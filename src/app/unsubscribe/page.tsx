// Unsubscribe landing page.
//   GET  /unsubscribe?t=<unsubscribeToken>  → human-friendly confirmation
//   (POST /api/unsubscribe handles RFC 8058 one-click from mail clients.)
//
// Both paths flip status to "unsubscribed" + set unsubscribedAt; durable
// token stays so a future re-subscribe goes through the regular signup flow.

import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { subscribers } from "@/db/schema";
import { tokensEqual } from "@/lib/email/tokens";
import { Container } from "@/components/ui/Container";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Unsubscribe — Public Pulse",
  robots: { index: false, follow: false },
  other: { "x-robots-tag": "noindex, nofollow, noarchive, nosnippet" },
};

type State = "ok" | "already" | "invalid" | "error";

async function unsubscribe(token: string): Promise<{ state: State; email?: string }> {
  if (!token || token.length > 200) return { state: "invalid" };
  try {
    const [row] = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.unsubscribeToken, token))
      .limit(1);
    if (!row) return { state: "invalid" };
    if (!tokensEqual(row.unsubscribeToken, token)) return { state: "invalid" };
    if (row.status === "unsubscribed") {
      return { state: "already", email: row.email };
    }
    await db
      .update(subscribers)
      .set({
        status: "unsubscribed",
        unsubscribedAt: new Date(),
      })
      .where(eq(subscribers.id, row.id));
    return { state: "ok", email: row.email };
  } catch (err) {
    console.error("[unsubscribe] failed", err);
    return { state: "error" };
  }
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const sp = await searchParams;
  const token = String(sp.t ?? "").trim();
  const result = await unsubscribe(token);

  const heading = {
    ok: "You've been unsubscribed.",
    already: "You're already unsubscribed.",
    invalid: "This unsubscribe link isn't valid.",
    error: "Something went wrong on our side.",
  }[result.state];

  const sub = {
    ok: "We'll stop sending you the Pulse Digest. If this was a mistake, you can subscribe again any time.",
    already: "No further action needed.",
    invalid: "It may have expired or been mistyped.",
    error: "Please try again, or email info@publicpulse.com.bd directly.",
  }[result.state];

  return (
    <section className="border-b border-ink bg-paper py-24 md:py-32">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <span className="inline-flex items-center rounded-full border border-ink/20 bg-paper px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-ink/55">
            Unsubscribe
          </span>
          <h1 className="mt-6 text-[44px] font-extrabold leading-[1.05] tracking-tight text-ink md:text-[56px]">
            {heading}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink/70">{sub}</p>
          {result.email && (
            <p className="mt-3 text-xs text-ink/55">{result.email}</p>
          )}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/" className="btn btn-secondary text-[14px] uppercase tracking-wide">
              Back home
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
