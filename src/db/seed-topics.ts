// Seed the content_topics queue with ~130 grounded topics.
//
// Every topic ships with a non-null `groundingHint` — that's the hard gate.
// The Bedrock generator pipeline (to be wired) will:
//   1. Pick the highest-priority `queued` row,
//   2. Resolve groundingHint via src/lib/grounding.ts → real specifics
//      (service detail, location stats, industry priorities, etc.),
//   3. Compose EN body + native BN if requested,
//   4. Run the quality gate (≥75) and either insert into blog_posts or
//      flip the row to `review` for human triage.
//
// Run:  npx tsx src/db/seed-topics.ts
// Idempotent: a topic with the same (topic, locale) is left alone.

import { db } from "./client";
import { contentTopics } from "./schema";
import { and, eq, sql } from "drizzle-orm";

type Seed = {
  topic: string;
  locale?: "en" | "bn";
  category?: string;
  targetKeyword?: string;
  priority?: number;
  groundingHint: object;
};

const SERVICES = [
  { slug: "political-pr", short: "Political PR" },
  { slug: "social-media", short: "Social media" },
  { slug: "content-production", short: "Content production" },
  { slug: "paid-ads", short: "Paid ads" },
  { slug: "hospitality", short: "Hospitality marketing" },
  { slug: "brand-building", short: "Brand building" },
  { slug: "seo-website", short: "SEO & website" },
  { slug: "analytics-reporting", short: "Analytics & reporting" },
  { slug: "influencer-marketing", short: "Influencer marketing" },
] as const;

const LOCATIONS = [
  "dhaka", "chattogram", "sylhet", "khulna", "rajshahi",
  "coxs-bazar", "gazipur", "narayanganj", "comilla",
] as const;

const INDUSTRIES = [
  "real-estate", "e-commerce", "restaurants-food", "healthcare",
  "education", "ngo-development", "government", "rmg-garments",
  "hospitality", "fintech",
] as const;

const GLOSSARY = [
  "aeo", "geo", "core-web-vitals", "conversion-api", "speakable-schema",
  "first-party-data", "attribution-window", "engagement-rate",
];

// ─── 1. Service × Location guides (45) ────────────────────────────────
const serviceLocationTopics: Seed[] = SERVICES.slice(0, 5).flatMap((s) =>
  LOCATIONS.slice(0, 9).map((loc) => ({
    topic: `${s.short} in ${loc.replace(/-/g, " ")} — buyer signals, channels and a budget framework`,
    targetKeyword: `${s.short.toLowerCase()} ${loc.replace(/-/g, " ")}`,
    priority: 50,
    groundingHint: { service: s.slug, location: loc },
  }))
);

// ─── 2. Service × Industry guides (40) ────────────────────────────────
const serviceIndustryTopics: Seed[] = SERVICES.slice(0, 4).flatMap((s) =>
  INDUSTRIES.map((ind) => ({
    topic: `${s.short} for ${ind.replace(/-/g, " ")} brands in Bangladesh`,
    targetKeyword: `${s.short.toLowerCase()} for ${ind.replace(/-/g, " ")}`,
    priority: 60,
    groundingHint: { service: s.slug, industry: ind },
  }))
);

// ─── 3. Glossary deep-dives (8) ───────────────────────────────────────
const glossaryTopics: Seed[] = GLOSSARY.map((g) => ({
  topic: `${g.toUpperCase().replace(/-/g, " ")} — what Bangladeshi marketers need to know in 2026`,
  targetKeyword: g.replace(/-/g, " "),
  priority: 80,
  groundingHint: { glossary: g },
}));

// ─── 4. Per-service practitioner ledes (9) ────────────────────────────
const serviceFundamentals: Seed[] = SERVICES.map((s) => ({
  topic: `What ${s.short.toLowerCase()} actually costs in Bangladesh — a transparent budget breakdown`,
  targetKeyword: `${s.short.toLowerCase()} pricing Bangladesh`,
  priority: 30,
  groundingHint: { service: s.slug },
}));

// ─── 5. Location market guides (9) ────────────────────────────────────
const locationOverviews: Seed[] = LOCATIONS.map((loc) => ({
  topic: `Digital marketing in ${loc.replace(/-/g, " ")} — population, buyer behaviour and the channels that work`,
  targetKeyword: `digital marketing ${loc.replace(/-/g, " ")}`,
  priority: 70,
  groundingHint: { location: loc },
}));

// ─── 6. Industry verticals (10) ───────────────────────────────────────
const industryOverviews: Seed[] = INDUSTRIES.map((ind) => ({
  topic: `Marketing playbook for ${ind.replace(/-/g, " ")} brands in Bangladesh`,
  targetKeyword: `${ind.replace(/-/g, " ")} marketing Bangladesh`,
  priority: 70,
  groundingHint: { industry: ind },
}));

// ─── 7. Native Bengali variants — top priority, native authoring required ─
const bnTopics: Seed[] = SERVICES.slice(0, 5).map((s) => ({
  topic: `${s.short} — বাংলাদেশের জন্য সম্পূর্ণ গাইড`,
  locale: "bn",
  targetKeyword: s.short.toLowerCase(),
  priority: 90,
  groundingHint: { service: s.slug, requires: "native-bn" },
}));

const ALL: Seed[] = [
  ...serviceLocationTopics,    // 45
  ...serviceIndustryTopics,    // 40
  ...glossaryTopics,           // 8
  ...serviceFundamentals,      // 9
  ...locationOverviews,        // 9
  ...industryOverviews,        // 10
  ...bnTopics,                 // 5
]; // = 126

async function main() {
  console.log(`Seeding ${ALL.length} content topics…`);
  let inserted = 0;
  let skipped = 0;
  for (const t of ALL) {
    const locale = t.locale ?? "en";
    // Idempotency: check if a topic with the same text + locale already exists.
    const [existing] = await db
      .select({ id: contentTopics.id })
      .from(contentTopics)
      .where(and(eq(contentTopics.topic, t.topic), eq(contentTopics.locale, locale)))
      .limit(1);
    if (existing) {
      skipped++;
      continue;
    }
    await db.insert(contentTopics).values({
      topic: t.topic,
      locale,
      category: t.category ?? "blog",
      targetKeyword: t.targetKeyword,
      priority: t.priority ?? 100,
      status: "queued",
      groundingHint: t.groundingHint,
    });
    inserted++;
  }
  const [count] = await db.select({ n: sql<number>`count(*)::int` }).from(contentTopics);
  console.log(`Done. Inserted ${inserted}, skipped existing ${skipped}. Total in queue: ${count?.n ?? "?"}.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
