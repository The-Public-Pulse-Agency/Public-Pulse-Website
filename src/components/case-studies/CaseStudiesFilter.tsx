"use client";

// Client-side filter for /case-studies. Reads ?industry=&service= from
// useSearchParams + filters the server-rendered list. Lets the parent page
// stay ISR-cached at the CDN.

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import { ArrowRight } from "lucide-react";

import { TiltCard } from "@/components/motion";
import { CountUp } from "@/components/ui/CountUp";

export type CaseStudyCard = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  industry: string;
  location: string | null;
  metric: string;
  windowLabel: string;
  services: string[];
  serviceSlug: string | null;
  clientName: string | null;
};

type Props = {
  cases: CaseStudyCard[];
  serviceLabels: Record<string, string>;
};

function parseMetric(metric: string): {
  num?: number;
  prefix: string;
  suffix: string;
} {
  const m = metric.trim().match(/^([+-])?\s*([\d.,]+)\s*([%a-zA-Z×x]*)$/);
  if (!m) return { prefix: "", suffix: "" };
  const sign = m[1];
  const digits = m[2];
  const unit = m[3];
  const n = parseFloat(digits.replace(/,/g, ""));
  if (!isFinite(n)) return { prefix: "", suffix: "" };
  return {
    num: n,
    prefix: sign === "-" ? "-" : sign === "+" ? "+" : "",
    suffix: unit ?? "",
  };
}

export function CaseStudiesFilter({ cases, serviceLabels }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  const activeIndustry = sp.get("industry") ?? "";
  const activeService = sp.get("service") ?? "";

  const industries = useMemo(
    () => Array.from(new Set(cases.map((c) => c.industry))).sort(),
    [cases]
  );
  const servicesSeen = useMemo(
    () =>
      Array.from(
        new Set([
          ...cases.flatMap((c) => c.services),
          ...cases.flatMap((c) => (c.serviceSlug ? [c.serviceSlug] : [])),
        ])
      ).sort(),
    [cases]
  );

  const filtered = useMemo(
    () =>
      cases.filter((c) => {
        if (activeIndustry && c.industry !== activeIndustry) return false;
        if (activeService) {
          const matches =
            c.services.includes(activeService) || c.serviceSlug === activeService;
          if (!matches) return false;
        }
        return true;
      }),
    [cases, activeIndustry, activeService]
  );

  function pushParams(next: { industry?: string | null; service?: string | null }) {
    const params = new URLSearchParams(sp.toString());
    if (next.industry !== undefined) {
      if (!next.industry) params.delete("industry");
      else params.set("industry", next.industry);
    }
    if (next.service !== undefined) {
      if (!next.service) params.delete("service");
      else params.set("service", next.service);
    }
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `/case-studies?${qs}` : "/case-studies", { scroll: false });
    });
  }

  return (
    <>
      {cases.length > 0 && (
        <section className="border-t border-ink bg-paper py-6">
          <div className="max-w-container mx-auto px-5 md:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => pushParams({ industry: null, service: null })}
                className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                  !activeIndustry && !activeService
                    ? "border-ink bg-ink text-paper"
                    : "border-ink/20 bg-paper text-ink/70 hover:border-ink"
                }`}
              >
                All ({cases.length})
              </button>
              {industries.map((ind) => {
                const count = cases.filter((c) => c.industry === ind).length;
                return (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => pushParams({ industry: ind })}
                    className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                      activeIndustry === ind
                        ? "border-ink bg-ink text-paper"
                        : "border-ink/20 bg-paper text-ink/70 hover:border-ink"
                    }`}
                  >
                    {ind} ({count})
                  </button>
                );
              })}
              {servicesSeen.length > 0 && (
                <span className="mx-2 h-4 w-px bg-ink/15" aria-hidden />
              )}
              {servicesSeen.map((s) => {
                const count = cases.filter(
                  (c) => c.services.includes(s) || c.serviceSlug === s
                ).length;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => pushParams({ service: s })}
                    className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                      activeService === s
                        ? "border-brand-orange bg-brand-orange text-paper"
                        : "border-ink/20 bg-paper text-ink/70 hover:border-ink"
                    }`}
                  >
                    {serviceLabels[s] ?? s} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-ink bg-paper-alt py-16 md:py-24">
        <div className="max-w-container mx-auto px-5 md:px-8">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink/20 bg-paper p-10 text-center">
              <p className="text-ink/55">
                {cases.length === 0
                  ? "Case studies are being written up — the latest will appear here soon."
                  : "No case studies match these filters. Try removing them above."}
              </p>
              <p className="mt-4 text-meta text-ink/45">
                In the meantime, see what we deliver under{" "}
                <Link href="/services" className="underline hover:text-brand-orange">
                  services
                </Link>
                {" "}or{" "}
                <Link href="/contact" className="underline hover:text-brand-orange">
                  talk to the team
                </Link>
                .
              </p>
            </div>
          ) : (
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => {
                const parsed = parseMetric(c.metric);
                return (
                  <li key={c.id}>
                    <TiltCard maxTilt={4}>
                      <Link
                        href={`/case-studies/${c.slug}`}
                        className="card group flex h-full flex-col"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="chip chip-orange">{c.industry}</span>
                          {c.location && (
                            <span className="inline-flex items-center rounded-full border border-ink/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink/55">
                              {c.location}
                            </span>
                          )}
                        </div>
                        <div className="mt-6">
                          <div className="text-[clamp(2.2rem,4vw+0.5rem,3.5rem)] font-extrabold leading-[0.95] tracking-tight text-ink">
                            {parsed.num !== undefined ? (
                              <CountUp
                                value={`${parsed.prefix}${parsed.num}${parsed.suffix}`}
                              />
                            ) : (
                              c.metric
                            )}
                          </div>
                          <div className="mt-2 text-eyebrow text-ink/55">
                            {c.windowLabel}
                          </div>
                        </div>
                        <h2 className="mt-5 text-h3 font-bold text-ink line-clamp-3">
                          {c.title}
                        </h2>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70 line-clamp-3">
                          {c.summary}
                        </p>
                        {c.services.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {c.services.slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="rounded-full border border-ink/15 bg-paper-tint px-2 py-0.5 text-[10px] font-semibold uppercase text-ink/65"
                              >
                                {serviceLabels[s] ?? s}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4 text-meta text-ink/55">
                          <span>{c.clientName ?? c.industry}</span>
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                            Read
                            <ArrowRight
                              className="h-3.5 w-3.5 transition group-hover:translate-x-1"
                              aria-hidden
                            />
                          </span>
                        </div>
                      </Link>
                    </TiltCard>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
