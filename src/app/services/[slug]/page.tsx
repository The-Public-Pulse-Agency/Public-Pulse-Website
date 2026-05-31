import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, ArrowRight, CheckCircle2 } from "lucide-react";

import { buildMetadata } from "@/lib/seo";
import {
  breadcrumbSchema,
  faqPageSchema,
  serviceSchema,
} from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { GradientHero } from "@/components/seo/GradientHero";
import { Container } from "@/components/ui/Container";
import { InlineBlock } from "@/components/lead-capture";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SERVICES, getService } from "@/lib/services";
import { getServiceContent } from "@/content/services";
import { getPostsBySourceRef } from "@/lib/data/blog";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return SERVICES.filter((s) => s.ready).map((s) => ({ slug: s.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  return buildMetadata({
    title: service.seoTitle,
    description: service.seoDescription,
    path: `/services/${service.slug}`,
    // Per-service OG card via the dynamic /og?title=&eyebrow= factory.
    // Headline uses the clean service name (not the verbose SEO title with
    // "| Public Pulse" suffix); chip uses the category in caps. Each service
    // now shares a distinct preview instead of the generic homepage OG.
    useDynamicOg: true,
    ogTitle: service.name,
    ogEyebrow: service.category.toUpperCase(),
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  const content = service && service.ready ? getServiceContent(service.slug) : undefined;
  if (!service || !service.ready || !content) notFound();

  // Topical cluster: blog posts whose grounding cites this service slug.
  const relatedPosts = await getPostsBySourceRef(service.slug, "en", 3);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: service.shortName, path: `/services/${service.slug}` },
  ];

  return (
    <article>
      <JsonLd
        data={[
          serviceSchema({
            slug: service.slug,
            name: service.name,
            description: service.oneLiner,
            serviceType: service.serviceType,
            category: service.category,
          }),
          breadcrumbSchema(crumbs),
          faqPageSchema(content.faqs),
        ]}
      />

      <GradientHero
        crumbs={crumbs}
        chip={service.category}
        title={
          <>
            {service.name}
            <span className="text-brand-orange">.</span>
          </>
        }
        lead={service.oneLiner}
        answer={content.answer}
        answerQuestion={`What is ${service.shortName} at Public Pulse Agency?`}
        primaryCtaLabel="Start a project"
      />

      {/* ═══ INTRO ═══════════════════════════════════════════════════════ */}
      <section className="border-y border-ink bg-paper-alt py-16 md:py-20">
        <Container>
          <p className="mx-auto max-w-3xl text-center text-lead text-ink/80">{content.intro}</p>
        </Container>
      </section>

      {/* ═══ DELIVERABLES ════════════════════════════════════════════════ */}
      <section id="deliverables" className="bg-paper py-20 md:py-28">
        <Container>
          <div className="grid items-end gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="text-eyebrow uppercase text-brand-orange">Deliverables</p>
              <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
                What&rsquo;s in the box.
              </h2>
            </div>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {content.included.map((item, i) => (
              <li key={item}>
                <ScrollReveal delayMs={Math.min(i, 8) * 40}>
                  <div className="flex items-start gap-3 rounded-card border border-ink/15 bg-paper p-5 transition hover:border-ink">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-orange" aria-hidden />
                    <span className="text-sm leading-relaxed text-ink">{item}</span>
                  </div>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ═══ PROCESS ═════════════════════════════════════════════════════ */}
      <section className="bg-ink py-20 text-paper md:py-28">
        <Container>
          <div className="max-w-3xl">
            <p className="text-eyebrow uppercase text-brand-orange">How it runs</p>
            <h2 className="mt-4 text-display font-extrabold tracking-tight">5-step process.</h2>
          </div>
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {content.process.map((step, i) => (
              <li key={step.title}>
                <ScrollReveal delayMs={i * 60}>
                  <div className="h-full rounded-card border border-white/15 bg-ink-soft p-6 transition hover:border-brand-orange">
                    <span className="text-meta font-semibold uppercase text-brand-orange">
                      Step {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 text-h3 font-bold leading-tight">{step.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/70">{step.body}</p>
                  </div>
                </ScrollReveal>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ═══ WHY US ══════════════════════════════════════════════════════ */}
      <section className="border-t border-ink bg-paper py-20 md:py-28">
        <Container>
          <div className="max-w-3xl">
            <p className="text-eyebrow uppercase text-brand-orange">Why us</p>
            <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
              Why Public Pulse for {service.shortName}?
            </h2>
          </div>
          <ul className="mt-12 grid gap-5 md:grid-cols-2">
            {content.whyChooseUs.map((w) => (
              <li key={w.title}>
                <div className="card h-full">
                  <h3 className="text-h3 font-bold text-ink">{w.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">{w.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ═══ FAQ ═════════════════════════════════════════════════════════ */}
      <section className="border-t border-ink bg-paper-alt py-20 md:py-28">
        <Container>
          <div className="max-w-3xl">
            <p className="text-eyebrow uppercase text-brand-orange">FAQ</p>
            <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
              Frequently asked.
            </h2>
          </div>
          <dl className="mx-auto mt-12 max-w-3xl space-y-4">
            {content.faqs.map((f) => (
              <div key={f.q} className="rounded-card border border-ink/15 bg-paper p-6">
                <dt className="font-semibold text-ink">{f.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink/70">{f.a}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* ═══ FREE AUDIT — service-specific lead capture ══════════════════ */}
      <section className="border-t border-ink bg-paper py-20 md:py-24">
        <Container>
          <InlineBlock context="service" />
        </Container>
      </section>

      {/* ═══ RELATED POSTS (topical cluster — only if posts cite this service) ══ */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-ink bg-paper-alt py-16 md:py-20">
          <Container>
            <div className="grid items-end gap-10 md:grid-cols-12">
              <div className="md:col-span-7">
                <p className="text-eyebrow uppercase text-brand-orange">From the blog</p>
                <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
                  Practitioner guides on {service.shortName.toLowerCase()}.
                </h2>
              </div>
            </div>
            <ul className="mt-10 grid gap-5 md:grid-cols-3">
              {relatedPosts.map((p) => (
                <li key={`${p.slug}-${p.locale}`}>
                  <Link href={`/blog/${p.slug}`} className="card group flex h-full flex-col">
                    <span className="text-meta font-semibold uppercase text-brand-orange">
                      {p.categorySlug}
                    </span>
                    <h3 className="mt-3 text-h3 font-bold text-ink">{p.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">{p.excerpt}</p>
                    <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                      Read · {p.readingTime} min
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" aria-hidden />
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* ═══ RELATED ═════════════════════════════════════════════════════ */}
      <section className="border-t border-ink bg-paper py-20 md:py-24">
        <Container>
          <div className="grid items-end gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="text-eyebrow uppercase text-brand-orange">Related</p>
              <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
                Pair with.
              </h2>
            </div>
          </div>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {SERVICES.filter((s) => s.slug !== service.slug)
              .slice(0, 3)
              .map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="card group flex h-full flex-col">
                    <span className="text-meta font-semibold uppercase text-brand-orange">
                      {s.category}
                    </span>
                    <h3 className="mt-3 text-h3 font-bold text-ink">{s.shortName}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">{s.oneLiner}</p>
                    <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                      Explore
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

      {/* ═══ CTA ═════════════════════════════════════════════════════════ */}
      <section className="border-t border-ink bg-ink py-24 text-paper md:py-28">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-mega font-extrabold leading-[0.95] tracking-tight">
              Ready for <span className="text-brand-orange">{service.shortName}</span>?
            </h2>
            <p className="mt-6 text-lead text-white/70">
              Free 30-minute consultation. We&rsquo;ll review your situation and propose a plan.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/contact" className="btn btn-orange">
                Get a free consultation
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </article>
  );
}
