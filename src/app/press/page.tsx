import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Download, Mail, FileText, Newspaper } from "lucide-react";

import { buildMetadata } from "@/lib/seo";
import {
  breadcrumbSchema,
  faqPageSchema,
  webPageSchema,
} from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SITE } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Press & media | Public Pulse",
  description:
    "Press, media, and brand resources for Public Pulse Agency — boilerplate, logo files, founder bio, and direct contact for journalists.",
  path: "/press",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Press", path: "/press" },
];

const FAQS = [
  {
    q: "How do I quote Public Pulse Agency?",
    a: 'Use this boilerplate: "Public Pulse Agency is Bangladesh\'s 360° digital marketing and political PR studio, founded in Dhaka in 2024. It runs nine integrated services — political PR, social media, content production, paid ads, hospitality marketing, branding, SEO, analytics, and influencer marketing — billed in BDT from a registered Bangladesh entity (BIN 009043032-0102 · Trade License TRAD/DNCC/037136/2025)."',
  },
  {
    q: "Can I download your logo?",
    a: "Yes. The brand mark is on this page in PNG (light + dark backgrounds). For SVG or print-ready EPS, email press@publicpulse.com.bd and we'll send a brand-kit zip within a working day.",
  },
  {
    q: "Who do I contact for press enquiries?",
    a: `Email ${SITE.contact.email} with "Press" in the subject line. For time-sensitive enquiries (same-day deadline), WhatsApp ${SITE.contact.phoneDisplay}. We reply Saturday–Thursday within business hours.`,
  },
  {
    q: "Do you have a spokesperson available for comment?",
    a: "Yes — for stories on Bangladesh digital marketing, political PR, election communications, AEO/GEO, or the Pulse Group (Event Pulse, Tender Pulse, Social Pulse, The Pulse Today). Reach out at the address above with topic + outlet + deadline.",
  },
  {
    q: "Where are you registered?",
    a: "Dhaka, Bangladesh. BIN 009043032-0102, Trade License TRAD/DNCC/037136/2025. We're a sister concern within Pulse Group.",
  },
];

