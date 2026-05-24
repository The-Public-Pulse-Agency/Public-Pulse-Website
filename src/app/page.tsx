import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Phone,
  CheckCircle2,
  Compass,
  Workflow,
  LineChart,
  Megaphone,
} from "lucide-react";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SERVICES } from "@/lib/services";
import { PULSE_BRANDS, PULSE_GROUP } from "@/lib/group";
import { SITE } from "@/lib/site";
import { getPublishedCaseStudies } from "@/lib/data/case-studies";

// Note on JSON-LD: Organization + WebSite emit site-wide from app/layout.tsx,
// so the homepage doesn't re-emit them.

// TODO(user): confirm these numbers. Defaults from AUDIT.md claims.
const TRUST_STATS = [
  { number: "50+", label: "Active clients" },
  { number: "300%+", label: "Avg engagement lift" },
  { number: "10+", label: "Industries served" },
  { number: "9", label: "Services in-house" },
];

const PROCESS_STEPS = [
  {
    icon: Compass,
    title: "Discover",
    body: "30-min strategy call, audit of your channels, your competitors and what's actually working in your category right now.",
  },
  {
    icon: Workflow,
    title: "Plan",
    body: "Quarterly plan with named owners, a content calendar, a paid-media budget, and the one KPI we'll be held to.",
  },
  {
    icon: Megaphone,
    title: "Execute",
    body: "Strategy, creative, paid media, PR and analytics in the same room. Weekly stand-up. Single source of truth in one report.",
  },
  {
    icon: LineChart,
    title: "Optimise",
    body: "Monthly reviews against the KPI. Honest call on what to double down on, what to kill. No vanity metrics on the report.",
  },
];

