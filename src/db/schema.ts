// Drizzle schema. Three tables:
//   • leads          — contact-form submissions (write path: /contact)
//   • case_studies   — admin-managed homepage results (read path: homepage,
//                       wrapped in unstable_cache + tag "case-studies")
//   • admin_users / sessions / accounts / verifications — BetterAuth tables
//
// Tag-based cache invalidation: every mutation in /manage calls
// revalidateTag('case-studies') or revalidateTag('leads') so the public
// homepage refreshes deterministically and DB reads stay off the request path.

import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  integer,
  uniqueIndex,
  index,
  jsonb,
} from "drizzle-orm/pg-core";

// ─── Lead capture ──────────────────────────────────────────────────────

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    serviceInterest: text("service_interest"), // matches a slug in src/lib/services.ts
    message: text("message").notNull(),
    // submission metadata
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ipHash: text("ip_hash"), // SHA-256(IP + daily-salt) — for dedup, never the raw IP
    userAgent: text("user_agent"),
    // workflow
    read: boolean("read").notNull().default(false),
    archived: boolean("archived").notNull().default(false),
  },
  (t) => ({
    submittedIdx: index("leads_submitted_at_idx").on(t.submittedAt.desc()),
    unreadIdx: index("leads_unread_idx").on(t.read, t.archived),
  })
);

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

// ─── Case studies (homepage Selected Results) ─────────────────────────

export const caseStudies = pgTable(
  "case_studies",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    slug: text("slug").notNull(),
    industry: text("industry").notNull(), // e.g. "Cox's Bazar resort"
    metric: text("metric").notNull(), // e.g. "+47% direct bookings"
    windowLabel: text("window_label").notNull(), // e.g. "90 days"
    summary: text("summary").notNull(),
    serviceSlug: text("service_slug"), // loose ref to src/lib/services.ts
    displayOrder: integer("display_order").notNull().default(0),
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("case_studies_slug_idx").on(t.slug),
    publishedIdx: index("case_studies_published_idx").on(
      t.published,
      t.displayOrder
    ),
  })
);

export type CaseStudy = typeof caseStudies.$inferSelect;
export type NewCaseStudy = typeof caseStudies.$inferInsert;

// ─── ContentTopic queue (LLM generation pipeline) ─────────────────────
// PHASE 4 quality-gate pipeline. Each row is a topic for the generator to
// drain: a target keyword, the grounding source it must cite, status
// (queued/skipped/generated/published/review), and gateScores JSONB.

export const contentTopics = pgTable(
  "content_topics",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    /** Free-text topic the generator works from. */
    topic: text("topic").notNull(),
    /** "en" | "bn" — bn topics need native authoring, not machine translation. */
    locale: text("locale").notNull().default("en"),
    /** /blog, /guides, /compare, /case-studies, /glossary, etc. */
    category: text("category").notNull(),
    targetKeyword: text("target_keyword"),
    /** Lower = higher priority. */
    priority: integer("priority").notNull().default(100),
    /** queued | generated | published | review | skipped (null grounding). */
    status: text("status").notNull().default("queued"),
    /** JSON-encoded grounding hint, matched by src/lib/grounding.ts. */
    groundingHint: jsonb("grounding_hint"),
    /** Grounding match result (after pre-gen guard runs). */
    groundingMatch: jsonb("grounding_match"),
    /** Quality gate result JSONB — per-category + hardFails/softFails. */
    gateScores: jsonb("gate_scores"),
    /** Once published, the post URL / slug it produced. */
    postSlug: text("post_slug"),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    /** FAQ snapshot at publish time (≥3 by quality gate). */
    faqJson: jsonb("faq_json"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    statusIdx: index("content_topics_status_idx").on(t.status, t.priority),
    scheduledIdx: index("content_topics_scheduled_idx").on(t.scheduledFor),
    localeCategoryIdx: index("content_topics_locale_category_idx").on(t.locale, t.category),
  })
);

export type ContentTopic = typeof contentTopics.$inferSelect;
export type NewContentTopic = typeof contentTopics.$inferInsert;

// ─── Newsletter subscribers (single opt-in for now, double-opt-in TODO) ─

