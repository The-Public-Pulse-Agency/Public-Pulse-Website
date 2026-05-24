import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { buildMetadata } from "@/lib/seo";
import {
  breadcrumbSchema,
  faqPageSchema,
  serviceSchema,
} from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { SERVICES, getService } from "@/lib/services";
import { getServiceContent } from "@/content/services";

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

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: service.shortName, path: `/services/${service.slug}` },
  ];

  const accent = getCategoryHex(service.categoryColor);

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

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(50%_45%_at_50%_0%,rgba(13,148,136,0.07),transparent_60%)]"
        />
        <Container className="relative pt-10 pb-16 md:pt-14 md:pb-20">
          <Breadcrumbs crumbs={crumbs} />

          <div className="mx-auto mt-6 max-w-3xl text-center">
            <span
              className="chip mx-auto"
              style={{ backgroundColor: `${accent}15`, color: accent }}
            >
              {service.category}
            </span>
            <h1 className="mt-5 text-display font-extrabold tracking-tight text-brand-navy">
              {service.name}
            </h1>
            <p className="mt-5 text-lead text-slate-600">{service.oneLiner}</p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/contact" className="btn btn-primary">
                Book a free audit
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="#what-included" className="btn btn-secondary">
                See what&rsquo;s included
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-3xl">
            <AnswerBlock question={`What is ${service.shortName} at Public Pulse Agency?`}>
              {content.answer}
            </AnswerBlock>
          </div>
        </Container>
      </section>

      {/* ─── INTRO ────────────────────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-20">
        <Container>
          <p className="mx-auto max-w-3xl text-center text-lead text-slate-700">{content.intro}</p>
        </Container>
      </section>

      {/* ─── WHAT'S INCLUDED ─────────────────────────────────────────── */}
      <section id="what-included" className="border-y border-slate-200 bg-surface-alt py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-eyebrow uppercase text-brand-teal">Deliverables</p>
            <h2 className="mt-3 text-h2 font-bold tracking-tight text-brand-navy">
              What&rsquo;s included
            </h2>
          </div>
          <ul className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
            {content.included.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-card border border-slate-200 bg-white p-4"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-teal" aria-hidden />
                <span className="text-sm leading-relaxed text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ─── PROCESS ──────────────────────────────────────────────────── */}
      <section className="bg-white py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-eyebrow uppercase text-brand-teal">How it runs</p>
            <h2 className="mt-3 text-h2 font-bold tracking-tight text-brand-navy">
              Our 5-step process
            </h2>
          </div>
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {content.process.map((step, i) => (
              <li key={step.title} className="card flex h-full flex-col">
                <span className="text-meta font-semibold uppercase text-brand-teal">
                  Step {i + 1}
                </span>
                <h3 className="mt-2 text-h3 font-semibold text-brand-navy">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ─── WHY US ───────────────────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-surface-alt py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-eyebrow uppercase text-brand-teal">Why us</p>
            <h2 className="mt-3 text-h2 font-bold tracking-tight text-brand-navy">
              Why choose Public Pulse for {service.shortName}?
            </h2>
          </div>
          <ul className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
            {content.whyChooseUs.map((w) => (
              <li key={w.title} className="card">
                <h3 className="text-h3 font-semibold text-brand-navy">{w.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{w.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-eyebrow uppercase text-brand-teal">FAQ</p>
            <h2 className="mt-3 text-h2 font-bold tracking-tight text-brand-navy">
              Frequently asked questions
            </h2>
          </div>
          <dl className="mx-auto mt-10 max-w-3xl space-y-6">
            {content.faqs.map((f) => (
              <div key={f.q} className="rounded-card border border-slate-200 bg-white p-6">
                <dt className="font-semibold text-brand-navy">{f.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-slate-600">{f.a}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* ─── RELATED SERVICES ────────────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-surface-alt py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-eyebrow uppercase text-brand-teal">Related</p>
            <h2 className="mt-3 text-h2 font-bold tracking-tight text-brand-navy">
              Related services
            </h2>
          </div>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {SERVICES.filter((s) => s.slug !== service.slug)
              .slice(0, 3)
              .map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="card group flex h-full flex-col"
                  >
                    <span
                      className="inline-flex h-10 w-10 items-center justify-center rounded-card text-xl"
                      style={{
                        backgroundColor: `${getCategoryHex(s.categoryColor)}15`,
                        color: getCategoryHex(s.categoryColor),
                      }}
                      aria-hidden
                    >
                      {s.emoji}
                    </span>
                    <h3 className="mt-4 text-h3 font-semibold text-brand-navy">{s.shortName}</h3>
                    <p className="mt-2 flex-1 text-sm text-slate-600">{s.oneLiner}</p>
                    <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal">
                      Explore
                      <ArrowRight
                        className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </p>
                  </Link>
                </li>
              ))}
          </ul>
        </Container>
      </section>

      {/* ─── CTA (dark) ───────────────────────────────────────────────── */}
      <section className="bg-brand-navy py-20 text-white md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-h1 font-bold tracking-tight">
              Interested in {service.shortName}?
            </h2>
            <p className="mt-4 text-lead text-white/75">
              Free 30-minute consultation. We&rsquo;ll review your situation and propose a plan.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/contact" className="btn btn-primary">
                Get a free consultation
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </article>
  );
}

function getCategoryHex(token: string): string {
  const map: Record<string, string> = {
    "cat-red": "#D32F2F",
    "cat-blue": "#1565C0",
    "cat-purple": "#6A1B9A",
    "cat-teal": "#0D9488",
    "cat-green": "#2E7D32",
    "cat-orange": "#EF6C00",
    "cat-navy": "#0F1B3D",
    "cat-brown": "#795548",
    "cat-magenta": "#AD1457",
  };
  return map[token] ?? "#0D9488";
}
