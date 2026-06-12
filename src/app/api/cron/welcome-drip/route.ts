// Welcome-drip cron — daily 08:00 UTC.
//
// Sends staged emails to confirmed subscribers based on time-since-confirm
// + their current dripStage:
//   D1  → "Start here" playbook
//   D7  → a case-study spotlight
//   D21 → soft pitch + booking link
//
// Each send advances dripStage so we don't re-send. Status must be
// 'confirmed' (unsubscribed are skipped).

import { NextResponse } from "next/server";
import { and, eq, gte, lte, isNotNull, or, lt } from "drizzle-orm";

import { db } from "@/db/client";
import { subscribers } from "@/db/schema";
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

type DripCopy = { subject: string; preheader: string; htmlBody: string };

function copyForStage(stage: 1 | 2 | 3, email: string, unsubToken: string): DripCopy {
  const unsubUrl = `${SITE.url}/unsubscribe?t=${encodeURIComponent(unsubToken)}`;
  const footer = `
    <hr style="border:none;border-top:1px solid #e3e3e3;margin:32px 0" />
    <p style="font-size:12px;color:#5d5d5d;line-height:1.5">
      You're getting this because you confirmed your Public Pulse subscription.
      <a href="${unsubUrl}" style="color:#5d5d5d">Unsubscribe</a> · ${SITE.contact.legal.bin ?? ""}
    </p>`;

  if (stage === 1) {
    return {
      subject: "Start here — the Bangladesh marketing playbook",
      preheader: "Three things every BD brand should fix this quarter.",
      htmlBody: `
        <p>Welcome to the Public Pulse Digest.</p>
        <p>Before the next issue lands, here are the three things every Bangladesh brand should sort first — distilled from 50+ campaigns we've run from Dhaka:</p>
        <ol>
          <li><strong>Meta Pixel + CAPI together.</strong> Browser-only Pixel undercounts ~20% of conversions in BD because of in-app browser quirks. CAPI fills the gap.</li>
          <li><strong>Local-language creative even on Bangla-English bilingual targeting.</strong> CTR jumps 2–3× on creative that mixes scripts where your audience actually does.</li>
          <li><strong>One number per campaign.</strong> "More awareness" isn't a goal. Pick one (CPL, CPM, ROAS) and instrument it weekly.</li>
        </ol>
        <p>Want a free 30-min audit on any of these? Reply to this email or <a href="${SITE.url}/book">book a slot</a>.</p>
        ${footer}`,
    };
  }
  if (stage === 2) {
    return {
      subject: "How a Dhaka hotel went from 15% to 47% direct bookings",
      preheader: "Real numbers from a 90-day paid + content campaign.",
      htmlBody: `
        <p>Quick one — the most-asked question we get is "does this stuff actually work in Bangladesh?"</p>
        <p>This is a recent campaign we ran for a Dhaka hospitality client:</p>
        <ul>
          <li><strong>Before:</strong> 15% direct bookings, 85% via OTAs (Booking.com, Agoda — high commission)</li>
          <li><strong>90 days in:</strong> 47% direct, OTA dependency cut in half</li>
          <li><strong>What changed:</strong> Meta CAPI setup → improved Pixel match rate 38% → 71% · landing-page Bangla creative · WhatsApp click-to-chat on every ad</li>
        </ul>
        <p>Read the full case study and similar wins on <a href="${SITE.url}/case-studies">our work page</a>, or reply to this email if you want to talk about applying the same playbook.</p>
        ${footer}`,
    };
  }
  return {
    subject: "Three weeks in — what would help next?",
    preheader: "Free 30-min call if any of this resonates.",
    htmlBody: `
      <p>You've been with the Digest for three weeks now. If any of the playbooks have sparked an "I wish someone would just do this for us" thought — that's literally what we do.</p>
      <p>Some of the things people most commonly book us for:</p>
      <ul>
        <li>Paid ads on Meta + Google (BDT 60k+/month retainer)</li>
        <li>Political PR + election readiness (90-day playbook)</li>
        <li>SEO + landing pages that actually convert in Bangladesh</li>
        <li>Analytics setup — CAPI, GA4, attribution that survives iOS 14</li>
      </ul>
      <p>If you'd like to chat — <a href="${SITE.url}/book">book a free 30-min strategy call</a> or reply with what you're trying to fix and I'll come back within a day.</p>
      <p>Either way, the Digest keeps landing every other week. Thanks for reading.</p>
      ${footer}`,
  };
}

async function handle(req: Request): Promise<Response> {
  if (!checkAuth(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const d1 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const d21 = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);

  // Each row gets exactly ONE drip per cron run. Limit batch size to
  // protect Resend rate limits.
  const STAGE_RULES = [
    { stage: 1 as const, ageBefore: d1, ageAfter: d7 }, // confirmed ≥1d ago AND <7d ago
    { stage: 2 as const, ageBefore: d7, ageAfter: d21 },
    { stage: 3 as const, ageBefore: d21, ageAfter: null },
  ];

  let totalSent = 0;
  const errors: string[] = [];

  for (const rule of STAGE_RULES) {
    const ageConditions = [
      lte(subscribers.confirmedAt, rule.ageBefore),
      ...(rule.ageAfter ? [gte(subscribers.confirmedAt, rule.ageAfter)] : []),
    ];

    const rows = await db
      .select({
        id: subscribers.id,
        email: subscribers.email,
        unsubscribeToken: subscribers.unsubscribeToken,
        dripStage: subscribers.dripStage,
      })
      .from(subscribers)
      .where(
        and(
          eq(subscribers.status, "confirmed"),
          isNotNull(subscribers.confirmedAt),
          lt(subscribers.dripStage, rule.stage),
          ...ageConditions
        )
      )
      .limit(25);

    for (const row of rows) {
      const copy = copyForStage(rule.stage, row.email, row.unsubscribeToken);
      try {
        const result = await sendEmail({
          to: row.email,
          subject: copy.subject,
          html: `<!-- ${copy.preheader} -->${copy.htmlBody}`,
          unsubscribeToken: row.unsubscribeToken,
          transactional: false,
          tags: [
            { name: "type", value: "welcome-drip" },
            { name: "stage", value: `d${rule.stage}` },
          ],
        });
        if (result.ok) {
          await db
            .update(subscribers)
            .set({ dripStage: rule.stage, dripLastAt: now })
            .where(eq(subscribers.id, row.id));
          totalSent++;
        } else {
          errors.push(`${row.email}: ${result.error ?? "unknown"}`);
        }
      } catch (err) {
        errors.push(`${row.email}: ${(err as Error).message}`);
      }
    }
  }
  void or;

  return NextResponse.json({
    ok: true,
    sent: totalSent,
    errors: errors.slice(0, 10),
    at: now.toISOString(),
  });
}

export async function POST(req: Request) { return handle(req); }
export async function GET(req: Request) { return handle(req); }
