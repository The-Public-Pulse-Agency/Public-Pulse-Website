// Modern compact case-studies index — filterable grid, dense but breathable.
// Server fetches once, ISR-cached. Client component (CaseStudiesFilter)
// reads useSearchParams + filters — keeps the page CDN-cacheable.

import type { Metadata } from "next";
import { Suspense } from "react";

import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { GradientHero } from "@/components/seo/GradientHero";
import { Container } from "@/components/ui/Container";
import { InlineBlock } from "@/components/lead-capture";
import { getPublishedCaseStudies } from "@/lib/data/case-studies";
import { SERVICES } from "@/lib/services";
import { CaseStudiesFilter } from "@/components/case-studies/CaseStudiesFilter";

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: "Case Studies | Public Pulse — Bangladesh client results",
  description:
    "Real client outcomes — paid, social, PR, SEO — across Bangladesh hospitality, e-commerce and political PR. Metrics-first, grounded in real campaigns.",
  path: "/case-studies",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Case studies", path: "/case-studies" },
];

export default async function CaseStudiesIndex() {
  const cases = await getPublishedCaseStudies("en");

  const serviceLabels: Record<string, string> = {};
  for (const s of SERVICES) serviceLabels[s.slug] = s.shortName;

  const serialized = cases.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    summary: c.summary,
    industry: c.industry,
    location: c.location ?? null,
    metric: c.metric,
    windowLabel: c.windowLabel,
    services: c.services ?? [],
    serviceSlug: c.serviceSlug ?? null,
    clientName: c.clientName ?? null,
  }));

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          collectionPageSchema({
            path: "/case-studies",
            name: "Public Pulse case studies",
            description:
              "Real client outcomes for Bangladesh brands — paid, social, PR, SEO.",
            items: cases.map((c) => ({ url: `/case-studies/${c.slug}`, name: c.title })),
          }),
          itemListSchema(
            "Public Pulse case studies",
            cases.map((c) => ({ url: `/case-studies/${c.slug}`, name: c.title }))
          ),
        ]}
      />

      <GradientHero
        crumbs={crumbs}
        chip="Case studies"
        title={
          <>
            Work that <span className="text-brand-orange">measured up</span>.
          </>
        }
        lead={`${cases.length} real engagement${cases.length === 1 ? "" : "s"} from Bangladesh brands and campaigns. No fluff, no fabricated screenshots — every number is real, citable, and grounded in work we delivered.`}
        answer={`Public Pulse case studies show real client outcomes across Bangladesh — paid, social, PR, SEO and political PR. ${cases.length} published engagement${cases.length === 1 ? "" : "s"} with documented metrics, time windows, and the services delivered. Where NDAs apply, client names are anonymised to a sector label.`}
      />

      <Suspense fallback={null}>
        <CaseStudiesFilter cases={serialized} serviceLabels={serviceLabels} />
      </Suspense>

      <section className="border-t border-ink bg-paper py-20 md:py-24">
        <Container>
          <InlineBlock context="service" />
        </Container>
      </section>
    </>
  );
}
