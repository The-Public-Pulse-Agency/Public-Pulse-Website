import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowUpRight,
  Award,
  Building2,
  Globe2,
  Layers,
  MapPin,
  MessageCircleMore,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

import { buildMetadata } from "@/lib/seo";
import { aboutPageSchema, breadcrumbSchema, faqPageSchema, type Faq } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { SITE } from "@/lib/site";
import { SERVICES } from "@/lib/services";
import { PULSE_GROUP, SISTER_BRANDS } from "@/lib/group";
import {
  AuroraGradient,
  GradientText,
  MagneticButton,
  Parallax,
  ScrollRevealV2 as ScrollReveal,
  Stagger,
  TiltCard,
} from "@/components/motion";

export const metadata: Metadata = buildMetadata({
  title: "About Public Pulse Agency | Dhaka Digital Marketing & Political PR",
  description:
    "Public Pulse Agency is Bangladesh's 360° digital marketing & political PR studio, founded in Dhaka in 2024. Nine integrated services billed in BDT from a registered Bangladesh entity.",
  path: "/about",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
];

// Four brand principles — phrased as brand promises, not "our team is great".
// Icons sourced from lucide-react; consistent with the rest of the site.
const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "Senior brief, every brief",
    body:
      "Every engagement is owned at the senior level inside the studio. No junior account handler escalating to a senior on a Friday review — the senior writes the brief and signs the report.",
  },
  {
    icon: MapPin,
    title: "Built for Bangladesh",
    body:
      "Founded in Dhaka, hires in Bangladesh, bills in BDT. Channel mix is Facebook-first because the market is; CAPI + Bkash/Nagad funnel design baked in; constituency-level PR works because the studio works at constituency level.",
  },
  {
    icon: Workflow,
    title: "One accountable team",
    body:
      "Strategy, creative, paid media, PR and analytics sit on one brief, in one office, with one weekly report. The hand-offs other agencies lose campaigns inside don't exist here.",
  },
  {
    icon: ScrollText,
    title: "Honest reporting",
    body:
      "Monthly business review covers what worked, what didn't, what we're killing this week. No vanity dashboards, no metric inflation. The numbers reconcile to your finance team.",
  },
];

