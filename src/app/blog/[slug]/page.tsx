import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";

import { buildMetadata } from "@/lib/seo";
import {
  articleSchema,
  breadcrumbSchema,
  faqPageSchema,
} from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { POSTS, getPost, DIGITAL_MARKETING_2026_CONTENT } from "@/lib/posts";

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

  const content = DIGITAL_MARKETING_2026_CONTENT;

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Insights", path: "/blog" },
    { name: post.category, path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  const wordCount =
    content.sections.reduce((n, s) => n + s.body.split(/\s+/).length, 0) +
    content.answer.split(/\s+/).length;

  const dateStr = new Date(post.datePublished).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article>
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

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-white">
        <Container className="pt-10 pb-10 md:pt-14">
          <Breadcrumbs crumbs={crumbs} />
          <header className="mx-auto mt-6 max-w-3xl text-center">
            <span className="chip chip-teal mx-auto">{post.category}</span>
            <h1 className="mt-5 text-h1 font-extrabold tracking-tight text-brand-navy">
              {post.title}
            </h1>
            <p className="mt-4 text-lead text-slate-600">{post.description}</p>
            <div className="mt-5 flex items-center justify-center gap-4 text-meta text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                {dateStr}
              </span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {post.readMinutes} min read
              </span>
            </div>
          </header>
        </Container>
      </section>

      {/* ─── HERO IMAGE ──────────────────────────────────────────────── */}
      <section className="bg-white">
        <Container className="pt-8">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-panel border border-slate-200">
            <Image
              src={post.hero}
              alt={post.title}
              width={1200}
              height={630}
              priority
              sizes="(max-width: 768px) 100vw, 1024px"
              className="h-auto w-full"
            />
          </div>
        </Container>
      </section>

      {/* ─── BODY ────────────────────────────────────────────────────── */}
      <section className="bg-white py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <AnswerBlock>{content.answer}</AnswerBlock>

            <div className="mt-10 space-y-10">
              {content.sections.map((s) => (
                <section key={s.heading}>
                  <h2 className="text-h2 font-bold tracking-tight text-brand-navy">{s.heading}</h2>
                  <p className="mt-4 text-base leading-relaxed text-slate-700">{s.body}</p>
                </section>
              ))}
            </div>

            <section className="mt-14">
              <h2 className="text-h2 font-bold tracking-tight text-brand-navy">FAQs</h2>
              <dl className="mt-6 space-y-4">
                {content.faqs.map((f) => (
                  <div
                    key={f.q}
                    className="rounded-card border border-slate-200 bg-white p-5"
                  >
                    <dt className="font-semibold text-brand-navy">{f.q}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-slate-600">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </Container>
      </section>

      {/* ─── CLOSING CTA ─────────────────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-surface-alt py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-h2 font-bold tracking-tight text-brand-navy">
              Want help executing this?
            </h2>
            <p className="mt-4 text-lead text-slate-600">
              Public Pulse Agency offers a free 30-minute consultation. We&rsquo;ll review your
              channels and propose a plan.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/contact" className="btn btn-primary">
                Get a free consultation
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/services" className="btn btn-secondary">
                Browse all 9 services
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </article>
  );
}
