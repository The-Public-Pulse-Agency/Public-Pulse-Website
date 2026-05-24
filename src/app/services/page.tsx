import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = buildMetadata({
  title: "Services | Public Pulse Agency — 9 Digital Marketing Services",
  description:
    "Political PR, social media, content, paid ads, hospitality, branding, SEO, analytics and influencer marketing — nine integrated services under one Dhaka roof.",
  path: "/services",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
];

export default function ServicesIndexPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <section className="bg-paper">
        <Container className="pt-10 pb-14 md:pt-14 md:pb-20">
          <Breadcrumbs crumbs={crumbs} />
          <div className="mt-8 max-w-5xl">
            <span className="chip chip-orange">Platform</span>
            <h1 className="mt-6 text-mega font-extrabold tracking-tight text-ink">
              Nine services. <span className="text-brand-orange">One</span> team.
            </h1>
            <p className="mt-6 max-w-2xl text-lead text-ink/70">
              Pick one, or take the full 360°. Each engagement is led by a senior on our team with a
              single KPI agreed before kickoff.
            </p>
          </div>
          <div className="mt-12 max-w-3xl">
            <AnswerBlock>
              Public Pulse Agency runs nine integrated digital marketing services for Bangladeshi
              brands, political candidates, and hospitality businesses — from political PR and
              election campaigns to social media, paid ads, SEO, content production, branding,
              analytics, and influencer marketing.
            </AnswerBlock>
          </div>
        </Container>
      </section>

      <section className="border-t border-ink bg-paper-alt py-16 md:py-24">
        <Container>
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <li key={s.slug}>
                <ScrollReveal delayMs={Math.min(i, 5) * 50}>
                  <Link href={`/services/${s.slug}`} className="card group flex h-full flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-meta font-semibold uppercase text-ink/45">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-3xl" aria-hidden>
                        {s.emoji}
                      </span>
                    </div>
                    <h2 className="mt-6 text-h3 font-bold text-ink">{s.name}</h2>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/70">{s.oneLiner}</p>
                    <p className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                      Explore
                      <ArrowRight
                        className="h-3.5 w-3.5 transition group-hover:translate-x-1"
                        aria-hidden
                      />
                    </p>
                  </Link>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
