import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import {
  articleSchema,
  breadcrumbSchema,
  faqPageSchema,
} from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import {
  POSTS,
  getPost,
  DIGITAL_MARKETING_2026_CONTENT,
} from "@/lib/posts";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return POSTS.filter((p) => p.ready).map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    ogType: "article",
    ogImage: post.hero,
    publishedTime: post.datePublished,
    modifiedTime: post.dateModified,
    section: post.category,
    tags: post.tags,
    authors: ["Public Pulse Agency"],
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post || !post.ready) notFound();

  // Foundation step 1: only one fully-written post.
  const content = DIGITAL_MARKETING_2026_CONTENT;

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.category, path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  const wordCount =
    content.sections.reduce((n, s) => n + s.body.split(/\s+/).length, 0) +
    content.answer.split(/\s+/).length;

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <JsonLd
        data={[
          articleSchema({
            slug: post.slug,
            headline: post.title,
            description: post.description,
            image: post.hero,
            datePublished: post.datePublished,
            dateModified: post.dateModified,
            section: post.category,
            tags: post.tags,
            wordCount,
          }),
          breadcrumbSchema(crumbs),
          faqPageSchema(content.faqs),
        ]}
      />

      <Breadcrumbs crumbs={crumbs} />

      <header className="mt-4">
        <div className={`text-xs font-semibold uppercase tracking-wider text-${post.categoryColor}`}>
          {post.category}
        </div>
        <h1 className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tight text-brand-navy">
          {post.title}
        </h1>
        <div className="mt-3 text-sm text-slate-500">
          {new Date(post.datePublished).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}
          {" · "}
          {post.readMinutes} min read
        </div>
      </header>

      <div className="mt-8 overflow-hidden rounded-2xl">
        <Image
          src={post.hero}
          alt={post.title}
          width={1200}
          height={630}
          priority
          sizes="(max-width: 768px) 100vw, 768px"
        />
      </div>

      <AnswerBlock>{content.answer}</AnswerBlock>

      <div className="prose-content mt-8 space-y-10">
        {content.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy">{s.heading}</h2>
            <p className="mt-3 text-lg leading-relaxed text-slate-700">{s.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-2xl md:text-3xl font-bold text-brand-navy">FAQs</h2>
        <dl className="mt-6 space-y-6">
          {content.faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-brand-navy">{f.q}</dt>
              <dd className="mt-2 text-slate-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12 rounded-2xl bg-surface-alt p-8">
        <h2 className="text-2xl font-bold text-brand-navy">Want help executing this?</h2>
        <p className="mt-2 text-slate-700">
          Public Pulse Agency offers a free 30-minute consultation. We&rsquo;ll review your channels and propose a plan.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/contact" className="inline-flex items-center rounded-full bg-brand-red px-5 py-2.5 font-semibold text-white hover:opacity-90">
            Get a free consultation
          </Link>
          <Link href="/services" className="inline-flex items-center rounded-full border border-brand-navy px-5 py-2.5 font-semibold text-brand-navy hover:bg-brand-navy hover:text-white">
            Browse all 9 services
          </Link>
        </div>
      </section>
    </article>
  );
}
