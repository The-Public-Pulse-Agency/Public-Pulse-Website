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
import { siteSearch, type SiteSearchHit } from "@/lib/site-search";

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

// Search logic moved to src/lib/site-search.ts — shared with /api/search
// JSON endpoint that powers the ⌘K command palette.
type Hit = SiteSearchHit;
async function runSearch(q: string): Promise<Hit[]> {
  return siteSearch(q, 40);
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
