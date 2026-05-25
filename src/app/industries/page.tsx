import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { GradientHero } from "@/components/seo/GradientHero";
import { Container } from "@/components/ui/Container";
import { INDUSTRIES } from "@/lib/taxonomies/industries";
import { getIndustryIcon } from "@/lib/icons";

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

      <GradientHero
        crumbs={crumbs}
        chip="Industries"
        title={
          <>
            Verticals we <span className="text-brand-orange">know</span>.
          </>
        }
        lead="Ten verticals we've worked across the Bangladesh economy — each with its own dominant channels, priorities and tested playbooks."
        answer="Public Pulse Agency runs vertical-tailored digital marketing across the Bangladesh economy: real estate, e-commerce, restaurants & food, healthcare, education, NGO & development, government, RMG & garments, hospitality, fintech. Each industry page surfaces the priorities and aligned services for that vertical."
      />

      <section className="border-t border-ink bg-paper-alt py-16 md:py-24">
        <Container>
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.map((i) => {
              const Icon = getIndustryIcon(i.slug);
              return (
              <li key={i.slug}>
                <Link href={`/industries/${i.slug}`} className="card group flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-meta font-semibold uppercase text-brand-orange">
                      Industry
                    </span>
                    <span className="grid h-11 w-11 place-items-center rounded-card bg-brand-orange/10 text-brand-orange transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" aria-hidden>
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <h2 className="mt-5 text-h3 font-bold text-ink">{i.name}</h2>
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
              );
            })}
          </ul>
        </Container>
      </section>
    </>
  );
}
