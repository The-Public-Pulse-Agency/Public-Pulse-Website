// Cal.com webhook receiver — auto-creates a lead on every new booking.
//
// Setup (one-time, in Cal.com dashboard):
//   1. Cal.com → Settings → Developer → Webhooks → Create Webhook
//   2. Subscribe URL:
//        https://publicpulse.com.bd/api/webhooks/cal-com
//   3. Subscribe to: BOOKING_CREATED, BOOKING_RESCHEDULED, BOOKING_CANCELLED
//   4. Cal.com generates a "Secret" (random string). Copy it.
//   5. sst secret set CAL_WEBHOOK_SECRET "<the secret>" --stage production
//   6. AWS_PROFILE=eventpulse npx sst deploy --stage production
//
// Signature: Cal.com signs with HMAC-SHA256 over the raw body using your
// secret, sent in `X-Cal-Signature-256` header (hex-encoded).
//
// Effect: every BOOKING_CREATED creates a corresponding row in `leads`
// (so the booking shows up in /manage/leads alongside contact-form
// submissions) AND fires a Meta CAPI Lead event for ad-attribution.

import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { calBookings, leads } from "@/db/schema";
import { sendCapiEvent } from "@/lib/meta-capi";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSecret(): string | null {
  if (process.env.CAL_WEBHOOK_SECRET) return process.env.CAL_WEBHOOK_SECRET;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Resource } = require("sst");
    return Resource?.CAL_WEBHOOK_SECRET?.value ?? null;
  } catch {
    return null;
  }
}

function verifySignature(rawBody: string, headers: Headers, secret: string): boolean {
  // Cal.com sends X-Cal-Signature-256 = hex(HMAC-SHA256(secret, body))
  const sig = headers.get("x-cal-signature-256") ?? "";
  if (!sig) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    if (sig.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

type CalWebhookPayload = {
  triggerEvent: string; // "BOOKING_CREATED" etc.
  payload?: {
    uid?: string;
    bookerUrl?: string;
    title?: string;
    type?: string; // event-type slug
    startTime?: string;
    endTime?: string;
    organizer?: { timeZone?: string };
    attendees?: Array<{
      name?: string;
      email?: string;
      phoneNumber?: string;
      timeZone?: string;
    }>;
    meetingUrl?: string;
    additionalNotes?: string;
    responses?: Record<string, unknown>;
  };
};

export async function POST(req: Request): Promise<Response> {
  const secret = getSecret();
  const rawBody = await req.text();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ ok: false, error: "secret-missing" }, { status: 503 });
    }
  } else if (!verifySignature(rawBody, req.headers, secret)) {
    return NextResponse.json({ ok: false, error: "invalid-signature" }, { status: 401 });
  }

  let body: CalWebhookPayload;
  try {
    body = JSON.parse(rawBody) as CalWebhookPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 });
  }

  const event = body.triggerEvent ?? "UNKNOWN";
  const p = body.payload ?? {};
  const uid = p.uid;
  if (!uid) {
    return NextResponse.json({ ok: true, ignored: "no-booking-uid" });
  }

  const attendee = (p.attendees ?? [])[0] ?? {};
  const status =
    event === "BOOKING_CREATED" ? "created"
    : event === "BOOKING_RESCHEDULED" ? "rescheduled"
    : event === "BOOKING_CANCELLED" ? "cancelled"
    : event.toLowerCase();

  // 1. Upsert booking row (dedup on calBookingId).
  await db
    .insert(calBookings)
    .values({
      calBookingId: uid,
      eventType: p.type ?? null,
      status,
      attendeeName: attendee.name ?? null,
      attendeeEmail: attendee.email ?? null,
      attendeePhone: attendee.phoneNumber ?? null,
      startTime: p.startTime ? new Date(p.startTime) : null,
      endTime: p.endTime ? new Date(p.endTime) : null,
      timezone: attendee.timeZone ?? p.organizer?.timeZone ?? null,
      meetingUrl: p.meetingUrl ?? null,
      notes: p.additionalNotes ?? null,
      payload: body,
    })
    .onConflictDoUpdate({
      target: calBookings.calBookingId,
      set: {
        status,
        startTime: p.startTime ? new Date(p.startTime) : null,
        endTime: p.endTime ? new Date(p.endTime) : null,
        notes: p.additionalNotes ?? null,
        payload: body,
      },
    });

  // 2. Only create a lead on the initial BOOKING_CREATED — not on reschedules.
  let leadId: string | null = null;
  if (event === "BOOKING_CREATED" && attendee.email) {
    try {
      const [row] = await db
        .insert(leads)
        .values({
          name: attendee.name ?? "Cal.com booking",
          email: attendee.email,
          phone: attendee.phoneNumber ?? null,
          serviceInterest: null, // Cal.com event-type slug could map here later
          message:
            `[Cal.com booking — ${p.title ?? "Strategy call"}]\n` +
            `Slot: ${p.startTime ?? "?"} → ${p.endTime ?? "?"} (${attendee.timeZone ?? "tz?"})\n` +
            (p.additionalNotes ? `\nNotes:\n${p.additionalNotes}` : ""),
          ipHash: "cal-com-webhook",
          userAgent: "cal.com",
        })
        .returning({ id: leads.id });
      leadId = row?.id ?? null;
      if (leadId) {
        await db
          .update(calBookings)
          .set({ leadId })
          .where(eq(calBookings.calBookingId, uid));
      }
    } catch (err) {
      console.error("[cal-com] lead insert failed", err);
    }

    // 3. CAPI Lead event for ad-attribution. Fire-and-forget.
    void sendCapiEvent({
      eventName: "Lead",
      eventSourceUrl: `${SITE.url}/book`,
      userData: {
        email: attendee.email,
        phone: attendee.phoneNumber ?? null,
        externalId: uid,
        country: "bd",
      },
      customData: {
        content_name: "Cal.com booking",
        content_category: "booking",
        source: "cal.com",
        currency: "BDT",
        value: 0,
      },
    }).then((r) => {
      if (!r.ok && r.reason !== "no-token") {
        console.warn("[cal-com] capi failed:", r.reason, r.error);
      }
    });
  }

  return NextResponse.json({ ok: true, event, leadId, calBookingId: uid });
}
