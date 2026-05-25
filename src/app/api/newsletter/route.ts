// Newsletter signup — double opt-in.
//
//   POST /api/newsletter { email, source?, locale?, page?, website? }
//
//   • Validates input (Zod) + honeypot.
//   • Inserts a `pending` subscriber with confirmToken + unsubscribeToken
//     (onConflictDoNothing keeps repeat clicks idempotent for existing rows).
//   • Sends ConfirmEmail (best-effort; failure surfaces a generic 200 so
//     bots learn nothing about the row's status).
//
// The actual subscription is created when the user clicks the link in
// ConfirmEmail and hits /confirm — see src/app/confirm/page.tsx.

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createHash } from "node:crypto";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { subscribers } from "@/db/schema";
import { SITE } from "@/lib/site";
import { newToken } from "@/lib/email/tokens";
import { sendEmail } from "@/lib/email/send";
import ConfirmEmail from "@/emails/ConfirmEmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email().min(3).max(254),
  source: z.string().max(120).optional(),
  /** "/blog", "/services/political-pr", etc. */
  page: z.string().max(200).optional(),
  locale: z.enum(["en", "bn"]).optional(),
  /** Honeypot — must be empty. */
  website: z.string().max(0).optional(),
});

function hashIp(ip: string): string {
  const dayKey = new Date().toISOString().slice(0, 10);
  return createHash("sha256").update(`${ip}::${dayKey}`).digest("hex").slice(0, 40);
}

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const { email, source, page, locale, website } = parsed.data;

  // Honeypot — silent success.
  if (website && website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const h = await headers();
  const ip =
    h.get("cf-connecting-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown";
  const userAgent = h.get("user-agent") ?? null;

  const normalizedEmail = email.toLowerCase().trim();
  const confirmToken = newToken(24);
  const unsubscribeToken = newToken(24);

  let row: { email: string; confirmToken: string | null; status: string } | null = null;
  try {
    const inserted = await db
      .insert(subscribers)
      .values({
        email: normalizedEmail,
        source: source ?? null,
        status: "pending",
        locale: locale ?? "en",
        capturePage: page ?? null,
        confirmToken,
        unsubscribeToken,
        ipHash: hashIp(ip),
        userAgent,
      })
      .onConflictDoNothing({ target: subscribers.email })
      .returning({
        email: subscribers.email,
        confirmToken: subscribers.confirmToken,
        status: subscribers.status,
      });

    if (inserted.length > 0) {
      row = inserted[0];
    } else {
      // Row already exists — look it up. For pending rows we resend the
      // existing confirm token; for confirmed/unsubscribed we silently 200.
      const [existing] = await db
        .select({
          email: subscribers.email,
          confirmToken: subscribers.confirmToken,
          status: subscribers.status,
        })
        .from(subscribers)
        .where(eq(subscribers.email, normalizedEmail))
        .limit(1);
      row = existing ?? null;
    }
  } catch (err) {
    console.error("[newsletter] insert failed", err);
    return NextResponse.json({ ok: true }); // generic OK — never leak DB errors
  }

  // Send ConfirmEmail ONLY for pending rows that still have a token.
  // Already-confirmed and already-unsubscribed rows get a silent 200 — no
  // resend, no info leak about whether the email is on the list.
  if (row && row.status === "pending" && row.confirmToken) {
    const confirmUrl = `${SITE.url}/confirm?t=${encodeURIComponent(row.confirmToken)}`;
    void sendEmail({
      to: row.email,
      subject: "Confirm your Public Pulse subscription",
      react: ConfirmEmail({ email: row.email, confirmUrl, locale: locale ?? "en" }),
      unsubscribeToken: null, // Pre-confirmation — no unsubscribe needed
      transactional: true,
      tags: [
        { name: "type", value: "newsletter-confirm" },
        { name: "source", value: (source ?? "unknown").replace(/[^a-z0-9-]/gi, "").slice(0, 40) || "unknown" },
      ],
    }).then((r) => {
      if (!r.ok) console.warn("[newsletter] confirm send failed", r.error);
    });
  }

  return NextResponse.json({ ok: true });
}
