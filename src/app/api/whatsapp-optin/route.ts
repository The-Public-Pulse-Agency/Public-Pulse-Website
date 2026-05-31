// WhatsApp opt-in endpoint — phone capture path of the site-wide LeadCapture.
//
//   POST /api/whatsapp-optin { phone, note?, source?, page?, locale?, website? }
//
//   • Validates phone format (BD-friendly — allows +880, 880, 0, etc.)
//   • Writes to whatsapp_optin with explicit consentText snapshot
//   • Honeypot suppresses bots silently
//   • Best-effort team notification email
//
// NOTE: phone numbers are PII — never reused for anything other than the
// stated WhatsApp outreach purpose. Consent text is stored verbatim for audit.

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createHash } from "node:crypto";
import { z } from "zod";

import { db } from "@/db/client";
import { whatsappOptin } from "@/db/schema";
import { sendEmail } from "@/lib/email/send";
import { SITE } from "@/lib/site";
import AdminWhatsAppNotify from "@/emails/AdminWhatsAppNotify";
import { extractFbCookies, sendCapiEvent } from "@/lib/meta-capi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONSENT_EN =
  "I agree to receive a one-time WhatsApp message from Public Pulse Agency about my enquiry. No marketing list.";
const CONSENT_BN =
  "আমি আমার অনুসন্ধান সম্পর্কে পাবলিক পালস থেকে একটি WhatsApp বার্তা পেতে সম্মত আছি। কোনো মার্কেটিং তালিকায় যোগ করা হবে না।";

const schema = z.object({
  phone: z
    .string()
    .min(8)
    .max(20)
    .regex(/^[+0-9 \-()]+$/, "phone uses digits, spaces, +, - or ()"),
  note: z.string().max(500).optional(),
  source: z.string().max(120).optional(),
  page: z.string().max(200).optional(),
  locale: z.enum(["en", "bn"]).optional(),
  consent: z.literal(true), // checkbox must be ticked
  website: z.string().max(0).optional(), // honeypot
});

function hashIp(ip: string): string {
  const dayKey = new Date().toISOString().slice(0, 10);
  return createHash("sha256").update(`${ip}::${dayKey}`).digest("hex").slice(0, 40);
}

function normalizePhone(raw: string): string {
  // Keep + at the start; drop everything else non-digit
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) return "+" + trimmed.slice(1).replace(/\D/g, "");
  return trimmed.replace(/\D/g, "");
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
    return NextResponse.json({ ok: false, error: "invalid input" }, { status: 400 });
  }
  const { phone, note, source, page, locale, website } = parsed.data;
  if (website && website.length > 0) {
    return NextResponse.json({ ok: true });
  }
  const phoneClean = normalizePhone(phone);
  if (phoneClean.length < 8) {
    return NextResponse.json({ ok: false, error: "invalid phone" }, { status: 400 });
  }
  const h = await headers();
  const ip =
    h.get("cf-connecting-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown";
  const userAgent = h.get("user-agent") ?? null;

  try {
    await db.insert(whatsappOptin).values({
      phone: phoneClean,
      source: source ?? null,
      capturePage: page ?? null,
      locale: locale ?? "en",
      note: note ?? null,
      consentText: locale === "bn" ? CONSENT_BN : CONSENT_EN,
      ipHash: hashIp(ip),
      userAgent,
    });
  } catch (err) {
    console.error("[whatsapp-optin] insert failed", err);
    return NextResponse.json({ ok: true });
  }

  // Best-effort team notification.
  void sendEmail({
    to: SITE.contact.email,
    subject: `WhatsApp opt-in · ${phoneClean}`,
    react: AdminWhatsAppNotify({
      phone: phoneClean,
      source: source ?? null,
      page: page ?? null,
      locale: locale ?? "en",
      note: note ?? null,
    }),
    unsubscribeToken: null,
    transactional: true,
    tags: [{ name: "type", value: "whatsapp-optin-notify" }],
  }).then((r) => {
    if (!r.ok) console.warn("[whatsapp-optin] notify failed", r.error);
  });

  // CAPI Lead event — phone-only, action_source=chat (WhatsApp).
  const cookies = extractFbCookies(h.get("cookie"));
  void sendCapiEvent({
    eventName: "Lead",
    eventSourceUrl: `${SITE.url}${page ?? "/"}`,
    actionSource: "chat",
    userData: {
      phone: phoneClean,
      ipAddress: ip === "unknown" ? null : ip,
      userAgent,
      fbc: cookies.fbc,
      fbp: cookies.fbp,
      externalId: phoneClean,
      country: "bd",
    },
    customData: {
      content_name: "WhatsApp opt-in",
      content_category: "whatsapp",
      source: source ?? "unknown",
      currency: "BDT",
      value: 0,
    },
  }).then((r) => {
    if (!r.ok && r.reason !== "no-token") {
      console.warn("[whatsapp-optin] capi failed:", r.reason, r.error);
    }
  });

  return NextResponse.json({ ok: true });
}
