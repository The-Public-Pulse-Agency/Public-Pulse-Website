import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { LOCATIONS } from "@/lib/taxonomies/locations";

export const metadata: Metadata = buildMetadata({
  title: "Locations | Public Pulse Agency in Bangladesh",
  description:
    "Public Pulse Agency delivers digital marketing and political PR across Bangladesh — Dhaka, Chattogram, Sylhet, Cox's Bazar, Khulna, Rajshahi, Gazipur, Narayanganj, Comilla.",
  path: "/locations",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Locations", path: "/locations" },
];

export default function LocationsIndex() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          itemListSchema(
            "Public Pulse Locations",
            LOCATIONS.map((l) => ({ url: `/locations/${l.slug}`, name: l.name }))
          ),
        ]}
      />

      <section className="bg-paper">
        <Container className="pt-10 pb-14 md:pt-14 md:pb-20">
          <Breadcrumbs crumbs={crumbs} />
          <div className="mt-8 max-w-5xl">
            <span className="chip chip-orange">Locations</span>
            <h1 className="mt-6 text-mega font-extrabold tracking-tight text-ink">
              Across <span className="text-brand-orange">Bangladesh</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lead text-ink/70">
              Dhaka HQ. Active engagements in {LOCATIONS.length} cities. Real local context — not
              copy-pasted templates.
            </p>
          </div>
          <div className="mt-12 max-w-3xl">
            <AnswerBlock>
              Public Pulse Agency runs digital marketing and political PR engagements across
              Bangladesh — Dhaka, Chattogram, Sylhet, Khulna, Rajshahi, Cox&apos;s Bazar, Gazipur,
              Narayanganj and Comilla. Each city has its own LocalBusiness page grounded in real
              local industry mix and consumer behaviour, not generic templates.
            </AnswerBlock>
          </div>
        </Container>
      </section>

      <section className="border-t border-ink bg-paper-alt py-16 md:py-24">
        <Container>
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {LOCATIONS.map((l) => (
              <li key={l.slug}>
                <Link href={`/locations/${l.slug}`} className="card group flex h-full flex-col">
                  <span className="text-meta font-semibold uppercase text-brand-orange">
                    {l.division}
                  </span>
                  <h2 className="mt-3 text-h3 font-bold text-ink">
                    Digital marketing in {l.name}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">
                    {l.characterizedBy}
                  </p>
                  <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                    Open {l.name}
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
