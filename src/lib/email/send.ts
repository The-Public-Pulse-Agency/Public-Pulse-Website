// Resend send wrapper. Single boundary so every transactional / newsletter
// send has consistent List-Unsubscribe + List-Unsubscribe-Post headers
// (RFC 8058 one-click) and consistent From / Reply-To addressing.
//
// Inputs are intentionally minimal — pass a react-email React node and the
// recipient address; we render to HTML + plain text and ship it.

import { render } from "@react-email/render";
import { Resend } from "resend";
import type { ReactElement } from "react";
import { SITE } from "@/lib/site";

let _resend: Resend | null = null;
function client(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}

export type SendArgs = {
  to: string;
  subject: string;
  /** React-email tree. We render to HTML and to plain text. */
  react?: ReactElement;
  /** Pre-rendered HTML body (used by cron jobs that don't want to spin up
   *  a React tree just to send one email). Provide either `react` OR `html`. */
  html?: string;
  /** Subscriber unsubscribe token — REQUIRED for any email going to a
   *  subscriber-table recipient (digest, welcome). For purely transactional
   *  sends (e.g. admin auth) pass null and we omit the List-Unsubscribe
   *  headers. */
  unsubscribeToken: string | null;
  /** Set true for genuinely transactional sends (confirmation) so we add
   *  Auto-Submitted: auto-generated. */
  transactional?: boolean;
  /** Tags forwarded to Resend for the dashboard. */
  tags?: Array<{ name: string; value: string }>;
  /** Optional override; defaults to noreply@<domain>. */
  fromOverride?: string;
};

export type SendResult =
  | { ok: true; id: string | null }
  | { ok: false; error: string };

export async function sendEmail(args: SendArgs): Promise<SendResult> {
  const r = client();
  if (!r) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }
  if (!args.react && !args.html) {
    return { ok: false, error: "send: react or html required" };
  }
  const html = args.html ?? (await render(args.react!));
  const text = args.react
    ? await render(args.react, { plainText: true })
    : args.html!.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  const fromAddr = args.fromOverride
    ?? process.env.RESEND_FROM_EMAIL
    ?? `Public Pulse <${SITE.contact.email}>`;
  const replyTo = process.env.RESEND_REPLY_TO ?? SITE.contact.email;

  const headers: Record<string, string> = {};
  if (args.unsubscribeToken) {
    const unsubUrl = `${SITE.url}/api/unsubscribe?t=${encodeURIComponent(args.unsubscribeToken)}`;
    const mailto = `mailto:unsubscribe@publicpulse.com.bd?subject=unsubscribe`;
    // RFC 2369 + RFC 8058 — Gmail/Apple/Outlook all read this. The two-value
    // form (mailto + https) lets clients pick whichever they handle natively.
    headers["List-Unsubscribe"] = `<${mailto}>, <${unsubUrl}>`;
    // RFC 8058: declares the https URL as a one-click POST endpoint, so
    // Gmail/Apple show their own native unsubscribe UI alongside our email.
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }
  if (args.transactional) {
    headers["Auto-Submitted"] = "auto-generated";
  }

  try {
    const res = await r.emails.send({
      from: fromAddr.includes("<") ? fromAddr : `Public Pulse <${fromAddr}>`,
      to: [args.to],
      replyTo,
      subject: args.subject,
      html,
      text,
      headers,
      tags: args.tags,
    });
    if ("error" in res && res.error) {
      return { ok: false, error: res.error.message ?? "send failed" };
    }
    return { ok: true, id: res.data?.id ?? null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown send error";
    return { ok: false, error: message };
  }
}
