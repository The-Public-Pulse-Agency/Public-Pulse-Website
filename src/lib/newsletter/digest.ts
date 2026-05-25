// Digest builder. Compiles posts published since the last sent issue into a
// draft NewsletterIssue. Idempotent — a duplicate cron firing the same minute
// will write a fresh draft (admin can delete duplicates from /manage).
//
// If env GENERATOR_AUTOSEND_DIGEST=true, the draft is sent immediately AND
// the row is flipped to "sent". Default is draft-only so admin can review.

import { and, desc, eq, gt, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  blogPosts,
  blogCategories,
  subscribers,
  newsletterIssues,
  newsletterSends,
  type DigestPostRef,
  type NewsletterIssue,
} from "@/db/schema";
import { SITE } from "@/lib/site";
import { sendEmail } from "@/lib/email/send";
import DigestEmail from "@/emails/DigestEmail";

export const DEFAULT_DIGEST_POSTS = 5;

/** Find the cutoff: most recent successfully-sent issue's sentAt, or
 *  14 days ago if no issues have ever been sent. */
async function getCutoff(): Promise<Date> {
  const [last] = await db
    .select({ sentAt: newsletterIssues.sentAt })
    .from(newsletterIssues)
    .where(and(eq(newsletterIssues.status, "sent"), isNotNull(newsletterIssues.sentAt)))
    .orderBy(desc(newsletterIssues.sentAt))
    .limit(1);
  if (last?.sentAt) return last.sentAt;
  return new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
}

async function nextIssueNumber(): Promise<number> {
  const [row] = await db
    .select({ max: sql<number>`coalesce(max(issue_number), 0)::int` })
    .from(newsletterIssues);
  return (row?.max ?? 0) + 1;
}

/** Build the post snapshot from the blog DB. */
async function snapshotRecentPosts(since: Date, limit: number): Promise<DigestPostRef[]> {
  const rows = await db
    .select({
      slug: blogPosts.slug,
      title: blogPosts.title,
      excerpt: blogPosts.excerpt,
      heroImageUrl: blogPosts.heroImageUrl,
      categorySlug: blogPosts.categorySlug,
      readingTime: blogPosts.readingTime,
      publishedAt: blogPosts.publishedAt,
    })
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.status, "published"),
        eq(blogPosts.locale, "en"),
        gt(blogPosts.publishedAt, since)
      )
    )
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit);

  // Resolve category nameEn for display
  const categoryRows = await db.select().from(blogCategories);
  const catMap = new Map(categoryRows.map((c) => [c.slug, c.nameEn]));

  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    category: catMap.get(r.categorySlug) ?? r.categorySlug,
    url: `${SITE.url}/blog/${r.slug}`,
    readingTime: r.readingTime,
    heroUrl: r.heroImageUrl ?? `${SITE.url}/og?title=${encodeURIComponent(r.title)}&eyebrow=${encodeURIComponent(catMap.get(r.categorySlug) ?? r.categorySlug)}`,
  }));
}

export type BuildDigestResult =
  | { kind: "skipped-no-posts" }
  | { kind: "drafted"; issue: NewsletterIssue }
  | { kind: "sent"; issue: NewsletterIssue; sentCount: number; failedCount: number };

/** Build (and optionally send) a digest. The default behavior is "drafted"
 *  so admins can review. AUTOSEND env flag promotes to "sent". */
