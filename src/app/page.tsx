import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Phone,
  Quote,
} from "lucide-react";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Marquee } from "@/components/ui/Marquee";
import { CountUp } from "@/components/ui/CountUp";
import { HeroPanel } from "@/components/home/HeroPanel";
import { SERVICES } from "@/lib/services";
import { getServiceIcon } from "@/lib/icons";
import { SITE } from "@/lib/site";
import { getFeaturedCaseStudies } from "@/lib/data/case-studies";
import { InlineBlock } from "@/components/lead-capture";

// JSON-LD Organization + WebSite emit site-wide from app/layout.tsx.

// TODO(user): confirm these numbers — defaults from AUDIT.md.
const STATS = [
  { number: "50+", label: "Active clients" },
  { number: "300%+", label: "Avg engagement lift" },
  { number: "10+", label: "Industries served" },
  { number: "9", label: "Services in-house" },
];

const PROCESS = [
  { n: "01", title: "Listen", body: "30-min strategy call. Channels audit. What's working, what isn't, and what you've already tried." },
  { n: "02", title: "Plan", body: "Quarterly plan with named owners, the calendar, the budget, and ONE KPI we'll be held to." },
  { n: "03", title: "Make", body: "Strategy, creative, paid, PR, analytics — one room, one brief, one weekly stand-up." },
  { n: "04", title: "Sharpen", body: "Monthly review. Honest call on what to double down on. What to kill. No vanity dashboards." },
];

