// Compact, metrics-forward case-study detail page.
//
// Sections:
//   • Hero — title + answer-first outcome (data-speakable) + headline metric
//   • Metric callout band — up to 6 CountUp metrics
//   • Challenge → Approach → Result — short prose, scannable
//   • Services + Industry + Location tags (internal-link clustering)
//   • Testimonial (only when real)
//   • FAQ (only when real)
//   • Related case studies
//   • CTA
//
// SEO/AEO/GEO:
//   • Article + BreadcrumbList + (FAQPage if faqs) + (Review if testimonial)
//   • answer-first `data-speakable` AnswerBlock — quotable by engines
//   • Internal links to services + locations + industries
//   • Single H1; CWV-safe (no animated layout props)

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Quote } from "lucide-react";

import { buildMetadata } from "@/lib/seo";
import {
  articleSchema,
  breadcrumbSchema,
  faqPageSchema,
  reviewSchema,
} from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { CountUp } from "@/components/ui/CountUp";
import { InlineBlock } from "@/components/lead-capture";
import {
  getCaseStudyBySlug,
  getPublishedCaseStudies,
  getRelatedCaseStudies,
} from "@/lib/data/case-studies";
import { SERVICES } from "@/lib/services";
import { SITE } from "@/lib/site";

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const all = await getPublishedCaseStudies("en");
    return all.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = await getCaseStudyBySlug(slug, "en");
  if (!study) return {};
  const title = study.seoTitle ?? `${study.title} — case study | Public Pulse`;
  const description =
    study.seoDescription ??
    `${study.metric} in ${study.windowLabel}. ${study.summary}`.slice(0, 160);
  return buildMetadata({
    title,
    description,
    path: `/case-studies/${slug}`,
    ogImage: study.heroImageUrl ?? undefined,
    alternateLanguages: { bn: `/bn/case-studies/${slug}` },
  });
}

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

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = await getCaseStudyBySlug(slug, "en");
  if (!study) notFound();

  const related = await getRelatedCaseStudies(study.slug, study.industry, "en", 3);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Case studies", path: "/case-studies" },
    { name: study.title, path: `/case-studies/${study.slug}` },
  ];

  const itemUrl = `${SITE.url}/case-studies/${study.slug}`;
  const itemId = `${itemUrl}#case-study`;
  const heroParsed = parseMetric(study.metric);
  const serviceLabel = (slug: string) =>
    SERVICES.find((s) => s.slug === slug)?.shortName ?? slug;

  const services = study.services ?? [];
  const metrics = study.metrics ?? [];
  const faqs = study.faqJson ?? [];

  const outcome =
    study.outcomeStatement ??
    `Public Pulse Agency delivered ${study.metric} for ${study.clientName ?? study.industry}${
      study.location ? ` in ${study.location}` : ""
    } in ${study.windowLabel}, running ${services.length > 0 ? services.join(", ") : "the engagement"}. Real measurement, grounded in Bangladesh conditions.`;

  // JSON-LD: Article + BreadcrumbList always. FAQPage only when ≥1 FAQ.
  // Review only when a real testimonial is present (HARD RULE: never fabricate).
  const schemas: object[] = [
    articleSchema({
      slug: study.slug,
      headline: study.title,
      description: study.summary,
      datePublished: study.publishedAt
        ? new Date(study.publishedAt).toISOString()
        : new Date(study.createdAt).toISOString(),
      dateModified: study.updatedAt ? new Date(study.updatedAt).toISOString() : undefined,
      image: study.heroImageUrl ?? `/og?title=${encodeURIComponent(study.title)}&eyebrow=${encodeURIComponent("Case study")}`,
      section: "Case study",
      pathPrefix: "/case-studies",
    }),
    breadcrumbSchema(crumbs),
  ];
  if (faqs.length > 0) schemas.push(faqPageSchema(faqs));
  if (study.testimonialQuote && study.testimonialAttribution) {
    schemas.push(
      reviewSchema({
        itemReviewed: itemId,
        body: study.testimonialQuote,
        rating: 5,
        authorName: study.testimonialAttribution,
      })
    );
  }

  return (
    <>
      <JsonLd data={schemas} />

      {/* ─── Compact hero ─────────────────────────────────────────────── */}
      <section className="border-b border-ink bg-paper">
        <Container className="pt-2">
          <Breadcrumbs crumbs={crumbs} />
        </Container>
        <Container>
          <div className="grid gap-10 py-10 md:grid-cols-12 md:py-16">
            <div className="md:col-span-7">
              <span className="chip chip-orange">{study.industry}</span>
              {study.location && (
                <span className="ml-2 inline-flex items-center rounded-full border border-ink/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink/55">
                  {study.location}
                </span>
              )}
              <h1 className="mt-5 text-[clamp(2rem,2.6vw+1rem,3.4rem)] font-extrabold leading-[1.05] tracking-tight text-ink">
                {study.title}
              </h1>
              {study.clientName && (
                <p className="mt-3 text-sm font-semibold uppercase tracking-wider text-ink/55">
                  {study.clientName}
                </p>
              )}
              <AnswerBlock question={study.title}>{outcome}</AnswerBlock>
            </div>
            <aside
              id="case-study"
              className="rounded-panel border border-ink/10 bg-paper-tint p-8 md:col-span-5"
            >
              <p className="text-eyebrow text-brand-red">Headline outcome</p>
              <div className="mt-3 text-[clamp(2.6rem,4vw+1rem,4.5rem)] font-extrabold leading-[0.95] tracking-tight text-ink">
                {heroParsed.num !== undefined ? (
                  <CountUp value={`${heroParsed.prefix}${heroParsed.num}${heroParsed.suffix}`} duration={1500} />
                ) : (
                  study.metric
                )}
              </div>
              <p className="mt-2 text-meta uppercase text-ink/55">{study.windowLabel}</p>
              {services.length > 0 && (
                <div className="mt-6 border-t border-ink/10 pt-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/55">
                    Services delivered
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {services.map((s) => (
                      <Link
                        key={s}
                        href={`/services/${s}`}
                        className="rounded-full border border-ink/15 bg-paper px-2.5 py-1 text-[11px] font-semibold text-ink/70 hover:border-ink hover:text-ink"
                      >
                        {serviceLabel(s)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </Container>
      </section>

      {/* ─── Optional hero image ──────────────────────────────────────── */}
      {study.heroImageUrl && (
        <section className="bg-paper">
          <Container>
            <div className="-mt-10 mb-12 overflow-hidden rounded-3xl border border-ink/10">
              <Image
                src={study.heroImageUrl}
                alt={study.title}
                width={1200}
                height={630}
                className="h-auto w-full"
                priority
              />
            </div>
          </Container>
        </section>
      )}

      {/* ─── Metric callout band ──────────────────────────────────────── */}
      {metrics.length > 0 && (
        <section className="border-y border-ink bg-ink py-12 text-paper md:py-16">
          <Container>
            <ul className={`grid gap-6 ${metrics.length >= 4 ? "md:grid-cols-3 lg:grid-cols-6" : `md:grid-cols-${metrics.length}`}`}>
              {metrics.map((m, i) => {
                const p = parseMetric(m.value + (m.unit ?? ""));
                return (
                  <li key={`${m.label}-${i}`}>
                    <div className="text-[clamp(2rem,3vw+0.5rem,3.4rem)] font-extrabold leading-[0.95] tracking-tight">
                      {p.num !== undefined ? (
                        <CountUp value={`${p.prefix}${p.num}${p.suffix}`} duration={1500} />
                      ) : (
                        m.value + (m.unit ?? "")
                      )}
                    </div>
                    <div className="mt-2 text-eyebrow text-white/65">{m.label}</div>
                    {m.timeframe && (
                      <div className="mt-1 text-[11px] text-white/45">{m.timeframe}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Container>
        </section>
      )}

      {/* ─── Challenge → Approach → Result (compact) ──────────────────── */}
      <section className="border-b border-ink bg-paper-alt py-16 md:py-20">
        <Container>
          <div className="grid gap-10 md:grid-cols-3">
            {[
              { eyebrow: "Challenge", body: study.challenge ?? null },
              { eyebrow: "Approach", body: study.approach ?? null },
              { eyebrow: "Result", body: study.result ?? null },
            ].map((b) =>
              b.body ? (
                <div key={b.eyebrow}>
                  <p className="text-eyebrow text-brand-red">{b.eyebrow}</p>
                  <p className="mt-3 text-base leading-relaxed text-ink/75 whitespace-pre-line">
                    {b.body}
                  </p>
                </div>
              ) : null
            )}
            {!study.challenge && !study.approach && !study.result && (
              <div className="md:col-span-3">
                <p className="text-base leading-relaxed text-ink/75">{study.summary}</p>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* ─── Testimonial (only when real) ─────────────────────────────── */}
      {study.testimonialQuote && study.testimonialAttribution && (
        <section className="border-b border-ink bg-paper py-16 md:py-20">
          <Container>
            <figure className="mx-auto max-w-3xl">
              <Quote className="h-8 w-8 text-brand-red" aria-hidden />
              <blockquote className="mt-4 text-h2 font-bold leading-[1.15] tracking-tight text-ink">
                &ldquo;{study.testimonialQuote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 text-sm font-semibold uppercase tracking-wider text-ink/55">
                — {study.testimonialAttribution}
              </figcaption>
            </figure>
          </Container>
        </section>
      )}

      {/* ─── FAQ (only when real) ─────────────────────────────────────── */}
      {faqs.length > 0 && (
        <section className="border-b border-ink bg-paper-alt py-16 md:py-20">
          <Container>
            <div className="mx-auto max-w-3xl">
              <p className="text-eyebrow text-brand-red">FAQ</p>
              <h2 className="mt-3 text-h2 font-extrabold tracking-tight text-ink">
                Common questions about this engagement.
              </h2>
              <div className="mt-8 space-y-3">
                {faqs.map((f, i) => (
                  <details
                    key={`${f.q}-${i}`}
                    className="group rounded-card border border-ink/15 bg-paper p-5 open:border-ink"
                  >
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                      <span className="font-semibold text-ink">{f.q}</span>
                      <span
                        aria-hidden
                        className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-ink/20 text-ink/60 transition group-open:rotate-45 group-open:border-brand-orange group-open:text-brand-orange"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-ink/75">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ─── Related (industry cluster) ──────────────────────────────── */}
      {related.length > 0 && (
        <section className="border-b border-ink bg-paper py-16 md:py-20">
          <Container>
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-eyebrow text-brand-red">More in {study.industry}</p>
                <h2 className="mt-3 text-h2 font-extrabold tracking-tight text-ink">
                  Related work.
                </h2>
              </div>
              <Link
                href="/case-studies"
                className="hidden text-sm font-semibold text-brand-orange hover:underline md:inline"
              >
                All case studies &rarr;
              </Link>
            </div>
            <ul className="mt-10 grid gap-5 md:grid-cols-3">
              {related.map((r) => (
                <li key={r.id}>
                  <Link href={`/case-studies/${r.slug}`} className="card group flex h-full flex-col">
                    <span className="chip chip-orange">{r.industry}</span>
                    <div className="mt-5 text-[clamp(1.6rem,2.5vw+0.5rem,2.4rem)] font-extrabold leading-[0.95] tracking-tight text-ink">
                      {r.metric}
                    </div>
                    <p className="mt-1 text-eyebrow text-ink/55">{r.windowLabel}</p>
                    <h3 className="mt-4 text-h3 font-bold text-ink line-clamp-3">{r.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70 line-clamp-2">
                      {r.summary}
                    </p>
                    <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                      Read
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" aria-hidden />
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* ─── CTA — free audit ────────────────────────────────────────── */}
      <section className="border-t border-ink bg-paper-alt py-20 md:py-24">
        <Container>
          <InlineBlock context="service" />
        </Container>
      </section>
    </>
  );
}
