import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, definedTermSetSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { GradientHero } from "@/components/seo/GradientHero";
import { Container } from "@/components/ui/Container";
import { GLOSSARY } from "@/lib/taxonomies/glossary";

export const metadata: Metadata = buildMetadata({
  title: "Glossary | Public Pulse Agency",
  description:
    "Digital marketing and political PR vocabulary, defined for the Bangladesh market — AEO, GEO, JSON-LD, IndexNow, Meta CAPI, ROAS, narrative engineering, and more.",
  path: "/glossary",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Glossary", path: "/glossary" },
];

const AREAS = [
  "Digital Marketing",
  "Political PR",
  "Paid Media",
  "SEO",
  "Branding",
  "Analytics",
] as const;

export default function GlossaryIndex() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          definedTermSetSchema(GLOSSARY.map((t) => ({ slug: t.slug, name: t.name }))),
        ]}
      />

      <GradientHero
        crumbs={crumbs}
        chip="Glossary"
        title={
          <>
            Words we <span className="text-brand-orange">use</span>.
          </>
        }
        lead="The vocabulary of digital marketing and political PR — defined for the Bangladesh market, in plain English (and Bangla where relevant)."
        answer="The Public Pulse glossary defines the working vocabulary of digital marketing and political PR: AEO, GEO, JSON-LD, FAQPage Schema, IndexNow, Meta Conversions API, ROAS, CTR, Political PR, Narrative Engineering, Opposition Research, llms.txt, robots.txt, Speakable. Each term has its own page with a longer explanation."
      />

      <section className="border-t border-ink bg-paper-alt py-16 md:py-24">
        <Container>
          {AREAS.map((area) => {
            const terms = GLOSSARY.filter((t) => t.area === area);
            if (terms.length === 0) return null;
            return (
              <div key={area} className="mb-14 last:mb-0">
                <h2 className="text-h2 font-extrabold tracking-tight text-ink">{area}</h2>
                <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {terms.map((t) => (
                    <li key={t.slug}>
                      <Link
                        href={`/glossary/${t.slug}`}
                        className="card group flex h-full flex-col"
                      >
                        <h3 className="text-h3 font-bold text-ink">{t.name}</h3>
                        {t.nameBn && (
                          <p className="mt-1 text-meta text-ink/55">{t.nameBn}</p>
                        )}
                        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/70">
                          {t.definition}
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
                  ))}
                </ul>
              </div>
            );
          })}
        </Container>
      </section>
    </>
  );
}