export default async function HomePage() {
  // Featured case studies for the homepage Selected results — curated set
  // (max 4). Falls back to most-recent published when none are featured;
  // returns [] if DB unreachable (homepage hides the section gracefully).
  const caseStudies = await getFeaturedCaseStudies("en", 4);
  return (
    <>
      {/* ═══════ AVOORA-STYLE HERO (wordmark + gradient + tiles) ════════ */}
      <HeroPanel />

      {/* ═══════ ANSWER BLOCK (AEO) ═════════════════════════════════════ */}
      <section className="bg-paper">
        <Container className="pb-14">
          <div className="mx-auto max-w-3xl">
            <AnswerBlock>
              Public Pulse Agency is a Dhaka-based 360° digital marketing and political PR studio.
              We run political PR, social media, content production, paid ads, hospitality
              marketing, brand building, SEO and analytics — under one accountable team, for 50+
              Bangladeshi brands.
            </AnswerBlock>
          </div>
        </Container>
      </section>

      {/* ═══════ MARQUEE — service categories on loop ═════════════════════ */}
      <section className="border-y border-ink bg-paper py-7">
        <Marquee>
          {[...SERVICES.map((s) => s.shortName), "Bangladesh", "Dhaka", "Cox's Bazar", "Election ready", "Brand systems"].map(
            (label, i) => (
              <div key={`${label}-${i}`} className="flex items-center gap-12">
                <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink whitespace-nowrap">
                  {label}
                </span>
                <span className="text-3xl text-brand-orange" aria-hidden>
                  ✦
                </span>
              </div>
            )
          )}
        </Marquee>
      </section>

      {/* ═══════ SERVICES (full list) ═════════════════════════════════════ */}
      <section className="bg-ink py-24 text-paper md:py-32">
        <Container>
          <div className="grid items-end gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="text-eyebrow uppercase text-brand-orange">What we do</p>
              <h2 className="mt-4 text-display tracking-tight">
                Nine sharp services.
                <br />
                <span className="text-white/60">One accountable team.</span>
              </h2>
            </div>
            <p className="md:col-span-5 text-lead text-white/70">
              We don&rsquo;t hand off between three agencies. Strategy, creative, paid media and
              analytics sit in the same room — and the same weekly report.
            </p>
          </div>

          <ul className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => {
              const Icon = getServiceIcon(s.slug);
              return (
              <li key={s.slug}>
                <ScrollReveal delayMs={Math.min(i, 5) * 50}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="group block h-full rounded-card border border-white/15 bg-ink-soft p-7 transition duration-300 hover:-translate-y-1 hover:border-brand-orange hover:bg-ink"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-meta font-semibold uppercase text-white/45">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="grid h-11 w-11 place-items-center rounded-card bg-brand-orange/15 text-brand-orange transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" aria-hidden>
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <h3 className="mt-6 text-h3 font-bold leading-tight">{s.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/70">{s.oneLiner}</p>
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
              );
            })}
          </ul>
        </Container>
      </section>

      {/* ═══════ STATS — paper, big-but-fits numbers ══════════════════════ */}
      <section className="border-y border-ink bg-paper py-20 md:py-28">
        <Container>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-x-8">
            {STATS.map((s, i) => (
              <li
                key={s.label}
                className="group border-l-2 border-ink pl-4 transition-colors duration-300 hover:border-brand-orange md:pl-6"
              >
                <ScrollReveal delayMs={i * 60}>
                  <CountUp
                    value={s.number}
                    className="block text-[clamp(2.25rem,4vw+0.5rem,4rem)] font-extrabold leading-none tracking-tight text-ink transition-colors duration-300 group-hover:text-brand-orange"
                  />
                  <div className="mt-4 max-w-[12rem] text-meta uppercase text-ink/60">
                    {s.label}
                  </div>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ═══════ PROCESS — paper, numbered, big steps ═════════════════════ */}
      <section className="bg-paper py-24 md:py-32">
        <Container>
          <div className="grid items-end gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="text-eyebrow uppercase text-brand-orange">How we run</p>
              <h2 className="mt-4 text-display tracking-tight text-ink">
                Four steps.
                <br />
                <span className="text-ink/40">No fog.</span>
              </h2>
            </div>
            <p className="md:col-span-5 text-lead text-ink/70">
              Same framework for a 30-day political PR push or a 12-month brand build.
            </p>
          </div>

          <ol className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((step, i) => (
              <li key={step.title}>
                <ScrollReveal delayMs={i * 70}>
                  <div className="card h-full">
                    <div className="text-meta font-semibold uppercase text-brand-orange">{step.n}</div>
                    <h3 className="mt-3 text-h3 font-bold text-ink">{step.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink/70">{step.body}</p>
                  </div>
                </ScrollReveal>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ═══════ RESULTS / CASE STUDIES (colorful gradient cards) ═════════ */}
      {caseStudies.length > 0 && (
        <section className="relative overflow-hidden border-t border-ink bg-ink py-24 text-paper md:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background: `radial-gradient(45% 50% at 15% 25%, #FF5C00 0%, transparent 60%), radial-gradient(50% 60% at 85% 75%, #2563EB 0%, transparent 60%), radial-gradient(40% 50% at 50% 60%, #0F766E 0%, transparent 55%)`,
            }}
          />
          <Container className="relative">
            <div className="grid items-end gap-10 md:grid-cols-12">
              <div className="md:col-span-7">
                <p className="text-eyebrow uppercase text-brand-orange">Selected results</p>
                <h2 className="mt-4 text-display tracking-tight">
                  Receipts.
                  <br />
                  <span className="text-white/45">Not vibes.</span>
                </h2>
              </div>
              <p className="md:col-span-5 text-lead text-white/75">
                Live engagements. Names withheld where NDAs apply — happy to walk specifics on a
                call.
              </p>
            </div>

            <ul className="mt-14 grid gap-5 md:grid-cols-3">
              {caseStudies.slice(0, 6).map((c, i) => (
                <li key={c.id}>
                  <ScrollReveal delayMs={i * 70}>
                    <article
                      className="group relative flex h-full flex-col overflow-hidden rounded-panel p-7 transition hover:-translate-y-1"
                      style={{ background: caseStudyGradient(i) }}
                    >
                      <div className="flex items-center justify-between">
                        <p className="chip chip-light">{c.industry}</p>
                        <span className="text-meta font-semibold uppercase text-paper/75">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="mt-7 text-[clamp(2.5rem,3.5vw+1rem,4.5rem)] font-extrabold leading-none tracking-tight text-paper">
                        {c.metric}
                      </p>
                      <p className="mt-2 text-meta uppercase tracking-wider text-paper/70">
                        Over {c.windowLabel}
                      </p>
                      <p className="mt-6 flex-1 text-sm leading-relaxed text-paper/85">
                        {c.summary}
                      </p>
                      {c.serviceSlug && (
                        <Link
                          href={`/services/${c.serviceSlug}`}
                          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-paper"
                        >
                          See service
                          <ArrowRight
                            className="h-3.5 w-3.5 transition group-hover:translate-x-1"
                            aria-hidden
                          />
                        </Link>
                      )}
                    </article>
                  </ScrollReveal>
                </li>
              ))}
            </ul>

            <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
              <p className="text-meta text-white/55">
                Numbers from active client engagements; specific accounts named with permission.
              </p>
              <Link
                href="/case-studies"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange"
              >
                Browse all case studies
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </Container>
        </section>
      )}

      {/* ═══════ TESTIMONIAL — quote-card with author block + stats ═══════ */}
      <section className="border-t border-ink bg-paper-alt py-24 md:py-32">
        <Container>
          <ScrollReveal>
            <figure className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-12 lg:gap-10">
              {/* Author / brand panel */}
              <div className="lg:col-span-4">
                <div
                  className="flex h-full flex-col justify-between gap-8 rounded-panel p-7 text-paper"
                  style={{
                    background: `radial-gradient(60% 70% at 70% 30%, #FF5C00 0%, transparent 60%), radial-gradient(80% 80% at 20% 80%, #0F766E 0%, transparent 60%), linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%)`,
                  }}
                >
                  <Quote className="h-8 w-8 text-brand-orange" aria-hidden />
                  <div>
                    <div className="flex items-center gap-3">
                      <div
                        className="grid h-12 w-12 place-items-center rounded-full bg-brand-orange text-paper text-lg font-extrabold"
                        aria-hidden
                      >
                        H
                      </div>
                      <div className="leading-tight">
                        <div className="text-sm font-bold">Hospitality brand</div>
                        <div className="text-[11px] uppercase tracking-wider text-paper/60">
                          Cox&rsquo;s Bazar
                        </div>
                      </div>
                    </div>
                    <p className="mt-5 text-meta uppercase tracking-wider text-paper/55">
                      Marketing director
                    </p>
                    <p className="mt-1 text-sm text-paper/80">
                      Replaced three agencies with Public Pulse in Q3 2025.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div className="lg:col-span-8">
                <div className="flex h-full flex-col justify-between gap-8 rounded-panel border border-ink/10 bg-paper p-8 md:p-10">
                  <blockquote className="text-h2 font-bold leading-snug tracking-tight text-ink">
                    &ldquo;We replaced three agencies with Public Pulse. Reporting got simpler,
                    decisions got faster, and the work — finally — looks like it&rsquo;s coming
                    from <span className="text-brand-orange">one brand</span>.&rdquo;
                  </blockquote>
                  <ul className="grid grid-cols-3 gap-4 border-t border-ink/10 pt-6 text-left">
                    <li>
                      <div className="text-[clamp(1.5rem,2vw+0.5rem,2.5rem)] font-extrabold leading-none text-ink">
                        3 → 1
                      </div>
                      <div className="mt-2 text-meta uppercase text-ink/55">
                        Vendor consolidation
                      </div>
                    </li>
                    <li>
                      <div className="text-[clamp(1.5rem,2vw+0.5rem,2.5rem)] font-extrabold leading-none text-ink">
                        2×
                      </div>
                      <div className="mt-2 text-meta uppercase text-ink/55">Decision speed</div>
                    </li>
                    <li>
                      <div className="text-[clamp(1.5rem,2vw+0.5rem,2.5rem)] font-extrabold leading-none text-ink">
                        1
                      </div>
                      <div className="mt-2 text-meta uppercase text-ink/55">
                        Weekly report, one team
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </figure>
          </ScrollReveal>
        </Container>
      </section>

      {/* ═══════ NEWSLETTER — homepage value block ════════════════════════ */}
      <section className="border-t border-ink bg-paper py-20 md:py-28">
        <Container>
          <InlineBlock context="homepage" />
        </Container>
      </section>

      {/* ═══════ FINAL CTA — dark, mega ═══════════════════════════════════ */}
      <section className="border-t border-ink bg-ink py-24 text-paper md:py-32">
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2 className="text-mega leading-[0.95] tracking-tight">
              Got a campaign that <span className="text-brand-orange">needs to land</span>?
            </h2>
            <p className="mt-7 max-w-2xl text-lead text-white/70">
              Free 30-minute consultation. We&rsquo;ll review your channels, your goals, and
              whether we&rsquo;re the right fit. No deck, no pitch.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/contact" className="btn btn-orange">
                Book the call
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
              <a href={`tel:${SITE.contact.phone}`} className="btn btn-ghost-dark">
                <Phone className="h-4 w-4" aria-hidden />
                {SITE.contact.phoneDisplay}
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

// Case-study cards rotate through this avoora-style gradient palette so the
// section never feels flat. Each gradient is layered radial + linear so the
// surface has depth, not a single hue.
function caseStudyGradient(i: number): string {
  const palettes = [
    // orange-led
    `radial-gradient(70% 80% at 80% 20%, #FFB07A 0%, transparent 60%), radial-gradient(60% 70% at 20% 80%, #B23A00 0%, transparent 60%), linear-gradient(135deg, #FF7A2E 0%, #E04E00 100%)`,
    // teal-led
    `radial-gradient(70% 80% at 20% 20%, #5EEAD4 0%, transparent 60%), radial-gradient(60% 70% at 80% 80%, #064E3B 0%, transparent 60%), linear-gradient(135deg, #14B8A6 0%, #0F766E 100%)`,
    // blue-led
    `radial-gradient(70% 80% at 80% 80%, #93C5FD 0%, transparent 60%), radial-gradient(60% 70% at 20% 20%, #1E1B4B 0%, transparent 60%), linear-gradient(135deg, #2563EB 0%, #1E3A8A 100%)`,
    // magenta-led
    `radial-gradient(70% 80% at 50% 30%, #FBCFE8 0%, transparent 60%), radial-gradient(60% 70% at 50% 90%, #831843 0%, transparent 60%), linear-gradient(135deg, #DB2777 0%, #9F1239 100%)`,
    // amber-led
    `radial-gradient(70% 80% at 30% 70%, #FCD34D 0%, transparent 60%), radial-gradient(60% 70% at 70% 30%, #92400E 0%, transparent 60%), linear-gradient(135deg, #F59E0B 0%, #B45309 100%)`,
    // violet-led
    `radial-gradient(70% 80% at 70% 30%, #C4B5FD 0%, transparent 60%), radial-gradient(60% 70% at 30% 70%, #3B0764 0%, transparent 60%), linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)`,
  ];
  return palettes[i % palettes.length];
}