const FAQS: Faq[] = [
  {
    q: "Who is Public Pulse Agency?",
    a: "Public Pulse Agency is a Bangladesh-based digital marketing and political PR studio. We run nine integrated services — political PR, social media, content production, paid media, hospitality marketing, brand building, SEO, analytics, and influencer marketing — under one roof from Dhaka.",
  },
  {
    q: "Where is Public Pulse based?",
    a: `Dhaka, Bangladesh. The studio is a registered Bangladesh entity (BIN ${SITE.contact.legal.bin}, Trade License ${SITE.contact.legal.tradeLicense}). All work is billed in BDT from the Dhaka office; client calls happen in Bengali and English.`,
  },
  {
    q: "What services does Public Pulse offer?",
    a: "Nine integrated services delivered by one accountable team: political PR, social media, content production, paid ads, hospitality marketing, brand building, SEO + website, analytics & reporting, and influencer marketing. Each service can run standalone or as part of an integrated campaign.",
  },
  {
    q: "Is Public Pulse a registered company in Bangladesh?",
    a: `Yes. Public Pulse Agency operates as a Bangladesh-registered business entity with BIN ${SITE.contact.legal.bin} and Trade License ${SITE.contact.legal.tradeLicense}. Invoices, contracts, and bank transfers are all handled through the registered entity.`,
  },
  {
    q: "How does Public Pulse bill?",
    a: "All engagements are billed in BDT against a written scope and a monthly retainer or project fee. Campaign media spend is invoiced separately at cost with line-item reconciliation. Government and NGO clients can be billed on standard tender-aligned payment terms.",
  },
  {
    q: "What is Pulse Group?",
    a: `Pulse Group is the parent organization. Public Pulse Agency is one of five sister concerns: ${SISTER_BRANDS.map((b) => b.name).join(", ")} and Public Pulse Agency. The group focuses on Bangladesh-specific digital businesses.`,
  },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          aboutPageSchema({ path: "/about", inLanguage: "en" }),
          breadcrumbSchema(crumbs),
          faqPageSchema(FAQS),
        ]}
      />

      {/* ═══ HERO — aurora + parallax + gradient headline ════════════════ */}
      <section className="relative isolate overflow-hidden border-b border-ink bg-paper">
        <AuroraGradient variant="default" />
        <Container className="relative z-10 pt-10 pb-16 md:pt-14 md:pb-20">
          <Breadcrumbs crumbs={crumbs} />
          <div className="mt-8 grid items-end gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <span className="chip chip-orange">About the studio</span>
              <h1 className="mt-6 text-mega font-extrabold tracking-tight text-ink leading-[0.95]">
                <GradientText as="span">A Bangladesh studio</GradientText>
                <br />
                built for{" "}
                <span className="text-brand-orange">integrated</span> work.
              </h1>
              <Parallax mouse mouseStrength={6} className="mt-6 max-w-2xl">
                <p className="text-lead text-ink/70">
                  Founded in Dhaka in 2024 to run the kind of integrated digital marketing and
                  political PR that Bangladeshi brands were stitching together from three or four
                  vendors. One brief, one office, one report.
                </p>
              </Parallax>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/contact" className="btn btn-primary">
                  Talk to the studio
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
                <a
                  href={SITE.contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  <MessageCircleMore className="h-4 w-4" aria-hidden />
                  WhatsApp
                </a>
              </div>
            </div>
            {/* Real proof strip — facts only. Numbers are scope-limited and
                derive from things we can audit (years live, services count,
                registered entity status, regions). No fabricated client
                counts. */}
            <div className="lg:col-span-4">
              <Stagger step={70}>
                <ProofTile k="2024" v="Founded in Dhaka" />
                <ProofTile k="9" v="Integrated services" />
                <ProofTile k="2" v="Languages (EN + বাংলা)" />
                <ProofTile k="100%" v="BDT-billed from a registered BD entity" />
              </Stagger>
            </div>
          </div>

          {/* AnswerBlock — entity-query tuned, data-speakable, 40-60 words */}
          <div className="mt-12 max-w-3xl">
            <AnswerBlock question="Who is Public Pulse Agency?">
              Public Pulse Agency is a Dhaka-based digital marketing and political PR studio,
              founded in 2024. It runs nine integrated services — political PR, social media,
              content, paid media, hospitality marketing, brand building, SEO, analytics, and
              influencer marketing — under one accountable team, billed in BDT from a registered
              Bangladesh entity.
            </AnswerBlock>
          </div>
        </Container>
      </section>

      {/* ═══ STORY — the handoff thesis ══════════════════════════════════ */}
      <section className="border-b border-ink bg-paper-alt py-20 md:py-28">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <ScrollReveal>
                <p className="text-eyebrow uppercase text-brand-orange">Why the studio exists</p>
                <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
                  Built to fix the <GradientText as="span">handoff</GradientText> problem.
                </h2>
              </ScrollReveal>
            </div>
            <div className="lg:col-span-7 space-y-5 text-ink/80">
              <Stagger step={90}>
                <p>
                  Most Bangladeshi brands run their digital marketing across three or four vendors —
                  a social agency, a media-buying shop, a freelance SEO consultant, an events
                  vendor. The hand-offs between those vendors are where every campaign loses
                  velocity, where the narrative drifts, where the reports stop reconciling.
                </p>
                <p>
                  Public Pulse was built to remove those hand-offs. Strategy, creative, paid media,
                  PR and analytics live on one shared brief, in one office in Dhaka, with one client
                  lead who owns the relationship and the report. The same senior who scoped the
                  campaign signs off the monthly review.
                </p>
                <p>
                  Registered business entity in Bangladesh — BIN&nbsp;
                  {SITE.contact.legal.bin}, Trade License&nbsp;{SITE.contact.legal.tradeLicense}.
                </p>
              </Stagger>
            </div>
          </div>
        </Container>
      </section>

      {/* ═══ PRINCIPLES — four brand promises (no individuals) ═══════════ */}
      <section className="bg-paper py-20 md:py-28">
        <Container>
          <div className="max-w-3xl">
            <ScrollReveal>
              <p className="text-eyebrow uppercase text-brand-orange">How we work</p>
              <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
                Four brand promises. Hold us to them.
              </h2>
            </ScrollReveal>
          </div>
          <ul className="mt-12 grid gap-5 md:grid-cols-2">
            <Stagger step={80}>
              {PRINCIPLES.map((p) => (
                <li key={p.title}>
                  <TiltCard className="card h-full">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-paper-tint">
                      <p.icon className="h-5 w-5 text-brand-orange" aria-hidden />
                    </div>
                    <h3 className="mt-5 text-h3 font-bold text-ink">{p.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink/70">{p.body}</p>
                  </TiltCard>
                </li>
              ))}
            </Stagger>
          </ul>
        </Container>
      </section>

      {/* ═══ CAPABILITIES BAND — 9 services as one team ══════════════════ */}
      <section className="border-y border-ink bg-ink py-20 text-paper md:py-28">
        <Container>
          <div className="max-w-3xl">
            <ScrollReveal>
              <p className="text-eyebrow uppercase text-brand-orange">Capabilities</p>
              <h2 className="mt-4 text-display font-extrabold tracking-tight">
                Nine services. <GradientText as="span">One accountable team.</GradientText>
              </h2>
              <p className="mt-6 text-lead text-white/70">
                Each service is led by a senior practitioner inside the studio. They stand alone or
                compose into an integrated campaign — strategy, creative, paid, PR, analytics all
                signing off on the same brief.
              </p>
            </ScrollReveal>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stagger step={60}>
              {SERVICES.filter((s) => s.ready).map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="group block h-full rounded-card border border-white/15 bg-ink-soft p-5 transition hover:border-brand-orange"
                  >
                    <span className="text-meta font-semibold uppercase tracking-wider text-brand-orange">
                      {s.category}
                    </span>
                    <h3 className="mt-3 text-h3 font-bold">{s.shortName}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-white/65">{s.oneLiner}</p>
                    <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                      Explore
                      <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                    </p>
                  </Link>
                </li>
              ))}
            </Stagger>
          </ul>
        </Container>
      </section>

      {/* ═══ PROOF — REAL only. Placeholders marked, not fabricated ══════ */}
      <section className="bg-paper-alt py-20 md:py-28">
        <Container>
          <div className="max-w-3xl">
            <ScrollReveal>
              <p className="text-eyebrow uppercase text-brand-orange">Proof</p>
              <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
                The work, the receipts.
              </h2>
              <p className="mt-6 text-lead text-ink/70">
                We publish client case studies and the monthly business reviews behind them. The
                section below populates from the admin once cases are entered.
              </p>
            </ScrollReveal>
          </div>
          {/* TODO(user): client logos bar — upload to /public/logos/ then list
              here, max 6 across. Real client logos only; no stock. */}
          {/* TODO(user): testimonials with Review schema — entered via /manage
              with reviewerName + clientCompany + rating. Reuse the existing
              Review schema helper in src/lib/schema.ts once data exists. */}
          {/* TODO(user): real case study links — populated by the existing
              case_studies table; render the published rows here once /manage
              has more than the seed. */}
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <Link
              href="/case-studies"
              className="card group flex h-full flex-col"
            >
              <Award className="h-6 w-6 text-brand-orange" aria-hidden />
              <h3 className="mt-4 text-h3 font-bold text-ink">Case studies</h3>
              <p className="mt-2 flex-1 text-sm text-ink/70">
                Industry, metric, window. Published as we get client sign-off.
              </p>
              <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                View results
                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
              </p>
            </Link>
            <Link href="/blog" className="card group flex h-full flex-col">
              <Sparkles className="h-6 w-6 text-brand-orange" aria-hidden />
              <h3 className="mt-4 text-h3 font-bold text-ink">Practitioner guides</h3>
              <p className="mt-2 flex-1 text-sm text-ink/70">
                Long-form notes on the channels, campaigns and tools we actually deliver against in
                Bangladesh.
              </p>
              <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                Read the blog
                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
              </p>
            </Link>
            <Link href="/services" className="card group flex h-full flex-col">
              <Layers className="h-6 w-6 text-brand-orange" aria-hidden />
              <h3 className="mt-4 text-h3 font-bold text-ink">All capabilities</h3>
              <p className="mt-2 flex-1 text-sm text-ink/70">
                Browse the nine integrated services and what each engagement covers in detail.
              </p>
              <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                Browse services
                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
              </p>
            </Link>
          </div>
        </Container>
      </section>

      {/* ═══ PULSE GROUP — parentOrganization reference ══════════════════ */}
      <section className="border-y border-ink bg-paper py-20 md:py-28">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <ScrollReveal>
                <p className="text-eyebrow uppercase text-brand-orange">Pulse Group</p>
                <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
                  Part of <GradientText as="span">a wider family</GradientText> of Bangladesh-focused
                  digital businesses.
                </h2>
                <p className="mt-6 text-lead text-ink/70">
                  Public Pulse Agency is one of five sister concerns inside&nbsp;
                  <a
                    href={PULSE_GROUP.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-sweep font-semibold text-ink"
                  >
                    {PULSE_GROUP.name}
                  </a>
                  . The group focuses entirely on Bangladesh-specific digital businesses.
                </p>
              </ScrollReveal>
            </div>
            <ul className="lg:col-span-7 grid gap-3 sm:grid-cols-2">
              <Stagger step={70}>
                {SISTER_BRANDS.map((b) => (
                  <li key={b.slug}>
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded-card border border-ink/15 bg-paper p-4 transition hover:border-ink"
                      style={{ borderLeft: `4px solid ${b.color}` }}
                    >
                      <p className="text-sm font-bold text-ink group-hover:text-brand-orange">
                        {b.name}
                      </p>
                      <p className="mt-1 text-xs text-ink/65">{b.tagline}</p>
                    </a>
                  </li>
                ))}
              </Stagger>
            </ul>
          </div>
        </Container>
      </section>

      {/* ═══ CREDENTIALS — registered entity + global reach ══════════════ */}
      <section className="bg-paper-alt py-20 md:py-28">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <ScrollReveal>
                <p className="text-eyebrow uppercase text-brand-orange">Credentials</p>
                <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
                  Registered. Local. Reachable.
                </h2>
              </ScrollReveal>
            </div>
            <ul className="lg:col-span-8 grid gap-4 sm:grid-cols-2">
              <Stagger step={70}>
                <CredentialTile
                  icon={Building2}
                  label="Legal entity"
                  value={`BIN ${SITE.contact.legal.bin}`}
                />
                <CredentialTile
                  icon={ScrollText}
                  label="Trade license"
                  value={SITE.contact.legal.tradeLicense}
                />
                <CredentialTile icon={MapPin} label="Office" value="Dhaka, Bangladesh" />
                <CredentialTile icon={Globe2} label="Languages served" value="English + বাংলা" />
                {/* TODO(user): drop a map once the studio address is public. */}
              </Stagger>
            </ul>
          </div>
        </Container>
      </section>

      {/* ═══ FAQ — entity questions, FAQPage schema attached above ══════ */}
      <section className="border-t border-ink bg-paper py-20 md:py-28">
        <Container>
          <div className="max-w-3xl">
            <ScrollReveal>
              <p className="text-eyebrow uppercase text-brand-orange">Frequently asked</p>
              <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
                Questions buyers + journalists usually ask.
              </h2>
            </ScrollReveal>
          </div>
          <div className="mt-12 mx-auto max-w-3xl space-y-3">
            {FAQS.map((f, i) => (
              <details
                key={`${f.q}-${i}`}
                className="group rounded-card border border-ink/15 bg-paper-alt p-5 open:border-ink"
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
        </Container>
      </section>

      {/* ═══ CTA ══════════════════════════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden border-t border-ink bg-ink py-24 text-paper md:py-28">
        <AuroraGradient variant="soft" />
        <Container className="relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-mega font-extrabold leading-[0.95] tracking-tight">
              Curious whether we&rsquo;re&nbsp;
              <GradientText as="span">the right fit</GradientText>?
            </h2>
            <p className="mt-6 text-lead text-white/70">
              We&rsquo;re not for everyone. The fastest way to find out is a 30-minute call.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <MagneticButton href="/contact" className="btn btn-orange">
                Book the call
                <ArrowUpRight className="ml-1 inline h-4 w-4" aria-hidden />
              </MagneticButton>
              <Link href="/services" className="btn btn-ghost-dark">
                Browse all 9 services
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

// ─── Local components ────────────────────────────────────────────────────

function ProofTile({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-card border border-ink/15 bg-paper/80 px-4 py-3 backdrop-blur">
      <p className="text-h3 font-extrabold tracking-tight text-ink">{k}</p>
      <p className="mt-1 text-xs text-ink/65">{v}</p>
    </div>
  );
}

type CredentialProps = { icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>; label: string; value: string };
function CredentialTile({ icon: Icon, label, value }: CredentialProps) {
  return (
    <li>
      <div className="flex items-start gap-4 rounded-card border border-ink/15 bg-paper p-5">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-paper-tint">
          <Icon className="h-4 w-4 text-brand-orange" aria-hidden />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink/55">{label}</p>
          <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
        </div>
      </div>
    </li>
  );
}
