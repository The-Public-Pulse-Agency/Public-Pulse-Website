import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
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
    <div className="max-w-container mx-auto px-6 py-12">
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />

      <h1 className="mt-4 text-5xl md:text-6xl font-extrabold tracking-tight text-brand-navy">
        Our services
      </h1>

      <AnswerBlock>
        Public Pulse Agency runs nine integrated digital marketing services for Bangladeshi brands, political
        candidates, and hospitality businesses — from political PR and election campaigns to social media, paid ads,
        SEO, content production, branding, analytics, and influencer marketing. Pick one, or take the full 360° package.
      </AnswerBlock>

      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {SERVICES.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/services/${s.slug}`}
              className="block h-full rounded-2xl border border-slate-200 p-6 transition hover:border-brand-red hover:shadow-md"
            >
              <div className="text-3xl">{s.emoji}</div>
              <h2 className="mt-3 text-xl font-bold text-brand-navy">{s.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{s.oneLiner}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
