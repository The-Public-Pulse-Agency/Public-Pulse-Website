// Site-wide text search. Indexes published blog posts + services + glossary +
// case studies + guides + compares + locations + industries + the election page.
//
// Implementation: server-side, no fts/db query — all sources are read at
// ISR-revalidate time (1h) and filtered in-memory on each request. Fast,
// cacheable, no extra infrastructure. Switches to Postgres FTS if/when
// the post count makes in-memory filtering slow (~1000+ posts).

import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Search as SearchIcon, ArrowRight } from "lucide-react";

import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SITE } from "@/lib/site";
import { SERVICES } from "@/lib/services";
import { LOCATIONS } from "@/lib/taxonomies/locations";
import { INDUSTRIES } from "@/lib/taxonomies/industries";
import { GLOSSARY } from "@/lib/taxonomies/glossary";
import { GUIDES } from "@/lib/content/guides";
import { COMPARES } from "@/lib/content/compares";
import { getPublishedPosts } from "@/lib/data/blog";
import { getPublishedCaseStudies } from "@/lib/data/case-studies";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Search | Public Pulse",
  description:
    "Search Public Pulse Agency — guides, services, glossary, case studies, and locations across our Bangladesh marketing playbooks.",
  path: "/search",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Search", path: "/search" },
];

