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
    /** Bilingual: one row per locale, slug+locale unique. */
    locale: text("locale").notNull().default("en"),
    /** Long form display title (e.g. "How a Cox's Bazar resort grew direct bookings 47% in 90 days"). */
    title: text("title").notNull().default("Untitled case study"),
    /** Optional sector label when NDA prevents naming the client (e.g. "A Cox's Bazar resort"). */
    clientName: text("client_name"),
    /** Logo URL (only when client is named + has agreed). */
    logoUrl: text("logo_url"),
    /** Loose categorisation — drives filter chips on /case-studies. */
    industry: text("industry").notNull(),
    /** Location slug from taxonomies/locations.ts (optional). */
    location: text("location"),
    /** Services involved (slugs). */
    services: jsonb("services").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    /** Headline metric — kept for back-compat + featured-card fast read. */
    metric: text("metric").notNull(),
    /** Time window the metric was measured over. */
    windowLabel: text("window_label").notNull(),
    /** Legacy summary — short marketing sentence. */
    summary: text("summary").notNull(),
    /** Loose ref to a single primary service (back-compat with homepage rail). */
    serviceSlug: text("service_slug"),
    /** AEO/GEO answer-first: 40–60 word self-contained outcome statement that
     *  engines can lift verbatim. Rendered with class="answer-block"
     *  data-speakable at the top of the detail page. */
    outcomeStatement: text("outcome_statement"),
    /** Long narrative — challenge → approach → result. Each is a short
     *  paragraph (~80–140 words each). Optional; the marketing summary is
     *  the back-compat fallback. */
    challenge: text("challenge"),
    approach: text("approach"),
    result: text("result"),
    /** Quantified metrics callout band — each item: {label, value, timeframe?}. */
    metrics: jsonb("metrics").$type<CaseStudyMetric[]>().notNull().default(sql`'[]'::jsonb`),
    /** ≥0 testimonial blocks. When present + real, drives Review schema. */
    testimonialQuote: text("testimonial_quote"),
    testimonialAttribution: text("testimonial_attribution"),
    /** ≥0 FAQs. When present, drives FAQPage schema. */
    faqJson: jsonb("faq_json").$type<{ q: string; a: string }[]>().notNull().default(sql`'[]'::jsonb`),
    /** 1200×630 hero image (file-served). */
    heroImageUrl: text("hero_image_url"),
    /** SEO overrides. */
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    /** Featured on homepage Selected results. */
    featured: boolean("featured").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    /** Legacy back-compat — true means status="published". */
    published: boolean("published").notNull().default(false),
    /** "draft" | "review" | "published". */
    status: text("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    slugLocaleIdx: uniqueIndex("case_studies_slug_locale_idx").on(t.slug, t.locale),
    publishedIdx: index("case_studies_published_idx").on(
      t.published,
      t.displayOrder
    ),
    statusIdx: index("case_studies_status_idx").on(t.status, t.publishedAt.desc()),
    featuredIdx: index("case_studies_featured_idx").on(t.featured, t.displayOrder),
  })
);

export type CaseStudy = typeof caseStudies.$inferSelect;
export type NewCaseStudy = typeof caseStudies.$inferInsert;

export type CaseStudyMetric = {
  /** Display label like "Direct bookings". */
  label: string;
  /** Display value like "+47%". When numeric (e.g. "47"), the detail page
   *  uses CountUp; when it has a sign or suffix, renders as plain text. */
  value: string;
  /** Optional time window override (defaults to row.windowLabel). */
  timeframe?: string;
  /** Optional unit suffix (e.g. "%", "BDT"). */
  unit?: string;
};

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

// ─── Messenger events (inbound Facebook Messenger webhook log) ─────────
// Every POST from /api/messenger/webhook lands as a row. Used for:
//   • Audit trail of every inbound interaction (msg / postback / opt-in)
//   • /manage listing of conversations
//   • Replay / reprocess if downstream handling fails
//
// We store the full payload as jsonb so we never lose data — even if Meta
// adds new fields, we keep them. Indexed by senderId + receivedAt so the
// /manage view can group per-user conversations.

