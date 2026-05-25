// Modern compact case-studies index — filterable grid, dense but breathable.
// Reuses the site design system; restrained motion (TiltCard on cards).
// Renders ONLY real published rows from /manage/case-studies — empty-state
// shows a value-led CTA, never fabricated placeholders.

import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { GradientHero } from "@/components/seo/GradientHero";
import { Container } from "@/components/ui/Container";
import { TiltCard } from "@/components/motion";
import { CountUp } from "@/components/ui/CountUp";
import { InlineBlock } from "@/components/lead-capture";
import { getPublishedCaseStudies } from "@/lib/data/case-studies";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = buildMetadata({
  title: "Case Studies | Public Pulse — Bangladesh client results",
  description:
    "Real client outcomes — paid, social, PR, SEO — across Bangladesh hospitality, e-commerce and political PR. Metrics-first, grounded in real campaigns.",
  path: "/case-studies",
  alternateLanguages: { bn: "/bn/case-studies" },
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Case studies", path: "/case-studies" },
];

/** Try to coerce "+47%", "47%", "2.3x", "-32" into a numeric CountUp value
 *  + its display suffix/prefix. Falls back to plain text on unparseable. */
function parseMetric(metric: string): { num?: number; prefix: string; suffix: string; raw: string } {
  const m = metric.trim().match(/^([+-])?\s*([\d.,]+)\s*([%a-zA-Z×x]*)$/);
  if (!m) return { raw: metric, prefix: "", suffix: "" };
  const sign = m[1];
  const digits = m[2];
  const unit = m[3];
  const n = parseFloat(digits.replace(/,/g, ""));
  if (!isFinite(n)) return { raw: metric, prefix: "", suffix: "" };
  return {
    num: n,
    prefix: sign === "-" ? "-" : sign === "+" ? "+" : "",
    suffix: unit ?? "",
    raw: metric,
  };
}

export default async function CaseStudiesIndex({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string; service?: string }>;
}) {
  const sp = await searchParams;
  const cases = await getPublishedCaseStudies("en");

  const activeIndustry = sp.industry;
  const activeService = sp.service;

  const filtered = cases.filter((c) => {
    if (activeIndustry && c.industry !== activeIndustry) return false;
    if (activeService) {
      const services = c.services ?? [];
      const matches = services.includes(activeService) || c.serviceSlug === activeService;
      if (!matches) return false;
    }
    return true;
  });

  // Build facets from real data — never show chips that no entry matches.
  const industries = Array.from(new Set(cases.map((c) => c.industry))).sort();
  const servicesSeen = Array.from(
    new Set([
      ...cases.flatMap((c) => c.services ?? []),
      ...cases.flatMap((c) => (c.serviceSlug ? [c.serviceSlug] : [])),
    ])
  ).sort();
  const serviceLabel = (slug: string) =>
    SERVICES.find((s) => s.slug === slug)?.shortName ?? slug;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          collectionPageSchema({
            path: "/case-studies",
            name: "Public Pulse case studies",
            description:
              "Real client outcomes for Bangladesh brands — paid, social, PR, SEO.",
            items: filtered.map((c) => ({ url: `/case-studies/${c.slug}`, name: c.title })),
          }),
          itemListSchema(
            "Public Pulse case studies",
            filtered.map((c) => ({ url: `/case-studies/${c.slug}`, name: c.title }))
          ),
        ]}
      />

      <GradientHero
        crumbs={crumbs}
        chip="Case studies"
        title={
          <>
            Work that <span className="text-brand-orange">measured up</span>.
          </>
        }
        lead={`${cases.length} real engagement${cases.length === 1 ? "" : "s"} from Bangladesh brands and campaigns. No fluff, no fabricated screenshots — every number is real, citable, and grounded in work we delivered.`}
        answer={`Public Pulse case studies show real client outcomes across Bangladesh — paid, social, PR, SEO and political PR. ${cases.length} published engagement${cases.length === 1 ? "" : "s"} with documented metrics, time windows, and the services delivered. Where NDAs apply, client names are anonymised to a sector label.`}
      />

      {/* ─── Filter chips ──────────────────────────────────────────────── */}
      {cases.length > 0 && (
        <section className="border-t border-ink bg-paper py-6">
          <Container>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/case-studies"
                className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                  !activeIndustry && !activeService
                    ? "border-ink bg-ink text-paper"
                    : "border-ink/20 bg-paper text-ink/70 hover:border-ink"
                }`}
              >
                All ({cases.length})
              </Link>
              {industries.map((ind) => {
                const count = cases.filter((c) => c.industry === ind).length;
                return (
                  <Link
                    key={ind}
                    href={`/case-studies?industry=${encodeURIComponent(ind)}`}
                    className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                      activeIndustry === ind
                        ? "border-ink bg-ink text-paper"
                        : "border-ink/20 bg-paper text-ink/70 hover:border-ink"
                    }`}
                  >
                    {ind} ({count})
                  </Link>
                );
              })}
              {servicesSeen.length > 0 && (
                <span className="mx-2 h-4 w-px bg-ink/15" aria-hidden />
              )}
              {servicesSeen.map((s) => {
                const count = cases.filter((c) => (c.services ?? []).includes(s) || c.serviceSlug === s).length;
                return (
                  <Link
                    key={s}
                    href={`/case-studies?service=${encodeURIComponent(s)}`}
                    className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                      activeService === s
                        ? "border-brand-orange bg-brand-orange text-paper"
                        : "border-ink/20 bg-paper text-ink/70 hover:border-ink"
                    }`}
                  >
                    {serviceLabel(s)} ({count})
                  </Link>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* ─── Grid ─────────────────────────────────────────────────────── */}
      <section className="border-t border-ink bg-paper-alt py-16 md:py-24">
        <Container>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink/20 bg-paper p-10 text-center">
              <p className="text-ink/55">
                {cases.length === 0
                  ? "Case studies are being written up — the latest will appear here soon."
                  : "No case studies match these filters. Try removing them above."}
              </p>
              <p className="mt-4 text-meta text-ink/45">
                In the meantime, see what we deliver under{" "}
                <Link href="/services" className="underline hover:text-brand-orange">
                  services
                </Link>
                {" "}or{" "}
                <Link href="/contact" className="underline hover:text-brand-orange">
                  talk to the team
                </Link>
                .
              </p>
            </div>
          ) : (
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => {
                const parsed = parseMetric(c.metric);
                return (
                  <li key={c.id}>
                    <TiltCard maxTilt={4}>
                      <Link
                        href={`/case-studies/${c.slug}`}
                        className="card group flex h-full flex-col"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="chip chip-orange">{c.industry}</span>
                          {c.location && (
                            <span className="inline-flex items-center rounded-full border border-ink/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink/55">
                              {c.location}
                            </span>
                          )}
                        </div>
                        {/* Big headline metric */}
                        <div className="mt-6">
                          <div className="text-[clamp(2.2rem,4vw+0.5rem,3.5rem)] font-extrabold leading-[0.95] tracking-tight text-ink">
                            {parsed.num !== undefined ? (
                              <CountUp value={`${parsed.prefix}${parsed.num}${parsed.suffix}`} />
                            ) : (
                              c.metric
                            )}
                          </div>
                          <div className="mt-2 text-eyebrow text-ink/55">
                            {c.windowLabel}
                          </div>
                        </div>
                        <h2 className="mt-5 text-h3 font-bold text-ink line-clamp-3">
                          {c.title}
                        </h2>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70 line-clamp-3">
                          {c.summary}
                        </p>
                        {(c.services ?? []).length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {(c.services ?? []).slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="rounded-full border border-ink/15 bg-paper-tint px-2 py-0.5 text-[10px] font-semibold uppercase text-ink/65"
                              >
                                {serviceLabel(s)}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4 text-meta text-ink/55">
                          <span>{c.clientName ?? c.industry}</span>
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                            Read
                            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" aria-hidden />
                          </span>
                        </div>
                      </Link>
                    </TiltCard>
                  </li>
                );
              })}
            </ul>
          )}
        </Container>
      </section>

      {/* ─── Free audit CTA — same surface as the service pages ───────── */}
      <section className="border-t border-ink bg-paper py-20 md:py-24">
        <Container>
          <InlineBlock context="service" />
        </Container>
      </section>
    </>
  );
}
