import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { POSTS } from "@/lib/posts";

export const metadata: Metadata = buildMetadata({
  title: "Blog | Public Pulse Agency — Digital Marketing Insights",
  description:
    "Expert articles on digital marketing, political PR, paid ads, SEO, hospitality marketing and brand building in Bangladesh — from Public Pulse Agency.",
  path: "/blog",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Blog", path: "/blog" },
];

export default function BlogIndexPage() {
  return (
    <div className="max-w-container mx-auto px-6 py-12">
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />

      <h1 className="mt-4 text-5xl md:text-6xl font-extrabold tracking-tight text-brand-navy">
        Blog &amp; articles
      </h1>

      <AnswerBlock>
        The Public Pulse Agency blog publishes long-form practitioner guides on digital marketing, political PR,
        paid ads, SEO, hospitality marketing, content production, and brand building — all written for the
        Bangladesh market and tested with real client campaigns.
      </AnswerBlock>

      <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {POSTS.map((p) => (
          <li key={p.slug} className="rounded-2xl border border-slate-200 overflow-hidden">
            <Link href={`/blog/${p.slug}`} className="block">
              <div className={`text-xs font-semibold uppercase tracking-wider text-${p.categoryColor} px-5 pt-5`}>
                {p.category}
              </div>
              <h2 className="px-5 mt-2 text-lg font-bold text-brand-navy">{p.title}</h2>
              <p className="px-5 mt-2 text-sm text-slate-600">{p.description}</p>
              <div className="px-5 pb-5 mt-3 text-xs text-slate-500">
                {new Date(p.datePublished).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}
                {" · "}
                {p.readMinutes} min read
                {!p.ready && <span className="ml-2 text-slate-400">· coming soon</span>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
