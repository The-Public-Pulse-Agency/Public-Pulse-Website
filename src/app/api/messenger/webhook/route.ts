// Facebook Messenger Platform webhook.
//
//   GET  /api/messenger/webhook   — Meta verification handshake
//   POST /api/messenger/webhook   — inbound event delivery
//
// Setup (in Meta Business Suite → your App → Messenger → Settings → Webhooks):
//   • Callback URL:  https://publicpulse.com.bd/api/messenger/webhook
//   • Verify token:  paste the value of MESSENGER_VERIFY_TOKEN (a string YOU
//                    choose, e.g. `openssl rand -hex 32`)
//   • Subscribe to:  messages, messaging_postbacks, messaging_optins,
//                    message_deliveries (optional), message_reads (optional)
//   • Subscribe the Page to the App (step 2 in Meta's UI).
//
// Secrets required:
//   MESSENGER_VERIFY_TOKEN      — used ONCE during webhook verification
//   MESSENGER_PAGE_ACCESS_TOKEN — used to send replies back to users
//   MESSENGER_APP_SECRET        — used to HMAC-verify every inbound POST
//
// Set them with:
//   sst secret set MESSENGER_VERIFY_TOKEN      "$(openssl rand -hex 32)" --stage production
//   sst secret set MESSENGER_PAGE_ACCESS_TOKEN "<token from Meta>"       --stage production
//   sst secret set MESSENGER_APP_SECRET        "<app secret from Meta>"  --stage production
//
// Docs:
//   • https://developers.facebook.com/docs/messenger-platform/webhooks
//   • https://developers.facebook.com/docs/graph-api/webhooks/getting-started/webhooks-for-messenger

import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

import { db } from "@/db/client";
import { messengerEvents, type NewMessengerEvent } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── GET: verification handshake ───────────────────────────────────────
// Meta calls with `?hub.mode=subscribe&hub.verify_token=<TOKEN>&hub.challenge=<RND>`.
// We must echo `hub.challenge` (plain text, 200) iff the verify_token matches.

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const expected = process.env.MESSENGER_VERIFY_TOKEN;
  if (!expected) {
    console.error("[messenger] MESSENGER_VERIFY_TOKEN not configured");
    return new NextResponse("misconfigured", { status: 500 });
  }
  if (mode !== "subscribe" || token !== expected) {
    console.warn("[messenger] verification rejected: mode=%s", mode);
    return new NextResponse("forbidden", { status: 403 });
  }
  if (!challenge) {
    return new NextResponse("missing challenge", { status: 400 });
  }

  return new NextResponse(challenge, {
    status: 200,
    headers: { "content-type": "text/plain" },
  });
}

// ─── POST: event delivery ──────────────────────────────────────────────
// Meta POSTs a JSON envelope of events. We MUST:
//   1. Verify the `x-hub-signature-256` header (HMAC-SHA256 with APP_SECRET).
//   2. Respond 200 quickly (<10s) regardless of downstream success.
//   3. Insert each individual message into messenger_events (jsonb raw).
//
// Note: when APP_SECRET isn't set we accept everything (dev mode). In
// production it MUST be set or we drop every event with 401.

type MessengerEntry = {
  id: string; // page id
  time?: number;
  messaging?: Array<{
    sender?: { id?: string };
    recipient?: { id?: string };
    timestamp?: number;
    message?: {
      mid?: string;
      text?: string;
      attachments?: unknown[];
      is_echo?: boolean;
    };
    postback?: { title?: string; payload?: string; mid?: string };
    delivery?: { mids?: string[]; watermark?: number };
    read?: { watermark?: number };
    optin?: { ref?: string };
  }>;
};

type MessengerPayload = {
  object?: string;
  entry?: MessengerEntry[];
};

function verifySignature(raw: string, headerValue: string | null): boolean {
  const appSecret = process.env.MESSENGER_APP_SECRET;
  if (!appSecret) {
    // No secret configured → accept (local dev). In production we set it.
    return true;
  }
  if (!headerValue || !headerValue.startsWith("sha256=")) return false;
  const expected = "sha256=" + createHmac("sha256", appSecret).update(raw, "utf8").digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(headerValue);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function classifyEvent(m: NonNullable<MessengerEntry["messaging"]>[number]): string {
  if (m.message) return m.message.is_echo ? "message_echo" : "message";
  if (m.postback) return "postback";
  if (m.delivery) return "delivery";
  if (m.read) return "read";
  if (m.optin) return "messaging_optins";
  return "other";
}

export async function POST(req: Request): Promise<Response> {
  // Read body as text first so we can HMAC-verify before parsing.
  let raw: string;
  try {
    raw = await req.text();
  } catch (e) {
    console.warn("[messenger] body read failed", e);
    return new NextResponse("bad request", { status: 400 });
  }

  if (!verifySignature(raw, req.headers.get("x-hub-signature-256"))) {
    console.warn("[messenger] HMAC verification failed");
    return new NextResponse("forbidden", { status: 401 });
  }

  let payload: MessengerPayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new NextResponse("invalid json", { status: 400 });
  }

  if (payload.object !== "page" || !Array.isArray(payload.entry)) {
    // Acknowledge anyway — Meta retries on non-200 and we don't want a
    // delivery storm because of an unknown object type.
    return NextResponse.json({ ok: true });
  }

  const rows: NewMessengerEvent[] = [];
  for (const entry of payload.entry) {
    const pageId = entry.id;
    for (const m of entry.messaging ?? []) {
      const eventType = classifyEvent(m);
      rows.push({
        eventType,
        pageId,
        senderId: m.sender?.id ?? null,
        recipientId: m.recipient?.id ?? null,
        messageId: m.message?.mid ?? m.postback?.mid ?? null,
        text: m.message?.text ?? m.postback?.title ?? null,
        raw: m,
        handled: false,
        fbTimestamp: m.timestamp ? new Date(m.timestamp) : null,
      });
    }
  }

  if (rows.length > 0) {
    try {
      // onConflictDoNothing on (message_id) — if Meta retries the same mid,
      // the second insert is a no-op. Postbacks/delivery/read get inserted
      // without dedup (messageId is null for some of these).
      await db.insert(messengerEvents).values(rows).onConflictDoNothing();
    } catch (e) {
      console.error("[messenger] insert failed", e);
      // Still return 200 to Meta — we don't want them to disable the
      // subscription. The error is logged for our side.
    }
  }

  return NextResponse.json({ ok: true });
}
