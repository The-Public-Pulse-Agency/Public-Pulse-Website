import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { COMPARES } from "@/lib/content/compares";

export const metadata: Metadata = buildMetadata({
  title: "Compare | Public Pulse Agency — decision matrices for BD marketing",
  description:
    "Side-by-side comparisons for Bangladesh marketing decisions: in-house team vs integrated agency, Facebook Ads vs Google Ads, channel-by-channel decision matrices.",
  path: "/compare",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Compare", path: "/compare" },
];

export default function CompareIndex() {
  const ready = COMPARES.filter((c) => c.ready);
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          itemListSchema(
            "Public Pulse Comparisons",
            ready.map((c) => ({ url: `/compare/${c.slug}`, name: c.title }))
          ),
        ]}
      />

      <section className="bg-paper">
        <Container className="pt-10 pb-14 md:pt-14 md:pb-20">
          <Breadcrumbs crumbs={crumbs} />
          <div className="mt-8 max-w-5xl">
            <span className="chip chip-orange">Compare</span>
            <h1 className="mt-6 text-mega font-extrabold tracking-tight text-ink">
              Decision <span className="text-brand-orange">matrices</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lead text-ink/70">
              Honest side-by-side comparisons for Bangladesh marketing decisions — no agency
              boosterism, no straw-man takedowns.
            </p>
          </div>
          <div className="mt-12 max-w-3xl">
            <AnswerBlock>
              The Public Pulse compare library publishes side-by-side decision matrices for the
              calls Bangladesh marketing teams have to make — in-house team vs integrated agency,
              Facebook Ads vs Google Ads, channel-by-channel cost/benefit. Each compare ends with
              an honest recommendation, not an agency pitch.
            </AnswerBlock>
          </div>
        </Container>
      </section>

      <section className="border-t border-ink bg-paper-alt py-16 md:py-24">
        <Container>
          <ul className="grid gap-5 md:grid-cols-2">
            {ready.map((c) => (
              <li key={c.slug}>
                <Link href={`/compare/${c.slug}`} className="card group flex h-full flex-col">
                  <span className="text-meta font-semibold uppercase text-brand-orange">
                    {c.leftLabel} vs {c.rightLabel}
                  </span>
                  <h2 className="mt-3 text-h3 font-bold text-ink">{c.title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/70">
                    {c.description}
                  </p>
                  <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                    Open
                    <ArrowRight
                      className="h-3.5 w-3.5 transition group-hover:translate-x-1"
                      aria-hidden
                    />
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
