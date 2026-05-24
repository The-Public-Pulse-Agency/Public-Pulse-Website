import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Star,
  Sparkles,
  Phone,
  MessageSquare,
} from "lucide-react";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Marquee } from "@/components/ui/Marquee";
import { SERVICES } from "@/lib/services";
import { SITE } from "@/lib/site";
import { getPublishedCaseStudies } from "@/lib/data/case-studies";

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
  const caseStudies = await getPublishedCaseStudies();
  return (
    <>
      {/* ═══════ HERO — paper / huge type / orange accent ════════════════ */}
      <section className="relative overflow-hidden bg-paper">
        <Container className="relative pt-16 pb-12 md:pt-24 md:pb-20">
          <div className="mx-auto max-w-5xl">
            <span className="chip chip-orange">
              <Sparkles className="h-3 w-3" aria-hidden />
              Dhaka · since 2024
            </span>
            <h1 className="mt-7 text-mega font-extrabold tracking-tight text-ink">
              We build brands that <span className="text-brand-orange">refuse</span> to be ignored.
            </h1>
            <p className="mt-7 max-w-2xl text-lead text-ink/70">
              A 360° creative + PR studio out of Dhaka. Political campaigns, hospitality launches,
              consumer brand builds — under one accountable team.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/contact" className="btn btn-primary">
                Start a project
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href={SITE.contact.whatsapp}
                rel="noopener noreferrer"
                target="_blank"
                className="btn btn-secondary"
              >
                <MessageSquare className="h-4 w-4" aria-hidden />
                WhatsApp
              </a>
              <div className="ml-2 hidden items-center gap-2 sm:flex">
                <div className="flex">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" aria-hidden />
                  ))}
                </div>
                <span className="text-meta uppercase text-ink/55">50+ brands shipped</span>
              </div>
            </div>
          </div>
        </Container>

        {/* AnswerBlock for AEO — full width, below the fold area */}
        <Container className="relative pb-20">
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

      {/* ═══════ SERVICES — dark section with cards ═══════════════════════ */}
      <section className="bg-ink py-24 text-paper md:py-32">
        <Container>
          <div className="grid items-end gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="text-eyebrow uppercase text-brand-orange">What we do</p>
              <h2 className="mt-4 text-display font-extrabold tracking-tight">
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
            {SERVICES.map((s, i) => (
              <li key={s.slug}>
                <ScrollReveal delayMs={Math.min(i, 5) * 50}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="group block h-full rounded-card border border-white/15 bg-ink-soft p-7 transition hover:border-brand-orange"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-meta font-semibold uppercase text-white/45">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-3xl" aria-hidden>
                        {s.emoji}
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
            ))}
          </ul>
        </Container>
      </section>

      {/* ═══════ STATS — paper, huge numbers ══════════════════════════════ */}
      <section className="border-y border-ink bg-paper py-20 md:py-28">
        <Container>
          <ul className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
            {STATS.map((s, i) => (
              <li key={s.label}>
                <ScrollReveal delayMs={i * 60}>
                  <div className="text-mega font-extrabold leading-none tracking-tight text-ink">
                    {s.number}
                  </div>
                  <div className="mt-4 max-w-[10rem] text-meta uppercase text-ink/60">
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
              <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
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

      {/* ═══════ RESULTS / CASE STUDIES ═══════════════════════════════════ */}
      {caseStudies.length > 0 && (
        <section className="border-t border-ink bg-paper-alt py-24 md:py-32">
          <Container>
            <div className="grid items-end gap-10 md:grid-cols-12">
              <div className="md:col-span-7">
                <p className="text-eyebrow uppercase text-brand-orange">Selected results</p>
                <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
                  Receipts.
                  <br />
                  <span className="text-ink/40">Not vibes.</span>
                </h2>
              </div>
              <p className="md:col-span-5 text-lead text-ink/70">
                Live engagements. Names withheld where NDAs apply — happy to walk specifics on a
                call.
              </p>
            </div>

            <ul className="mt-14 grid gap-5 md:grid-cols-3">
              {caseStudies.slice(0, 6).map((c, i) => (
                <li key={c.id}>
                  <ScrollReveal delayMs={i * 70}>
                    <article className="card flex h-full flex-col">
                      <p className="text-meta uppercase tracking-wider text-ink/55">{c.industry}</p>
                      <p className="mt-4 text-mega font-extrabold leading-none tracking-tight text-ink">
                        {c.metric}
                      </p>
                      <p className="mt-2 text-meta uppercase text-ink/55">Over {c.windowLabel}</p>
                      <p className="mt-4 text-sm leading-relaxed text-ink/70">{c.summary}</p>
                    </article>
                  </ScrollReveal>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* ═══════ TESTIMONIAL — single, huge ═══════════════════════════════ */}
      <section className="bg-paper py-24 md:py-32">
        <Container>
          <ScrollReveal>
            <figure className="mx-auto max-w-4xl text-center">
              <Sparkles className="mx-auto h-7 w-7 text-brand-orange" aria-hidden />
              <blockquote className="mt-6 text-display font-extrabold leading-[1.05] tracking-tight text-ink">
                &ldquo;We replaced three agencies with Public Pulse. Reporting got simpler,
                decisions got faster, and the work — finally — looks like it&rsquo;s coming from
                <span className="text-brand-orange"> one brand.</span>&rdquo;
              </blockquote>
              <figcaption className="mt-8 text-meta uppercase tracking-wider text-ink/55">
                Marketing director · hospitality brand · Cox&rsquo;s Bazar
              </figcaption>
            </figure>
          </ScrollReveal>
        </Container>
      </section>

      {/* ═══════ FINAL CTA — dark, mega ═══════════════════════════════════ */}
      <section className="border-t border-ink bg-ink py-24 text-paper md:py-32">
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2 className="text-mega font-extrabold leading-[0.95] tracking-tight">
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
