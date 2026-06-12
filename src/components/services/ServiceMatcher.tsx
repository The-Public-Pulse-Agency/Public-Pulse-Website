"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { SERVICES } from "@/lib/services";
import { track } from "@/lib/analytics";

// 3-question service-matcher quiz. Maps the visitor's answers to a weighted
// score per service slug, then surfaces the top 3 with a "Book a call about
// X" CTA prefilled to /book?service=<slug>.

type Choice = {
  label: string;
  /** Service-slug → weight (positive boost, negative dampen). */
  weights: Record<string, number>;
};
type Question = {
  id: string;
  prompt: string;
  multi?: boolean;
  choices: Choice[];
};

const QUESTIONS: Question[] = [
  {
    id: "goal",
    prompt: "What's the headline goal for the next 90 days?",
    choices: [
      { label: "More qualified leads / sales", weights: { "paid-ads": 3, "seo-website": 2, "analytics-reporting": 1 } },
      { label: "Brand awareness + recall", weights: { "brand-building": 3, "content-production": 2, "influencer-marketing": 2, "social-media": 1 } },
      { label: "Direct hotel / venue bookings", weights: { "hospitality": 3, "paid-ads": 1, "seo-website": 1 } },
      { label: "Win an election / political comms", weights: { "political-pr": 4 } },
      { label: "Daily social + community", weights: { "social-media": 3, "content-production": 1 } },
      { label: "Fix tracking / reporting", weights: { "analytics-reporting": 3, "seo-website": 1 } },
    ],
  },
  {
    id: "channels",
    prompt: "Where do you spend your budget today?",
    multi: true,
    choices: [
      { label: "Meta Ads (Facebook + Instagram)", weights: { "paid-ads": 2, "analytics-reporting": 1 } },
      { label: "Google Search + YouTube", weights: { "paid-ads": 2, "seo-website": 1 } },
      { label: "Influencers / creators", weights: { "influencer-marketing": 3, "content-production": 1 } },
      { label: "Press / PR / TV", weights: { "political-pr": 2, "brand-building": 1 } },
      { label: "Nothing — starting from zero", weights: { "brand-building": 2, "seo-website": 2 } },
    ],
  },
  {
    id: "industry",
    prompt: "Which describes you best?",
    choices: [
      { label: "Consumer brand / FMCG", weights: { "brand-building": 2, "content-production": 1, "paid-ads": 1 } },
      { label: "Hotel / restaurant / hospitality", weights: { "hospitality": 3 } },
      { label: "Political candidate / party", weights: { "political-pr": 4 } },
      { label: "Real estate / property", weights: { "brand-building": 1, "paid-ads": 2, "content-production": 1 } },
      { label: "E-commerce / D2C", weights: { "paid-ads": 3, "seo-website": 2, "analytics-reporting": 1 } },
      { label: "NGO / development / healthcare", weights: { "content-production": 1, "social-media": 1, "brand-building": 1 } },
      { label: "Other", weights: {} },
    ],
  },
];

