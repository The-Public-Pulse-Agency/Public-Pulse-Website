import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Search } from "lucide-react";

import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "Free Tools | Public Pulse — SEO, social, ad-spend audits",
  description:
    "Free interactive tools from Public Pulse Agency: instant SEO audit, social benchmark, ad-spend calculator. Built for Bangladesh brands.",
  path: "/tools",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Tools", path: "/tools" },
];

const TOOLS = [
  {
    slug: "seo-audit",
    icon: Search,
    title: "SEO audit",
    body: "Enter your domain, get a 10-point on-page snapshot in 10 seconds. Title, meta, H1, OG, schema, TTFB, HSTS.",
    available: true,
  },
];

export default function ToolsPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          webPageSchema({
            path: "/tools",
            name: "Free Tools",
            description: "Interactive tools from Public Pulse Agency for BD brands.",
          }),
        ]}
      />

      <section className="bg-paper py-12 md:py-20">
        <Container>
          <Breadcrumbs crumbs={crumbs} />
          <div className="mt-6 max-w-3xl">
            <p className="text-eyebrow uppercase text-brand-orange">Free tools</p>
            <h1 className="mt-4 text-h1 tracking-tight text-ink">
              Diagnostics you can run without a sales call.
            </h1>
            <p className="mt-5 text-lead text-ink/65">
              Interactive tools we built for Bangladesh brands. No signup for any of the basic versions — find out where you stand, then decide if you want help.
            </p>
          </div>

          <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/tools/${t.slug}`}
                  className="group flex h-full flex-col gap-3 rounded-card border border-ink/10 bg-paper p-6 transition hover:-translate-y-0.5 hover:border-brand-orange hover:shadow-card-hover"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-orange/10 text-brand-orange">
                    <t.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h2 className="text-h3 tracking-tight text-ink">{t.title}</h2>
                    <p className="mt-2 text-body text-ink/65">{t.body}</p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-brand-orange">
                    Open <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
            <li className="rounded-card border border-dashed border-ink/15 p-6 text-meta text-ink/55">
              More tools shipping soon: social benchmark, ad-spend ROI calculator, election readiness checker.
            </li>
          </ul>
        </Container>
      </section>
    </>
  );
}
