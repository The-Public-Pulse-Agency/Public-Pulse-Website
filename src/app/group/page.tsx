import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ExternalLink } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, pulseGroupSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { PULSE_GROUP, PULSE_BRANDS } from "@/lib/group";

export const metadata: Metadata = buildMetadata({
  title: `${PULSE_GROUP.name} — Five Bangladesh-focused brands`,
  description:
    "Pulse Group is a family of five Bangladesh-focused digital businesses: Public Pulse, Event Pulse, Tender Pulse, Social Pulse and The Pulse Today. One group, five brands, one country.",
  path: "/group",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Pulse Group", path: "/group" },
];

export default function GroupPage() {
  return (
    <>
      <JsonLd data={[pulseGroupSchema(), breadcrumbSchema(crumbs)]} />

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(50%_45%_at_50%_0%,rgba(13,148,136,0.07),transparent_60%)]"
        />
        <Container className="relative pt-10 pb-14 md:pt-14 md:pb-20">
          <Breadcrumbs crumbs={crumbs} />
          <div className="mx-auto mt-6 max-w-3xl text-center">
            <p className="text-eyebrow uppercase text-brand-teal">{PULSE_GROUP.name}</p>
            <h1 className="mt-3 text-display font-extrabold tracking-tight text-brand-navy">
              Five brands. One country.
            </h1>
            <p className="mt-5 text-lead text-slate-600">
              {PULSE_GROUP.name} operates five Bangladesh-focused digital businesses across digital
              marketing, event management, e-procurement, community marketing and news media.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl">
            <AnswerBlock question={`What is ${PULSE_GROUP.name}?`}>
              {PULSE_GROUP.name} is a family of five Bangladesh-focused digital businesses: Public
              Pulse Agency (digital marketing &amp; political PR), Event Pulse (events), Tender
              Pulse (e-procurement intelligence), Social Pulse (community &amp; influencer
              marketing), and The Pulse Today (daily news for Bangladesh). One group, five
              capabilities, fully in-house.
            </AnswerBlock>
          </div>
        </Container>
      </section>

      {/* ─── BRANDS ──────────────────────────────────────────────────── */}
      <section className="bg-white py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-eyebrow uppercase text-brand-teal">The brands</p>
            <h2 className="mt-3 text-h2 font-bold tracking-tight text-brand-navy">
              Each brand, on its own terms.
            </h2>
            <p className="mt-4 text-slate-600">
              Brands don&rsquo;t share a sales team or a website. They share an operating standard
              — the same engineering, design and accounting bones — so any one of them can plug
              into another&rsquo;s engagement when a client&rsquo;s problem crosses categories.
            </p>
          </div>

          <ul className="mt-12 grid gap-5 md:grid-cols-2">
            {PULSE_BRANDS.map((b) => {
              const inner = (
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className="text-lg font-extrabold tracking-tight"
                          style={{ color: b.color }}
                        >
                          {b.logoText.primary}
                        </span>
                        <span className="text-base font-semibold tracking-tight text-slate-500">
                          {b.logoText.secondary.replace(".bd", "")}
                        </span>
                      </div>
                      <h3 className="mt-3 text-h3 font-semibold text-brand-navy">{b.name}</h3>
                    </div>
                    {b.self ? (
                      <span className="chip chip-teal">You are here</span>
                    ) : (
                      <ExternalLink
                        className="mt-1 h-4 w-4 flex-shrink-0 text-slate-400"
                        aria-hidden
                      />
                    )}
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">{b.tagline}</p>
                  {!b.self && (
                    <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal">
                      Visit {b.logoText.primary}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </p>
                  )}
                </div>
              );
              return (
                <li key={b.slug}>
                  {b.self ? (
                    <div
                      className="card"
                      style={{ borderLeftColor: b.color, borderLeftWidth: 3 }}
                    >
                      {inner}
                    </div>
                  ) : (
                    <a
                      href={b.url}
                      rel="noopener noreferrer"
                      target="_blank"
                      aria-label={`Visit ${b.name} — ${b.tagline}`}
                      className="card group block"
                      style={{ borderLeftColor: b.color, borderLeftWidth: 3 }}
                    >
                      {inner}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* ─── CLOSING ─────────────────────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-surface-alt py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-eyebrow uppercase text-brand-teal">One country</p>
            <h2 className="mt-3 text-h2 font-bold tracking-tight text-brand-navy">
              Built in Dhaka, for Bangladesh.
            </h2>
            <p className="mt-4 text-slate-600">
              All five brands are headquartered in Dhaka. All five hire in Bangladesh, bill in BDT,
              and design for the cultural and regulatory realities of doing business here.
            </p>
            <div className="mt-7">
              <Link href="/" className="btn btn-secondary">
                Back to Public Pulse
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
