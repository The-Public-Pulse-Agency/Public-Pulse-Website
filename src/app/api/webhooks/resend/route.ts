// Resend webhook receiver — newsletter engagement analytics.
//
// Setup (one-time, in Resend dashboard):
//   1. Resend → Webhooks → Add endpoint:
//        https://publicpulse.com.bd/api/webhooks/resend
//   2. Subscribe to: email.sent, email.delivered, email.opened,
//        email.clicked, email.bounced, email.complained
//   3. Copy the "Signing secret" Resend shows
//   4. sst secret set RESEND_WEBHOOK_SECRET "<signing-secret>" --stage production
//   5. AWS_PROFILE=eventpulse npx sst deploy --stage production
//
// Signature: Resend signs with Svix (svix-id, svix-timestamp, svix-signature
// headers). We verify HMAC-SHA256 over `id.timestamp.body` against the
// signing secret (Svix shared-secret pattern).
//
// Idempotency: dedup on (providerId, eventType) — Svix retries are safe.

import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { eq, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { newsletterSends, resendEvents } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSecret(): string | null {
  if (process.env.RESEND_WEBHOOK_SECRET) return process.env.RESEND_WEBHOOK_SECRET;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Resource } = require("sst");
    return Resource?.RESEND_WEBHOOK_SECRET?.value ?? null;
  } catch {
    return null;
  }
}

function verify(rawBody: string, headers: Headers, secret: string): boolean {
  const svixId = headers.get("svix-id");
  const svixTs = headers.get("svix-timestamp");
  const svixSig = headers.get("svix-signature");
  if (!svixId || !svixTs || !svixSig) return false;

  // Reject replays older than 5 minutes.
  const ts = parseInt(svixTs, 10);
  if (!Number.isFinite(ts)) return false;
  const ageMs = Date.now() - ts * 1000;
  if (ageMs > 5 * 60 * 1000 || ageMs < -60 * 1000) return false;

  // Strip the "whsec_" prefix and base64-decode the secret per Svix spec.
  const secretBase64 = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  let secretBytes: Buffer;
  try {
    secretBytes = Buffer.from(secretBase64, "base64");
  } catch {
    return false;
  }

  const signedPayload = `${svixId}.${svixTs}.${rawBody}`;
  const expected = createHmac("sha256", secretBytes).update(signedPayload).digest("base64");

  // Svix sends "v1,<sig> v1,<sig2>" space-separated. Any matching one passes.
  for (const part of svixSig.split(" ")) {
    const [, sig] = part.split(",");
    if (!sig) continue;
    try {
      if (
        sig.length === expected.length &&
        timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
      ) {
        return true;
      }
    } catch {
      // length-mismatch fall-through
    }
  }
  return false;
}

type ResendEventPayload = {
  type: string;
  data?: {
    email_id?: string;
    to?: string | string[];
    subject?: string;
    bounce?: { type?: string };
    click?: { link?: string };
  };
};

export async function POST(req: Request): Promise<Response> {
  const secret = getSecret();
  const rawBody = await req.text();
  if (!secret) {
    // No secret configured = treat as misconfigured. Refuse in prod.
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ ok: false, error: "secret-missing" }, { status: 503 });
    }
  } else if (!verify(rawBody, req.headers, secret)) {
    return NextResponse.json({ ok: false, error: "invalid-signature" }, { status: 401 });
  }

  let payload: ResendEventPayload;
  try {
    payload = JSON.parse(rawBody) as ResendEventPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 });
  }
  const eventType = payload.type ?? "unknown";
  const providerId = payload.data?.email_id ?? "";
  if (!providerId) {
    return NextResponse.json({ ok: true, ignored: "no-email-id" });
  }

  const to = Array.isArray(payload.data?.to)
    ? payload.data?.to[0]
    : (payload.data?.to as string | undefined);
  const detail =
    eventType === "email.clicked"
      ? payload.data?.click?.link ?? null
      : eventType === "email.bounced"
      ? payload.data?.bounce?.type ?? null
      : null;

  // 1. Audit-log every event. Dedup on (providerId, eventType).
  await db
    .insert(resendEvents)
    .values({
      eventType,
      providerId,
      to: to ?? null,
      subject: payload.data?.subject ?? null,
      detail,
      payload,
    })
    .onConflictDoNothing();

  // 2. Update aggregate counters on newsletter_sends for fast dashboard reads.
  const now = new Date();
  if (eventType === "email.opened") {
    await db
      .update(newsletterSends)
      .set({
        openedAt: now,
        openCount: sql`${newsletterSends.openCount} + 1`,
      })
      .where(eq(newsletterSends.providerId, providerId));
  } else if (eventType === "email.clicked") {
    await db
      .update(newsletterSends)
      .set({
        clickedAt: now,
        clickCount: sql`${newsletterSends.clickCount} + 1`,
      })
      .where(eq(newsletterSends.providerId, providerId));
  } else if (eventType === "email.bounced") {
    await db
      .update(newsletterSends)
      .set({ bouncedAt: now, bounceType: payload.data?.bounce?.type ?? "unknown" })
      .where(eq(newsletterSends.providerId, providerId));
  } else if (eventType === "email.complained") {
    await db
      .update(newsletterSends)
      .set({ complainedAt: now })
      .where(eq(newsletterSends.providerId, providerId));
  }
  // email.sent / email.delivered just go to the audit log; we already have
  // the sentAt timestamp from when sendIssue ran.

  return NextResponse.json({ ok: true, eventType });
}
