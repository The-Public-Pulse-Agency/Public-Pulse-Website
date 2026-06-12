// Auto-publisher cron — flips status='scheduled' → 'published' for any
// blog post whose scheduledFor has passed. Runs every 15 min.
//
// Triggered by EventBridge → /api/cron/trigger-auto-publish Lambda →
// HTTPS POST to this route. CRON_SECRET in Authorization header.
//
// Idempotent: re-running the same minute is a no-op (status check).

import { NextResponse } from "next/server";
import { revalidatePath, updateTag } from "next/cache";
import { and, eq, isNotNull, lte } from "drizzle-orm";

import { db } from "@/db/client";
import { blogPosts } from "@/db/schema";
import { BLOG_TAG } from "@/lib/data/blog";
import { pingIndexNow } from "@/lib/indexnow";
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
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${expected}`;
}

async function handle(req: Request): Promise<Response> {
  if (!checkAuth(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find scheduled posts whose time has come.
  const ready = await db
    .select({ id: blogPosts.id, slug: blogPosts.slug, locale: blogPosts.locale })
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.status, "scheduled"),
        isNotNull(blogPosts.scheduledFor),
        lte(blogPosts.scheduledFor, now)
      )
    )
    .limit(50);

  if (ready.length === 0) {
    return NextResponse.json({ ok: true, published: 0, at: now.toISOString() });
  }

  // Flip status to published in a single batch.
  const ids = ready.map((p) => p.id);
  await db
    .update(blogPosts)
    .set({ status: "published", publishedAt: now, updatedAt: now })
    .where(and(eq(blogPosts.status, "scheduled")));
  void ids;

  // Refresh public caches + ping IndexNow for each newly-published URL.
  updateTag(BLOG_TAG);
  revalidatePath("/blog");
  revalidatePath("/");
  for (const p of ready) {
    revalidatePath(`/blog/${p.slug}`);
  }
  void pingIndexNow(
    ready.map((p) => `${SITE.url}/blog/${p.slug}`).concat([`${SITE.url}/blog`])
  ).catch(() => {});

  return NextResponse.json({
    ok: true,
    published: ready.length,
    slugs: ready.map((p) => p.slug),
    at: now.toISOString(),
  });
}

export async function POST(req: Request) { return handle(req); }
export async function GET(req: Request) { return handle(req); }
