// Meta Conversions API (CAPI) client.
//
// Server-side companion to the Meta Pixel. When a meaningful event happens
// on the server (newsletter signup → Lead; confirm click → CompleteRegistration;
// contact form submit → Lead; WhatsApp opt-in → Lead) we POST it to Meta's
// Graph API with hashed user data.
//
// Why CAPI matters: iOS ITP + ad blockers strip the browser Pixel for a
// growing share of visitors. Server-side events restore the conversion
// signal Meta's ad-optimization needs.
//
// Setup (manual, one-time):
//   1. Meta Events Manager → your Dataset (Public Pulse Agency, ID 1992777924798448)
//      → Settings → Conversions API → Generate Access Token → copy
//   2. `sst secret set META_CAPI_ACCESS_TOKEN "<token>" --stage production`
//   3. (optional) For verification, Events Manager → Test Events → grab the
//      TEST<...> code, then:
//      `sst secret set META_CAPI_TEST_EVENT_CODE "<code>" --stage production`
//      Remove this once you've confirmed events arrive — leaving it routes
//      all events to the test stream instead of production.
//
// Docs:
//   • https://developers.facebook.com/docs/marketing-api/conversions-api
//   • https://developers.facebook.com/docs/marketing-api/conversions-api/parameters

import { createHash } from "node:crypto";

import { SITE } from "@/lib/site";

const GRAPH_API_VERSION = "v21.0";

/** Dataset to POST events to. Defaults to the Public Pulse Agency CAPI
 *  dataset (different from the pre-existing browser-Pixel ID
 *  SITE.tracking.metaPixel). Both can coexist; for client+server dedup
 *  they need to share the same ID. */
const DATASET_ID =
  process.env.META_CAPI_DATASET_ID || "1992777924798448";

function sha256(input: string): string {
  return createHash("sha256").update(input.toLowerCase().trim()).digest("hex");
}

function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

function hashOrUndefined(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const v = value.trim();
  if (!v) return undefined;
  return sha256(v);
}

export type CapiEventName =
  | "Lead"
  | "CompleteRegistration"
  | "Contact"
  | "Subscribe"
  | "ViewContent"
  | "Schedule";

export type CapiUserData = {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  country?: string | null;
  city?: string | null;
  /** Raw IPv4/IPv6 — Meta wants UNHASHED. */
  ipAddress?: string | null;
  /** UA string — UNHASHED. */
  userAgent?: string | null;
  /** Facebook click ID from _fbc cookie — UNHASHED. */
  fbc?: string | null;
  /** Facebook browser ID from _fbp cookie — UNHASHED. */
  fbp?: string | null;
  /** Your internal user id (subscriber UUID, etc.) — hashed before send. */
  externalId?: string | null;
};

export type CapiCustomData = Record<
  string,
  string | number | boolean | null | undefined
>;

export type CapiEventInput = {
  eventName: CapiEventName;
  /** Page URL that triggered this event. */
  eventSourceUrl: string;
  /** UTC unix seconds. Default: now. */
  eventTime?: number;
  /** Unique-per-event ID for client+server dedup. Default: random UUID. */
  eventId?: string;
  userData: CapiUserData;
  customData?: CapiCustomData;
  /** Default "website". Use "chat" for WhatsApp/Messenger events. */
  actionSource?: "website" | "app" | "chat" | "email" | "phone_call" | "system_generated" | "business_messaging" | "physical_store" | "other";
};

export type CapiSendResult =
  | { ok: true; eventsReceived: number; messages: string[]; fbtraceId?: string }
  | { ok: false; reason: "no-token" | "fetch-error" | "api-error"; error?: string };

/** Best-effort: send a single event. Failures are logged + swallowed —
 *  we never want a CAPI outage to break a form-submit Lambda. */
export async function sendCapiEvent(
  input: CapiEventInput
): Promise<CapiSendResult> {
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!token || token.startsWith("PENDING_")) {
    return { ok: false, reason: "no-token" };
  }

  const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE || undefined;

  const userData: Record<string, unknown> = {};
  const em = hashOrUndefined(input.userData.email);
  const ph = input.userData.phone
    ? sha256(normalizePhone(input.userData.phone))
    : undefined;
  const fn = hashOrUndefined(input.userData.firstName);
  const ln = hashOrUndefined(input.userData.lastName);
  const ct = hashOrUndefined(input.userData.city);
  const country = hashOrUndefined(input.userData.country);
  const externalId = hashOrUndefined(input.userData.externalId);
  if (em) userData.em = [em];
  if (ph) userData.ph = [ph];
  if (fn) userData.fn = [fn];
  if (ln) userData.ln = [ln];
  if (ct) userData.ct = [ct];
  if (country) userData.country = [country];
  if (externalId) userData.external_id = [externalId];
  if (input.userData.ipAddress) userData.client_ip_address = input.userData.ipAddress;
  if (input.userData.userAgent) userData.client_user_agent = input.userData.userAgent;
  if (input.userData.fbc) userData.fbc = input.userData.fbc;
  if (input.userData.fbp) userData.fbp = input.userData.fbp;

  const event = {
    event_name: input.eventName,
    event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
    event_id: input.eventId ?? cryptoRandomId(),
    event_source_url: input.eventSourceUrl,
    action_source: input.actionSource ?? "website",
    user_data: userData,
    ...(input.customData && Object.keys(input.customData).length > 0
      ? { custom_data: pruneUndefined(input.customData) }
      : {}),
  };

  const body: Record<string, unknown> = {
    data: [event],
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  };

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${DATASET_ID}/events?access_token=${encodeURIComponent(token)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      // CAPI requests should be fast; abort after 3s so a slow Meta
      // response doesn't tie up the form-submit Lambda.
      signal: AbortSignal.timeout(3000),
    });
    const json = (await res.json().catch(() => ({}))) as {
      events_received?: number;
      messages?: string[];
      fbtrace_id?: string;
      error?: { message?: string };
    };
    if (!res.ok) {
      console.warn(
        "[capi] api error",
        res.status,
        json?.error?.message ?? JSON.stringify(json)
      );
      return {
        ok: false,
        reason: "api-error",
        error: json?.error?.message ?? `HTTP ${res.status}`,
      };
    }
    return {
      ok: true,
      eventsReceived: json.events_received ?? 0,
      messages: json.messages ?? [],
      fbtraceId: json.fbtrace_id,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown";
    console.warn("[capi] fetch error", message);
    return { ok: false, reason: "fetch-error", error: message };
  }
}

function cryptoRandomId(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { randomUUID } = require("node:crypto") as typeof import("node:crypto");
  return randomUUID();
}

function pruneUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const k of Object.keys(obj) as (keyof T)[]) {
    if (obj[k] !== undefined && obj[k] !== null) out[k] = obj[k];
  }
  return out;
}

/** Extract _fbc / _fbp from a Cookie header. Used to thread the visitor's
 *  Facebook click+browser IDs through to CAPI for proper attribution. */
export function extractFbCookies(cookieHeader: string | null): {
  fbc?: string;
  fbp?: string;
} {
  if (!cookieHeader) return {};
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const eq = c.indexOf("=");
      if (eq === -1) return [c.trim(), ""];
      return [c.slice(0, eq).trim(), c.slice(eq + 1).trim()];
    })
  );
  return {
    fbc: cookies._fbc || undefined,
    fbp: cookies._fbp || undefined,
  };
}

/** Best-effort client IP from CloudFront / edge headers. */
export function extractClientIp(headers: Headers): string | undefined {
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    undefined
  );
}

void SITE;
