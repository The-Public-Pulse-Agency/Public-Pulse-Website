import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { POSTS } from "@/lib/posts";

export const metadata: Metadata = buildMetadata({
  title: "Insights | Public Pulse Agency — Digital Marketing Guides",
  description:
    "Practitioner guides on digital marketing, political PR, paid ads, SEO, hospitality marketing and brand building in Bangladesh — from Public Pulse Agency.",
  path: "/blog",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Insights", path: "/blog" },
];

export default function BlogIndexPage() {
  const ready = POSTS.filter((p) => p.ready);
  const upcoming = POSTS.filter((p) => !p.ready);

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <section className="bg-paper">
        <Container className="pt-10 pb-14 md:pt-14 md:pb-20">
          <Breadcrumbs crumbs={crumbs} />
          <div className="mt-8 max-w-5xl">
            <span className="chip chip-orange">Insights</span>
            <h1 className="mt-6 text-mega font-extrabold tracking-tight text-ink">
              Notes from the <span className="text-brand-orange">studio</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lead text-ink/70">
              Long-form articles on digital marketing, political PR, paid ads, SEO, hospitality
              marketing, and brand building — written for Bangladesh and tested with real campaigns.
            </p>
          </div>
          <div className="mt-12 max-w-3xl">
            <AnswerBlock>
              The Public Pulse Agency insights blog publishes long-form practitioner guides on
              digital marketing, political PR, paid ads, SEO, hospitality marketing, content
              production and brand building — all written for the Bangladesh market and tested with
              real client campaigns.
            </AnswerBlock>
          </div>
        </Container>
      </section>

      <section className="border-t border-ink bg-paper-alt py-16 md:py-24">
        <Container>
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {ready.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="card group flex h-full flex-col">
                  <span className="chip chip-light">{p.category}</span>
                  <h2 className="mt-5 text-h3 font-bold text-ink">{p.title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/70">{p.description}</p>
                  <div className="mt-5 flex items-center justify-between text-meta text-ink/55">
                    <span>
                      {new Date(p.datePublished).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      · {p.readMinutes} min
                    </span>
                    <ArrowRight
                      className="h-4 w-4 text-brand-orange transition group-hover:translate-x-1"
                      aria-hidden
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {upcoming.length > 0 && (
            <div className="mt-16 border-t border-ink/15 pt-12">
              <p className="text-eyebrow uppercase text-ink/55">Coming soon</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((p) => (
                  <li key={p.slug} className="rounded-card border border-dashed border-ink/25 p-4">
                    <span className="chip chip-light">{p.category}</span>
                    <h3 className="mt-3 text-sm font-semibold text-ink/70">{p.title}</h3>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
