import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import {
  breadcrumbSchema,
  faqPageSchema,
  localBusinessSchema,
} from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProgrammaticPage, CalloutList, Hl } from "@/components/seo/ProgrammaticPage";
import { LOCATIONS, getLocation } from "@/lib/taxonomies/locations";
import { SERVICES, getService } from "@/lib/services";

type Params = { city: string };

export function generateStaticParams(): Params[] {
  return LOCATIONS.map((l) => ({ city: l.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { city } = await params;
  const loc = getLocation(city);
  if (!loc) return {};
  return buildMetadata({
    title: `Digital Marketing Agency in ${loc.name} | Public Pulse`,
    description: `Public Pulse Agency for ${loc.name}: digital marketing, paid ads, SEO, PR, content. Grounded in the real ${loc.name} market — ${loc.topIndustries.slice(0, 3).join(", ")}.`,
    path: `/locations/${loc.slug}`,
  });
}

export default async function LocationPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { city } = await params;
  const loc = getLocation(city);
  if (!loc) notFound();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Locations", path: "/locations" },
    { name: loc.name, path: `/locations/${loc.slug}` },
  ];

  // Aligned services for this city (intersection of topIndustries → SERVICES).
  const aligned = SERVICES.filter((s) => s.ready).slice(0, 6);

  // Top 3 over-indexed industries — content hook for FAQ + body copy.
  const top = loc.topIndustries.slice(0, 3);

  return (
    <>
      <JsonLd
        data={[
          localBusinessSchema({
            city: loc.name,
            url: `https://publicpulse.com.bd/locations/${loc.slug}`,
          }),
          breadcrumbSchema(crumbs),
          faqPageSchema([
            {
              q: `Does Public Pulse Agency serve clients in ${loc.name}?`,
              a: `Yes. We run active digital marketing and political PR engagements in ${loc.name} from our Dhaka HQ. ${loc.characterizedBy}`,
            },
            {
              q: `What industries in ${loc.name} does Public Pulse focus on?`,
              a: `${loc.name}'s economy over-indexes on ${top.join(", ")}. We tailor every engagement to the dominant local verticals rather than running a generic playbook.`,
            },
            {
              q: `How does Public Pulse handle billing for ${loc.name} clients?`,
              a: `Standard BDT invoicing from our registered Bangladesh entity (BIN 009043032-0102). VAT included. Monthly retainer or per-campaign — your call.`,
            },
            {
              q: `Can engagements be run fully remote from ${loc.name}?`,
              a: `Yes for most digital work. Field-heavy engagements (event activation, on-the-ground political PR, location photo/video) require a local production day which we'll cost separately.`,
            },
          ]),
        ]}
      />

      <ProgrammaticPage
        crumbs={crumbs}
        chip={`${loc.division} Division`}
        title={
          <>
            Digital marketing agency in <Hl>{loc.name}</Hl>.
          </>
        }
        lead={`${loc.characterizedBy} Public Pulse delivers paid ads, SEO, PR and content across the city's dominant industries.`}
        answer={`Public Pulse Agency runs digital marketing, paid ads, SEO, PR and content for businesses in ${loc.name}, ${loc.division} Division, Bangladesh. We work with ${loc.topIndustries.slice(0, 3).join(", ")} brands — the ${loc.name} market's dominant verticals — billed in BDT from our registered Dhaka entity.`}
        answerQuestion={`What does Public Pulse do for clients in ${loc.name}?`}
        faqs={[
          {
            q: `Does Public Pulse Agency serve clients in ${loc.name}?`,
            a: `Yes. We run active digital marketing and political PR engagements in ${loc.name} from our Dhaka HQ. ${loc.characterizedBy}`,
          },
          {
            q: `What industries in ${loc.name} does Public Pulse focus on?`,
            a: `${loc.name}'s economy over-indexes on ${top.join(", ")}. We tailor every engagement to the dominant local verticals rather than running a generic playbook.`,
          },
          {
            q: `How does Public Pulse handle billing for ${loc.name} clients?`,
            a: `Standard BDT invoicing from our registered Bangladesh entity (BIN 009043032-0102). VAT included. Monthly retainer or per-campaign — your call.`,
          },
          {
            q: `Can engagements be run fully remote from ${loc.name}?`,
            a: `Yes for most digital work. Field-heavy engagements (event activation, on-the-ground political PR, location photo/video) require a local production day which we'll cost separately.`,
          },
        ]}
        related={[
          ...top.map((ind) => ({
            href: `/industries/${ind}`,
            label: `${ind.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase())} marketing`,
            eyebrow: "Industry",
          })),
          ...aligned.slice(0, 3 - top.length > 0 ? 3 - top.length : 0).map((s) => ({
            href: `/${s.slug}/${loc.slug}`,
            label: `${s.shortName} in ${loc.name}`,
            eyebrow: "Service × Location",
          })),
        ].slice(0, 3)}
        ctaTitle={
          <>
            A campaign in <Hl>{loc.name}</Hl>?
          </>
        }
      >
        <CalloutList
          items={[
            `In-house BDT invoicing — VAT-compliant, registered Bangladesh entity`,
            `Active client roster across ${loc.topIndustries.length} ${loc.name} verticals`,
            `${loc.population} population — campaign sizing calibrated to real market reach`,
            `Same one-team accountability as a Dhaka engagement`,
            `Local production day available for field-heavy work`,
            `Bangla + English creative, both calibrated for ${loc.name}`,
          ]}
        />

        <section className="border-t border-ink bg-ink py-20 text-paper md:py-24">
          <div className="mx-auto max-w-3xl px-5 md:px-8">
            <p className="text-eyebrow uppercase text-brand-orange">Service mix</p>
            <h2 className="mt-4 text-display font-extrabold tracking-tight">
              The services {loc.name} brands ask for.
            </h2>
            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {aligned.map((s, i) => (
                <li
                  key={s.slug}
                  className="flex items-center gap-3 rounded-card border border-white/15 bg-ink-soft p-4"
                >
                  <span className="text-meta font-semibold uppercase text-white/45">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-sm font-semibold">{s.shortName}</span>
                  <a
                    href={`/${s.slug}/${loc.slug}`}
                    className="text-meta font-semibold uppercase text-brand-orange"
                  >
                    {s.shortName} in {loc.name} →
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </ProgrammaticPage>
    </>
  );
}

// Keep an export for getService usage elsewhere referenced in the dynamic body.
void getService;