export const subscribers = pgTable(
  "subscribers",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    email: text("email").notNull(),
    /** "subscribed" | "unsubscribed" — for now we accept on form submit and
     *  trust the verification email to confirm. Full double-opt-in adds
     *  "pending_confirmation" and a verification token here. */
    status: text("status").notNull().default("subscribed"),
    /** Source attribution — e.g. "footer-cta", "blog-bottom", "/contact". */
    source: text("source"),
    /** Surrogate token used by the unsubscribe link in the welcome email. */
    unsubscribeToken: text("unsubscribe_token").notNull(),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  },
  (t) => ({
    emailIdx: uniqueIndex("subscribers_email_idx").on(t.email),
    statusIdx: index("subscribers_status_idx").on(t.status),
  })
);

export type Subscriber = typeof subscribers.$inferSelect;
export type NewSubscriber = typeof subscribers.$inferInsert;

// ─── Blog: categories + authors + posts ───────────────────────────────

export const blogCategories = pgTable(
  "blog_categories",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    slug: text("slug").notNull(),
    nameEn: text("name_en").notNull(),
    nameBn: text("name_bn"),
    description: text("description"),
    /** Tailwind color token like "cat-red" — drives the chip border on cards. */
    colorToken: text("color_token").notNull().default("cat-navy"),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("blog_categories_slug_idx").on(t.slug),
  })
);

export type BlogCategory = typeof blogCategories.$inferSelect;
export type NewBlogCategory = typeof blogCategories.$inferInsert;

// authors moved from hardcoded /about + blog bylines to DB. Person schema
// on the published surface reads from here. /manage/team is the CRUD UI.
export const authors = pgTable(
  "authors",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    role: text("role").notNull(),
    /** 1-paragraph public bio. */
    bio: text("bio").notNull(),
    /** Credentials (e.g. "MBA, IBA Dhaka", "8 years political PR") — used in E-E-A-T. */
    credentials: text("credentials"),
    /** Public profile photo. Stored as path or absolute URL. */
    image: text("image"),
    /** External profile URLs — fed into schema.org Person sameAs. */
    sameAs: jsonb("same_as").$type<string[]>(),
    /** Optional email shown on byline. */
    email: text("email"),
    /** Display order on /about. */
    displayOrder: integer("display_order").notNull().default(0),
    /** When false, hidden from /about and post bylines. */
    visible: boolean("visible").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("authors_slug_idx").on(t.slug),
  })
);

export type Author = typeof authors.$inferSelect;
export type NewAuthor = typeof authors.$inferInsert;

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    slug: text("slug").notNull(),
    /** "en" | "bn" — bilingual is one row per locale, slug is per-locale-unique. */
    locale: text("locale").notNull().default("en"),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    /** Raw MDX (or markdown) body. Compiled at request time, ISR-cached. */
    bodyMdx: text("body_mdx").notNull(),
    heroImageUrl: text("hero_image_url"),
    /** Slug of a blog_categories row. */
    categorySlug: text("category_slug").notNull(),
    tags: jsonb("tags").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    /** Slug of an authors row. */
    authorSlug: text("author_slug").notNull(),
    /** Workflow: draft / review / scheduled / published. */
    status: text("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    /** ≥3 FAQs after the gate. {q, a}[] */
    faqJson: jsonb("faq_json").$type<{ q: string; a: string }[]>().notNull().default(sql`'[]'::jsonb`),
    /** AnswerBlock body: 40–60 word self-contained answer. */
    answerFirst: text("answer_first").notNull(),
    /** Slugs of grounding refs (services, locations, industries, glossary, case-study ids). */
    sourceRefs: jsonb("source_refs").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    /** Quality gate output (per category + hardFails/softFails). */
    gateScores: jsonb("gate_scores"),
    /** Overrides for OG image factory. */
    ogTitle: text("og_title"),
    readingTime: integer("reading_time").notNull().default(5),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    /** Primary keyword from the originating content_topic (used in title/H1/answer). */
    targetKeyword: text("target_keyword"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugLocaleIdx: uniqueIndex("blog_posts_slug_locale_idx").on(t.slug, t.locale),
    statusIdx: index("blog_posts_status_idx").on(t.status, t.publishedAt.desc()),
    localeCategoryIdx: index("blog_posts_locale_category_idx").on(t.locale, t.categorySlug),
    publishedAtIdx: index("blog_posts_published_at_idx").on(t.publishedAt.desc()),
  })
);

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;

// ─── BetterAuth tables ─────────────────────────────────────────────────
// Shape matches BetterAuth's expected schema (v1.x, email+password adapter).
// Generated by `npx @better-auth/cli generate` and inlined here so Drizzle
// owns the migration. Re-run `generate` if BetterAuth bumps a major.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"), // bcrypt hash for email+password provider
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
