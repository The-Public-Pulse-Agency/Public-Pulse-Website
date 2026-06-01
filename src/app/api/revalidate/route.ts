// Manual cache-bust endpoint. The "permanent fix" for stuck-cache classes
// of bugs (e.g. /blog showed 0 posts because unstable_cache was populated
// at build time with [] before DATABASE_URL was set, and revalidate:false
// meant the empty result stayed cached forever).
//
//   curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
//     "https://publicpulse.com.bd/api/revalidate?tag=blog"
//
// Pass either ?tag= or ?path= (or both) as query params. The SECRET
// MUST be in the Authorization header — query-string secrets leak into
// CloudFront access logs + CloudWatch and are recoverable from there.
// Same CRON_SECRET as /api/cron/digest. Fails CLOSED in production.

import { NextResponse } from "next/server";
import { revalidatePath, updateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getCronSecret(): string | null {
  if (process.env.CRON_SECRET) return process.env.CRON_SECRET;
  if (process.env.SST_RESOURCE_CRON_SECRET) return process.env.SST_RESOURCE_CRON_SECRET;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Resource } = require("sst");
    const v = Resource?.CRON_SECRET?.value;
    if (typeof v === "string" && v.length > 0) return v;
  } catch {
    /* sst not available */
  }
  return null;
}

function checkSecret(req: Request): boolean {
  const expected = getCronSecret();
  if (!expected) {
    if (process.env.NODE_ENV === "production") return false;
    return true;
  }
  // Header-only. Query-string secrets are logged by CloudFront + CloudWatch
  // and any actor with log access can replay them.
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${expected}`;
}

async function handle(req: Request): Promise<Response> {
  if (!checkSecret(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const tag = url.searchParams.get("tag");
  const path = url.searchParams.get("path");
  if (!tag && !path) {
    return NextResponse.json({ ok: false, error: "pass ?tag=name or ?path=/route" }, { status: 400 });
  }
  const done: { tag?: string; path?: string } = {};
  if (tag) {
    updateTag(tag);
    done.tag = tag;
  }
  if (path) {
    revalidatePath(path);
    done.path = path;
  }
  return NextResponse.json({ ok: true, revalidated: done, at: new Date().toISOString() });
}

export async function POST(req: Request): Promise<Response> {
  return handle(req);
}
// GET allowed so curl + browser visits work for quick admin use.
export async function GET(req: Request): Promise<Response> {
  return handle(req);
}
