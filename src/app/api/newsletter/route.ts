// Newsletter signup endpoint.
//   POST /api/newsletter { email, source? }  → 200 { ok: true }
//
// - Validates the email (Zod).
// - Inserts a subscribers row (onConflictDoNothing keeps the request idempotent).
// - Sends a welcome email via Resend (best-effort; failure doesn't break signup).
// - Never returns DB-level errors to the client (information leakage).
//
// Cache-Control: no-store. Single write path.

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { Resend } from "resend";

import { db } from "@/db/client";
import { subscribers } from "@/db/schema";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email().min(3).max(254),
  source: z.string().max(120).optional(),
  /** Honeypot — must be empty. */
  website: z.string().max(0).optional(),
});

let _resend: Resend | null = null;
function resend(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null; // best-effort; signup still proceeds without email
  _resend = new Resend(key);
  return _resend;
}

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
  const { email, source, website } = parsed.data;

  // Honeypot — silent success to avoid telling bots they were caught.
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

  const unsubscribeToken = randomUUID();
  const normalizedEmail = email.toLowerCase().trim();

  try {
    await db
      .insert(subscribers)
      .values({
        email: normalizedEmail,
        source: source ?? null,
        status: "subscribed",
        unsubscribeToken,
        ipHash: hashIp(ip),
        userAgent,
        confirmedAt: new Date(),
      })
      .onConflictDoNothing({ target: subscribers.email });
  } catch (err) {
    console.error("[newsletter] db insert failed", err);
    // Continue — we still try to send the welcome (idempotent for the user).
  }

  // Best-effort welcome email.
  const r = resend();
  if (r) {
    try {
      const fromAddr = process.env.RESEND_FROM_EMAIL ?? SITE.contact.email;
      await r.emails.send({
        from: `Public Pulse <${fromAddr}>`,
        to: [normalizedEmail],
        subject: "You're on the Public Pulse list",
        text: [
          `Welcome — you're signed up for the Public Pulse newsletter.`,
          ``,
          `We send one email roughly every 2 weeks. Insights from Bangladesh's`,
          `digital marketing and political PR work: real playbooks, channel`,
          `experiments, what worked and what didn't.`,
          ``,
          `If you change your mind, unsubscribe in one click:`,
          `${SITE.url}/newsletter/unsubscribe?t=${unsubscribeToken}`,
          ``,
          `— Public Pulse`,
          `${SITE.url}`,
        ].join("\n"),
      });
    } catch (err) {
      console.warn("[newsletter] welcome email failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
