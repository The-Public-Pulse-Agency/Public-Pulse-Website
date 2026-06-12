// Site search JSON endpoint. Powers the ⌘K command palette overlay.
//
//   GET /api/search?q=<query>&limit=8
//
// Cached for 5 minutes at the CDN edge so common queries hit edge cache.

import { NextResponse } from "next/server";
import { siteSearch } from "@/lib/site-search";

export const runtime = "nodejs";
export const revalidate = 300; // 5 min

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const limitRaw = url.searchParams.get("limit") ?? "8";
  const limit = Math.min(40, Math.max(1, parseInt(limitRaw, 10) || 8));

  if (q.trim().length < 2) {
    return NextResponse.json({ hits: [] });
  }

  const hits = await siteSearch(q, limit);
  return NextResponse.json(
    { hits },
    { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=600" } }
  );
}
