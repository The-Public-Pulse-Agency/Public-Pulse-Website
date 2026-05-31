import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqPageSchema, serviceSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProgrammaticPage, CalloutList, Hl } from "@/components/seo/ProgrammaticPage";
import { SERVICES, getService } from "@/lib/services";
import { INDUSTRIES, getIndustry } from "@/lib/taxonomies/industries";

// SERVICE × INDUSTRY matrix — 9 × 10 = 90 grounded pages at
//   /<service>-for-<industry>     e.g. /paid-ads-for-real-estate
//
// The URL is a single segment with the "-for-" delimiter. We parse it,
// validate against the SERVICES + INDUSTRIES catalogs, and 404 anything
// that doesn't match a real combination.

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return SERVICES.filter((s) => s.ready).flatMap((s) =>
    INDUSTRIES.map((i) => ({ slug: `${s.slug}-for-${i.slug}` }))
  );
}

export const dynamicParams = false;

function parseSlug(slug: string): {
  service: ReturnType<typeof getService>;
  industry: ReturnType<typeof getIndustry>;
} {
  const marker = "-for-";
  const idx = slug.indexOf(marker);
  if (idx <= 0) return { service: undefined, industry: undefined };
  const serviceSlug = slug.slice(0, idx);
  const industrySlug = slug.slice(idx + marker.length);
  return { service: getService(serviceSlug), industry: getIndustry(industrySlug) };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { service, industry } = parseSlug(slug);
  if (!service || !industry) return {};
  return buildMetadata({
    title: `${service.shortName} for ${industry.name} | Public Pulse Agency`,
    description: `Public Pulse delivers ${service.shortName.toLowerCase()} for Bangladesh ${industry.name.toLowerCase()} brands — tuned to the vertical's priorities: ${industry.priorities.slice(0, 3).join(", ")}.`,
    path: `/${slug}`,
    useDynamicOg: true,
    ogTitle: `${service.shortName} for ${industry.name}`,
    ogEyebrow: `${service.category.toUpperCase()} · ${industry.name.toUpperCase()}`,
  });
}

export default async function ServiceIndustryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const { service: s, industry: ind } = parseSlug(slug);
  if (!s || !s.ready || !ind) notFound();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: s.shortName, path: `/services/${s.slug}` },
    { name: ind.name, path: `/${slug}` },
  ];

  const autoFaqs = [
    {
      q: `Does Public Pulse offer ${s.shortName.toLowerCase()} for ${ind.name.toLowerCase()} brands?`,
      a: `Yes. ${s.oneLiner} For ${ind.name} brands we calibrate the engagement to vertical priorities: ${ind.priorities.slice(0, 3).join(", ")}.`,
    },
    {
      q: `What makes ${s.shortName.toLowerCase()} for ${ind.name.toLowerCase()} different?`,
      a: ind.description,
    },
    {
      q: `Which other services pair well with this for ${ind.name.toLowerCase()}?`,
      a: `Our default ${ind.name} playbook pairs ${ind.alignedServices.slice(0, 3).join(", ")} — we walk through fit on a consultation call.`,
    },
    {
      q: `How is this priced?`,
      a: `Monthly retainer or per-campaign. Free 30-minute consultation; written scope + single KPI before kickoff.`,
    },
  ];

  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            slug: s.slug,
            name: `${s.name} for ${ind.name}`,
            description: `${s.oneLiner} For Bangladesh ${ind.name} brands.`,
            serviceType: s.serviceType,
            category: s.category,
          }),
          breadcrumbSchema(crumbs),
          faqPageSchema(autoFaqs),
        ]}
      />

      <ProgrammaticPage
        crumbs={crumbs}
        chip={`${ind.name} × ${s.category}`}
        title={
          <>
            {s.shortName} for <Hl>{ind.name}</Hl>.
          </>
        }
        lead={`${s.oneLiner} Calibrated to ${ind.name.toLowerCase()} priorities.`}
        answer={`Public Pulse Agency delivers ${s.shortName.toLowerCase()} for Bangladesh ${ind.name} brands. ${ind.description} The engagement is tuned to ${ind.name.toLowerCase()} priorities: ${ind.priorities.slice(0, 3).join(", ")} — not generic ${s.shortName.toLowerCase()} delivered to whoever signs.`}
        answerQuestion={`What does ${s.shortName} for ${ind.name} look like?`}
        faqs={autoFaqs}
        related={[
          { href: `/services/${s.slug}`, label: `${s.shortName} (full overview)`, eyebrow: "Service" },
          { href: `/industries/${ind.slug}`, label: `${ind.name} marketing (vertical)`, eyebrow: "Industry" },
        ]}
        ctaTitle={
          <>
            <Hl>{s.shortName}</Hl> for {ind.name}?
          </>
        }
      >
        <CalloutList items={ind.priorities} />
      </ProgrammaticPage>
    </>
  );
}
