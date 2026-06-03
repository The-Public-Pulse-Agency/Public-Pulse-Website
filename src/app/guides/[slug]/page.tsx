import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock, ArrowRight } from "lucide-react";

import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqPageSchema, howToSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { GradientHero } from "@/components/seo/GradientHero";
import { Container } from "@/components/ui/Container";
import { GUIDES, getGuide } from "@/lib/content/guides";
import { getGlossaryTerm } from "@/lib/taxonomies/glossary";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return GUIDES.filter((g) => g.ready).map((g) => ({ slug: g.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return {};
  return buildMetadata({
    title: g.title,
    description: g.description,
    path: `/guides/${g.slug}`,
    useDynamicOg: true,
    ogTitle: g.title,
    ogEyebrow: "GUIDE · HOW-TO",
  });
}

export default async function GuidePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g || !g.ready) notFound();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: g.title, path: `/guides/${g.slug}` },
  ];

  const refs = (g.glossaryRefs ?? [])
    .map((s) => getGlossaryTerm(s))
    .filter((t): t is NonNullable<ReturnType<typeof getGlossaryTerm>> => t != null);

  const autoFaqs = [
    {
      q: `How long does ${g.title.split(" ").slice(0, 3).join(" ")}… typically take?`,
      a: `Roughly ${g.totalTime.replace("PT", "").toLowerCase()} for the steps in this playbook end-to-end, assuming the prerequisites are already in place.`,
    },
    {
      q: `What do I need before I start?`,
      a: g.prerequisites.join("; "),
    },
    {
      q: `Can Public Pulse run this for me?`,
      a: `Yes. This playbook is open documentation but we do this work for clients. Free 30-minute consultation to scope.`,
    },
  ];

  return (
    <article>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          howToSchema({
            slug: g.slug,
            name: g.title,
            description: g.description,
            steps: g.steps.map((s) => ({ name: s.name, text: s.text })),
            totalTime: g.totalTime,
            tool: g.tools,
          }),
          faqPageSchema(autoFaqs),
        ]}
      />

      <GradientHero
        crumbs={crumbs}
        chip={`HowTo · ${g.totalTime.replace("PT", "").toLowerCase()}`}
        title={g.title}
        lead={g.description}
        answer={g.answer}
        answerQuestion={g.title}
      />

      <section className="border-t border-ink bg-paper-alt py-16 md:py-20">
        <Container>
          <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-h3 font-bold text-ink">Tools</h2>
              <ul className="mt-4 space-y-2 text-sm text-ink/80">
                {g.tools.map((t) => (
                  <li key={t}>· {t}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-h3 font-bold text-ink">Prerequisites</h2>
              <ul className="mt-4 space-y-2 text-sm text-ink/80">
                {g.prerequisites.map((p) => (
                  <li key={p}>· {p}</li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-ink bg-paper py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-h2 tracking-tight text-ink">Step-by-step</h2>
            <ol className="mt-8 space-y-6">
              {g.steps.map((s, i) => (
                <li
                  key={s.name}
                  className="rounded-card border border-ink/15 bg-paper p-6"
                >
                  <div className="text-meta font-semibold uppercase text-brand-orange">
                    Step {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-2 text-h3 font-bold text-ink">{s.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/80">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {refs.length > 0 && (
        <section className="border-t border-ink bg-paper-alt py-16 md:py-20">
          <Container>
            <div className="mx-auto max-w-3xl">
              <p className="text-eyebrow uppercase text-brand-orange">In the glossary</p>
              <h2 className="mt-4 text-h2 tracking-tight text-ink">
                Terms used.
              </h2>
            </div>
            <ul className="mt-8 grid gap-3 md:grid-cols-3">
              {refs.map((s) => (
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
            <h2 className="mt-4 text-h2 tracking-tight text-ink">
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
