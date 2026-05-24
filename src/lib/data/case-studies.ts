// Tagged cached read layer for case_studies.
//
// PUBLIC pages MUST go through getPublishedCaseStudies(). Direct db.select()
// from a page or layout is a bug — see docs/CACHING.md.
//
// /manage CRUD writes invalidate this with revalidateTag('case-studies').

import "server-only";
import { unstable_cache } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { caseStudies, type CaseStudy } from "@/db/schema";

export const CASE_STUDIES_TAG = "case-studies";

export const getPublishedCaseStudies = unstable_cache(
  async (): Promise<CaseStudy[]> => {
    // Resilience contract: the homepage MUST render even when the DB is
    // unreachable (e.g. at build time before secrets are wired, or during a
    // Neon outage). The "Selected results" section gracefully hides when this
    // returns []. Never let the public homepage fail because of this query.
    try {
      return await db
        .select()
        .from(caseStudies)
        .where(eq(caseStudies.published, true))
        .orderBy(desc(caseStudies.displayOrder), desc(caseStudies.publishedAt));
    } catch (err) {
      console.warn(
        "[case-studies] DB unavailable — returning empty list. Homepage will hide the results section.",
        err instanceof Error ? err.message : err
      );
      return [];
    }
  },
  ["case-studies:published"],
  { tags: [CASE_STUDIES_TAG], revalidate: false }
);

// Admin-only — NOT cached. /manage routes are uncached anyway.
export async function listAllCaseStudies(): Promise<CaseStudy[]> {
  return db.select().from(caseStudies).orderBy(desc(caseStudies.updatedAt));
}

export async function getCaseStudyById(id: string): Promise<CaseStudy | undefined> {
  const rows = await db.select().from(caseStudies).where(eq(caseStudies.id, id)).limit(1);
  return rows[0];
}