export function ServiceMatcher() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [done, setDone] = useState(false);

  function answer(qId: string, label: string, multi: boolean) {
    setAnswers((prev) => {
      const current = prev[qId] ?? [];
      if (multi) {
        const next = current.includes(label) ? current.filter((c) => c !== label) : [...current, label];
        return { ...prev, [qId]: next };
      }
      return { ...prev, [qId]: [label] };
    });
    if (!multi) {
      setTimeout(() => {
        if (step < QUESTIONS.length - 1) setStep(step + 1);
        else complete();
      }, 200);
    }
  }

  function complete() {
    track("service_matcher_completed", { surface: "/services" });
    setDone(true);
  }

  const ranked = useMemo(() => {
    const scores: Record<string, number> = {};
    for (const q of QUESTIONS) {
      const picks = answers[q.id] ?? [];
      for (const label of picks) {
        const choice = q.choices.find((c) => c.label === label);
        if (!choice) continue;
        for (const [slug, w] of Object.entries(choice.weights)) {
          scores[slug] = (scores[slug] ?? 0) + w;
        }
      }
    }
    const ready = new Set(SERVICES.filter((s) => s.ready).map((s) => s.slug));
    return Object.entries(scores)
      .filter(([slug]) => ready.has(slug))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([slug, score]) => ({ service: SERVICES.find((s) => s.slug === slug)!, score }));
  }, [answers]);

  function restart() {
    setAnswers({});
    setStep(0);
    setDone(false);
  }

  if (done) {
    return (
      <div className="rounded-panel border border-ink/15 bg-paper p-6 md:p-8">
        <p className="text-eyebrow uppercase text-brand-orange">Your matches</p>
        <h3 className="mt-3 text-h2 tracking-tight text-ink">
          Based on your answers — start with these.
        </h3>
        <ul className="mt-7 space-y-4">
          {ranked.length === 0 && (
            <li className="text-ink/65">
              No strong match yet. Try{" "}
              <Link href="/services" className="text-brand-orange underline">browsing all services</Link> or{" "}
              <Link href="/contact" className="text-brand-orange underline">tell us what you&rsquo;re trying to do</Link>.
            </li>
          )}
          {ranked.map((r, i) => (
            <li key={r.service.slug}>
              <Link
                href={`/services/${r.service.slug}`}
                className="group flex items-start gap-4 rounded-card border border-ink/10 bg-paper p-5 transition hover:-translate-y-0.5 hover:border-brand-orange hover:shadow-card-hover"
              >
                <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-brand-orange/10 text-brand-orange font-bold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-h3 font-bold text-ink">{r.service.name}</div>
                  <div className="mt-1 text-meta text-ink/65">{r.service.oneLiner}</div>
                </div>
                <ArrowRight className="mt-2 h-5 w-5 flex-shrink-0 text-ink/40 transition group-hover:translate-x-1 group-hover:text-brand-orange" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link href={`/book${ranked[0] ? `?service=${ranked[0].service.slug}` : ""}`} className="btn btn-orange">
            Book a call about {ranked[0]?.service.shortName ?? "this"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <button type="button" onClick={restart} className="inline-flex items-center gap-2 text-sm font-semibold text-ink/65 hover:text-ink">
            <RotateCcw className="h-4 w-4" aria-hidden /> Start over
          </button>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[step];
  const picks = answers[q.id] ?? [];
  const isMulti = !!q.multi;

  return (
    <div className="rounded-panel border border-ink/15 bg-paper p-6 md:p-8">
      <div className="flex items-center justify-between">
        <p className="text-eyebrow uppercase text-brand-orange">
          Match me to a service · Step {step + 1} of {QUESTIONS.length}
        </p>
        <div className="flex items-center gap-1">
          {QUESTIONS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full transition ${i <= step ? "bg-brand-orange" : "bg-ink/10"}`}
            />
          ))}
        </div>
      </div>
      <h3 className="mt-4 text-h2 tracking-tight text-ink">{q.prompt}</h3>
      {isMulti && <p className="mt-2 text-meta text-ink/55">Pick all that apply.</p>}
      <ul className="mt-6 space-y-2">
        {q.choices.map((c) => {
          const picked = picks.includes(c.label);
          return (
            <li key={c.label}>
              <button
                type="button"
                onClick={() => answer(q.id, c.label, isMulti)}
                aria-pressed={picked}
                className={`flex w-full items-center gap-3 rounded-card border px-4 py-3 text-left text-sm font-medium transition ${
                  picked
                    ? "border-brand-orange bg-brand-orange/5 text-ink"
                    : "border-ink/10 bg-paper text-ink hover:border-ink"
                }`}
              >
                <span
                  aria-hidden
                  className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded-full border-2 ${
                    picked ? "border-brand-orange bg-brand-orange text-paper" : "border-ink/30"
                  }`}
                >
                  {picked ? "✓" : ""}
                </span>
                {c.label}
              </button>
            </li>
          );
        })}
      </ul>
      {isMulti && (
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink/55 hover:text-ink disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => (step < QUESTIONS.length - 1 ? setStep(step + 1) : complete())}
            className="btn btn-orange"
          >
            {step < QUESTIONS.length - 1 ? "Next" : "See my matches"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
