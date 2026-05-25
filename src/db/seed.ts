// One-time seed: insert a single placeholder case study so the cached
// homepage data layer has something to return on first build.
//
// Run: npx tsx src/db/seed.ts (requires DATABASE_URL_DIRECT in env)

import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { caseStudies } from "./schema";

async function main() {
  const url = process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL_DIRECT or DATABASE_URL must be set");

  const sql = neon(url);
  const db = drizzle(sql);

  const now = new Date();
  await db
    .insert(caseStudies)
    .values({
      slug: "seed-coxs-bazar-resort",
      title: "Cox's Bazar resort — 47% growth in direct bookings (seed placeholder)",
      industry: "Cox's Bazar resort",
      metric: "+47% direct bookings",
      windowLabel: "90 days",
      summary:
        "Rebuilt OTA listings and shifted 38% of paid spend to direct-channel campaigns. Replace this seed entry from /manage once the real cases are ready.",
      serviceSlug: "hospitality",
      displayOrder: 0,
      published: true,
      publishedAt: now,
    })
    .onConflictDoNothing();

  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