export async function buildAndPossiblySendDigest(args: {
  autosend: boolean;
  /** "cron-auto" | "cron-draft" | "manual" — written to created_by. */
  createdBy: "cron-auto" | "cron-draft" | "manual";
  /** Override post-cap (default 5). */
  limit?: number;
}): Promise<BuildDigestResult> {
  const cutoff = await getCutoff();
  const posts = await snapshotRecentPosts(cutoff, args.limit ?? DEFAULT_DIGEST_POSTS);
  if (posts.length === 0) {
    return { kind: "skipped-no-posts" };
  }

  const issueNo = await nextIssueNumber();
  const featured = posts[0]!;

  // Subject + preheader + intro — drafted from the actual post list. Admin
  // can edit before send via /manage/newsletter.
  const subject = featured.title;
  const preheader = `Issue № ${String(issueNo).padStart(2, "0")} — ${featured.excerpt.slice(0, 110)}`;
  const intro =
    posts.length === 1
      ? `One new piece from the studio this fortnight. Read below — and reply if you want a deeper look.`
      : `${posts.length} new pieces from the studio this fortnight, led by "${featured.title}". The rest are below.`;

  const [issue] = await db
    .insert(newsletterIssues)
    .values({
      issueNumber: issueNo,
      subject,
      preheader,
      intro,
      posts,
      status: args.autosend ? "sending" : "draft",
      createdBy: args.createdBy,
    })
    .returning();

  if (!args.autosend) return { kind: "drafted", issue };

  const { sentCount, failedCount } = await sendIssue(issue.id);
  const [refreshed] = await db
    .select()
    .from(newsletterIssues)
    .where(eq(newsletterIssues.id, issue.id))
    .limit(1);

  return { kind: "sent", issue: refreshed ?? issue, sentCount, failedCount };
}

/** Send a drafted issue to every confirmed subscriber. Per-recipient row
 *  in newsletter_sends prevents duplicates on retries. */
export async function sendIssue(
  issueId: string
): Promise<{ sentCount: number; failedCount: number }> {
  const [issue] = await db
    .select()
    .from(newsletterIssues)
    .where(eq(newsletterIssues.id, issueId))
    .limit(1);
  if (!issue) throw new Error("issue not found");

  await db
    .update(newsletterIssues)
    .set({ status: "sending", updatedAt: new Date() })
    .where(eq(newsletterIssues.id, issueId));

  const subs = await db
    .select({
      id: subscribers.id,
      email: subscribers.email,
      unsubscribeToken: subscribers.unsubscribeToken,
      locale: subscribers.locale,
    })
    .from(subscribers)
    .where(eq(subscribers.status, "confirmed"));

  let sentCount = 0;
  let failedCount = 0;

  // Throttle gently — 5 concurrent sends max to avoid Resend rate-limits.
  const concurrency = 5;
  let i = 0;
  async function worker() {
    while (i < subs.length) {
      const idx = i++;
      const s = subs[idx];
      const unsubscribeUrl = `${SITE.url}/unsubscribe?t=${encodeURIComponent(s.unsubscribeToken)}`;
      try {
        // Skip if already attempted for this issue (idempotency).
        const [existing] = await db
          .select({ id: newsletterSends.id, status: newsletterSends.status })
          .from(newsletterSends)
          .where(and(eq(newsletterSends.issueId, issueId), eq(newsletterSends.subscriberId, s.id)))
          .limit(1);
        if (existing && existing.status === "sent") {
          sentCount++;
          continue;
        }

        const result = await sendEmail({
          to: s.email,
          subject: issue.subject,
          react: DigestEmail({
            issueNumber: issue.issueNumber,
            preheader: issue.preheader,
            subject: issue.subject,
            intro: issue.intro,
            posts: issue.posts,
            email: s.email,
            unsubscribeUrl,
            locale: s.locale === "bn" ? "bn" : "en",
          }),
          unsubscribeToken: s.unsubscribeToken,
          tags: [
            { name: "type", value: "newsletter-digest" },
            { name: "issue", value: String(issue.issueNumber) },
          ],
        });

        if (existing) {
          await db
            .update(newsletterSends)
            .set({
              status: result.ok ? "sent" : "failed",
              providerId: result.ok ? result.id : null,
              error: result.ok ? null : result.error,
              sentAt: new Date(),
            })
            .where(eq(newsletterSends.id, existing.id));
        } else {
          await db.insert(newsletterSends).values({
            issueId,
            subscriberId: s.id,
            status: result.ok ? "sent" : "failed",
            providerId: result.ok ? result.id : null,
            error: result.ok ? null : result.error,
            sentAt: new Date(),
          });
        }

        if (result.ok) sentCount++;
        else failedCount++;
      } catch (e) {
        failedCount++;
        console.warn("[digest] send loop error", e);
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, subs.length) }, () => worker());
  await Promise.all(workers);

  await db
    .update(newsletterIssues)
    .set({
      status: "sent",
      sentCount,
      failedCount,
      sentAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(newsletterIssues.id, issueId));

  return { sentCount, failedCount };
}
