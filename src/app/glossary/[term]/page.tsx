import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, definedTermSchema, faqPageSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { GLOSSARY, getGlossaryTerm } from "@/lib/taxonomies/glossary";

type Params = { term: string };

export function generateStaticParams(): Params[] {
  return GLOSSARY.map((t) => ({ term: t.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { term } = await params;
  const t = getGlossaryTerm(term);
  if (!t) return {};
  return buildMetadata({
    title: `${t.name} — definition | Public Pulse Glossary`,
    description: t.definition,
    path: `/glossary/${t.slug}`,
  });
}

export default async function TermPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { term } = await params;
  const t = getGlossaryTerm(term);
  if (!t) notFound();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Glossary", path: "/glossary" },
    { name: t.name, path: `/glossary/${t.slug}` },
  ];

  const see = (t.see ?? [])
    .map((s) => getGlossaryTerm(s))
    .filter((s): s is NonNullable<ReturnType<typeof getGlossaryTerm>> => s != null);

  // Auto-generated FAQ — keeps the AEO surface on every glossary page.
  const autoFaqs = [
    {
      q: `What does ${t.name} mean?`,
      a: t.definition,
    },
    {
      q: `Why does ${t.name} matter for Bangladesh brands?`,
      a: t.body.split(".")[0] + ".",
    },
    {
      q: `Does Public Pulse use ${t.name} in client engagements?`,
      a: `Yes. ${t.name} is part of how we deliver ${t.area.toLowerCase()} for clients. Walk through it on a free consultation call.`,
    },
  ];

  return (
    <article>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          definedTermSchema({
            slug: t.slug,
            name: t.name,
            description: t.definition,
            termBn: t.nameBn,
            area: t.area,
          }),
          faqPageSchema(autoFaqs),
        ]}
      />

      <section className="bg-paper">
        <Container className="pt-10 pb-14 md:pt-14 md:pb-20">
          <Breadcrumbs crumbs={crumbs} />
          <div className="mt-8 max-w-4xl">
            <span className="chip chip-orange">{t.area}</span>
            <h1 className="mt-6 text-display font-extrabold tracking-tight text-ink">
              {t.name}
            </h1>
            {t.nameBn && (
              <p className="mt-3 text-h3 font-medium text-ink/55">{t.nameBn}</p>
            )}
            <p className="mt-6 text-lead text-ink/70">{t.definition}</p>
          </div>

          <div className="mt-12 max-w-3xl">
            <AnswerBlock question={`What is ${t.name}?`}>{t.definition}</AnswerBlock>
          </div>
        </Container>
      </section>

      <section className="border-t border-ink bg-paper py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-h2 font-extrabold tracking-tight text-ink">In practice</h2>
            <p className="mt-4 text-base leading-relaxed text-ink/80">{t.body}</p>
          </div>
        </Container>
      </section>

      {see.length > 0 && (
        <section className="border-t border-ink bg-paper-alt py-16 md:py-20">
          <Container>
            <div className="mx-auto max-w-3xl">
              <p className="text-eyebrow uppercase text-brand-orange">See also</p>
              <h2 className="mt-4 text-h2 font-extrabold tracking-tight text-ink">
                Related terms.
              </h2>
            </div>
            <ul className="mt-8 grid gap-3 md:grid-cols-3">
              {see.map((s) => (
                <li key={s.slug}>
                  <Link href={`/glossary/${s.slug}`} className="card group flex h-full flex-col">
                    <h3 className="text-h3 font-bold text-ink">{s.name}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">
                      {s.definition}
                    </p>
                    <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
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
          </Container>
        </section>
      )}

      <section className="border-t border-ink bg-paper py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-eyebrow uppercase text-brand-orange">FAQ</p>
            <h2 className="mt-4 text-h2 font-extrabold tracking-tight text-ink">
              Frequently asked.
            </h2>
            <dl className="mt-8 space-y-4">
              {autoFaqs.map((f) => (
                <div key={f.q} className="rounded-card border border-ink/15 bg-paper p-6">
                  <dt className="font-semibold text-ink">{f.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-ink/70">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>
    </article>
  );
}