type Hit = {
  kind: "post" | "service" | "glossary" | "case-study" | "guide" | "compare" | "location" | "industry" | "page";
  title: string;
  url: string;
  excerpt: string;
  /** Lower score = more relevant. Used for stable ordering. */
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

async function runSearch(q: string): Promise<Hit[]> {
  const needle = q.trim().toLowerCase();
  if (!needle || needle.length < 2) return [];

  const hits: Hit[] = [];

  // Services
  for (const s of SERVICES.filter((s) => s.ready)) {
    const sc = score(needle, s.name, s.shortName, s.oneLiner, s.serviceType, s.category);
    if (sc < 999) {
      hits.push({
        kind: "service",
        title: s.name,
        url: `/services/${s.slug}`,
        excerpt: s.oneLiner,
        score: sc,
      });
    }
  }

  // Glossary
  for (const g of GLOSSARY) {
    const sc = score(needle, g.name, g.definition, g.nameBn);
    if (sc < 999) {
      hits.push({
        kind: "glossary",
        title: g.name,
        url: `/glossary/${g.slug}`,
        excerpt: g.definition,
        score: sc + 0.2, // slight bias so primary content ranks higher
      });
    }
  }

  // Locations
  for (const loc of LOCATIONS) {
    const sc = score(needle, loc.name, loc.nameBn, loc.division, loc.characterizedBy);
    if (sc < 999) {
      hits.push({
        kind: "location",
        title: `Digital marketing in ${loc.name}`,
        url: `/locations/${loc.slug}`,
        excerpt: `${loc.division} division. ${loc.characterizedBy.slice(0, 120)}${loc.characterizedBy.length > 120 ? "…" : ""}`,
        score: sc,
      });
    }
  }

  // Industries
  for (const ind of INDUSTRIES) {
    const sc = score(needle, ind.name, ind.description, ind.priorities.join(" "));
    if (sc < 999) {
      hits.push({
        kind: "industry",
        title: `Marketing for ${ind.name}`,
        url: `/industries/${ind.slug}`,
        excerpt: ind.description,
        score: sc,
      });
    }
  }

  // Guides
  for (const guide of GUIDES) {
    const sc = score(needle, guide.title, guide.description, guide.answer);
    if (sc < 999) {
      hits.push({
        kind: "guide",
        title: guide.title,
        url: `/guides/${guide.slug}`,
        excerpt: guide.description,
        score: sc,
      });
    }
  }

  // Compares
  for (const cmp of COMPARES) {
    if (!cmp.ready) continue;
    const sc = score(needle, cmp.title, cmp.description, cmp.answer);
    if (sc < 999) {
      hits.push({
        kind: "compare",
        title: cmp.title,
        url: `/compare/${cmp.slug}`,
        excerpt: cmp.description,
        score: sc,
      });
    }
  }

  // Blog posts (DB-backed; gracefully returns [] if Neon is unreachable)
  try {
    const posts = await getPublishedPosts("en");
    for (const p of posts) {
      const tagBlob = Array.isArray(p.tags) ? (p.tags as string[]).join(" ") : "";
      const sc = score(needle, p.title, p.excerpt, p.categorySlug, tagBlob);
      if (sc < 999) {
        hits.push({
          kind: "post",
          title: p.title,
          url: `/blog/${p.slug}`,
          excerpt: p.excerpt,
          score: sc + 0.1,
        });
      }
    }
  } catch {
    /* DB unreachable — silently skip posts */
  }

  // Case studies (DB-backed)
  try {
    const cases = await getPublishedCaseStudies("en");
    for (const c of cases) {
      const sc = score(needle, c.title, c.summary, c.industry, c.clientName);
      if (sc < 999) {
        hits.push({
          kind: "case-study",
          title: c.title,
          url: `/case-studies/${c.slug}`,
          excerpt: c.summary,
          score: sc,
        });
      }
    }
  } catch {
    /* DB unreachable */
  }

  // Static pages worth surfacing
  const STATIC_PAGES: Array<{ title: string; url: string; excerpt: string; keywords: string }> = [
    { title: "Election readiness", url: "/election", excerpt: "90-day election playbook for Bangladeshi candidates and parties.", keywords: "election candidate party political pr campaign vote constituency" },
    { title: "About Public Pulse", url: "/about", excerpt: "Bangladesh-based 360° digital marketing and political PR agency.", keywords: "about studio founders agency dhaka bangladesh" },
    { title: "Contact", url: "/contact", excerpt: "Send a brief or book a strategy call.", keywords: "contact email phone whatsapp brief" },
    { title: "Press & media", url: "/press", excerpt: "Brand assets, boilerplate, and media enquiries.", keywords: "press media journalist logo brand kit" },
  ];
  for (const pg of STATIC_PAGES) {
    const sc = score(needle, pg.title, pg.excerpt, pg.keywords);
    if (sc < 999) {
      hits.push({ kind: "page", title: pg.title, url: pg.url, excerpt: pg.excerpt, score: sc });
    }
  }

  // Sort by score, then by kind so high-intent pages (service, location)
  // bubble above blog noise when scores tie.
  const kindWeight: Record<Hit["kind"], number> = {
    service: 0, location: 0.05, industry: 0.05, "case-study": 0.05,
    page: 0.1, compare: 0.15, guide: 0.15, post: 0.2, glossary: 0.3,
  };
  hits.sort((a, b) => (a.score + kindWeight[a.kind]) - (b.score + kindWeight[b.kind]));
  return hits.slice(0, 40);
}

const KIND_LABEL: Record<Hit["kind"], string> = {
  service: "Service",
  glossary: "Glossary",
  "case-study": "Case study",
  post: "Article",
  guide: "Guide",
  compare: "Decision matrix",
  location: "Location",
  industry: "Industry",
  page: "Page",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const hits = await runSearch(query);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          webPageSchema({
            path: "/search",
            name: "Search Public Pulse",
            description:
              "Search Public Pulse Agency — guides, services, glossary, case studies, and locations across our Bangladesh marketing playbooks.",
          }),
        ]}
      />

      <section className="bg-paper py-12 md:py-20">
        <Container>
          <Breadcrumbs crumbs={crumbs} />
          <div className="mt-6 max-w-3xl">
            <p className="text-eyebrow uppercase text-brand-orange">Search</p>
            <h1 className="mt-4 text-h1 tracking-tight text-ink">
              Find a guide, service, or case study.
            </h1>
            <p className="mt-5 text-lead text-ink/70">
              Searches across our published Bangladesh marketing playbooks — service
              pages, glossary terms, blog posts, case studies, location and industry hubs.
            </p>
          </div>

          {/* GET form — keeps the URL shareable + bookmark-friendly. */}
          <form method="get" action="/search" className="mt-8 max-w-2xl" role="search">
            <label htmlFor="q" className="sr-only">
              Search the site
            </label>
            <div className="flex items-center gap-3 rounded-full border border-ink/15 bg-paper px-5 py-3 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-brand-orange/30">
              <SearchIcon className="h-5 w-5 flex-shrink-0 text-ink/45" aria-hidden />
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="e.g. paid ads, political pr, hospitality, cox's bazar"
                autoComplete="off"
                className="flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink/40"
              />
              <button type="submit" className="btn btn-orange text-[13px]">
                Search
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </form>

          {query.length >= 2 && (
            <p className="mt-6 text-meta text-ink/55">
              {hits.length === 0
                ? `No results for "${query}".`
                : `${hits.length} result${hits.length === 1 ? "" : "s"} for "${query}".`}
            </p>
          )}
          {query.length > 0 && query.length < 2 && (
            <p className="mt-6 text-meta text-ink/55">Type at least 2 characters.</p>
          )}

          <Suspense fallback={null}>
            <ul className="mt-8 space-y-4">
              {hits.map((h) => (
                <li key={h.url}>
                  <Link
                    href={h.url}
                    className="group block rounded-card border border-ink/10 bg-paper p-5 transition hover:-translate-y-0.5 hover:border-brand-orange hover:shadow-card-hover"
                  >
                    <div className="text-meta uppercase tracking-wider text-brand-orange">
                      {KIND_LABEL[h.kind]}
                    </div>
                    <div className="mt-2 text-h3 font-bold text-ink group-hover:text-brand-orange">
                      {h.title}
                    </div>
                    <p className="mt-1 text-body text-ink/65">{h.excerpt}</p>
                    <p className="mt-3 text-meta text-ink/45">{h.url}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </Suspense>

          {query.length >= 2 && hits.length === 0 && (
            <div className="mt-10 rounded-card border border-dashed border-ink/20 bg-surface-alt p-8 text-center">
              <p className="text-body text-ink/70">Nothing matched. Try a broader term, or browse:</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Link href="/services" className="rounded-full border border-ink/20 px-4 py-1.5 text-sm hover:border-brand-orange">Services</Link>
                <Link href="/blog" className="rounded-full border border-ink/20 px-4 py-1.5 text-sm hover:border-brand-orange">Insights</Link>
                <Link href="/guides" className="rounded-full border border-ink/20 px-4 py-1.5 text-sm hover:border-brand-orange">Guides</Link>
                <Link href="/glossary" className="rounded-full border border-ink/20 px-4 py-1.5 text-sm hover:border-brand-orange">Glossary</Link>
                <Link href="/case-studies" className="rounded-full border border-ink/20 px-4 py-1.5 text-sm hover:border-brand-orange">Case studies</Link>
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
