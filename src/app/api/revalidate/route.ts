// Manual cache-bust endpoint. The "permanent fix" for stuck-cache classes
// of bugs (e.g. /blog showed 0 posts because unstable_cache was populated
// at build time with [] before DATABASE_URL was set, and revalidate:false
// meant the empty result stayed cached forever).
//
//   POST /api/revalidate?tag=blog&secret=<CRON_SECRET>
//   POST /api/revalidate?path=/blog&secret=<CRON_SECRET>
//
// Pass either ?tag= or ?path= (or both). Auth is the same CRON_SECRET used
// by /api/cron/digest. Fails CLOSED in production.

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
  const url = new URL(req.url);
  const qp = url.searchParams.get("secret");
  if (qp && qp === expected) return true;
  const auth = req.headers.get("authorization") ?? "";
  if (auth === `Bearer ${expected}`) return true;
  return false;
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
