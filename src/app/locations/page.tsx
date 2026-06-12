import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { GradientHero } from "@/components/seo/GradientHero";
import { Container } from "@/components/ui/Container";
import { LOCATIONS } from "@/lib/taxonomies/locations";
import { BangladeshMap } from "@/components/locations/BangladeshMap";

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

      <GradientHero
        crumbs={crumbs}
        chip="Locations"
        title={
          <>
            Across <span className="text-brand-orange">Bangladesh</span>.
          </>
        }
        lead={`Dhaka HQ. Active engagements in ${LOCATIONS.length} cities. Real local context — not copy-pasted templates.`}
        answer="Public Pulse Agency runs digital marketing and political PR engagements across Bangladesh — Dhaka, Chattogram, Sylhet, Khulna, Rajshahi, Cox's Bazar, Gazipur, Narayanganj and Comilla. Each city has its own LocalBusiness page grounded in real local industry mix and consumer behaviour, not generic templates."
      />

      {/* ─── Interactive Bangladesh map ──────────────────────────────
          Geographic SVG with hoverable city dots — replaces the static
          grid as the primary discovery surface. Card list below stays
          for SEO + keyboard browsing. */}
      <section className="border-t border-ink bg-paper py-16 md:py-20">
        <Container>
          <div className="max-w-3xl">
            <p className="text-eyebrow uppercase text-brand-orange">Coverage map</p>
            <h2 className="mt-3 text-h2 tracking-tight text-ink">
              Hover a city. See the local context. Click to open.
            </h2>
          </div>
          <div className="mt-10">
            <BangladeshMap />
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
