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

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(50%_45%_at_50%_0%,rgba(13,148,136,0.07),transparent_60%)]"
        />
        <Container className="relative pt-10 pb-14 md:pt-14 md:pb-20">
          <Breadcrumbs crumbs={crumbs} />
          <div className="mx-auto mt-6 max-w-3xl text-center">
            <p className="text-eyebrow uppercase text-brand-teal">Insights</p>
            <h1 className="mt-3 text-display font-extrabold tracking-tight text-brand-navy">
              Practitioner guides for the Bangladesh market.
            </h1>
            <p className="mt-5 text-lead text-slate-600">
              Long-form articles on digital marketing, political PR, paid ads, SEO, hospitality
              marketing, and brand building — written for Bangladesh and tested with real campaigns.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl">
            <AnswerBlock>
              The Public Pulse Agency insights blog publishes long-form practitioner guides on
              digital marketing, political PR, paid ads, SEO, hospitality marketing, content
              production and brand building — all written for the Bangladesh market and tested
              with real client campaigns.
            </AnswerBlock>
          </div>
        </Container>
      </section>

      {/* ─── ARTICLES ────────────────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-24">
        <Container>
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ready.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="card group flex h-full flex-col">
                  <span className="chip chip-teal">{p.category}</span>
                  <h2 className="mt-4 text-h3 font-semibold text-brand-navy">{p.title}</h2>
                  <p className="mt-2 flex-1 text-sm text-slate-600">{p.description}</p>
                  <div className="mt-5 flex items-center justify-between text-meta text-slate-500">
                    <span>
                      {new Date(p.datePublished).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      · {p.readMinutes} min read
                    </span>
                    <ArrowRight
                      className="h-4 w-4 text-brand-teal transition group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {upcoming.length > 0 && (
            <div className="mt-16 border-t border-slate-200 pt-12">
              <p className="text-eyebrow uppercase text-slate-500">Coming soon</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((p) => (
                  <li key={p.slug} className="rounded-card border border-dashed border-slate-200 p-4">
                    <span className="chip">{p.category}</span>
                    <h3 className="mt-3 text-sm font-semibold text-slate-700">{p.title}</h3>
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
