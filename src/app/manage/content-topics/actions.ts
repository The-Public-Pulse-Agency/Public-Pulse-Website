"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { contentTopics } from "@/db/schema";

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/manage/sign-in");
}

function refresh() {
  revalidatePath("/manage/content-topics");
  revalidatePath("/manage");
}

export async function createTopicAction(formData: FormData) {
  await requireSession();
  const topic = String(formData.get("topic") ?? "").trim();
  const locale = String(formData.get("locale") ?? "en");
  const category = String(formData.get("category") ?? "blog").trim();
  const targetKeyword = String(formData.get("targetKeyword") ?? "").trim() || null;
  const priorityRaw = Number(formData.get("priority") ?? 100);
  const groundingRaw = String(formData.get("groundingHint") ?? "").trim();

  if (!topic || !category) return;

  let groundingHint: unknown = null;
  if (groundingRaw) {
    try {
      groundingHint = JSON.parse(groundingRaw);
    } catch {
      // Allow plain-text shortcut: convert "service:political-pr" → { service: "political-pr" }.
      const m = groundingRaw.match(/^(\w+):(.+)$/);
      groundingHint = m ? { [m[1]]: m[2].trim() } : { note: groundingRaw };
    }
  }

  // Hard gate: a topic without grounding never enters the queue — it goes
  // straight to "skipped" so the generator never spends LLM tokens on it.
  const status = groundingHint ? "queued" : "skipped";

  await db.insert(contentTopics).values({
    topic,
    locale,
    category,
    targetKeyword,
    priority: Number.isFinite(priorityRaw) ? priorityRaw : 100,
    status,
    groundingHint: groundingHint as object | null,
  });
  refresh();
}

export async function setTopicStatusAction(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("next") ?? "");
  const allowed = new Set(["queued", "generated", "published", "review", "skipped"]);
  if (!id || !allowed.has(next)) return;
  await db.update(contentTopics).set({ status: next, updatedAt: new Date() }).where(eq(contentTopics.id, id));
  refresh();
}

export async function deleteTopicAction(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.delete(contentTopics).where(eq(contentTopics.id, id));
  refresh();
}

/** Generate ONE specific topic via Bedrock (synchronous — admin clicks the
 *  button and waits). Heavy work; expect 10–25 seconds per post. */
export async function generateNowAction(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { runGenerator } = await import("@/lib/generator/run");
  await runGenerator({ maxPosts: 1, topicIds: [id], reviewFirst: true });
  refresh();
}

/** Generate the next N queued topics in priority order. Default N=3 to keep
 *  the synchronous request under ~60s. For larger runs use the CLI. */
export async function runBatchAction(formData: FormData) {
  await requireSession();
  const n = Math.min(5, Math.max(1, Number(formData.get("n") ?? 3)));
  const locale = String(formData.get("locale") ?? "");
  const reviewFirst = String(formData.get("reviewFirst") ?? "1") === "1";
  const { runGenerator } = await import("@/lib/generator/run");
  await runGenerator({
    maxPosts: n,
    locale: locale === "en" || locale === "bn" ? locale : undefined,
    reviewFirst,
  });
  refresh();
}

export async function bulkSkipNullGrounding() {
  await requireSession();
  // Move any queued topic with null grounding to skipped — the generator
  // would refuse them anyway; this just makes the queue UI honest.
  await db
    .update(contentTopics)
    .set({ status: "skipped", updatedAt: new Date() })
    .where(eq(contentTopics.status, "queued"));
  refresh();
}

export async function bulkRequeueAction(formData: FormData) {
  await requireSession();
  const ids = formData.getAll("id").map(String).filter(Boolean);
  if (ids.length === 0) return;
  await db
    .update(contentTopics)
    .set({ status: "queued", updatedAt: new Date() })
    .where(inArray(contentTopics.id, ids));
  refresh();
}
