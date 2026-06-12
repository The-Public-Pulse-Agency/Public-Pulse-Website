// SEO audit tool — visitor enters a domain, we fetch and run a quick
// on-page check, return a snapshot with score + findings.
//
// Security posture:
//   - SSRF defended by safeFetchPublic() — see src/lib/ssrf-guard.ts.
//     Refuses to hit AWS IMDS, RFC1918, loopback, link-local, IPv6
//     private space, or non-80/443 ports.
//   - Rate-limited 5 requests / hour / IP using tool_runs table.
//   - Generic error responses; details never echoed back to caller.
//   - Body capped at 1 MB to prevent OOM.

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { and, eq, gte, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { toolRuns } from "@/db/schema";
import { hashIp, isOverLimit } from "@/lib/rate-limit";
import { safeFetchPublic } from "@/lib/ssrf-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Finding = {
  kind: "ok" | "warn" | "fail";
  category: string;
  label: string;
  detail: string;
};

function normalizeUrl(input: string): string | null {
  let v = input.trim();
  if (!v) return null;
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  try {
    const u = new URL(v);
    if (!/^https?:$/.test(u.protocol)) return null;
    return u.origin;
  } catch {
    return null;
  }
}

function extract(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

function audit(html: string, headers: Headers, ms: number): { score: number; findings: Finding[] } {
  const findings: Finding[] = [];
  const title = extract(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!title) {
    findings.push({ kind: "fail", category: "Meta", label: "Missing <title>", detail: "Every page must have a <title> for SERP rendering." });
  } else if (title.length < 30) {
    findings.push({ kind: "warn", category: "Meta", label: `Title is short (${title.length} chars)`, detail: "Aim for 40–60 characters for full SERP display." });
  } else if (title.length > 65) {
    findings.push({ kind: "warn", category: "Meta", label: `Title is long (${title.length} chars)`, detail: "Google truncates >60. Yours: " + title.slice(0, 80) });
  } else {
    findings.push({ kind: "ok", category: "Meta", label: `Title length OK (${title.length} chars)`, detail: title.slice(0, 100) });
  }

  const desc = extract(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  if (!desc) {
    findings.push({ kind: "fail", category: "Meta", label: "Missing meta description", detail: "Add one — Google uses it as the SERP snippet." });
  } else if (desc.length < 100) {
    findings.push({ kind: "warn", category: "Meta", label: `Description is short (${desc.length} chars)`, detail: "Aim for 140–160 characters." });
  } else if (desc.length > 170) {
    findings.push({ kind: "warn", category: "Meta", label: `Description is long (${desc.length} chars)`, detail: "Google truncates ~160." });
  } else {
    findings.push({ kind: "ok", category: "Meta", label: `Description length OK (${desc.length} chars)`, detail: desc.slice(0, 140) });
  }

  const h1Matches = html.match(/<h1\b/gi) ?? [];
  if (h1Matches.length === 0) {
    findings.push({ kind: "fail", category: "Structure", label: "No <h1> on the page", detail: "Every page should have exactly one H1." });
  } else if (h1Matches.length > 1) {
    findings.push({ kind: "warn", category: "Structure", label: `Multiple <h1> tags (${h1Matches.length})`, detail: "Best practice is exactly one H1." });
  } else {
    findings.push({ kind: "ok", category: "Structure", label: "Single <h1>", detail: "" });
  }

  const og = /<meta[^>]+property=["']og:/i.test(html);
  findings.push(
    og
      ? { kind: "ok", category: "Social", label: "Open Graph tags present", detail: "Good for Facebook/LinkedIn previews." }
      : { kind: "fail", category: "Social", label: "No Open Graph tags", detail: "Add og:title, og:description, og:image for social shares." }
  );

  const canonical = extract(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  findings.push(
    canonical
      ? { kind: "ok", category: "Canonical", label: "Canonical link set", detail: canonical }
      : { kind: "warn", category: "Canonical", label: "Missing canonical link", detail: "Helps Google pick the right URL when duplicates exist." }
  );

  const jsonLd = /<script[^>]+type=["']application\/ld\+json["']/i.test(html);
  findings.push(
    jsonLd
      ? { kind: "ok", category: "Schema", label: "JSON-LD schema present", detail: "Helps rich results + AI engines." }
      : { kind: "warn", category: "Schema", label: "No JSON-LD schema", detail: "Add Organization + WebSite at minimum." }
  );

  if (ms > 3000) {
    findings.push({ kind: "fail", category: "Performance", label: `Slow TTFB (${ms}ms)`, detail: "Should be <800ms for a marketing site." });
  } else if (ms > 1000) {
    findings.push({ kind: "warn", category: "Performance", label: `Average TTFB (${ms}ms)`, detail: "Aim for <800ms." });
  } else {
    findings.push({ kind: "ok", category: "Performance", label: `Fast TTFB (${ms}ms)`, detail: "" });
  }

  const robots = extract(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
  if (robots && /noindex/i.test(robots)) {
    findings.push({ kind: "fail", category: "Robots", label: "Page is noindexed", detail: "This page won't appear in Google. Was that intentional?" });
  } else {
    findings.push({ kind: "ok", category: "Robots", label: "Page is indexable", detail: robots ?? "no robots meta — default = index, follow" });
  }

  const hasCSP = headers.get("content-security-policy");
  findings.push(
    hasCSP
      ? { kind: "ok", category: "Security", label: "CSP header present", detail: "Reduces XSS surface." }
      : { kind: "warn", category: "Security", label: "No CSP header", detail: "Add a Content-Security-Policy header." }
  );

  const hasHSTS = headers.get("strict-transport-security");
  findings.push(
    hasHSTS
      ? { kind: "ok", category: "Security", label: "HSTS enforced", detail: "" }
      : { kind: "warn", category: "Security", label: "No HSTS header", detail: "Strict-Transport-Security forces HTTPS." }
  );

  const total = findings.length * 10;
  const earned = findings.reduce((s, f) => s + (f.kind === "ok" ? 10 : f.kind === "warn" ? 5 : 0), 0);
  const score = total > 0 ? Math.round((earned / total) * 100) : 0;
  return { score, findings };
}

export async function POST(req: Request): Promise<Response> {
  // ── 1. Identify caller — refuse unknown-IP requests so attackers
  //     can't pool into a single "unknown" bucket and evade rate-limit.
  const h = await headers();
  const ip =
    h.get("cf-connecting-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    null;
  if (!ip) {
    return NextResponse.json({ ok: false, error: "missing-client-ip" }, { status: 400 });
  }
  const ipKey = hashIp(ip);

  // ── 2. Rate limit — 5 audits / hour / IP. Check BEFORE the fetch.
  const limited = await isOverLimit(ipKey, 5, async (key, since) => {
    const [row] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(toolRuns)
      .where(and(eq(toolRuns.tool, "seo-audit"), eq(toolRuns.ipHash, key), gte(toolRuns.runAt, since)));
    return row?.n ?? 0;
  }).catch(() => false);
  if (limited) {
    return NextResponse.json(
      { ok: false, error: "Too many audits. Try again in an hour." },
      { status: 429 }
    );
  }

  // ── 3. Parse the URL caller wants audited.
  let body: { domain?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 });
  }
  const url = normalizeUrl(body.domain ?? "");
  if (!url) {
    return NextResponse.json({ ok: false, error: "Enter a valid domain (e.g. example.com)" }, { status: 400 });
  }

  // Record the run BEFORE the fetch so a fetch failure still counts
  // toward the rate limit (otherwise an attacker can probe blocked
  // hosts cheaply).
  await db.insert(toolRuns).values({ tool: "seo-audit", ipHash: ipKey }).catch(() => {});

  // ── 4. Fetch the URL through the SSRF guard.
  const result = await safeFetchPublic(url, 10_000);
  if (!result.ok) {
    // Generic message — never leak internal topology details. Log
    // server-side for debugging.
    console.warn("[seo-audit] fetch refused", { url, reason: result.reason });
    return NextResponse.json(
      { ok: false, error: "Couldn't reach that URL. Check that it's publicly accessible." },
      { status: 502 }
    );
  }
  // Treat any non-2xx upstream HTTP status as a fetch failure for the
  // caller — don't echo their URL or the upstream status code.
  if (result.status >= 400 || result.status >= 300) {
    console.warn("[seo-audit] upstream non-2xx", { url, status: result.status });
    return NextResponse.json(
      { ok: false, error: "Couldn't reach that URL. Check that it's publicly accessible." },
      { status: 502 }
    );
  }

  const { score, findings } = audit(result.html, result.headers, result.ms);
  return NextResponse.json({
    ok: true,
    url,
    score,
    ttfbMs: result.ms,
    findings,
    summary: `${findings.filter((f) => f.kind === "fail").length} critical · ${findings.filter((f) => f.kind === "warn").length} warnings · ${findings.filter((f) => f.kind === "ok").length} passes`,
  });
}
