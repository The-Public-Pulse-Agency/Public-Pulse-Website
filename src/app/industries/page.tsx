import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { INDUSTRIES } from "@/lib/taxonomies/industries";

export const metadata: Metadata = buildMetadata({
  title: "Industries | Public Pulse Agency",
  description:
    "Vertical-specific digital marketing across the Bangladesh economy — real estate, e-commerce, restaurants, healthcare, education, NGO, government, RMG, hospitality, fintech.",
  path: "/industries",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Industries", path: "/industries" },
];

export default function IndustriesIndex() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          itemListSchema(
            "Public Pulse Industries",
            INDUSTRIES.map((i) => ({ url: `/industries/${i.slug}`, name: i.name }))
          ),
        ]}
      />

      <section className="bg-paper">
        <Container className="pt-10 pb-14 md:pt-14 md:pb-20">
          <Breadcrumbs crumbs={crumbs} />
          <div className="mt-8 max-w-5xl">
            <span className="chip chip-orange">Industries</span>
            <h1 className="mt-6 text-mega font-extrabold tracking-tight text-ink">
              Verticals we <span className="text-brand-orange">know</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lead text-ink/70">
              Ten verticals we&rsquo;ve worked across the Bangladesh economy — each with its own
              dominant channels, priorities and tested playbooks.
            </p>
          </div>
          <div className="mt-12 max-w-3xl">
            <AnswerBlock>
              Public Pulse Agency runs vertical-tailored digital marketing across the Bangladesh
              economy: real estate, e-commerce, restaurants &amp; food, healthcare, education, NGO
              &amp; development, government, RMG &amp; garments, hospitality, fintech. Each
              industry page surfaces the priorities and aligned services for that vertical.
            </AnswerBlock>
          </div>
        </Container>
      </section>

      <section className="border-t border-ink bg-paper-alt py-16 md:py-24">
        <Container>
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.map((i) => (
              <li key={i.slug}>
                <Link href={`/industries/${i.slug}`} className="card group flex h-full flex-col">
                  <span className="text-meta font-semibold uppercase text-brand-orange">
                    Industry
                  </span>
                  <h2 className="mt-3 text-h3 font-bold text-ink">{i.name}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">
                    {i.description}
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
