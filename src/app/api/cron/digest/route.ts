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
// SST passes the secret to this Lambda via the `link:` binding. The value
// is read via SST's Resource accessor (works) with a process.env fallback
// for local dev. Fails CLOSED in production — no secret found → 503.

import { NextResponse } from "next/server";
import { buildAndPossiblySendDigest } from "@/lib/newsletter/digest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Resolve CRON_SECRET from any available source. SST exposes linked
 *  secrets via the Resource accessor; OpenNext also bridges them as env
 *  vars in some configurations. Plain process.env works in local dev. */
function getCronSecret(): string | null {
  // Direct env (local dev + some Lambda runtimes)
  if (process.env.CRON_SECRET) return process.env.CRON_SECRET;
  // SST's resource-binding env naming
  if (process.env.SST_RESOURCE_CRON_SECRET) return process.env.SST_RESOURCE_CRON_SECRET;
  // SST Resource accessor (preferred, but requires the sst package + linked secret)
  try {
    // Dynamic require so the build doesn't fail in environments without `sst`.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Resource } = require("sst");
    const value = Resource?.CRON_SECRET?.value;
    if (typeof value === "string" && value.length > 0) return value;
  } catch {
    /* sst not installed at runtime — fall through */
  }
  return null;
}

function checkSecret(req: Request): boolean {
  const expected = getCronSecret();
  if (!expected) {
    // Production: fail CLOSED. Dev only opens up when NODE_ENV !== production.
    if (process.env.NODE_ENV === "production") return false;
    return true;
  }
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
