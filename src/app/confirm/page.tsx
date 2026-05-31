// Confirmation landing page.
//   GET /confirm?t=<confirmToken>
//
// Flow:
//   • Look up the subscriber by confirmToken
//   • If found + pending: flip to confirmed, clear confirmToken, set confirmedAt
//   • Send WelcomeEmail (best-effort)
//   • Render a confirmation page (single, friendly state)
//
// Hidden in robots.txt; no-store; no public link surfaces it.

import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";

import { headers } from "next/headers";

import { db } from "@/db/client";
import { subscribers } from "@/db/schema";
import { tokensEqual } from "@/lib/email/tokens";
import { sendEmail } from "@/lib/email/send";
import WelcomeEmail from "@/emails/WelcomeEmail";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/site";
import { extractClientIp, extractFbCookies, sendCapiEvent } from "@/lib/meta-capi";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Confirm subscription — Public Pulse",
  robots: { index: false, follow: false },
  other: { "x-robots-tag": "noindex, nofollow, noarchive, nosnippet" },
};

type State = "ok" | "already" | "invalid" | "error";

async function confirm(token: string, reqHeaders: Headers): Promise<{
  state: State;
  email?: string;
  unsubscribeUrl?: string;
  locale?: "en" | "bn";
}> {
  if (!token || token.length > 200) return { state: "invalid" };
  try {
    const [row] = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.confirmToken, token))
      .limit(1);
    if (!row) {
      // Maybe already confirmed (token was cleared). Distinguish with a
      // best-effort fallback lookup on unsubscribeToken IS NOT helpful; just
      // tell the user the link is invalid OR they're already confirmed.
      return { state: "invalid" };
    }
    if (!tokensEqual(row.confirmToken, token)) return { state: "invalid" };
    if (row.status === "confirmed") return { state: "already", email: row.email };
    if (row.status === "unsubscribed") return { state: "invalid" };

    await db
      .update(subscribers)
      .set({
        status: "confirmed",
        confirmedAt: new Date(),
        confirmToken: null,
      })
      .where(eq(subscribers.id, row.id));

    const locale = (row.locale === "bn" ? "bn" : "en") as "en" | "bn";
    const unsubscribeUrl = `${SITE.url}/unsubscribe?t=${encodeURIComponent(row.unsubscribeToken)}`;

    void sendEmail({
      to: row.email,
      subject: "You're in — welcome to Public Pulse",
      react: WelcomeEmail({ email: row.email, unsubscribeUrl, locale }),
      unsubscribeToken: row.unsubscribeToken,
      tags: [{ name: "type", value: "newsletter-welcome" }],
    }).then((r) => {
      if (!r.ok) console.warn("[confirm] welcome send failed", r.error);
    });

    // Fire CompleteRegistration to Meta CAPI (the Lead event already fired
    // on initial signup; this completes the funnel + lifts match quality
    // because we now have a confirmed-good email).
    const cookies = extractFbCookies(reqHeaders.get("cookie"));
    const ipAddress = extractClientIp(reqHeaders);
    const ua = reqHeaders.get("user-agent");
    void sendCapiEvent({
      eventName: "CompleteRegistration",
      eventSourceUrl: `${SITE.url}/confirm`,
      userData: {
        email: row.email,
        ipAddress,
        userAgent: ua,
        fbc: cookies.fbc,
        fbp: cookies.fbp,
        externalId: row.email,
        country: "bd",
      },
      customData: {
        content_name: "Newsletter confirmation (double opt-in)",
        content_category: "newsletter",
        status: "confirmed",
        currency: "BDT",
        value: 0,
      },
    }).then((r) => {
      if (!r.ok && r.reason !== "no-token") {
        console.warn("[confirm] capi failed:", r.reason, r.error);
      }
    });

    return { state: "ok", email: row.email, unsubscribeUrl, locale };
  } catch (err) {
    console.error("[confirm] failed", err);
    return { state: "error" };
  }
}

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const sp = await searchParams;
  const token = String(sp.t ?? "").trim();
  const result = await confirm(token, await headers());

  const heading = {
    ok: "You're in.",
    already: "You're already confirmed.",
    invalid: "This confirmation link isn't valid.",
    error: "Something went wrong on our side.",
  }[result.state];

  const sub = {
    ok: "We've sent you a welcome email. Watch your inbox — the next Pulse Digest lands soon.",
    already: "Your subscription is active. No action needed.",
    invalid: "It may have already been used, or the link expired. Try subscribing again from the homepage.",
    error: "Please try the link again, or email us directly.",
  }[result.state];

  return (
    <section className="border-b border-ink bg-paper py-24 md:py-32">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <span className="inline-flex items-center rounded-full border border-ink/20 bg-paper px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-orange">
            Newsletter
          </span>
          <h1 className="mt-6 text-[44px] font-extrabold leading-[1.05] tracking-tight text-ink md:text-[56px]">
            {heading}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink/70">{sub}</p>
          {result.email && (
            <p className="mt-3 text-xs text-ink/55">{result.email}</p>
          )}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/blog" className="btn btn-orange text-[14px] uppercase tracking-wide">
              Read the latest
            </Link>
            <Link href="/" className="btn btn-secondary text-[14px] uppercase tracking-wide">
              Back home
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
