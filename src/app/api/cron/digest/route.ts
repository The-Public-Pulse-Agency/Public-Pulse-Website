// Bi-weekly digest cron endpoint.
//
//   GET /api/cron/digest
//
// Triggered by SST Cron (see sst.config.ts). Defaults to drafting a new
// NewsletterIssue for admin review (created_by="cron-draft"). Set the env
// flag GENERATOR_AUTOSEND_DIGEST=true to flip cron firings into autosend
// mode (the issue is sent immediately + flipped to "sent").
//
// Auth: requires the CRON_SECRET to match either ?secret= or Bearer header.
// SST passes this in via env binding; manual triggers from the admin UI
// use a server action instead and bypass the secret.

import { NextResponse } from "next/server";
import { buildAndPossiblySendDigest } from "@/lib/newsletter/digest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function checkSecret(req: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return true; // dev mode — no secret required
  const url = new URL(req.url);
  const qp = url.searchParams.get("secret");
  if (qp && qp === expected) return true;
  const auth = req.headers.get("authorization") ?? "";
  if (auth === `Bearer ${expected}`) return true;
  return false;
}

export async function GET(req: Request): Promise<Response> {
  if (!checkSecret(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const autosend = process.env.GENERATOR_AUTOSEND_DIGEST === "true";
  try {
    const result = await buildAndPossiblySendDigest({
      autosend,
      createdBy: autosend ? "cron-auto" : "cron-draft",
    });
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("[cron/digest] failed", err);
    const message = err instanceof Error ? err.message : "unknown";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
