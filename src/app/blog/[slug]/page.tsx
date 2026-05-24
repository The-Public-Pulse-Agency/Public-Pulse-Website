import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowUpRight, CalendarDays, Clock } from "lucide-react";

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

      <section className="bg-paper">
        <Container className="pt-10 pb-10 md:pt-14">
          <Breadcrumbs crumbs={crumbs} />
          <header className="mx-auto mt-8 max-w-3xl">
            <span className="chip chip-orange">{post.category}</span>
            <h1 className="mt-6 text-display font-extrabold tracking-tight text-ink">
              {post.title}
            </h1>
            <p className="mt-4 text-lead text-ink/70">{post.description}</p>
            <div className="mt-5 flex items-center gap-4 text-meta text-ink/55">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                {dateStr}
              </span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {post.readMinutes} min
              </span>
            </div>
          </header>
        </Container>
      </section>

      <section className="bg-paper">
        <Container className="pt-8">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-panel border border-ink">
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

      <section className="bg-paper py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <AnswerBlock>{content.answer}</AnswerBlock>
            <div className="mt-10 space-y-10">
              {content.sections.map((s) => (
                <section key={s.heading}>
                  <h2 className="text-h2 font-extrabold tracking-tight text-ink">{s.heading}</h2>
                  <p className="mt-4 text-base leading-relaxed text-ink/80">{s.body}</p>
                </section>
              ))}
            </div>
            <section className="mt-14">
              <h2 className="text-h2 font-extrabold tracking-tight text-ink">FAQs</h2>
              <dl className="mt-6 space-y-4">
                {content.faqs.map((f) => (
                  <div key={f.q} className="rounded-card border border-ink/15 bg-paper p-5">
                    <dt className="font-semibold text-ink">{f.q}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-ink/70">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </Container>
      </section>

      <section className="border-t border-ink bg-ink py-24 text-paper md:py-28">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-mega font-extrabold leading-[0.95] tracking-tight">
              Want help <span className="text-brand-orange">executing</span> this?
            </h2>
            <p className="mt-6 text-lead text-white/70">
              Public Pulse Agency offers a free 30-minute consultation.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/contact" className="btn btn-orange">
                Get a free consultation
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/services" className="btn btn-ghost-dark">
                Browse all 9 services
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </article>
  );
}
