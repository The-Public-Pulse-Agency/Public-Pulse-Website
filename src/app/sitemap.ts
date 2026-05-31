import type { MetadataRoute } from "next";
import { SITE, absoluteUrl } from "@/lib/site";
import { SERVICES } from "@/lib/services";
import { LOCATIONS } from "@/lib/taxonomies/locations";
import { INDUSTRIES } from "@/lib/taxonomies/industries";
import { GLOSSARY } from "@/lib/taxonomies/glossary";
import { GUIDES } from "@/lib/content/guides";
import { COMPARES } from "@/lib/content/compares";
import { getPublishedPosts } from "@/lib/data/blog";
import { getPublishedCaseStudies } from "@/lib/data/case-studies";

// Single flat sitemap.xml — Next.js doesn't have first-class sitemap-index
// support without a route handler. We list every URL here with `alternates`
// so Google sees the bn/en relationship even though only en pages exist
// today; bn entries are commented in once hand-authored content lands.
//
// Programmatic surfaces grouped by category — each entry is also referenced
// in docs/JOURNEY.md so the SEO surface is auditable.

const today = new Date().toISOString().slice(0, 10);

function entry(
  path: string,
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly" = "monthly",
  priority = 0.7
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(path),
    lastModified: today,
    changeFrequency,
    priority,
    alternates: {
      languages: {
        en: absoluteUrl(path),
        "x-default": absoluteUrl(path),
        // bn: absoluteUrl(`/bn${path === "/" ? "" : path}`),  // unlock when bn content lands
      },
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Core marketing pages ───────────────────────────────────────────
  const core: MetadataRoute.Sitemap = [
    entry("/", "weekly", 1),
    entry("/about", "monthly", 0.8),
    entry("/services", "monthly", 0.9),
    entry("/blog", "weekly", 0.8),
    entry("/contact", "yearly", 0.7),
    entry("/glossary", "weekly", 0.7),
    entry("/guides", "weekly", 0.7),
    entry("/case-studies", "weekly", 0.8),
    entry("/locations", "monthly", 0.7),
    entry("/industries", "monthly", 0.7),
    entry("/privacy", "yearly", 0.3),
    entry("/terms", "yearly", 0.3),
    entry("/data-deletion", "yearly", 0.3),
  ];

  // ── Services × 9 ───────────────────────────────────────────────────
  const services = SERVICES.filter((s) => s.ready).map((s) =>
    entry(`/services/${s.slug}`, "monthly", 0.8)
  );

  // ── Locations × N ──────────────────────────────────────────────────
  const locations = LOCATIONS.map((l) => entry(`/locations/${l.slug}`, "monthly", 0.7));

  // ── Industries × N ─────────────────────────────────────────────────
  const industries = INDUSTRIES.map((i) => entry(`/industries/${i.slug}`, "monthly", 0.7));

  // ── Service × Location matrix (scale driver) ───────────────────────
  const serviceLocation = SERVICES.filter((s) => s.ready).flatMap((s) =>
    LOCATIONS.map((l) => entry(`/${s.slug}/${l.slug}`, "monthly", 0.65))
  );

  // ── Service × Industry matrix ──────────────────────────────────────
  const serviceIndustry = SERVICES.filter((s) => s.ready).flatMap((s) =>
    INDUSTRIES.map((i) => entry(`/${s.slug}-for-${i.slug}`, "monthly", 0.65))
  );

  // ── Glossary terms ─────────────────────────────────────────────────
  const glossary = GLOSSARY.map((t) => entry(`/glossary/${t.slug}`, "monthly", 0.5));

  // ── Guides (HowTo playbooks) ───────────────────────────────────────
  const guides = GUIDES.map((g) => entry(`/guides/${g.slug}`, "monthly", 0.7));

  // ── Compare pages ──────────────────────────────────────────────────
  const compares = COMPARES.map((c) => entry(`/compare/${c.slug}`, "monthly", 0.6));

  // ── Blog (DB-backed; published posts in EN + BN with hreflang) ────
  const publishedEn = await getPublishedPosts("en");
  const publishedBn = await getPublishedPosts("bn");
  const bnSlugSet = new Set(publishedBn.map((p) => p.slug));
  const blog: MetadataRoute.Sitemap = publishedEn.map((p) => {
    const path = `/blog/${p.slug}`;
    const hasBn = bnSlugSet.has(p.slug);
    return {
      url: absoluteUrl(path),
      lastModified: p.publishedAt ? new Date(p.publishedAt).toISOString().slice(0, 10) : today,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          en: absoluteUrl(path),
          "x-default": absoluteUrl(path),
          ...(hasBn ? { "bn-BD": absoluteUrl(`/bn/blog/${p.slug}`) } : {}),
        },
      },
    };
  });
  // ── Case studies (DB-backed, EN + BN with hreflang) ─────────────────
  const caseEn = await getPublishedCaseStudies("en");
  const caseBn = await getPublishedCaseStudies("bn");
  const caseBnSlugs = new Set(caseBn.map((c) => c.slug));
  const cases: MetadataRoute.Sitemap = caseEn.map((c) => {
    const path = `/case-studies/${c.slug}`;
    const hasBn = caseBnSlugs.has(c.slug);
    return {
      url: absoluteUrl(path),
      lastModified: c.publishedAt ? new Date(c.publishedAt).toISOString().slice(0, 10) : today,
      changeFrequency: "monthly",
      priority: 0.75,
      alternates: {
        languages: {
          en: absoluteUrl(path),
          "x-default": absoluteUrl(path),
          ...(hasBn ? { "bn-BD": absoluteUrl(`/bn/case-studies/${c.slug}`) } : {}),
        },
      },
    };
  });
  const casesBnOnly: MetadataRoute.Sitemap = caseBn.map((c) => ({
    url: absoluteUrl(`/bn/case-studies/${c.slug}`),
    lastModified: c.publishedAt ? new Date(c.publishedAt).toISOString().slice(0, 10) : today,
    changeFrequency: "monthly",
    priority: 0.7,
    alternates: {
      languages: {
        "bn-BD": absoluteUrl(`/bn/case-studies/${c.slug}`),
        en: absoluteUrl(`/case-studies/${c.slug}`),
        "x-default": absoluteUrl(`/case-studies/${c.slug}`),
      },
    },
  }));

  const blogBnOnly: MetadataRoute.Sitemap = publishedBn.map((p) => ({
    url: absoluteUrl(`/bn/blog/${p.slug}`),
    // Neon HTTP driver returns timestamps as ISO strings on some code paths
    // (cache rehydrate, JSONB serialization). Coerce defensively.
    lastModified: p.publishedAt ? new Date(p.publishedAt).toISOString().slice(0, 10) : today,
    changeFrequency: "monthly",
    priority: 0.65,
    alternates: {
      languages: {
        "bn-BD": absoluteUrl(`/bn/blog/${p.slug}`),
        en: absoluteUrl(`/blog/${p.slug}`),
        "x-default": absoluteUrl(`/blog/${p.slug}`),
      },
    },
  }));

  return [
    ...core,
    ...services,
    ...locations,
    ...industries,
    ...serviceLocation,
    ...serviceIndustry,
    ...glossary,
    ...guides,
    ...compares,
    ...blog,
    ...blogBnOnly,
    ...cases,
    ...casesBnOnly,
  ];
}

export const revalidate = 3600;
export const dynamic = "force-static";
void SITE.url;
