// বাংলা case-study detail. Falls back to EN if a BN-authored version
// doesn't exist yet (and links the visitor to the EN canonical to avoid
// faking a translation).

import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { buildMetadata } from "@/lib/seo";
import {
  articleSchema,
  breadcrumbSchema,
  faqPageSchema,
} from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { CountUp } from "@/components/ui/CountUp";
import { getCaseStudyBySlug } from "@/lib/data/case-studies";
import { SITE } from "@/lib/site";

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = await getCaseStudyBySlug(slug, "bn");
  if (!study) return {};
  return buildMetadata({
    title: `${study.title} — কেস স্টাডি | পাবলিক পালস`,
    description: study.seoDescription ?? `${study.metric} ${study.windowLabel}। ${study.summary}`.slice(0, 160),
    path: `/bn/case-studies/${slug}`,
    alternateLanguages: { en: `/case-studies/${slug}` },
  });
}

function parseMetric(metric: string): { num?: number; prefix: string; suffix: string } {
  const m = metric.trim().match(/^([+-])?\s*([\d.,]+)\s*([%a-zA-Z×x]*)$/);
  if (!m) return { prefix: "", suffix: "" };
  const sign = m[1];
  const digits = m[2];
  const unit = m[3];
  const n = parseFloat(digits.replace(/,/g, ""));
  if (!isFinite(n)) return { prefix: "", suffix: "" };
  return { num: n, prefix: sign === "-" ? "-" : sign === "+" ? "+" : "", suffix: unit ?? "" };
}

export default async function BnCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = await getCaseStudyBySlug(slug, "bn");
  // BN not authored yet → redirect to EN (never machine-translate inline).
  if (!study) {
    const en = await getCaseStudyBySlug(slug, "en");
    if (!en) notFound();
    redirect(`/case-studies/${slug}`);
  }

  const crumbs = [
    { name: "হোম", path: "/" },
    { name: "কেস স্টাডি", path: "/bn/case-studies" },
    { name: study.title, path: `/bn/case-studies/${study.slug}` },
  ];

  const itemUrl = `${SITE.url}/bn/case-studies/${study.slug}`;
  const heroParsed = parseMetric(study.metric);
  const faqs = study.faqJson ?? [];
  const outcome = study.outcomeStatement ?? study.summary;

  const schemas: object[] = [
    articleSchema({
      slug: study.slug,
      headline: study.title,
      description: study.summary,
      datePublished: study.publishedAt
        ? new Date(study.publishedAt).toISOString()
        : new Date(study.createdAt).toISOString(),
      dateModified: study.updatedAt ? new Date(study.updatedAt).toISOString() : undefined,
      image: study.heroImageUrl ?? `/og?title=${encodeURIComponent(study.title)}&eyebrow=${encodeURIComponent("কেস স্টাডি")}`,
      section: "Case study",
      inLanguage: "bn-BD",
      pathPrefix: "/bn/case-studies",
    }),
    breadcrumbSchema(crumbs),
  ];
  if (faqs.length > 0) schemas.push(faqPageSchema(faqs));

  return (
    <>
      <JsonLd data={schemas} />
      <section className="border-b border-ink bg-paper">
        <Container className="pt-2">
          <Breadcrumbs crumbs={crumbs} />
        </Container>
        <Container>
          <div className="grid gap-10 py-10 md:grid-cols-12 md:py-16">
            <div className="md:col-span-7">
              <span className="chip chip-orange">{study.industry}</span>
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
            <aside className="rounded-panel border border-ink/10 bg-paper-tint p-8 md:col-span-5">
              <p className="text-eyebrow text-brand-red">প্রধান ফলাফল</p>
              <div className="mt-3 text-[clamp(2.6rem,4vw+1rem,4.5rem)] font-extrabold leading-[0.95] tracking-tight text-ink">
                {heroParsed.num !== undefined ? (
                  <CountUp value={`${heroParsed.prefix}${heroParsed.num}${heroParsed.suffix}`} duration={1500} />
                ) : (
                  study.metric
                )}
              </div>
              <p className="mt-2 text-meta uppercase text-ink/55">{study.windowLabel}</p>
            </aside>
          </div>
        </Container>
      </section>

      <section className="border-b border-ink bg-paper-alt py-16">
        <Container>
          <div className="grid gap-10 md:grid-cols-3">
            {[
              { eyebrow: "চ্যালেঞ্জ", body: study.challenge },
              { eyebrow: "পদ্ধতি", body: study.approach },
              { eyebrow: "ফলাফল", body: study.result },
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
          </div>
          <p className="mt-12 text-meta text-ink/55">
            English version:{" "}
            <Link href={`/case-studies/${study.slug}`} className="underline hover:text-brand-orange">
              /case-studies/{study.slug}
            </Link>
          </p>
        </Container>
      </section>
    </>
  );
}