export default function PressPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          webPageSchema({
            path: "/press",
            name: "Press & media — Public Pulse Agency",
            description:
              "Press, media, and brand resources for Public Pulse Agency.",
            keywords: [
              "Public Pulse press",
              "Bangladesh agency media kit",
              "Public Pulse brand assets",
            ],
          }),
          faqPageSchema(FAQS),
        ]}
      />

      <section className="bg-paper py-12 md:py-20">
        <Container>
          <Breadcrumbs crumbs={crumbs} />
          <div className="mt-6 max-w-3xl">
            <p className="text-eyebrow uppercase text-brand-orange">Press &amp; media</p>
            <h1 className="mt-4 text-display tracking-tight text-ink">
              Reporting on us? Here&rsquo;s what you need.
            </h1>
            <p className="mt-5 text-lead text-ink/70">
              Boilerplate, brand assets, founder bio, and a direct line for journalists.
              We reply within a working day — same-day for live deadlines.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={`mailto:${SITE.contact.email}?subject=Press%20enquiry`}
                className="btn btn-orange"
              >
                Email the press desk
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <a
                href={SITE.contact.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                WhatsApp (urgent deadlines)
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── Boilerplate ─────────────────────────────────────────────── */}
      <section className="bg-surface-alt py-16 md:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <p className="text-eyebrow uppercase text-brand-orange">Boilerplate</p>
              <h2 className="mt-4 text-h2 tracking-tight text-ink">
                Cut, paste, publish.
              </h2>
              <p className="mt-4 text-body text-ink/65">
                Copy-ready boilerplate for stories about Public Pulse. Verified
                facts — registered entity, services, sister concerns, contact.
              </p>
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-card border border-ink/10 bg-paper p-6 md:p-8">
                <p className="text-meta uppercase tracking-wider text-ink/45">
                  Short boilerplate (50 words)
                </p>
                <blockquote className="mt-3 text-lead text-ink">
                  Public Pulse Agency is Bangladesh&rsquo;s 360° digital marketing
                  and political PR studio, founded in Dhaka in 2024. It runs nine
                  integrated services billed in BDT from a registered Bangladesh
                  entity (BIN 009043032-0102 · Trade License TRAD/DNCC/037136/2025).
                  A sister concern within Pulse Group.
                </blockquote>

                <p className="mt-8 text-meta uppercase tracking-wider text-ink/45">
                  Long boilerplate (120 words)
                </p>
                <blockquote className="mt-3 text-body text-ink/80">
                  Public Pulse Agency is Bangladesh&rsquo;s 360° digital marketing
                  and political PR studio, founded in Dhaka in 2024 by Moshiur Rahman.
                  The agency runs nine integrated services — political PR &amp; image
                  building, social media, content production, paid ads (Meta &amp;
                  Google), hospitality marketing, brand building, SEO &amp; website,
                  analytics &amp; reporting, and influencer marketing — under a single
                  accountable team. Engagements are billed in BDT from a registered
                  Bangladesh entity (BIN 009043032-0102 · Trade License
                  TRAD/DNCC/037136/2025), served from Dhaka with field coordinators
                  nationwide. Public Pulse is a sister concern within Pulse Group,
                  alongside Event Pulse, Tender Pulse, Social Pulse, and The Pulse Today.
                </blockquote>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── Brand assets ─────────────────────────────────────────── */}
      <section className="bg-paper py-16 md:py-24">
        <Container>
          <div className="max-w-3xl">
            <p className="text-eyebrow uppercase text-brand-orange">Brand assets</p>
            <h2 className="mt-4 text-h2 tracking-tight text-ink">
              Logos, colors, typography.
            </h2>
            <p className="mt-5 text-body text-ink/65">
              For SVG / EPS / brand-kit zip, email the press desk — we&rsquo;ll send
              within a working day. The wordmark below is reproducible inline if you
              prefer.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-card border border-ink/10 bg-paper p-8">
              <p className="text-meta uppercase tracking-wider text-ink/45">
                On light background
              </p>
              <div className="mt-6 grid h-32 place-items-center rounded-card bg-paper">
                <span className="text-3xl font-extrabold tracking-tight text-ink">
                  Public<span className="text-brand-orange">Pulse</span>
                </span>
              </div>
              <a
                href={`mailto:${SITE.contact.email}?subject=Brand%20kit%20request`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-orange hover:underline"
              >
                <Download className="h-4 w-4" aria-hidden /> Request brand-kit zip
              </a>
            </div>
            <div className="rounded-card border border-ink/10 bg-ink p-8 text-paper">
              <p className="text-meta uppercase tracking-wider text-white/55">
                On dark background
              </p>
              <div className="mt-6 grid h-32 place-items-center rounded-card bg-ink">
                <span className="text-3xl font-extrabold tracking-tight text-paper">
                  Public<span className="text-brand-orange">Pulse</span>
                </span>
              </div>
              <a
                href={`mailto:${SITE.contact.email}?subject=Brand%20kit%20request`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-orange hover:underline"
              >
                <Download className="h-4 w-4" aria-hidden /> Request brand-kit zip
              </a>
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="rounded-card border border-ink/10 bg-paper p-6">
              <div className="h-16 w-full rounded-card bg-brand-orange" aria-hidden />
              <p className="mt-4 text-meta uppercase tracking-wider text-ink/55">
                Brand orange
              </p>
              <p className="mt-1 font-mono text-body text-ink">#FF5C00</p>
            </div>
            <div className="rounded-card border border-ink/10 bg-paper p-6">
              <div className="h-16 w-full rounded-card bg-ink" aria-hidden />
              <p className="mt-4 text-meta uppercase tracking-wider text-ink/55">
                Ink
              </p>
              <p className="mt-1 font-mono text-body text-ink">#0A0A0A</p>
            </div>
            <div className="rounded-card border border-ink/10 bg-paper p-6">
              <div className="h-16 w-full rounded-card border border-ink/15 bg-paper" aria-hidden />
              <p className="mt-4 text-meta uppercase tracking-wider text-ink/55">
                Paper
              </p>
              <p className="mt-1 font-mono text-body text-ink">#FFFFFF</p>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── Coverage ─────────────────────────────────────────────── */}
      <section className="bg-surface-alt py-16 md:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <p className="text-eyebrow uppercase text-brand-orange">Coverage</p>
              <h2 className="mt-4 text-h2 tracking-tight text-ink">
                In the news.
              </h2>
              <p className="mt-4 text-body text-ink/65">
                Articles, interviews, and mentions of Public Pulse Agency in the
                Bangladesh media. Reach out if your outlet should be on this list.
              </p>
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-card border border-dashed border-ink/20 bg-paper p-10 text-center">
                <Newspaper className="mx-auto h-10 w-10 text-ink/40" aria-hidden />
                <p className="mt-4 text-body text-ink/70">
                  Coverage gallery is being curated. Featured an interview, op-ed,
                  or quote? Send it to{" "}
                  <a
                    href={`mailto:${SITE.contact.email}?subject=Coverage%20to%20add`}
                    className="font-semibold text-brand-orange hover:underline"
                  >
                    {SITE.contact.email}
                  </a>{" "}
                  and we&rsquo;ll add it here.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────── */}
      <section className="bg-paper py-16 md:py-24">
        <Container>
          <div className="max-w-3xl">
            <p className="text-eyebrow uppercase text-brand-orange">FAQ</p>
            <h2 className="mt-4 text-h1 tracking-tight text-ink">
              Journalist questions.
            </h2>
          </div>
          <div className="mt-10 space-y-4">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-card border border-ink/10 bg-paper p-5 open:shadow-card"
              >
                <summary className="cursor-pointer list-none text-h3 font-bold text-ink marker:hidden">
                  <span className="flex items-start justify-between gap-4">
                    <span>{f.q}</span>
                    <span aria-hidden className="mt-1 text-brand-orange transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-body text-ink/70">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-ink py-14 text-paper">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <h2 className="text-h2 tracking-tight">
                Got a deadline?
              </h2>
              <p className="mt-3 text-white/70">
                Email the press desk and put your outlet + deadline in the subject —
                we&rsquo;ll match the response window.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:${SITE.contact.email}?subject=Press%20enquiry`}
                className="btn btn-orange"
              >
                <Mail className="h-4 w-4" aria-hidden /> Email press desk
              </a>
              <Link href="/about" className="btn btn-ghost-dark">
                <FileText className="h-4 w-4" aria-hidden /> About the studio
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