export const messengerEvents = pgTable(
  "messenger_events",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    /** "message" | "postback" | "delivery" | "read" | "messaging_optins" | other. */
    eventType: text("event_type").notNull(),
    /** Facebook Page ID that received this event. */
    pageId: text("page_id"),
    /** Sender's PSID (Page-Scoped ID — unique per user-per-page). */
    senderId: text("sender_id"),
    /** Recipient PSID (usually the page itself for inbound). */
    recipientId: text("recipient_id"),
    /** Inbound message id (mid) — Meta dedupes by this. */
    messageId: text("message_id"),
    /** Plain-text message content if this is a text message. */
    text: text("text"),
    /** Whatever else the event carried (attachments, postback payload, etc.). */
    raw: jsonb("raw").notNull(),
    /** Has the team replied / handled this? */
    handled: boolean("handled").notNull().default(false),
    /** Meta's timestamp (ms epoch). */
    fbTimestamp: timestamp("fb_timestamp", { withTimezone: true }),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    senderIdx: index("messenger_events_sender_idx").on(t.senderId, t.receivedAt.desc()),
    pageIdx: index("messenger_events_page_idx").on(t.pageId, t.receivedAt.desc()),
    messageIdx: uniqueIndex("messenger_events_msg_idx").on(t.messageId),
    handledIdx: index("messenger_events_handled_idx").on(t.handled, t.receivedAt.desc()),
  })
);

export type MessengerEvent = typeof messengerEvents.$inferSelect;
export type NewMessengerEvent = typeof messengerEvents.$inferInsert;

// ─── Facebook Page connection (OAuth-granted page access token) ────────
// One row per (admin user × connected Page). The admin signs in to /manage
// with their email+password (BetterAuth), then runs /manage/connect/facebook
// which kicks off the Facebook OAuth flow + asks them to select a Page.
// The selected Page's long-lived Page Access Token + granted scopes land
// here. Used by messenger-send + page-insights as the auth source — falls
// back to MESSENGER_PAGE_ACCESS_TOKEN env when no DB row exists.

export const facebookConnections = pgTable(
  "facebook_connections",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    /** BetterAuth user.id of the admin who connected this Page. */
    userId: text("user_id").notNull(),
    /** Facebook Page ID. */
    pageId: text("page_id").notNull(),
    pageName: text("page_name").notNull(),
    /** Long-lived Page Access Token (does not expire as long as the admin
     *  user token is alive + roles are intact). */
    pageAccessToken: text("page_access_token").notNull(),
    /** Token for the underlying user (also long-lived once exchanged). */
    userAccessToken: text("user_access_token"),
    /** Optional Business Manager ID that owns the Page. */
    businessId: text("business_id"),
    businessName: text("business_name"),
    /** Granted OAuth scopes (so we can detect missing perms). */
    scopesGranted: jsonb("scopes_granted").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    /** Whether webhook subscription succeeded for this Page. */
    webhookSubscribed: boolean("webhook_subscribed").notNull().default(false),
    /** Soft-disable without deleting the row. */
    active: boolean("active").notNull().default(true),
    connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (t) => ({
    userIdx: index("facebook_connections_user_idx").on(t.userId),
    pageIdx: uniqueIndex("facebook_connections_user_page_idx").on(t.userId, t.pageId),
    activeIdx: index("facebook_connections_active_idx").on(t.active, t.connectedAt.desc()),
  })
);

export type FacebookConnection = typeof facebookConnections.$inferSelect;
export type NewFacebookConnection = typeof facebookConnections.$inferInsert;

// ─── Newsletter subscribers (DOUBLE OPT-IN) ────────────────────────────
// status flow: pending → confirmed → unsubscribed.
// confirm_token is one-time; consumed when the user clicks the confirmation
// link. unsubscribe_token is durable; same token is included in every send.

export const subscribers = pgTable(
  "subscribers",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    email: text("email").notNull(),
    /** "pending" | "confirmed" | "unsubscribed". Legacy "subscribed" rows
     *  are treated as "confirmed" for backwards-compat. */
    status: text("status").notNull().default("pending"),
    /** Source attribution — e.g. "footer", "blog-end", "exit-intent", "sticky". */
    source: text("source"),
    /** Locale of the signup form — drives email language (en|bn). */
    locale: text("locale").notNull().default("en"),
    /** Path/variant of the capture site (e.g. "/blog/<slug>"). */
    capturePage: text("capture_page"),
    /** Single-use confirm token. Null once confirmed. */
    confirmToken: text("confirm_token"),
    /** Durable unsubscribe token — included in every send. */
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
    confirmTokenIdx: index("subscribers_confirm_token_idx").on(t.confirmToken),
    unsubscribeTokenIdx: index("subscribers_unsubscribe_token_idx").on(t.unsubscribeToken),
  })
);

export type Subscriber = typeof subscribers.$inferSelect;
export type NewSubscriber = typeof subscribers.$inferInsert;

