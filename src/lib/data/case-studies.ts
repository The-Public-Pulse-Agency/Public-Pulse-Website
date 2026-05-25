// Tagged cached read layer for case_studies.
//
// PUBLIC pages MUST go through these accessors. Direct db.select() from a
// page or layout is a bug — see docs/CACHING.md.
//
// /manage CRUD writes invalidate with revalidateTag('case-studies').

import { unstable_cache } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { caseStudies, type CaseStudy } from "@/db/schema";

export const CASE_STUDIES_TAG = "case-studies";

/** All published case studies for a locale. The `eq(published,true)` filter
 *  is the durable signal — legacy rows pre-date the `status` column. */
export const getPublishedCaseStudies = unstable_cache(
  async (locale: "en" | "bn" = "en"): Promise<CaseStudy[]> => {
    try {
      const rows = await db
        .select()
        .from(caseStudies)
        .where(
          and(
            eq(caseStudies.published, true),
            eq(caseStudies.locale, locale)
          )
        )
        .orderBy(desc(caseStudies.displayOrder), desc(caseStudies.publishedAt));
      return rows;
    } catch (err) {
      console.warn(
        "[case-studies] DB unavailable — returning empty list.",
        err instanceof Error ? err.message : err
      );
      return [];
    }
  },
  ["case-studies:published-v2"],
  { tags: [CASE_STUDIES_TAG], revalidate: false }
);

/** Featured case studies for the homepage Selected results. Falls back to
 *  most-recent published if no featured set, so the homepage never stays
 *  empty once even one row is published. */
export const getFeaturedCaseStudies = unstable_cache(
  async (locale: "en" | "bn" = "en", limit = 4): Promise<CaseStudy[]> => {
    try {
      const rows = await db
        .select()
        .from(caseStudies)
        .where(
          and(
            eq(caseStudies.published, true),
            eq(caseStudies.locale, locale),
            eq(caseStudies.featured, true)
          )
        )
        .orderBy(desc(caseStudies.displayOrder), desc(caseStudies.publishedAt))
        .limit(limit);
      if (rows.length === 0) {
        return await db
          .select()
          .from(caseStudies)
          .where(
            and(
              eq(caseStudies.published, true),
              eq(caseStudies.locale, locale)
            )
          )
          .orderBy(desc(caseStudies.publishedAt))
          .limit(limit);
      }
      return rows;
    } catch {
      return [];
    }
  },
  ["case-studies:featured-v2"],
  { tags: [CASE_STUDIES_TAG], revalidate: false }
);

export const getCaseStudyBySlug = unstable_cache(
  async (slug: string, locale: "en" | "bn" = "en"): Promise<CaseStudy | null> => {
    try {
      const [row] = await db
        .select()
        .from(caseStudies)
        .where(and(eq(caseStudies.slug, slug), eq(caseStudies.locale, locale)))
        .limit(1);
      if (!row) return null;
      if (row.published || row.status === "published") return row;
      return null;
    } catch {
      return null;
    }
  },
  ["case-studies:by-slug-v2"],
  { tags: [CASE_STUDIES_TAG], revalidate: false }
);

/** Related case studies by industry overlap. */
export const getRelatedCaseStudies = unstable_cache(
  async (
    excludeSlug: string,
    industry: string,
    locale: "en" | "bn" = "en",
    limit = 3
  ): Promise<CaseStudy[]> => {
    try {
      const rows = await db
        .select()
        .from(caseStudies)
        .where(
          and(
            eq(caseStudies.published, true),
            eq(caseStudies.locale, locale),
            eq(caseStudies.industry, industry)
          )
        )
        .orderBy(desc(caseStudies.publishedAt))
        .limit(limit + 1);
      return rows.filter((r) => r.slug !== excludeSlug).slice(0, limit);
    } catch {
      return [];
    }
  },
  ["case-studies:related-v2"],
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
