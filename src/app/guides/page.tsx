import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Clock } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { GUIDES } from "@/lib/content/guides";

export const metadata: Metadata = buildMetadata({
  title: "Guides | Public Pulse Agency — HowTo playbooks for BD marketing & PR",
  description:
    "Step-by-step HowTo playbooks: Facebook campaigns for BD elections, Meta Conversions API setup, IndexNow publish pipeline. Grounded in Bangladesh marketing reality.",
  path: "/guides",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Guides", path: "/guides" },
];

export default function GuidesIndex() {
  const ready = GUIDES.filter((g) => g.ready);
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          itemListSchema(
            "Public Pulse Guides",
            ready.map((g) => ({ url: `/guides/${g.slug}`, name: g.title }))
          ),
        ]}
      />

      <section className="bg-paper">
        <Container className="pt-10 pb-14 md:pt-14 md:pb-20">
          <Breadcrumbs crumbs={crumbs} />
          <div className="mt-8 max-w-5xl">
            <span className="chip chip-orange">Guides</span>
            <h1 className="mt-6 text-mega font-extrabold tracking-tight text-ink">
              Step-by-step <span className="text-brand-orange">playbooks</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lead text-ink/70">
              HowTo playbooks for Bangladesh digital marketing &amp; political PR. Each guide is
              grounded in real BD context — not a re-skin of a generic SaaS post.
            </p>
          </div>
          <div className="mt-12 max-w-3xl">
            <AnswerBlock>
              The Public Pulse guides library publishes step-by-step playbooks for Bangladesh
              digital marketing and political PR — Facebook campaigns for constituency elections,
              Meta Conversions API setup for BD e-commerce, IndexNow integration. Each guide is
              authored as a HowTo (schema.org) with timing and tooling specified.
            </AnswerBlock>
          </div>
        </Container>
      </section>

      <section className="border-t border-ink bg-paper-alt py-16 md:py-24">
        <Container>
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {ready.map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}`} className="card group flex h-full flex-col">
                  <span className="text-meta font-semibold uppercase text-brand-orange">
                    HowTo
                  </span>
                  <h2 className="mt-3 text-h3 font-bold text-ink">{g.title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/70">
                    {g.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between text-meta text-ink/55">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      {g.totalTime.replace("PT", "").toLowerCase()}
                    </span>
                    <ArrowRight
                      className="h-3.5 w-3.5 text-brand-orange transition group-hover:translate-x-1"
                      aria-hidden
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
