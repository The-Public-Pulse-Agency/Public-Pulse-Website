import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, pulseGroupSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
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

// TODO(user): confirm group narrative — founding year of the group itself,
// the through-line that unites the five brands, and whether there's a shared
// leadership team to name. The current copy is best-effort from the brand list.

export default function GroupPage() {
  return (
    <>
      {/* ───────── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-navy text-white">
        <div className="bg-grain absolute inset-0" aria-hidden="true" />
        <Container className="relative py-20 md:py-32">
          <div className="text-white/80">
            <Breadcrumbs crumbs={crumbs} />
          </div>

          <div className="mt-10 grid items-start gap-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-eyebrow uppercase text-white/60">{PULSE_GROUP.name}</p>
              <h1 className="mt-6 font-serif text-display font-medium text-white">
                Five brands.
                <br />
                One <span className="italic text-brand-red">country</span>.
              </h1>
              <p className="mt-8 max-w-xl text-lead text-white/80">
                {PULSE_GROUP.name} operates five Bangladesh-focused digital businesses across digital
                marketing, event management, e-procurement, community marketing, and news media. Each
                brand stands on its own — together they cover the operating surface of a modern
                Bangladeshi business.
              </p>
            </div>

            <div className="lg:col-span-5 lg:pt-12">
              <div className="answer-block-dark" data-speakable="">
                <p className="text-eyebrow uppercase text-brand-red">What is Pulse Group?</p>
                <p className="mt-3 text-[17px] leading-relaxed text-white/92">
                  {PULSE_GROUP.name} is a family of five Bangladesh-focused digital businesses:
                  Public Pulse Agency (digital marketing &amp; political PR), Event Pulse (events),
                  Tender Pulse (e-procurement intelligence), Social Pulse (community &amp; influencer
                  marketing), and The Pulse Today (daily news for Bangladesh). One group, five
                  capabilities, fully in-house.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ───────── BRANDS — EDITORIAL CARDS ─────────────────────────────── */}
      <section className="bg-white py-24 md:py-32">
        <Container>
          <JsonLd data={[pulseGroupSchema(), breadcrumbSchema(crumbs)]} />

          <ScrollReveal>
            <div className="grid items-end gap-8 md:grid-cols-12">
              <div className="md:col-span-7">
                <p className="text-eyebrow uppercase text-brand-red">The brands</p>
                <h2 className="mt-4 font-serif text-h2 font-medium text-brand-navy">
                  Each brand,
                  <br />
                  <span className="italic">on its own terms</span>.
                </h2>
              </div>
              <p className="md:col-span-5 text-lead text-slate-700">
                Brands don&rsquo;t share a sales team or a website. They share an operating standard
                — the same engineering, design, and accounting bones — so any one of them can plug
                into another&rsquo;s engagement when a client&rsquo;s problem crosses categories.
              </p>
            </div>
          </ScrollReveal>

          <ul className="mt-16 space-y-6">
            {PULSE_BRANDS.map((b, i) => (
              <li key={b.slug}>
                <ScrollReveal delayMs={Math.min(i, 4) * 60}>
                  <BrandRow
                    brand={b}
                    isFirst={i === 0}
                    isLast={i === PULSE_BRANDS.length - 1}
                  />
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ───────── CLOSING ──────────────────────────────────────────────── */}
      <section className="bg-surface-alt py-24 md:py-32">
        <Container>
          <ScrollReveal>
            <div className="mx-auto max-w-prose text-center">
              <p className="text-eyebrow uppercase text-brand-red">One country</p>
              <h2 className="mt-4 font-serif text-h2 font-medium text-brand-navy">
                Built in Dhaka,
                <br />
                <span className="italic">for Bangladesh</span>.
              </h2>
              <p className="mt-6 text-lead text-slate-700">
                All five brands are headquartered in Dhaka. All five hire in Bangladesh, bill in BDT,
                and design for the cultural and regulatory realities of doing business here — not
                templates ported from elsewhere.
              </p>
              <div className="mt-10">
                <Link
                  href="/"
                  className="cta-primary inline-flex items-center rounded-full border border-brand-navy px-6 py-3 font-semibold text-brand-navy hover:bg-brand-navy hover:text-white"
                >
                  Back to Public Pulse →
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </>
  );
}

// ─── Sub-component ──────────────────────────────────────────────────────

type Brand = (typeof PULSE_BRANDS)[number];

function BrandRow({
  brand,
  isFirst,
  isLast,
}: {
  brand: Brand;
  isFirst: boolean;
  isLast: boolean;
}) {
  void isFirst; // reserved for future top-border styling
  void isLast;
  const headerStyle = { color: brand.color };

  const Inner = (
    <div
      className="card-hover relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 md:p-12"
      style={{ borderLeftColor: brand.color, borderLeftWidth: 4 }}
    >
      <div className="grid items-start gap-8 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="leading-tight">
            <div className="font-serif text-3xl font-medium" style={headerStyle}>
              {brand.logoText.primary}
            </div>
            <div className="text-meta text-slate-500">{brand.logoText.secondary}</div>
          </div>
          <h3 className="mt-6 font-serif text-2xl font-medium text-brand-navy">
            {brand.name}
          </h3>
        </div>

        <div className="md:col-span-6">
          <p className="text-lead text-slate-700">{brand.tagline}</p>
        </div>

        <div className="md:col-span-2 md:text-right">
          {brand.self ? (
            <span className="text-meta uppercase text-slate-400">You are here</span>
          ) : (
            <span
              className="text-meta font-semibold uppercase"
              style={headerStyle}
            >
              Visit site →
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (brand.self) return Inner;

  return (
    <a
      href={brand.url}
      rel="noopener noreferrer"
      target="_blank"
      aria-label={`Visit ${brand.name} — ${brand.tagline}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 rounded-2xl"
    >
      {Inner}
    </a>
  );
}
