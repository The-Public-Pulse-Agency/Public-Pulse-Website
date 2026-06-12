"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, Check, AlertCircle, XCircle, Loader2 } from "lucide-react";
import { track } from "@/lib/analytics";

type Finding = {
  kind: "ok" | "warn" | "fail";
  category: string;
  label: string;
  detail: string;
};

type Result =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "error"; message: string }
  | {
      state: "done";
      url: string;
      score: number;
      ttfbMs: number;
      findings: Finding[];
      summary: string;
    };

const ICONS = {
  ok: { Icon: Check, color: "text-emerald-600 bg-emerald-50" },
  warn: { Icon: AlertCircle, color: "text-amber-600 bg-amber-50" },
  fail: { Icon: XCircle, color: "text-red-600 bg-red-50" },
};

export function SeoAuditTool() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<Result>({ state: "idle" });

  async function audit(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim()) return;
    setResult({ state: "loading" });
    track("audit_tool_completed", { surface: "/tools/seo-audit", domain: domain.trim().slice(0, 60) });
    try {
      const res = await fetch("/api/tools/seo-audit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }),
      });
      const data = await res.json();
      if (!data.ok) {
        setResult({ state: "error", message: data.error ?? "Something went wrong" });
        return;
      }
      setResult({
        state: "done",
        url: data.url,
        score: data.score,
        ttfbMs: data.ttfbMs,
        findings: data.findings,
        summary: data.summary,
      });
    } catch (err) {
      setResult({ state: "error", message: (err as Error).message });
    }
  }

  return (
    <div>
      <form onSubmit={audit} className="rounded-panel border border-ink/15 bg-paper p-6 md:p-8">
        <label htmlFor="domain" className="text-eyebrow uppercase text-brand-orange">
          Free SEO audit
        </label>
        <h2 className="mt-3 text-h2 tracking-tight text-ink">
          Enter your domain. Get a 10-point snapshot in seconds.
        </h2>
        <p className="mt-3 text-meta text-ink/65">
          We check title + meta description + H1 + OG + canonical + schema + TTFB + robots + CSP + HSTS. No email required for the basic check.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-card border border-ink/15 bg-paper px-4 py-3 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-brand-orange/20">
            <Search className="h-5 w-5 flex-shrink-0 text-ink/45" aria-hidden />
            <input
              id="domain"
              type="text"
              required
              inputMode="url"
              autoComplete="off"
              placeholder="brand.com.bd"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              disabled={result.state === "loading"}
              className="flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink/40"
            />
          </div>
          <button
            type="submit"
            disabled={result.state === "loading"}
            className="btn btn-orange whitespace-nowrap disabled:opacity-60"
          >
            {result.state === "loading" ? (
              <><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Auditing…</>
            ) : (
              <>Run audit <ArrowRight className="h-4 w-4" aria-hidden /></>
            )}
          </button>
        </div>

        {result.state === "error" && (
          <p className="mt-4 rounded-card border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {result.message}
          </p>
        )}
      </form>

      {result.state === "done" && (
        <div className="mt-8 space-y-6">
          {/* Score panel */}
          <div className="grid items-center gap-6 rounded-panel border border-ink/15 bg-paper p-6 md:grid-cols-3 md:p-8">
            <div className="md:col-span-1">
              <p className="text-meta uppercase tracking-wider text-ink/55">{result.url}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-display-number font-medium tracking-tight text-ink">
                  {result.score}
                </span>
                <span className="text-h3 text-ink/55">/100</span>
              </div>
              <p className="mt-2 text-meta text-ink/55">{result.summary}</p>
            </div>
            <div className="md:col-span-2">
              <div className="rounded-card border border-brand-orange/30 bg-brand-orange/5 p-5">
                <p className="text-eyebrow uppercase text-brand-orange">Want the full audit?</p>
                <p className="mt-2 text-body text-ink">
                  Backlinks, competitor gap, keyword positions, technical crawl. 30 min, free, no pitch.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/book" className="btn btn-orange text-[13px]">
                    Book a free review <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <Link href="/contact" className="text-sm font-semibold text-brand-orange hover:underline">
                    Or send a brief →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Findings list */}
          <div className="rounded-panel border border-ink/15 bg-paper p-6 md:p-8">
            <p className="text-eyebrow uppercase text-ink/55">Findings</p>
            <ul className="mt-5 space-y-3">
              {result.findings.map((f, i) => {
                const { Icon, color } = ICONS[f.kind];
                return (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-card border border-ink/10 bg-paper p-4"
                  >
                    <span className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-full ${color}`}>
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-meta uppercase tracking-wider text-ink/55">{f.category}</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-ink">{f.label}</p>
                      {f.detail && <p className="mt-1 text-meta text-ink/65">{f.detail}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
