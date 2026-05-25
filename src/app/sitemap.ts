import type { MetadataRoute } from "next";
import { SITE, absoluteUrl } from "@/lib/site";
import { SERVICES } from "@/lib/services";
import { POSTS } from "@/lib/posts";
import { LOCATIONS } from "@/lib/taxonomies/locations";
import { INDUSTRIES } from "@/lib/taxonomies/industries";
import { GLOSSARY } from "@/lib/taxonomies/glossary";
import { GUIDES } from "@/lib/content/guides";
import { COMPARES } from "@/lib/content/compares";

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

export default function sitemap(): MetadataRoute.Sitemap {
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

  // ── Blog ───────────────────────────────────────────────────────────
  const blog = POSTS.filter((p) => p.ready).map((p) => ({
    ...entry(`/blog/${p.slug}`, "monthly", 0.7),
    lastModified: p.dateModified ?? p.datePublished,
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
  ];
}

export const revalidate = 3600;
export const dynamic = "force-static";
void SITE.url;
