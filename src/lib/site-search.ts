// Shared site-search logic used by /search (page) and /api/search (JSON).
// In-memory filter over typed catalogs + DB-backed posts + case studies.

import { SERVICES } from "@/lib/services";
import { LOCATIONS } from "@/lib/taxonomies/locations";
import { INDUSTRIES } from "@/lib/taxonomies/industries";
import { GLOSSARY } from "@/lib/taxonomies/glossary";
import { GUIDES } from "@/lib/content/guides";
import { COMPARES } from "@/lib/content/compares";
import { getPublishedPosts } from "@/lib/data/blog";
import { getPublishedCaseStudies } from "@/lib/data/case-studies";

export type SiteSearchHit = {
  kind: "post" | "service" | "glossary" | "case-study" | "guide" | "compare" | "location" | "industry" | "page";
  title: string;
  url: string;
  excerpt: string;
  /** Lower = more relevant. */
  score: number;
};

function score(needle: string, ...fields: (string | null | undefined)[]): number {
  if (!needle) return 999;
  const n = needle.toLowerCase();
  let best = 999;
  for (const f of fields) {
    if (!f) continue;
    const h = f.toLowerCase();
    if (h === n) return 0;
    if (h.startsWith(n)) best = Math.min(best, 1);
    else if (h.includes(` ${n}`)) best = Math.min(best, 2);
    else if (h.includes(n)) best = Math.min(best, 3);
  }
  return best;
}

const STATIC_PAGES: Array<{ title: string; url: string; excerpt: string; keywords: string }> = [
  { title: "Election readiness", url: "/election", excerpt: "90-day election playbook for Bangladeshi candidates and parties.", keywords: "election candidate party political pr campaign vote constituency" },
  { title: "About Public Pulse", url: "/about", excerpt: "Bangladesh-based 360° digital marketing and political PR agency.", keywords: "about studio founders agency dhaka bangladesh" },
  { title: "Contact", url: "/contact", excerpt: "Send a brief or book a strategy call.", keywords: "contact email phone whatsapp brief" },
  { title: "Press & media", url: "/press", excerpt: "Brand assets, boilerplate, and media enquiries.", keywords: "press media journalist logo brand kit" },
  { title: "Pricing", url: "/pricing", excerpt: "Tier matrix and starting points for every service.", keywords: "pricing cost budget retainer monthly" },
  { title: "Book a call", url: "/book", excerpt: "30-min strategy call.", keywords: "book schedule cal.com calendar" },
];

export async function siteSearch(q: string, limit = 40): Promise<SiteSearchHit[]> {
  const needle = q.trim().toLowerCase();
  if (!needle || needle.length < 2) return [];

  const hits: SiteSearchHit[] = [];

  for (const s of SERVICES.filter((s) => s.ready)) {
    const sc = score(needle, s.name, s.shortName, s.oneLiner, s.serviceType, s.category);
    if (sc < 999) hits.push({ kind: "service", title: s.name, url: `/services/${s.slug}`, excerpt: s.oneLiner, score: sc });
  }
  for (const g of GLOSSARY) {
    const sc = score(needle, g.name, g.definition, g.nameBn);
    if (sc < 999) hits.push({ kind: "glossary", title: g.name, url: `/glossary/${g.slug}`, excerpt: g.definition, score: sc + 0.2 });
  }
  for (const loc of LOCATIONS) {
    const sc = score(needle, loc.name, loc.nameBn, loc.division, loc.characterizedBy);
    if (sc < 999) hits.push({
      kind: "location",
      title: `Digital marketing in ${loc.name}`,
      url: `/locations/${loc.slug}`,
      excerpt: `${loc.division} division. ${loc.characterizedBy.slice(0, 120)}${loc.characterizedBy.length > 120 ? "…" : ""}`,
      score: sc,
    });
  }
  for (const ind of INDUSTRIES) {
    const sc = score(needle, ind.name, ind.description, ind.priorities.join(" "));
    if (sc < 999) hits.push({ kind: "industry", title: `Marketing for ${ind.name}`, url: `/industries/${ind.slug}`, excerpt: ind.description, score: sc });
  }
  for (const guide of GUIDES) {
    const sc = score(needle, guide.title, guide.description, guide.answer);
    if (sc < 999) hits.push({ kind: "guide", title: guide.title, url: `/guides/${guide.slug}`, excerpt: guide.description, score: sc });
  }
  for (const cmp of COMPARES) {
    if (!cmp.ready) continue;
    const sc = score(needle, cmp.title, cmp.description, cmp.answer);
    if (sc < 999) hits.push({ kind: "compare", title: cmp.title, url: `/compare/${cmp.slug}`, excerpt: cmp.description, score: sc });
  }
  try {
    const posts = await getPublishedPosts("en");
    for (const p of posts) {
      const tagBlob = Array.isArray(p.tags) ? (p.tags as string[]).join(" ") : "";
      const sc = score(needle, p.title, p.excerpt, p.categorySlug, tagBlob);
      if (sc < 999) hits.push({ kind: "post", title: p.title, url: `/blog/${p.slug}`, excerpt: p.excerpt, score: sc + 0.1 });
    }
  } catch { /* DB unreachable */ }
  try {
    const cases = await getPublishedCaseStudies("en");
    for (const c of cases) {
      const sc = score(needle, c.title, c.summary, c.industry, c.clientName);
      if (sc < 999) hits.push({ kind: "case-study", title: c.title, url: `/case-studies/${c.slug}`, excerpt: c.summary, score: sc });
    }
  } catch { /* DB unreachable */ }
  for (const pg of STATIC_PAGES) {
    const sc = score(needle, pg.title, pg.excerpt, pg.keywords);
    if (sc < 999) hits.push({ kind: "page", title: pg.title, url: pg.url, excerpt: pg.excerpt, score: sc });
  }

  const kindWeight: Record<SiteSearchHit["kind"], number> = {
    service: 0, location: 0.05, industry: 0.05, "case-study": 0.05,
    page: 0.1, compare: 0.15, guide: 0.15, post: 0.2, glossary: 0.3,
  };
  hits.sort((a, b) => (a.score + kindWeight[a.kind]) - (b.score + kindWeight[b.kind]));
  return hits.slice(0, limit);
}
