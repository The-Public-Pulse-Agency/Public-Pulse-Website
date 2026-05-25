// Seed for blog_categories + authors. Run with:
//   set -a && . ./.env.production && set +a && npx tsx src/db/seed-blog.ts
//
// Idempotent: uses onConflictDoNothing on the unique slug indexes.

import "dotenv/config";
import { db } from "./client";
import { blogCategories, authors } from "./schema";

const CATEGORIES = [
  { slug: "political-pr", nameEn: "Political PR", nameBn: "রাজনৈতিক জনসংযোগ", description: "Election campaigns, candidate image, narrative engineering, opposition research.", colorToken: "cat-red", displayOrder: 1 },
  { slug: "paid-media", nameEn: "Paid Media", nameBn: "পেইড মিডিয়া", description: "Meta, Google, YouTube — ROAS-focused playbooks for Bangladesh.", colorToken: "cat-teal", displayOrder: 2 },
  { slug: "social-media", nameEn: "Social Media", nameBn: "সোশ্যাল মিডিয়া", description: "Facebook, Instagram, TikTok, YouTube content + community management.", colorToken: "cat-blue", displayOrder: 3 },
  { slug: "seo", nameEn: "SEO", nameBn: "এসইও", description: "Local SEO, technical SEO, content SEO — for Bangladesh search.", colorToken: "cat-navy", displayOrder: 4 },
  { slug: "branding", nameEn: "Branding", nameBn: "ব্র্যান্ডিং", description: "Brand systems, identity, positioning for BD startups + rebrands.", colorToken: "cat-orange", displayOrder: 5 },
  { slug: "content", nameEn: "Content", nameBn: "কন্টেন্ট", description: "Video, photo, motion, drone — strategy-driven production.", colorToken: "cat-purple", displayOrder: 6 },
  { slug: "hospitality", nameEn: "Hospitality", nameBn: "হসপিটালিটি", description: "Resorts, hotels, restaurants — Cox's Bazar to Sylhet to Dhaka.", colorToken: "cat-green", displayOrder: 7 },
  { slug: "analytics", nameEn: "Analytics", nameBn: "অ্যানালিটিক্স", description: "GA4, GTM, Meta CAPI, Looker Studio, ROI attribution.", colorToken: "cat-brown", displayOrder: 8 },
  { slug: "influencer", nameEn: "Influencer", nameBn: "ইনফ্লুয়েন্সার", description: "Discovery, tier strategy, contracts, FTC-compliant disclosure.", colorToken: "cat-magenta", displayOrder: 9 },
  { slug: "ai-aeo-geo", nameEn: "AI / AEO / GEO", nameBn: "এআই / এইও / জিইও", description: "Answer engines, generative engines, schema, llms.txt.", colorToken: "cat-navy", displayOrder: 10 },
] as const;

const AUTHORS = [
  {
    slug: "moshiur-rahman",
    name: "Moshiur Rahman",
    role: "Founder & Managing Director",
    bio: "Leads strategy across Public Pulse. Background in political PR and brand-building for Bangladesh consumer brands. Speaks at constituency-level political campaigns and hospitality launches in Cox's Bazar.",
    credentials: "Founder, Public Pulse Agency · 8+ years digital marketing & political PR in Bangladesh",
    image: null,
    sameAs: [],
    email: "moshiur@publicpulse.com.bd",
    displayOrder: 1,
    visible: true,
  },
  {
    slug: "head-of-strategy",
    name: "[Head of Strategy]",
    role: "Head of Strategy",
    bio: "Sets the playbook for political PR engagements and major brand launches. Constituency-level campaign experience across multiple Bangladesh election cycles.",
    credentials: "Multiple BD election cycles · narrative engineering · opposition research",
    image: null,
    sameAs: [],
    email: null,
    displayOrder: 2,
    visible: true,
  },
  {
    slug: "creative-director",
    name: "[Creative Director]",
    role: "Creative Director",
    bio: "Owns the bar for production — brand films, photography, motion. Bangla and English creative across hospitality, political and consumer brands in Bangladesh.",
    credentials: "10+ years production · BD hospitality + political + consumer",
    image: null,
    sameAs: [],
    email: null,
    displayOrder: 3,
    visible: true,
  },
] as const;

async function main() {
  console.log(`Seeding ${CATEGORIES.length} categories…`);
  for (const c of CATEGORIES) {
    await db.insert(blogCategories).values(c).onConflictDoNothing({ target: blogCategories.slug });
  }
  console.log(`Seeding ${AUTHORS.length} authors…`);
  for (const a of AUTHORS) {
    await db
      .insert(authors)
      .values({ ...a, sameAs: [...a.sameAs] as string[] })
      .onConflictDoNothing({ target: authors.slug });
  }
  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
