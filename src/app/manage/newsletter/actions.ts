"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { newsletterIssues, subscribers } from "@/db/schema";
import { buildAndPossiblySendDigest, sendIssue } from "@/lib/newsletter/digest";

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/manage/sign-in");
}

/** Build a fresh draft from posts since last sent issue. */
export async function buildDraftAction(): Promise<void> {
  await requireSession();
  await buildAndPossiblySendDigest({ autosend: false, createdBy: "manual" });
  revalidatePath("/manage/newsletter");
}

const updateSchema = z.object({
  subject: z.string().min(3).max(180),
  preheader: z.string().min(3).max(160),
  intro: z.string().min(10).max(2000),
});

export async function updateIssueAction(id: string, formData: FormData): Promise<void> {
  await requireSession();
  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => `${String(i.path[0])}: ${i.message}`).join("; "));
  }
  await db
    .update(newsletterIssues)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(newsletterIssues.id, id));
  revalidatePath("/manage/newsletter");
  revalidatePath(`/manage/newsletter/${id}`);
}

export async function sendIssueAction(id: string): Promise<void> {
  await requireSession();
  await sendIssue(id);
  revalidatePath("/manage/newsletter");
  revalidatePath(`/manage/newsletter/${id}`);
}

export async function deleteIssueAction(id: string): Promise<void> {
  await requireSession();
  const [row] = await db.select({ status: newsletterIssues.status }).from(newsletterIssues).where(eq(newsletterIssues.id, id)).limit(1);
  // Safety: don't delete an already-sent issue (keeps audit trail).
  if (!row || row.status === "sent" || row.status === "sending") {
    return;
  }
  await db.delete(newsletterIssues).where(eq(newsletterIssues.id, id));
  revalidatePath("/manage/newsletter");
}

/** Quick test send to the admin's own email for inbox QA. */
export async function testSendAction(id: string, formData: FormData): Promise<void> {
  await requireSession();
  const to = String(formData.get("to") ?? "").trim();
  if (!to) return;
  const [issue] = await db.select().from(newsletterIssues).where(eq(newsletterIssues.id, id)).limit(1);
  if (!issue) return;
  const { sendEmail } = await import("@/lib/email/send");
  const DigestEmail = (await import("@/emails/DigestEmail")).default;
  const { SITE } = await import("@/lib/site");
  await sendEmail({
    to,
    subject: `[TEST] ${issue.subject}`,
    react: DigestEmail({
      issueNumber: issue.issueNumber,
      preheader: issue.preheader,
      subject: issue.subject,
      intro: issue.intro,
      posts: issue.posts,
      email: to,
      unsubscribeUrl: `${SITE.url}/unsubscribe?t=test-token`,
      locale: "en",
    }),
    unsubscribeToken: "test-token",
    tags: [{ name: "type", value: "newsletter-test" }],
  });
}

/** Stats helper for /manage/newsletter index. */
export async function newsletterStats() {
  await requireSession();
  const [counts] = await db
    .select({
      total: subscribers.id,
    })
    .from(subscribers);
  void counts;
}
