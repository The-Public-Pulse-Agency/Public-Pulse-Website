import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import {
  breadcrumbSchema,
  faqPageSchema,
  localBusinessSchema,
  serviceSchema,
} from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProgrammaticPage, CalloutList, Hl } from "@/components/seo/ProgrammaticPage";
import { SERVICES, getService } from "@/lib/services";
import { LOCATIONS, getLocation } from "@/lib/taxonomies/locations";

// Folder must be named [slug] (not [service]) — Next.js requires consistent
// dynamic-segment names at the same path depth as sibling /(matrix)/[slug]/.
type Params = { slug: string; city: string };

// SERVICE × LOCATION matrix — 9 services × 9 locations = 81 grounded pages.
//
// Route lives under (matrix) route group so the URL is bare `/<service>/<city>`
// without leaking into the actual /services/<slug> tree. The catch is that
// generateStaticParams + dynamicParams=false guarantees a 404 for any
// service/city that isn't a real combination.

export function generateStaticParams(): Params[] {
  return SERVICES.filter((s) => s.ready).flatMap((s) =>
    LOCATIONS.map((l) => ({ slug: s.slug, city: l.slug }))
  );
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug, city } = await params;
  const s = getService(slug);
  const l = getLocation(city);
  if (!s || !l) return {};
  return buildMetadata({
    title: `${s.shortName} in ${l.name} | Public Pulse Agency`,
    description: `${s.oneLiner} Public Pulse delivers ${s.shortName.toLowerCase()} for ${l.name} brands — grounded in the local market.`,
    path: `/${s.slug}/${l.slug}`,
  });
}

export default async function ServiceLocationPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug, city } = await params;
  const s = getService(slug);
  const l = getLocation(city);
  if (!s || !s.ready || !l) notFound();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: s.shortName, path: `/services/${s.slug}` },
    { name: l.name, path: `/${s.slug}/${l.slug}` },
  ];

  const url = `https://publicpulse.com.bd/${s.slug}/${l.slug}`;

  const autoFaqs = [
    {
      q: `Does Public Pulse offer ${s.shortName.toLowerCase()} in ${l.name}?`,
      a: `Yes. ${s.oneLiner} We deliver it for ${l.name} brands from our Dhaka HQ, calibrated to the local market: ${l.characterizedBy}`,
    },
    {
      q: `How does ${s.shortName.toLowerCase()} in ${l.name} differ from ${s.shortName.toLowerCase()} elsewhere in Bangladesh?`,
      a: `${l.name} over-indexes on ${l.topIndustries.slice(0, 3).join(", ")}. The playbook we use in ${l.name} weights toward those verticals — different creative, different paid mix, different KPIs than the same service in, say, Dhaka.`,
    },
    {
      q: `What's the entry-level engagement for ${s.shortName} in ${l.name}?`,
      a: `Monthly retainer or per-campaign — depends on scope. Free 30-minute consultation to scope your specific situation.`,
    },
    {
      q: `Do I need to travel to Dhaka to work with Public Pulse?`,
      a: `No. Most of the engagement runs remotely. Field-heavy work (location video, on-the-ground PR) gets a costed local production day.`,
    },
  ];

  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            slug: s.slug,
            name: `${s.name} in ${l.name}`,
            description: `${s.oneLiner} For ${l.name} brands.`,
            serviceType: s.serviceType,
            category: s.category,
          }),
          localBusinessSchema({ city: l.name, url }),
          breadcrumbSchema(crumbs),
          faqPageSchema(autoFaqs),
        ]}
      />

      <ProgrammaticPage
        crumbs={crumbs}
        chip={`${s.category} · ${l.division}`}
        title={
          <>
            {s.shortName} in <Hl>{l.name}</Hl>.
          </>
        }
        lead={`${s.oneLiner} For brands operating in ${l.name}, ${l.division} Division.`}
        answer={`Public Pulse Agency delivers ${s.shortName.toLowerCase()} for ${l.name} brands. We tune every engagement to the local market — ${l.name} over-indexes on ${l.topIndustries.slice(0, 3).join(", ")}, so the playbook and KPIs we run differ from generic ${s.shortName.toLowerCase()} delivered elsewhere.`}
        answerQuestion={`What does ${s.shortName} look like for ${l.name} brands?`}
        faqs={autoFaqs}
        related={[
          { href: `/services/${s.slug}`, label: `${s.shortName} (full service overview)`, eyebrow: "Service" },
          { href: `/locations/${l.slug}`, label: `Marketing in ${l.name} (city overview)`, eyebrow: "Location" },
          ...l.topIndustries.slice(0, 1).map((ind) => ({
            href: `/${s.slug}-for-${ind}`,
            label: `${s.shortName} for ${ind.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase())}`,
            eyebrow: "Service × Industry",
          })),
        ]}
        ctaTitle={
          <>
            <Hl>{s.shortName}</Hl> for a {l.name} brand?
          </>
        }
      >
        <CalloutList
          items={[
            `${l.population} population — campaign sizing calibrated to real reach`,
            `Strongest local verticals: ${l.topIndustries.slice(0, 3).join(", ")}`,
            `${l.characterizedBy.split(".")[0]}.`,
            `Same one-team accountability as a Dhaka engagement`,
            `BDT invoicing from our registered BD entity`,
            `Bangla + English creative — both calibrated for ${l.name}`,
          ]}
        />
      </ProgrammaticPage>
    </>
  );
}
