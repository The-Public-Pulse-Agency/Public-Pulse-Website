import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowUpRight, CalendarDays, Clock, ExternalLink, MessageCircleMore, Share2 } from "lucide-react";

import { buildMetadata } from "@/lib/seo";
import {
  articleSchema,
  BRAND_BYLINE,
  breadcrumbSchema,
  faqPageSchema,
} from "@/lib/schema";
import { absoluteUrl, SITE } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { GradientHero } from "@/components/seo/GradientHero";
import { Container } from "@/components/ui/Container";
import { InlineBlock } from "@/components/lead-capture";
import {
  getCategories,
  getPostBySlug,
  getPublishedPosts,
  getRelatedPosts,
} from "@/lib/data/blog";
import { PostBody } from "@/components/blog/PostBody";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { ArticleTOC } from "@/components/blog/ArticleTOC";
import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker";
import { SERVICES } from "@/lib/services";
import { LOCATIONS } from "@/lib/taxonomies/locations";
import { INDUSTRIES } from "@/lib/taxonomies/industries";
import { GLOSSARY } from "@/lib/taxonomies/glossary";

type Params = { slug: string };
type Faq = { q: string; a: string };

export const revalidate = 300;
export const dynamicParams = true;

// Defer all post rendering to runtime ISR. Build-time prerender of 100+
// posts was exhausting Neon HTTP connection limits (each post calls
// getRelatedPosts which queries Neon). At runtime, the first request per
// slug pays the ~500ms render cost; CloudFront caches it for everyone
// else for 5 min then stale-while-revalidate.
export async function generateStaticParams(): Promise<Params[]> {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug, "en");
  if (!post) return {};

  // Per-post OG image: prefer an explicit heroImageUrl when set; otherwise
  // use the dynamic /og?title=&eyebrow= factory so each post gets a unique
  // gradient card with its own title (instead of every post sharing the
  // generic site-wide /og-image.jpg).
  return buildMetadata({
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    path: `/blog/${post.slug}`,
    ogType: "article",
    ogImage: post.heroImageUrl ?? undefined,
    useDynamicOg: !post.heroImageUrl,
    ogEyebrow: post.categorySlug,
    // Neon HTTP driver returns timestamps as ISO strings in some code paths
    // (cache-rehydration, JSONB round-trips). Coerce via new Date(...) so
    // .toISOString() always works regardless of source type.
    publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
    section: post.categorySlug,
    tags: (post.tags as string[] | null) ?? [],
    authors: [SITE.name],
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, "en");
  if (!post) notFound();

  const [categories, related] = await Promise.all([
    getCategories(),
    getRelatedPosts(post.slug, post.categorySlug, "en", 3),
  ]);

  const category = categories.find((c) => c.slug === post.categorySlug);
  const faqs = ((post.faqJson as Faq[] | null) ?? []).filter((f) => f?.q && f?.a);
  const tags = (post.tags as string[] | null) ?? [];
  const sourceRefs = (post.sourceRefs as string[] | null) ?? [];

  // Backlinks block: resolve each grounding ref to its canonical page so the
  // post links into the rest of the site (good for SEO + reader navigation).
  // Order: most-specific first (service/location/industry/glossary) → broader.
  type Backlink = { href: string; label: string; eyebrow: string };
  const backlinks: Backlink[] = [];
  for (const ref of sourceRefs) {
    const svc = SERVICES.find((s) => s.slug === ref && s.ready);
    if (svc) {
      backlinks.push({ href: `/services/${svc.slug}`, label: svc.shortName, eyebrow: "Service" });
      continue;
    }
    const loc = LOCATIONS.find((l) => l.slug === ref);
    if (loc) {
      backlinks.push({ href: `/locations/${loc.slug}`, label: loc.name, eyebrow: "Location" });
      continue;
    }
    const ind = INDUSTRIES.find((i) => i.slug === ref);
    if (ind) {
      backlinks.push({ href: `/industries/${ind.slug}`, label: ind.name, eyebrow: "Industry" });
      continue;
    }
    const term = GLOSSARY.find((g) => g.slug === ref);
    if (term) {
      backlinks.push({ href: `/glossary/${term.slug}`, label: term.name, eyebrow: "Glossary" });
    }
  }
  // Always add a category-filtered insights link + the global insights hub.
  if (category) {
    backlinks.push({
      href: `/blog?category=${category.slug}`,
      label: `More ${category.nameEn.toLowerCase()} guides`,
      eyebrow: "Category",
    });
  }
  backlinks.push({ href: "/services", label: "All services", eyebrow: "Browse" });
  backlinks.push({ href: "/contact", label: "Book a free consultation", eyebrow: "Contact" });
  // Hero image: if heroImageUrl is set in the row, use it. Otherwise generate
  // a per-post gradient card via the existing /og factory so each post gets a
  // unique hero with its own title (not the site-wide generic /og-image.jpg).
  const heroImage =
    post.heroImageUrl ??
    `/og?title=${encodeURIComponent(post.title)}&eyebrow=${encodeURIComponent(category?.nameEn ?? post.categorySlug)}`;

  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;
  const updatedDate = post.updatedAt
    ? new Date(post.updatedAt).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;
  const updatedIsNewer =
    post.publishedAt &&
    post.updatedAt &&
    new Date(post.updatedAt).getTime() - new Date(post.publishedAt).getTime() > 24 * 60 * 60 * 1000;

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Insights", path: "/blog" },
    ...(category ? [{ name: category.nameEn, path: `/blog?category=${category.slug}` }] : []),
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  const wordCount = post.bodyMdx.split(/\s+/).filter(Boolean).length;
  const shareUrl = absoluteUrl(`/blog/${post.slug}`);
  const whatsappShare = `https://wa.me/?text=${encodeURIComponent(`${post.title} — ${shareUrl}`)}`;

  // Article schema author = the Organization. No Person. Brand owns the byline.
  const schemas: object[] = [
    articleSchema({
      slug: post.slug,
      headline: post.title,
      description: post.excerpt,
      image: heroImage,
      datePublished: post.publishedAt
        ? new Date(post.publishedAt).toISOString()
        : new Date(post.createdAt).toISOString(),
      dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
      inLanguage: post.locale === "bn" ? "bn" : "en",
      section: category?.nameEn ?? post.categorySlug,
      tags,
      wordCount,
    }),
    breadcrumbSchema(crumbs),
  ];
  if (faqs.length > 0) schemas.push(faqPageSchema(faqs));

  return (
    <article>
      <ReadingProgress />
      <ScrollDepthTracker surface={`/blog/${post.slug}`} />
      <JsonLd data={schemas} />

      <GradientHero
        crumbs={crumbs}
        chip={`${category?.nameEn ?? post.categorySlug} · ${publishedDate ?? "Draft"} · ${post.readingTime} min read`}
        title={post.title}
        lead={post.excerpt}
        answer={post.answerFirst}
        answerQuestion={post.title}
        variant="compact"
      />

      <section className="bg-paper">
        <Container className="pt-2">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-panel border border-ink">
            <Image
              src={heroImage}
              alt={post.title}
              width={1200}
              height={630}
              priority
              sizes="(max-width: 768px) 100vw, 1024px"
              className="h-auto w-full"
              // The dynamic /og?title= factory already returns a 1200x630 PNG
              // sized exactly for this slot. Skip the next/image optimizer
              // (which also rejects query-string srcs without an explicit
              // images.localPatterns entry). Static heroImageUrls still flow
              // through this same prop with no harm.
              unoptimized={!post.heroImageUrl}
            />
          </div>
        </Container>
      </section>

      <section className="bg-paper py-12 md:py-16">
        <Container>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              {/* Brand byline + meta — brand-forward, no named individuals */}
              <div className="flex flex-wrap items-center gap-4 border-b border-ink/10 pb-6">
                <div
                  className="grid h-12 w-12 place-items-center rounded-full bg-ink text-paper text-sm font-extrabold tracking-tight"
                  aria-hidden="true"
                >
                  PP
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink">
                    <Link href="/about" className="hover:text-brand-orange">
                      {BRAND_BYLINE.name}
                    </Link>
                  </p>
                  <p className="text-xs text-ink/55">{BRAND_BYLINE.role}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-wider text-ink/55">
                  {publishedDate && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                      Published {publishedDate}
                    </span>
                  )}
                  {updatedIsNewer && updatedDate && (
                    <span className="inline-flex items-center gap-1">· Updated {updatedDate}</span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    {post.readingTime} min
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="mt-8">
                <PostBody body={post.bodyMdx} />
              </div>

              {/* Mid-post lead capture (only for posts > ~4 min — gives the
                  reader a quiet pause before the next section). */}
              {post.readingTime >= 4 && (
                <div className="my-12">
                  <InlineBlock context="blog-mid" align="center" />
                </div>
              )}

              {/* Tags + share */}
              <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 pt-6">
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-ink/15 bg-paper-tint px-2.5 py-1 text-[11px] font-medium text-ink/70"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
                <a
                  href={whatsappShare}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-[11px] font-semibold text-ink/70 hover:border-ink hover:text-ink"
                >
                  <Share2 className="h-3.5 w-3.5" aria-hidden />
                  Share
                </a>
              </div>

              {/* Source references — for AEO/GEO trust signal */}
              {sourceRefs.length > 0 && (
                <aside className="mt-10 rounded-panel border border-ink/15 bg-paper-tint p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/55">
                    Sources & further reading
                  </p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {sourceRefs.map((ref, i) => {
                      const isUrl = /^https?:\/\//.test(ref);
                      return (
                        <li key={`${ref}-${i}`} className="text-ink/75">
                          {isUrl ? (
                            <a
                              href={ref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-start gap-1.5 hover:text-brand-orange"
                            >
                              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                              <span className="break-all">{ref}</span>
                            </a>
                          ) : (
                            <span>{ref}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </aside>
              )}

              {/* End-of-post lead capture — the strongest position on the page */}
              <div className="mt-14">
                <InlineBlock context="blog-end" variant="dark" />
              </div>

              {/* FAQ accordion */}
              {faqs.length > 0 && (
                <section className="mt-14">
                  <h2 className="text-h2 tracking-tight text-ink">
                    Frequently asked questions
                  </h2>
                  <div className="mt-6 space-y-3">
                    {faqs.map((f, i) => (
                      <details
                        key={`${f.q}-${i}`}
                        className="group rounded-card border border-ink/15 bg-paper p-5 open:border-ink"
                      >
                        <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                          <span className="font-semibold text-ink">{f.q}</span>
                          <span
                            aria-hidden
                            className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-ink/20 text-ink/60 transition group-open:rotate-45 group-open:border-brand-orange group-open:text-brand-orange"
                          >
                            +
                          </span>
                        </summary>
                        <p className="mt-3 text-sm leading-relaxed text-ink/75">{f.a}</p>
                      </details>
                    ))}
                  </div>
                </section>
              )}

              {/* Keep exploring — internal backlinks to grounded pages */}
              {backlinks.length > 0 && (
                <section className="mt-14 rounded-panel border border-ink/15 bg-paper-tint p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/55">
                    Keep exploring
                  </p>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {backlinks.map((b) => (
                      <li key={b.href}>
                        <Link
                          href={b.href}
                          className="group flex items-center justify-between gap-3 rounded-card border border-ink/15 bg-paper px-4 py-3 transition hover:border-ink"
                        >
                          <span>
                            <span className="block text-[10px] font-semibold uppercase tracking-wider text-ink/45">
                              {b.eyebrow}
                            </span>
                            <span className="mt-0.5 block text-sm font-semibold text-ink group-hover:text-brand-orange">
                              {b.label}
                            </span>
                          </span>
                          <ArrowUpRight
                            className="h-4 w-4 shrink-0 text-ink/40 transition group-hover:text-brand-orange group-hover:translate-x-0.5"
                            aria-hidden
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Sticky-ish sidebar with TOC + related posts */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 space-y-6">
                <div className="hidden lg:block">
                  <ArticleTOC />
                </div>
                {related.length > 0 && (
                  <div className="rounded-panel border border-ink/15 bg-paper p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/55">
                      Related reads
                    </p>
                    <ul className="mt-4 space-y-4">
                      {related.map((r) => (
                        <li key={`${r.slug}-${r.locale}`}>
                          <Link
                            href={`/blog/${r.slug}`}
                            className="group block"
                          >
                            <p className="text-sm font-semibold text-ink group-hover:text-brand-orange">
                              {r.title}
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs text-ink/60">{r.excerpt}</p>
                            <p className="mt-2 text-[10px] uppercase tracking-wider text-ink/45">
                              {r.readingTime} min · {r.categorySlug}
                            </p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA card */}
                <div
                  className="overflow-hidden rounded-panel p-6 text-paper"
                  style={{
                    background: `radial-gradient(60% 80% at 80% 20%, #FF5C00 0%, transparent 60%), radial-gradient(80% 80% at 20% 80%, #2563EB 0%, transparent 60%), linear-gradient(135deg, #14B8A6 0%, #0A0A0A 100%)`,
                  }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-paper/80">
                    Need help executing?
                  </p>
                  <p className="mt-3 text-h3 font-bold leading-tight">
                    Talk to the team.
                  </p>
                  <p className="mt-1 text-sm text-paper/80">
                    Free 30-minute consultation · Reply under 2 hours on WhatsApp.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink"
                    >
                      Book a call
                      <ArrowUpRight className="h-3 w-3" aria-hidden />
                    </Link>
                    <a
                      href={SITE.contact.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-paper/40 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-paper hover:bg-paper/10"
                    >
                      <MessageCircleMore className="h-3 w-3" aria-hidden />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section className="border-t border-ink bg-ink py-24 text-paper md:py-28">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-mega leading-[0.95] tracking-tight">
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