// ─── WhatsApp opt-in (phone leads) ─────────────────────────────────────
// Separate table from `leads` (contact form) and `subscribers` (email): a
// WhatsApp opt-in is an explicit consent to be messaged on WhatsApp, captured
// via the site-wide LeadCapture component when the user picks phone. We treat
// the number itself as PII — never reuse it for anything but WhatsApp outreach.

export const whatsappOptin = pgTable(
  "whatsapp_optin",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    /** E.164-ish; we store what the user typed and normalize at read time. */
    phone: text("phone").notNull(),
    /** "active" | "revoked". */
    status: text("status").notNull().default("active"),
    /** Source attribution — same scheme as subscribers.source. */
    source: text("source"),
    capturePage: text("capture_page"),
    locale: text("locale").notNull().default("en"),
    /** Free-text context the user typed (optional, never required). */
    note: text("note"),
    /** Consent text the user agreed to — stored verbatim for audit. */
    consentText: text("consent_text").notNull(),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    /** Admin workflow — has the team reached out yet? */
    contacted: boolean("contacted").notNull().default(false),
    archived: boolean("archived").notNull().default(false),
  },
  (t) => ({
    phoneIdx: index("whatsapp_optin_phone_idx").on(t.phone),
    statusIdx: index("whatsapp_optin_status_idx").on(t.status, t.contacted),
    createdIdx: index("whatsapp_optin_created_idx").on(t.createdAt.desc()),
  })
);

export type WhatsappOptin = typeof whatsappOptin.$inferSelect;
export type NewWhatsappOptin = typeof whatsappOptin.$inferInsert;

// ─── Newsletter issues (digest drafts) ─────────────────────────────────
// One row per digest. status flow: draft → sent. The bi-weekly Cron creates
// a row in `draft` status with a snapshot of posts since last send; admin
// reviews / edits in /manage/newsletter, then sends. If AUTOSEND env is on,
// the cron sends immediately and writes the row as `sent`.

export const newsletterIssues = pgTable(
  "newsletter_issues",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    /** Display number — auto-incremented from the previous issue. */
    issueNumber: integer("issue_number").notNull(),
    /** Subject line (editable). */
    subject: text("subject").notNull(),
    /** Pre-header (hidden snippet shown next to subject in inbox). */
    preheader: text("preheader").notNull(),
    /** Body intro paragraph above the featured post (editable). */
    intro: text("intro").notNull(),
    /** Snapshot of posts included, in display order. */
    posts: jsonb("posts").$type<DigestPostRef[]>().notNull().default(sql`'[]'::jsonb`),
    /** "draft" | "sent" | "sending". */
    status: text("status").notNull().default("draft"),
    /** Counts after a send completes. */
    sentCount: integer("sent_count").notNull().default(0),
    failedCount: integer("failed_count").notNull().default(0),
    /** "cron-auto" | "cron-draft" | "manual". */
    createdBy: text("created_by").notNull().default("manual"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
  },
  (t) => ({
    statusIdx: index("newsletter_issues_status_idx").on(t.status, t.createdAt.desc()),
    issueIdx: uniqueIndex("newsletter_issues_issue_idx").on(t.issueNumber),
  })
);

export type NewsletterIssue = typeof newsletterIssues.$inferSelect;
export type NewNewsletterIssue = typeof newsletterIssues.$inferInsert;

/** Reference shape for the snapshot of posts inside a digest. */
export type DigestPostRef = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  url: string;
  readingTime: number;
  heroUrl: string;
};

// ─── Newsletter sends (per-issue audit log) ────────────────────────────
// One row per recipient per issue — used to detect/skip duplicates if a
// send retries, and to compute open/click stats later if we add tracking.

export const newsletterSends = pgTable(
  "newsletter_sends",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    issueId: uuid("issue_id").notNull(),
    subscriberId: uuid("subscriber_id").notNull(),
    /** "queued" | "sent" | "failed". */
    status: text("status").notNull().default("queued"),
    /** Resend message id, when known. */
    providerId: text("provider_id"),
    error: text("error"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
  },
  (t) => ({
    issueIdx: index("newsletter_sends_issue_idx").on(t.issueId),
    subscriberIdx: index("newsletter_sends_subscriber_idx").on(t.subscriberId),
    issueSubIdx: uniqueIndex("newsletter_sends_issue_sub_idx").on(t.issueId, t.subscriberId),
  })
);

export type NewsletterSend = typeof newsletterSends.$inferSelect;
export type NewNewsletterSend = typeof newsletterSends.$inferInsert;

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
