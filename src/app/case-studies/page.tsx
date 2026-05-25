import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { getPublishedCaseStudies } from "@/lib/data/case-studies";

export const metadata: Metadata = buildMetadata({
  title: "Case Studies | Public Pulse Agency — Bangladesh client results",
  description:
    "Real engagement results from Public Pulse clients across Bangladesh hospitality, e-commerce, political PR and brand-building. Metrics-led case studies.",
  path: "/case-studies",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Case Studies", path: "/case-studies" },
];

export default async function CaseStudiesIndex() {
  const cases = await getPublishedCaseStudies();
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          itemListSchema(
            "Public Pulse Case Studies",
            cases.map((c) => ({ url: `/case-studies/${c.slug}`, name: `${c.industry} — ${c.metric}` }))
          ),
        ]}
      />

      <section className="bg-paper">
        <Container className="pt-10 pb-14 md:pt-14 md:pb-20">
          <Breadcrumbs crumbs={crumbs} />
          <div className="mt-8 max-w-5xl">
            <span className="chip chip-orange">Case studies</span>
            <h1 className="mt-6 text-mega font-extrabold tracking-tight text-ink">
              Receipts. <span className="text-brand-orange">Not vibes.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lead text-ink/70">
              Real engagement results — metrics-led, dated, named where the client has approved
              attribution; industry-described where NDAs apply.
            </p>
          </div>
          <div className="mt-12 max-w-3xl">
            <AnswerBlock>
              Public Pulse case studies are published as Review + Service JSON-LD with the metric,
              the time window, the industry, and the engagement summary. Named where the client
              has approved; otherwise industry-only. No anonymized vanity numbers — every metric
              ties to a real engagement.
            </AnswerBlock>
          </div>
        </Container>
      </section>

      <section className="border-t border-ink bg-paper-alt py-16 md:py-24">
        <Container>
          {cases.length === 0 ? (
            <p className="mx-auto max-w-2xl text-center text-ink/55">
              No public case studies yet — engagements are under NDA. Reach out for walk-through.
            </p>
          ) : (
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {cases.map((c) => (
                <li key={c.id}>
                  <article className="card flex h-full flex-col">
                    <p className="text-meta uppercase tracking-wider text-ink/55">{c.industry}</p>
                    <p className="mt-4 text-[clamp(2rem,3vw+1rem,3.5rem)] font-extrabold leading-none tracking-tight text-ink">
                      {c.metric}
                    </p>
                    <p className="mt-2 text-meta uppercase text-ink/55">Over {c.windowLabel}</p>
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-ink/70">{c.summary}</p>
                    {c.serviceSlug && (
                      <Link
                        href={`/services/${c.serviceSlug}`}
                        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange"
                      >
                        See service
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    )}
                  </article>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>
    </>
  );
}
