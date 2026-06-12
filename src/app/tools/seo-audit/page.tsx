import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqPageSchema, webPageSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SeoAuditTool } from "./SeoAuditTool";

export const metadata: Metadata = buildMetadata({
  title: "Free SEO Audit Tool | Public Pulse — Bangladesh agency",
  description:
    "Run a free 10-point on-page SEO audit on any domain. Title, meta, H1, Open Graph, canonical, JSON-LD, TTFB, HSTS — instant snapshot, no signup.",
  path: "/tools/seo-audit",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Tools", path: "/tools" },
  { name: "SEO audit", path: "/tools/seo-audit" },
];

const FAQS = [
  {
    q: "What does the audit check?",
    a: "10 high-signal on-page items: title tag length, meta description, H1 count, Open Graph tags, canonical link, JSON-LD schema, TTFB, robots meta, CSP, and HSTS. No crawling beyond the homepage.",
  },
  {
    q: "Is my domain saved anywhere?",
    a: "No. Each run is stateless — we don't store the domain or the findings. If you want a saved audit + competitor benchmark, that's the paid review.",
  },
  {
    q: "What's NOT in this tool?",
    a: "Backlinks, ranking positions, competitor gap, technical crawl beyond the homepage. Those need 30 minutes + paid tools (Ahrefs/Semrush). Book a free 30-min review and we'll do that part.",
  },
];

export default function SeoAuditPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          webPageSchema({
            path: "/tools/seo-audit",
            name: "Free SEO Audit Tool",
            description:
              "10-point on-page SEO audit for any domain. Instant, no signup.",
          }),
          faqPageSchema(FAQS),
        ]}
      />

      <section className="bg-paper py-12 md:py-20">
        <Container>
          <Breadcrumbs crumbs={crumbs} />
          <div className="mt-6 max-w-3xl">
            <p className="text-eyebrow uppercase text-brand-orange">Free tool</p>
            <h1 className="mt-4 text-h1 tracking-tight text-ink">
              Free on-page SEO audit. 10 seconds.
            </h1>
            <p className="mt-5 text-lead text-ink/65">
              Enter your domain. We fetch the homepage and check 10 high-signal items most BD brands get wrong. No signup; you can read the findings and leave.
            </p>
          </div>

          <div className="mt-10 max-w-4xl">
            <SeoAuditTool />
          </div>
        </Container>
      </section>

      <section className="bg-surface-alt py-16 md:py-24">
        <Container>
          <div className="max-w-3xl">
            <p className="text-eyebrow uppercase text-brand-orange">FAQ</p>
            <h2 className="mt-4 text-h2 tracking-tight text-ink">
              Tool questions.
            </h2>
          </div>
          <div className="mt-10 space-y-4">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-card border border-ink/10 bg-paper p-5 open:shadow-card">
                <summary className="cursor-pointer list-none text-h3 tracking-tight text-ink marker:hidden">
                  <span className="flex items-start justify-between gap-4">
                    <span>{f.q}</span>
                    <span aria-hidden className="mt-1 text-brand-orange transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-body text-ink/70">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
