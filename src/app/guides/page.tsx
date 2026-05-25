import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Clock } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { GradientHero } from "@/components/seo/GradientHero";
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

      <GradientHero
        crumbs={crumbs}
        chip="Guides"
        title={
          <>
            Step-by-step <span className="text-brand-orange">playbooks</span>.
          </>
        }
        lead="HowTo playbooks for Bangladesh digital marketing & political PR. Each guide is grounded in real BD context — not a re-skin of a generic SaaS post."
        answer="The Public Pulse guides library publishes step-by-step playbooks for Bangladesh digital marketing and political PR — Facebook campaigns for constituency elections, Meta Conversions API setup for BD e-commerce, IndexNow integration. Each guide is authored as a HowTo (schema.org) with timing and tooling specified."
      />

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
