import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Container } from "@/components/ui/Container";
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

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(50%_45%_at_50%_0%,rgba(13,148,136,0.07),transparent_60%)]"
        />
        <Container className="relative pt-10 pb-14 md:pt-14 md:pb-20">
          <Breadcrumbs crumbs={crumbs} />
          <div className="mx-auto mt-6 max-w-3xl text-center">
            <p className="text-eyebrow uppercase text-brand-teal">Platform</p>
            <h1 className="mt-3 text-display font-extrabold tracking-tight text-brand-navy">
              Nine services. One accountable team.
            </h1>
            <p className="mt-5 text-lead text-slate-600">
              Pick one, or take the full 360° package. Each engagement is led by a senior on our
              team, with a single KPI agreed before kickoff.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl">
            <AnswerBlock>
              Public Pulse Agency runs nine integrated digital marketing services for Bangladeshi
              brands, political candidates, and hospitality businesses — from political PR and
              election campaigns to social media, paid ads, SEO, content production, branding,
              analytics, and influencer marketing.
            </AnswerBlock>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 md:py-24">
        <Container>
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="card group flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
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
                    <span className="chip">{s.category}</span>
                  </div>
                  <h2 className="mt-5 text-h3 font-semibold text-brand-navy">{s.name}</h2>
                  <p className="mt-2 flex-1 text-sm text-slate-600">{s.oneLiner}</p>
                  <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal">
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
    </>
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
