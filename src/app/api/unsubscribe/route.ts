// RFC 8058 one-click unsubscribe endpoint.
//
//   POST /api/unsubscribe?t=<token>
//   POST /api/unsubscribe   (body: List-Unsubscribe=One-Click, t=<token>)
//   GET  /api/unsubscribe?t=<token>   (delegates to /unsubscribe page)
//
// Gmail / Apple Mail / Outlook fire a POST with List-Unsubscribe=One-Click
// to the URL in the List-Unsubscribe header. We must respond 200 if the
// unsubscribe was honored (no UI; the mail client renders its own).

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { subscribers } from "@/db/schema";
import { tokensEqual } from "@/lib/email/tokens";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function doUnsubscribe(token: string): Promise<boolean> {
  if (!token || token.length > 200) return false;
  try {
    const [row] = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.unsubscribeToken, token))
      .limit(1);
    if (!row) return false;
    if (!tokensEqual(row.unsubscribeToken, token)) return false;
    if (row.status === "unsubscribed") return true; // idempotent
    await db
      .update(subscribers)
      .set({
        status: "unsubscribed",
        unsubscribedAt: new Date(),
      })
      .where(eq(subscribers.id, row.id));
    return true;
  } catch (err) {
    console.error("[unsubscribe-post] failed", err);
    return false;
  }
}

export async function POST(req: Request): Promise<Response> {
  const url = new URL(req.url);
  let token = url.searchParams.get("t") ?? "";

  // RFC 8058: clients may also send `List-Unsubscribe=One-Click` in the body
  // as application/x-www-form-urlencoded. Some Apple Mail builds include
  // the token in the body too.
  if (!token) {
    try {
      const ct = req.headers.get("content-type") ?? "";
      if (ct.includes("application/x-www-form-urlencoded")) {
        const text = await req.text();
        const params = new URLSearchParams(text);
        token = params.get("t") ?? "";
      }
    } catch {
      /* ignore */
    }
  }

  const ok = await doUnsubscribe(token);
  // Even on miss we 200 — mail clients don't differentiate, and we don't
  // want to leak token validity.
  return new NextResponse(ok ? "OK" : "OK", {
    status: 200,
    headers: { "cache-control": "no-store" },
  });
}

export async function GET(req: Request): Promise<Response> {
  // Browsers hitting the URL get redirected to the human-friendly page.
  const url = new URL(req.url);
  const token = url.searchParams.get("t") ?? "";
  return NextResponse.redirect(
    `${SITE.url}/unsubscribe${token ? `?t=${encodeURIComponent(token)}` : ""}`,
    { status: 302 }
  );
}
