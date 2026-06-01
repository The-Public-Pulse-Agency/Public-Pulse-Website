import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Calendar, ShieldCheck, Clock, Users, Megaphone, AlertTriangle } from "lucide-react";

import { buildMetadata } from "@/lib/seo";
import {
  breadcrumbSchema,
  faqPageSchema,
  webPageSchema,
} from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { SITE } from "@/lib/site";
import { politicalPr } from "@/content/services/political-pr";
import { bookingUrl } from "@/lib/booking";

export const metadata: Metadata = buildMetadata({
  // Title: 56 chars — under Google's 60-char SERP cutoff. Echoes the H1
  // "Win the perception first. The booth comes after." for brand recall.
  // Geo keyword "Bangladesh" leads for local-pack ranking.
  title: "Bangladesh Election PR: Win the Perception, Win the Seat",
  description:
    "Win Bangladeshi elections with our 90-day PR playbook: constituency survey, narrative design, ground + digital coordination, 24h crisis SLA from Dhaka.",
  path: "/election",
  useDynamicOg: true,
  // Social-share OG card: outcome-led, time-bounded ("in 90 days"),
  // sized to fit the 1200×630 /og factory without truncation.
  ogTitle: "Win the Seat in 90 Days — Bangladesh Election PR",
  ogEyebrow: "FOR CANDIDATES · 24-HOUR CRISIS SLA",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Election readiness", path: "/election" },
];

// Election-cycle FAQs — different from the political-pr service FAQ.
// Tuned for "what should we do before the election" / "how late is too late"
// questions a candidate's team would actually ask.
const FAQS = [
  {
    q: "When should a campaign engage you before an election?",
    a: "Ideally 6–9 months out. We can run condensed 90-day playbooks closer to polling, but the earlier we start, the cheaper and more effective the narrative work is — and the lower the crisis-response risk.",
  },
  {
    q: "What does a 90-day election playbook actually include?",
    a: "Constituency opinion survey → rival/opposition mapping → narrative design → creative production (photo, video, copy) → digital + ground-team activation → daily sentiment tracking → 24-hour crisis response → polling-day comms → post-election PR.",
  },
  {
    q: "Will you work with our opposition too?",
    a: "No. We never work with directly competing candidates in the same constituency during the same cycle. All engagements are NDA-protected by default.",
  },
  {
    q: "Is this digital-only?",
    a: "No — it's integrated. Narrative, digital reach, ground-team coordination, and crisis response run as one campaign under a single accountable team.",
  },
  {
    q: "What about crisis communication on election night?",
    a: "24-hour crisis SLA is built into every election engagement. When the news cycle turns at 11pm, a strategist and a creative are on it by midnight.",
  },
  {
    q: "Where are you based and do you serve outside Dhaka?",
    a: "Dhaka-based, with field coordinators across constituencies nationwide. We've run campaigns in Dhaka, Chattogram, Sylhet, and elsewhere across Bangladesh.",
  },
];

// 90-day phase plan, derived from political-pr.process but mapped to
// week markers so a campaign manager can read it as a calendar.
const PHASES = [
  {
    icon: Users,
    weeks: "Day 0–14",
    title: "Discovery + survey",
    body: "Free consultation. Constituency opinion survey, rival analysis, baseline sentiment, identify the local-hero narrative thread.",
  },
  {
    icon: Megaphone,
    weeks: "Week 3–6",
    title: "Strategy + production",
    body: "Narrative design, audience segmentation, creative production in-house — candidate photo, video, biography, public service documentation, copy.",
  },
  {
    icon: Calendar,
    weeks: "Week 7–10",
    title: "Mobilization",
    body: "Ground-team and digital activated together. Daily sentiment tracking, A/B narrative tests, weekly KPI reports, budget reallocation across booths.",
  },
  {
    icon: AlertTriangle,
    weeks: "Week 11–12",
    title: "Peak + polling day",
    body: "24-hour crisis SLA fully active. Rapid-response copy + creative. Polling-day comms, get-out-the-vote messaging, real-time sentiment monitoring.",
  },
  {
    icon: ShieldCheck,
    weeks: "Day +1 onward",
    title: "Post-election PR",
    body: "Result reframing, gracious-loss / decisive-win narrative, thank-you outreach, transition-to-governance messaging.",
  },
];

export default function ElectionPage() {
  const booking = bookingUrl();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          webPageSchema({
            path: "/election",
            name: "Win the Seat in 90 Days — Bangladesh Election PR",
            description:
              "90-day election PR playbook for Bangladeshi candidates and parties.",
            about: ["political-pr"],
            keywords: [
              "Bangladesh election PR",
              "political campaign agency Bangladesh",
              "candidate image building Dhaka",
              "90-day election playbook",
              "win the seat",
            ],
          }),
          faqPageSchema(FAQS),
        ]}
      />

      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="absolute inset-0 -z-10 opacity-30" aria-hidden>
          <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-brand-orange/25 blur-3xl" />
          <div className="absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-brand-orange/15 blur-3xl" />
        </div>
        <Container>
          <div className="py-12 md:py-20">
            <Breadcrumbs crumbs={crumbs} />
            <div className="mt-6 grid items-end gap-10 md:grid-cols-12">
              <div className="md:col-span-8">
                <p className="text-eyebrow uppercase text-brand-orange">
                  Election readiness · Bangladesh
                </p>
                <h1 className="mt-4 text-display font-extrabold tracking-tight">
                  Win the perception <em className="not-italic text-brand-orange">first</em>.
                  The booth comes after.
                </h1>
                <p className="mt-6 max-w-2xl text-lead text-white/80">
                  90-day election playbook for candidates and parties in Bangladesh —
                  constituency survey, narrative design, ground + digital coordination,
                  and a 24-hour crisis SLA. NDA-protected, senior in the room, billed in BDT.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href={booking ? "/book" : "/contact"}
                    className="btn btn-orange"
                  >
                    {booking ? "Book a 30-min strategy call" : "Start a campaign brief"}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <a
                    href={SITE.contact.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost-dark"
                  >
                    WhatsApp the strategist
                  </a>
                </div>
              </div>
              <div className="md:col-span-4">
                <div className="rounded-card border border-white/15 bg-white/5 p-5 backdrop-blur">
                  <div className="flex items-center gap-2 text-white/70">
                    <Clock className="h-4 w-4" aria-hidden />
                    <span className="text-eyebrow uppercase">Crisis SLA</span>
                  </div>
                  <p className="mt-3 text-h3 font-bold text-paper">
                    24 hours — strategist + creative on it by midnight.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-paper py-12 md:py-20">
        <Container>
          <AnswerBlock>{politicalPr.answer}</AnswerBlock>
        </Container>
      </section>

      <section className="bg-surface-alt py-16 md:py-24">
        <Container>
          <div className="max-w-3xl">
            <p className="text-eyebrow uppercase text-brand-orange">90-day playbook</p>
            <h2 className="mt-4 text-h1 font-extrabold tracking-tight text-ink">
              Five phases. One accountable team.
            </h2>
            <p className="mt-5 text-lead text-ink/70">
              Calendar-mapped so your campaign manager can see exactly what happens when.
              We compress this to 60 or 45 days when the timeline demands it — the order
              stays the same, the depth changes.
            </p>
          </div>
          <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PHASES.map((p, i) => (
              <li
                key={p.title}
                className="rounded-card border border-ink/10 bg-paper p-6 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-orange/10 text-brand-orange">
                    <p.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="text-meta font-mono uppercase tracking-wider text-ink/45">
                    {String(i + 1).padStart(2, "0")} · {p.weeks}
                  </span>
                </div>
                <h3 className="mt-5 text-h3 font-bold text-ink">{p.title}</h3>
                <p className="mt-2 text-body text-ink/65">{p.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-paper py-16 md:py-24">
        <Container>
          <div className="max-w-3xl">
            <p className="text-eyebrow uppercase text-brand-orange">Constituency-ready</p>
            <h2 className="mt-4 text-h1 font-extrabold tracking-tight text-ink">
              What we deliver — at constituency scale.
            </h2>
          </div>
          <ul className="mt-10 grid gap-x-10 gap-y-4 md:grid-cols-2">
            {politicalPr.included
              .filter((item) => !item.includes("TODO"))
              .map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 border-b border-ink/10 pb-4 text-body text-ink"
                >
                  <span aria-hidden className="mt-2 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-orange" />
                  <span>{item}</span>
                </li>
              ))}
          </ul>
        </Container>
      </section>

      <section className="bg-surface-alt py-16 md:py-24">
        <Container>
          <div className="max-w-3xl">
            <p className="text-eyebrow uppercase text-brand-orange">FAQ</p>
            <h2 className="mt-4 text-h1 font-extrabold tracking-tight text-ink">
              Election cycle questions.
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

      <section className="bg-ink py-16 text-paper md:py-24">
        <Container>
          <div className="max-w-3xl">
            <h2 className="text-h1 font-extrabold tracking-tight">
              Election cycle running? Let&rsquo;s talk this week.
            </h2>
            <p className="mt-5 text-lead text-white/75">
              Free 30-minute discovery call. We&rsquo;ll review the seat, the opposition,
              and the timeline — and tell you honestly whether we can help and when to start.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={booking ? "/book" : "/contact"} className="btn btn-orange">
                {booking ? "Book the call" : "Send a brief"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/services/political-pr" className="btn btn-ghost-dark">
                Read the service detail
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
