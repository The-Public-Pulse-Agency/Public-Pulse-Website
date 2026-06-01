import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqPageSchema, industrySchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProgrammaticPage, CalloutList, Hl } from "@/components/seo/ProgrammaticPage";
import { INDUSTRIES, getIndustry } from "@/lib/taxonomies/industries";
import { SERVICES, getService } from "@/lib/services";

type Params = { industry: string };

export function generateStaticParams(): Params[] {
  return INDUSTRIES.map((i) => ({ industry: i.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { industry } = await params;
  const ind = getIndustry(industry);
  if (!ind) return {};
  return buildMetadata({
    title: `Digital Marketing for ${ind.name} | Public Pulse`,
    description: `Public Pulse Agency runs vertical-tailored digital marketing for ${ind.name} brands in Bangladesh — ${ind.priorities.slice(0, 3).join(", ")}.`,
    path: `/industries/${ind.slug}`,
    useDynamicOg: true,
    ogTitle: `Digital Marketing for ${ind.name}`,
    ogEyebrow: `INDUSTRY · ${ind.name.toUpperCase()}`,
  });
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { industry } = await params;
  const ind = getIndustry(industry);
  if (!ind) notFound();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Industries", path: "/industries" },
    { name: ind.name, path: `/industries/${ind.slug}` },
  ];

  // Resolve aligned services to real service entries.
  const alignedServices = ind.alignedServices
    .map((slug) => getService(slug))
    .filter((s): s is NonNullable<ReturnType<typeof getService>> => s != null && s.ready)
    .slice(0, 6);

  return (
    <>
      <JsonLd
        data={[
          industrySchema({
            slug: ind.slug,
            name: ind.name,
            description: ind.description,
            alignedServiceSlugs: alignedServices.map((s) => s.slug),
          }),
          breadcrumbSchema(crumbs),
          faqPageSchema([
            {
              q: `Does Public Pulse work with ${ind.name} brands?`,
              a: `Yes. ${ind.description} Our aligned services for this vertical: ${alignedServices.map((s) => s.shortName).join(", ")}.`,
            },
            {
              q: `What does ${ind.name} marketing usually prioritise?`,
              a: `In Bangladesh, ${ind.name} brands typically prioritise: ${ind.priorities.join("; ")}. We tune every engagement to those.`,
            },
            {
              q: `Which services does Public Pulse pair with ${ind.name}?`,
              a: `Our default playbook for ${ind.name} pairs ${alignedServices.slice(0, 3).map((s) => s.shortName).join(", ")} — adjusted per brand maturity.`,
            },
            {
              q: `How is a ${ind.name} engagement priced?`,
              a: `Monthly retainer or per-campaign, depending on scope. Discovery call first; written scope with named owners + a single KPI before kickoff.`,
            },
          ]),
        ]}
      />

      <ProgrammaticPage
        crumbs={crumbs}
        chip="Industry"
        title={
          <>
            Digital marketing for <Hl>{ind.name}</Hl>.
          </>
        }
        lead={ind.description}
        answer={`Public Pulse Agency runs ${alignedServices.slice(0, 4).map((s) => s.shortName.toLowerCase()).join(", ")} for ${ind.name} brands in Bangladesh. We prioritise ${ind.priorities.slice(0, 3).join(", ")} — the moves that actually move the needle in this vertical, not generic agency playbooks.`}
        answerQuestion={`What does Public Pulse do for ${ind.name} clients?`}
        faqs={[
          {
            q: `Does Public Pulse work with ${ind.name} brands?`,
            a: `Yes. ${ind.description} Our aligned services for this vertical: ${alignedServices.map((s) => s.shortName).join(", ")}.`,
          },
          {
            q: `What does ${ind.name} marketing usually prioritise?`,
            a: `In Bangladesh, ${ind.name} brands typically prioritise: ${ind.priorities.join("; ")}. We tune every engagement to those.`,
          },
          {
            q: `Which services does Public Pulse pair with ${ind.name}?`,
            a: `Our default playbook for ${ind.name} pairs ${alignedServices.slice(0, 3).map((s) => s.shortName).join(", ")} — adjusted per brand maturity.`,
          },
          {
            q: `How is a ${ind.name} engagement priced?`,
            a: `Monthly retainer or per-campaign, depending on scope. Discovery call first; written scope with named owners + a single KPI before kickoff.`,
          },
        ]}
        related={alignedServices.slice(0, 3).map((s) => ({
          href: `/${s.slug}-for-${ind.slug}`,
          label: `${s.shortName} for ${ind.name}`,
          eyebrow: "Service × Industry",
        }))}
        ctaTitle={
          <>
            A <Hl>{ind.name}</Hl> brief?
          </>
        }
      >
        <CalloutList items={ind.priorities} />
      </ProgrammaticPage>
    </>
  );
}

// services lookup is referenced in body
void SERVICES;