export default async function HomePage() {
  const caseStudies = await getPublishedCaseStudies();

  return (
    <>
      {/* ───────── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(13,148,136,0.08),transparent_60%)]"
        />
        <Container className="relative pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="chip chip-teal mx-auto">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Dhaka-based · serving Bangladesh
            </span>
            <h1 className="mt-6 text-display font-extrabold tracking-tight text-brand-navy">
              The 360° growth partner for Bangladesh&rsquo;s leading brands.
            </h1>
            <p className="mt-6 text-lead text-slate-600">
              Political PR, social, paid media, content, SEO, hospitality marketing and analytics —
              under one accountable team. The same room owns the strategy, the creative and the
              spreadsheet.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/contact" className="btn btn-primary">
                Book a free audit
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href={SITE.contact.whatsapp}
                rel="noopener noreferrer"
                target="_blank"
                className="btn btn-secondary"
              >
                <MessageSquare className="h-4 w-4" aria-hidden />
                Chat on WhatsApp
              </a>
            </div>
            <p className="mt-5 text-meta text-slate-500">
              No deck. No pitch. 30-min audit of your existing funnel and what we&rsquo;d change.
            </p>
          </div>

          <ScrollReveal className="mt-14">
            <AnswerBlock>
              Public Pulse Agency is a Dhaka-based 360° digital marketing and political PR agency.
              We run political PR, social media, content production, paid ads, hospitality marketing,
              brand building, SEO and analytics under one roof, for 50+ Bangladeshi brands. Part of
              {" "}
              {PULSE_GROUP.name}.
            </AnswerBlock>
          </ScrollReveal>

          {/* Trust stats */}
          <ScrollReveal className="mt-14 grid grid-cols-2 gap-6 border-t border-slate-200 pt-10 md:grid-cols-4">
            {TRUST_STATS.map((s) => (
              <div key={s.label} className="text-center md:text-left">
                <div className="text-display-number font-bold text-brand-navy">{s.number}</div>
                <div className="mt-1.5 text-meta uppercase text-slate-500">{s.label}</div>
              </div>
            ))}
          </ScrollReveal>
        </Container>
      </section>

      {/* ───────── SISTER BRANDS — TRUST BAND ───────────────────────────── */}
      <section className="border-b border-slate-200 bg-surface-alt py-10">
        <Container>
          <p className="text-center text-meta uppercase tracking-[0.12em] text-slate-500">
            Part of {PULSE_GROUP.name} — sister brands across Bangladesh
          </p>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {PULSE_BRANDS.map((b) => (
              <li key={b.slug} className="flex items-baseline gap-1.5 opacity-80 transition hover:opacity-100">
                <span className="text-sm font-extrabold tracking-tight text-brand-navy">
                  {b.logoText.primary}
                </span>
                <span className="text-sm font-semibold tracking-tight text-slate-500">
                  {b.logoText.secondary.replace(".bd", "")}
                </span>
                {b.self && (
                  <span className="ml-1 text-[10px] font-semibold uppercase tracking-wider text-brand-teal">
                    you are here
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ───────── SERVICES ─────────────────────────────────────────────── */}
      <section className="bg-white py-20 md:py-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-eyebrow uppercase text-brand-teal">Platform</p>
            <h2 className="mt-3 text-h2 font-bold tracking-tight text-brand-navy">
              Nine services. One accountable team.
            </h2>
            <p className="mt-4 text-lead text-slate-600">
              We don&rsquo;t hand off between three agencies. Strategy, creative, paid media and
              analytics sit in the same room — and the same weekly report.
            </p>
          </div>

          <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <li key={s.slug}>
                <ScrollReveal delayMs={Math.min(i, 5) * 50}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="card group flex h-full flex-col"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className="inline-flex h-10 w-10 items-center justify-center rounded-card text-xl"
                        style={{
                          backgroundColor: `${getCategoryHex(s.categoryColor)}15`,
                          color: getCategoryHex(s.categoryColor),
                        }}
                        aria-hidden="true"
                      >
                        {s.emoji}
                      </span>
                      <span className="chip">{s.category}</span>
                    </div>
                    <h3 className="mt-5 text-h3 font-semibold text-brand-navy">{s.name}</h3>
                    <p className="mt-2 flex-1 text-sm text-slate-600">{s.oneLiner}</p>
                    <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal">
                      Explore
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                    </p>
                  </Link>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ───────── PROCESS ──────────────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-surface-alt py-20 md:py-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-eyebrow uppercase text-brand-teal">How we work</p>
            <h2 className="mt-3 text-h2 font-bold tracking-tight text-brand-navy">
              A repeatable four-step engagement.
            </h2>
            <p className="mt-4 text-lead text-slate-600">
              The same framework whether it&rsquo;s a 30-day political PR push or a 12-month brand build.
            </p>
          </div>

          <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.title}>
                  <ScrollReveal delayMs={i * 70}>
                    <div className="card h-full">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-card bg-brand-teal/10 text-brand-teal">
                          <Icon className="h-4.5 w-4.5" aria-hidden />
                        </span>
                        <span className="text-meta font-semibold uppercase text-slate-500">
                          Step {i + 1}
                        </span>
                      </div>
                      <h3 className="mt-4 text-h3 font-semibold text-brand-navy">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
                    </div>
                  </ScrollReveal>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      {/* ───────── RESULTS / CASE STUDIES (cached, tag-invalidated) ─────── */}
      {caseStudies.length > 0 && (
        <section className="bg-white py-20 md:py-28">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-eyebrow uppercase text-brand-teal">Selected results</p>
              <h2 className="mt-3 text-h2 font-bold tracking-tight text-brand-navy">
                What changes when one team owns the full stack.
              </h2>
              <p className="mt-4 text-lead text-slate-600">
                Recent examples from active engagements. Names withheld where the engagement is
                NDA-protected.
              </p>
            </div>

            <ul className="mt-14 grid gap-6 md:grid-cols-3">
              {caseStudies.slice(0, 6).map((c, i) => (
                <li key={c.id}>
                  <ScrollReveal delayMs={i * 70}>
                    <article className="card flex h-full flex-col">
                      <p className="text-meta uppercase tracking-wider text-slate-500">
                        {c.industry}
                      </p>
                      <p className="mt-4 text-display-number font-bold leading-none text-brand-navy">
                        {c.metric}
                      </p>
                      <p className="mt-1.5 text-meta uppercase text-slate-500">
                        Over {c.windowLabel}
                      </p>
                      <p className="mt-4 text-sm leading-relaxed text-slate-600">{c.summary}</p>
                    </article>
                  </ScrollReveal>
                </li>
              ))}
            </ul>

            <p className="mt-10 text-center text-xs text-slate-500">
              Numbers are from active client engagements; specific accounts named with permission.
            </p>
          </Container>
        </section>
      )}

      {/* ───────── TESTIMONIAL (single, placeholder) ────────────────────── */}
      {/* TODO(user): replace with a real client testimonial once approved. */}
      <section className="bg-surface-alt py-20 md:py-28">
        <Container>
          <ScrollReveal>
            <figure className="mx-auto max-w-3xl text-center">
              <Sparkles className="mx-auto h-6 w-6 text-brand-teal" aria-hidden />
              <blockquote className="mt-5 text-h2 font-medium leading-snug tracking-tight text-brand-navy">
                &ldquo;We replaced three agencies with Public Pulse. Reporting got simpler, decisions
                got faster, and the work — finally — looks like it&rsquo;s coming from one brand.&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-meta uppercase tracking-wider text-slate-500">
                Marketing director · hospitality brand · Cox&rsquo;s Bazar
              </figcaption>
            </figure>
          </ScrollReveal>
        </Container>
      </section>

      {/* ───────── PROMISE BAND ─────────────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-white py-20 md:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="text-eyebrow uppercase text-brand-teal">Our promise</p>
              <h2 className="mt-3 text-h2 font-bold tracking-tight text-brand-navy">
                What you get on day one.
              </h2>
              <p className="mt-4 text-lead text-slate-600">
                Engagements start with a written scope, named owners, and a single KPI we&rsquo;re
                accountable to. No surprises on month three.
              </p>
              <Link
                href="/contact"
                className="btn btn-primary mt-8"
              >
                Get a custom proposal
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <ul className="lg:col-span-7 grid gap-4 sm:grid-cols-2">
              {[
                "Written scope with named owners and milestones",
                "Single KPI per engagement — agreed before kickoff",
                "Weekly stand-up + monthly business review",
                "All creative + ad accounts owned by you",
                "Bangla & English copy, both calibrated",
                "Crisis response on call 24/7 for PR retainers",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-card border border-slate-200 bg-white p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-teal" aria-hidden />
                  <span className="text-sm text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* ───────── CLOSING CTA (dark) ───────────────────────────────────── */}
      <section className="bg-brand-navy py-20 text-white md:py-28">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="text-h1 font-bold tracking-tight">
                Talk to a team that picks up the phone.
              </h2>
              <p className="mt-5 max-w-xl text-lead text-white/75">
                Free 30-minute consultation. We&rsquo;ll review your channels, your goals, and
                whether we&rsquo;re the right fit. No deck, no pitch.
              </p>
            </div>
            <div className="lg:col-span-5 flex flex-wrap items-center gap-3 lg:justify-end">
              <Link href="/contact" className="btn btn-primary">
                Book the call
                <ArrowRight className="h-4 w-4" aria-hidden />
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

// Tailwind can't compile dynamic `text-${color}` classes, so we resolve hex
// on the server. Single source of truth: src/lib/services.ts.
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
