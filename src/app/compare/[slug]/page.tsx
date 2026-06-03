import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import { articleSchema, breadcrumbSchema, faqPageSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProgrammaticPage, Hl } from "@/components/seo/ProgrammaticPage";
import { Container } from "@/components/ui/Container";
import { COMPARES, getCompare } from "@/lib/content/compares";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return COMPARES.filter((c) => c.ready).map((c) => ({ slug: c.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getCompare(slug);
  if (!c) return {};
  return buildMetadata({
    title: c.title,
    description: c.description,
    path: `/compare/${c.slug}`,
    useDynamicOg: true,
    ogTitle: c.title,
    ogEyebrow: "COMPARE · DECISION MATRIX",
  });
}

export default async function ComparePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const c = getCompare(slug);
  if (!c || !c.ready) notFound();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Compare", path: "/compare" },
    { name: c.title, path: `/compare/${c.slug}` },
  ];

  const autoFaqs = [
    { q: `${c.leftLabel} or ${c.rightLabel} — which is right for me?`, a: c.recommendation },
    {
      q: `What's the biggest difference between ${c.leftLabel} and ${c.rightLabel}?`,
      a: `${c.points[0]?.dimension}: ${c.leftLabel} → ${c.points[0]?.left}. ${c.rightLabel} → ${c.points[0]?.right}.`,
    },
    {
      q: `Can I use both?`,
      a: `Often yes. Most engagements combine elements of each rather than going purely one way.`,
    },
  ];

  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            slug: `compare/${c.slug}`,
            headline: c.title,
            description: c.description,
            image: "/og-image.jpg",
            datePublished: c.datePublished,
            section: "Compare",
            wordCount: c.description.split(" ").length + c.answer.split(" ").length + c.recommendation.split(" ").length,
          }),
          breadcrumbSchema(crumbs),
          faqPageSchema(autoFaqs),
        ]}
      />

      <ProgrammaticPage
        crumbs={crumbs}
        chip="Compare"
        title={
          <>
            {c.leftLabel} <Hl>vs</Hl> {c.rightLabel}.
          </>
        }
        lead={c.description}
        answer={c.answer}
        answerQuestion={c.title}
        faqs={autoFaqs}
      >
        <section className="border-t border-ink bg-paper py-16 md:py-20">
          <Container>
            <div className="mx-auto max-w-4xl overflow-hidden rounded-card border border-ink">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-ink bg-ink text-paper">
                    <th className="p-4 font-semibold">Dimension</th>
                    <th className="p-4 font-semibold">{c.leftLabel}</th>
                    <th className="p-4 font-semibold">{c.rightLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {c.points.map((p, i) => (
                    <tr
                      key={p.dimension}
                      className={`border-t border-ink/10 ${i % 2 ? "bg-paper-alt" : "bg-paper"}`}
                    >
                      <td className="p-4 font-semibold text-ink">{p.dimension}</td>
                      <td className="p-4 text-ink/80">{p.left}</td>
                      <td className="p-4 text-ink/80">{p.right}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </section>

        <section className="border-t border-ink bg-paper-alt py-16 md:py-20">
          <Container>
            <div className="mx-auto max-w-3xl">
              <p className="text-eyebrow uppercase text-brand-orange">Our recommendation</p>
              <h2 className="mt-4 text-h2 tracking-tight text-ink">
                The short version.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-ink/80">{c.recommendation}</p>
            </div>
          </Container>
        </section>
      </ProgrammaticPage>
    </>
  );
}
