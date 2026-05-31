"use server";

// Contact-form server action.
//
// IMPORTANT — this is the ONLY write path on the public site. It MUST:
//   • validate server-side (never trust the client)
//   • drop honeypot submissions silently (don't tell bots they were detected)
//   • rate-limit by hashed IP + payload signature against the leads table
//   • write the lead to Neon
//   • notify info@publicpulse.com.bd via Resend
//   • return a Cache-Control: no-store response (Next handles this for actions)
//
// We do NOT call revalidateTag here — leads don't show on public pages.

import { headers } from "next/headers";
import { createHash } from "node:crypto";
import { Resend } from "resend";
import { eq, and, gte } from "drizzle-orm";
import { db } from "@/db/client";
import { leads } from "@/db/schema";
import { contactSchema, type ContactActionResult, type ContactInput } from "@/lib/contact-schema";
import { SITE } from "@/lib/site";
import { getService } from "@/lib/services";
import { extractFbCookies, sendCapiEvent } from "@/lib/meta-capi";

// One Resend client per Lambda container (reused across warm invocations).
// Lazy init so `next build` / typecheck doesn't require the API key to be set.
let _resend: Resend | null = null;
function resend(): Resend {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  _resend = new Resend(key);
  return _resend;
}

/** Hash an IP with a daily-rotating salt so we get dedup without storing PII. */
function hashIp(ip: string): string {
  const dayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
  return createHash("sha256").update(`${ip}::${dayKey}`).digest("hex").slice(0, 40);
}

/** Best-effort client IP from CloudFront / edge headers. */
async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("cf-connecting-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

/** Reject if this IP has submitted ≥3 leads in the last hour. Cheap; one indexed query. */
async function isRateLimited(ipHash: string): Promise<boolean> {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await db
    .select({ id: leads.id })
    .from(leads)
    .where(and(eq(leads.ipHash, ipHash), gte(leads.submittedAt, since)))
    .limit(3);
  return recent.length >= 3;
}

export async function submitContact(
  input: ContactInput
): Promise<ContactActionResult> {
  // 1. Validate
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof ContactInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof ContactInput | undefined;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors };
  }

  const data = parsed.data;

  // 2. Honeypot — silent success so bots learn nothing
  if (data.website && data.website.length > 0) {
    return { ok: true };
  }

  // 3. Rate limit (per-IP per-hour)
  const h = await headers();
  const userAgent = h.get("user-agent") ?? null;
  const ipHash = hashIp(await clientIp());

  if (await isRateLimited(ipHash)) {
    return {
      ok: false,
      error: "You've sent us a few messages already. We'll be in touch shortly.",
    };
  }

  // 4. Persist
  const [row] = await db
    .insert(leads)
    .values({
      name: data.name,
      email: data.email,
      phone: data.phone?.trim() || null,
      serviceInterest: data.serviceInterest ?? null,
      message: data.message,
      ipHash,
      userAgent,
    })
    .returning({ id: leads.id });

  // 5. Notify via Resend (best effort — if Resend fails the lead is still saved)
  try {
    const fromName = "Public Pulse Website";
    const fromAddr = process.env.RESEND_FROM_EMAIL ?? SITE.contact.email;
    const replyTo = process.env.RESEND_REPLY_TO ?? data.email;

    const result = await resend().emails.send({
      from: `${fromName} <${fromAddr}>`,
      to: [SITE.contact.email],
      replyTo,
      subject: `New lead — ${data.name} (${serviceLabel(data.serviceInterest)})`,
      text: composeLeadEmail({ ...data, leadId: row?.id }),
    });

    if (result.error) {
      console.error("[contact] Resend send failed (lead still persisted)", {
        leadId: row?.id,
        err: result.error,
      });
    }
  } catch (err) {
    console.error("[contact] Resend threw (lead still persisted)", {
      leadId: row?.id,
      err: err instanceof Error ? err.message : String(err),
    });
  }

  // CAPI Lead event — highest-value conversion the agency cares about.
  // Split the name into first/last for better Meta match-rate.
  const [firstName, ...lastParts] = (data.name ?? "").trim().split(/\s+/);
  const lastName = lastParts.join(" ");
  const fbCookies = extractFbCookies(h.get("cookie"));
  void sendCapiEvent({
    eventName: "Lead",
    eventSourceUrl: `${SITE.url}/contact`,
    userData: {
      email: data.email,
      phone: data.phone?.trim() || null,
      firstName: firstName || null,
      lastName: lastName || null,
      ipAddress: (await clientIp()) !== "unknown" ? await clientIp() : null,
      userAgent,
      fbc: fbCookies.fbc,
      fbp: fbCookies.fbp,
      externalId: data.email,
      country: "bd",
    },
    customData: {
      content_name: `Contact form — ${serviceLabel(data.serviceInterest)}`,
      content_category: "contact-form",
      service_interest: data.serviceInterest ?? "not-specified",
      currency: "BDT",
      value: 0,
    },
  }).then((r) => {
    if (!r.ok && r.reason !== "no-token") {
      console.warn("[contact] capi failed:", r.reason, r.error);
    }
  });

  return { ok: true };
}

// ─── helpers ─────────────────────────────────────────────────────────────

function serviceLabel(slug: string | null | undefined): string {
  if (!slug || slug === "not-sure") return "not specified";
  return getService(slug)?.shortName ?? slug;
}

function composeLeadEmail(d: ContactInput & { leadId?: string }): string {
  return [
    `New lead via publicpulse.com.bd/contact`,
    ``,
    `Name:         ${d.name}`,
    `Email:        ${d.email}`,
    `Phone:        ${d.phone || "—"}`,
    `Service:      ${serviceLabel(d.serviceInterest)}`,
    `Lead ID:      ${d.leadId ?? "—"}`,
    ``,
    `Message:`,
    `${d.message}`,
    ``,
    `Manage all leads: ${SITE.url}/manage/leads`,
  ].join("\n");
}
