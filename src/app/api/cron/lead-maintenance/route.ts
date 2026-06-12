// Lead-maintenance cron — daily 03:00 UTC.
//
//   1. Auto-archive leads that are unread and >90 days old. Keeps the
//      /manage/leads inbox readable without losing the row.
//   2. Email a weekly digest of NEW leads (Monday only) so you don't
//      have to check /manage manually.
//
// Triggered by EventBridge → /api/cron/trigger-lead-maintenance Lambda.

import { NextResponse } from "next/server";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { leads } from "@/db/schema";
import { sendEmail } from "@/lib/email/send";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getCronSecret(): string | null {
  if (process.env.CRON_SECRET) return process.env.CRON_SECRET;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Resource } = require("sst");
    return Resource?.CRON_SECRET?.value ?? null;
  } catch {
    return null;
  }
}
function checkAuth(req: Request): boolean {
  const expected = getCronSecret();
  if (!expected) return process.env.NODE_ENV !== "production";
  return (req.headers.get("authorization") ?? "") === `Bearer ${expected}`;
}

async function handle(req: Request): Promise<Response> {
  if (!checkAuth(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // 1. Auto-archive stale unread leads.
  const archived = await db
    .update(leads)
    .set({ archived: true })
    .where(and(eq(leads.read, false), eq(leads.archived, false), lte(leads.submittedAt, cutoff)))
    .returning({ id: leads.id });

  // 2. Weekly digest — Monday only.
  let digestSent = false;
  if (now.getUTCDay() === 1) {
    const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recent = await db
      .select({
        name: leads.name,
        email: leads.email,
        phone: leads.phone,
        service: leads.serviceInterest,
        message: leads.message,
        submittedAt: leads.submittedAt,
      })
      .from(leads)
      .where(and(eq(leads.archived, false), gte(leads.submittedAt, since)))
      .orderBy(desc(leads.submittedAt))
      .limit(50);

    if (recent.length > 0) {
      const body = recent
        .map(
          (l) =>
            `${l.name} (${l.email}${l.phone ? " · " + l.phone : ""}) — ${l.service ?? "no service selected"}\n` +
            `${(l.message || "").slice(0, 200)}${(l.message || "").length > 200 ? "…" : ""}\n` +
            `Received: ${new Date(l.submittedAt).toISOString()}`
        )
        .join("\n\n──────────\n\n");

      const html =
        `<p>You have <strong>${recent.length}</strong> new leads in the last 7 days.</p>` +
        `<p>Reply to this email to acknowledge, or open <a href="${SITE.url}/manage/leads">/manage/leads</a> for full context.</p>` +
        `<pre style="white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace;font-size:13px;line-height:1.5">${body
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</pre>`;

      const result = await sendEmail({
        to: SITE.contact.email,
        subject: `Weekly leads digest — ${recent.length} new`,
        html,
        unsubscribeToken: null,
        transactional: true,
        tags: [{ name: "type", value: "weekly-leads-digest" }],
      });
      digestSent = result.ok;
    }
  }

  return NextResponse.json({
    ok: true,
    archived: archived.length,
    digest_sent: digestSent,
    at: now.toISOString(),
  });
}

export async function POST(req: Request) { return handle(req); }
export async function GET(req: Request) { return handle(req); }
