// The blog generator loop.
//
// Idempotent: skips topics that already produced a published post (linked by
// post_slug). Resumable: each topic is its own transaction.
//
// Cost-gated:
//   • GENERATOR_MAX_POSTS_PER_RUN (env, default 5) hard caps a single run.
//   • Topics with null grounding are skipped BEFORE any LLM call.
//   • If a topic returns ungroundable refs (resolver returns null), it flips
//     to "skipped" without spending tokens.

// Note: no `import "server-only"` — this module is also called by the CLI
// (scripts/generate.ts). Server-only behavior is enforced by the dependency
// chain (db client, next/cache) and by the surrounding admin auth check
// when invoked from a Server Action.
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { blogPosts, contentTopics, type ContentTopic } from "@/db/schema";
import { invokeModel, BEDROCK_MODEL_ID, BEDROCK_REGION, BEDROCK_MAX_TOKENS } from "@/lib/bedrock";
import { resolveGrounding, type ResolvedGrounding } from "./grounding-resolver";
import { buildSystemPrompt, buildUserPrompt, EMIT_POST_TOOL } from "./prompts";
import { runQualityGate, type GateResult } from "@/lib/quality-gate";
import { BLOG_TAG } from "@/lib/data/blog";
import { updateTag, revalidatePath } from "next/cache";
import { pingIndexNow } from "@/lib/indexnow";
import { SITE } from "@/lib/site";

export type GeneratorOptions = {
  maxPosts?: number;
  /** If true, never publishes — gate-pass posts go in as `draft` so you can
   *  review before they go live. */
  reviewFirst?: boolean;
  /** Restrict to a single locale (handy for the first BN smoke test). */
  locale?: "en" | "bn";
  /** Don't write to DB — return what would happen. */
  dryRun?: boolean;
  /** Optional restriction to specific topic IDs (overrides the auto-pull). */
  topicIds?: string[];
};

export type GeneratorReport = {
  modelId: string;
  region: string;
  considered: number;
  generated: number;
  published: number;
  reviewQueued: number;
  skipped: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  results: PerTopicResult[];
};

export type PerTopicResult = {
  topicId: string;
  topic: string;
  locale: string;
  outcome: "PUBLISH" | "REVIEW" | "SKIP" | "ERROR";
  reason?: string;
  postSlug?: string;
  gate?: GateResult;
  inputTokens?: number;
  outputTokens?: number;
};

const DEFAULT_MAX = Number(process.env.GENERATOR_MAX_POSTS_PER_RUN ?? 5);

export async function runGenerator(options: GeneratorOptions = {}): Promise<GeneratorReport> {
  const maxPosts = options.maxPosts ?? DEFAULT_MAX;
  const report: GeneratorReport = {
    modelId: BEDROCK_MODEL_ID,
    region: BEDROCK_REGION,
    considered: 0,
    generated: 0,
    published: 0,
    reviewQueued: 0,
    skipped: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    results: [],
  };

  const where = options.topicIds && options.topicIds.length > 0
    ? inArray(contentTopics.id, options.topicIds)
    : options.locale
    ? and(eq(contentTopics.status, "queued"), eq(contentTopics.locale, options.locale))
    : eq(contentTopics.status, "queued");

  const queue = await db
    .select()
    .from(contentTopics)
    .where(where)
    .orderBy(asc(contentTopics.priority), asc(contentTopics.createdAt))
    .limit(maxPosts * 2); // pull extra because some will get skipped pre-LLM

  for (const topic of queue) {
    if (report.generated >= maxPosts) break;
    report.considered += 1;
    const res = await processOne(topic, options);
    report.results.push(res);
    if (res.outcome === "SKIP" || res.outcome === "ERROR") {
      report.skipped += 1;
    } else {
      report.generated += 1;
      if (res.outcome === "PUBLISH") report.published += 1;
      else report.reviewQueued += 1;
    }
    report.totalInputTokens += res.inputTokens ?? 0;
    report.totalOutputTokens += res.outputTokens ?? 0;
  }

  return report;
}

async function processOne(
  topic: ContentTopic,
  options: GeneratorOptions
): Promise<PerTopicResult> {
  // 1. Hard-skip null grounding before any LLM call.
  const grounding = resolveGrounding(topic);
  if (!grounding) {
    if (!options.dryRun) {
      await db
        .update(contentTopics)
        .set({ status: "skipped", updatedAt: new Date() })
        .where(eq(contentTopics.id, topic.id));
    }
    return {
      topicId: topic.id,
      topic: topic.topic,
      locale: topic.locale,
      outcome: "SKIP",
      reason: "null-grounding",
    };
  }

  // 2. Already produced? Skip — idempotency.
  if (topic.postSlug) {
    return {
      topicId: topic.id,
      topic: topic.topic,
      locale: topic.locale,
      outcome: "SKIP",
      reason: "already-generated",
      postSlug: topic.postSlug,
    };
  }

  // 3. Invoke Bedrock with the tool-use contract.
  //    Retry once at 1.5x maxTokens if the first attempt hit max_tokens or
  //    produced a truncated tool_use payload (missing body or <3 FAQs).
  //    Cheaper than saving a doomed REVIEW post and regenerating from
  //    /manage by hand.
  const locale = (topic.locale === "bn" ? "bn" : "en") as "en" | "bn";
  const baseInvoke = {
    system: buildSystemPrompt(locale),
    userMessage: buildUserPrompt({
      topic: topic.topic,
      targetKeyword: topic.targetKeyword,
      locale,
      grounding,
    }),
    // Spread to drop the readonly markers `as const` puts on EMIT_POST_TOOL.
    tools: [{ ...EMIT_POST_TOOL }],
    toolChoice: { type: "tool", name: "emit_post" },
    temperature: 0.4,
  };

  // BN tokens are ~3-4x heavier per character. Give BN a higher ceiling on
  // both attempts to avoid the "structurally complete but faqs=[]" failure
  // mode where the model elides FAQs to stay under cap.
  const localeFactor = locale === "bn" ? 1.5 : 1;
  const attempts: { attempt: number; maxTokens: number }[] = [
    { attempt: 1, maxTokens: Math.round(BEDROCK_MAX_TOKENS * localeFactor) },
    { attempt: 2, maxTokens: Math.min(16000, Math.round(BEDROCK_MAX_TOKENS * localeFactor * 1.5)) },
  ];

  let bedrockResp;
  let toolUse;
  let payload: EmitPostInput | { error: string } | null = null;
  let lastFailReason = "";
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let usedAttempts = 0;

  for (const a of attempts) {
    usedAttempts = a.attempt;
    try {
      bedrockResp = await invokeModel({ ...baseInvoke, maxTokens: a.maxTokens });
    } catch (err) {
      return {
        topicId: topic.id,
        topic: topic.topic,
        locale: topic.locale,
        outcome: "ERROR",
        reason: `bedrock-error (attempt ${a.attempt}): ${(err as Error).message}`,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
      };
    }
    totalInputTokens += bedrockResp.usage.input_tokens;
    totalOutputTokens += bedrockResp.usage.output_tokens;

    toolUse = bedrockResp.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      lastFailReason = "no-tool-use-in-response";
      // No tool_use means stop_reason is usually "max_tokens" with text
      // overflow or a refusal — retry only if max_tokens.
      if (bedrockResp.stop_reason === "max_tokens" && a.attempt < attempts.length) continue;
      return {
        topicId: topic.id,
        topic: topic.topic,
        locale: topic.locale,
        outcome: "ERROR",
        reason: lastFailReason,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
      };
    }

    payload = parseEmitPostInput(toolUse.input);
    if ("error" in payload) {
      lastFailReason = `parse-error: ${payload.error}`;
      // Most parse errors here are "missing-required-field" from a
      // truncated tool_input — retry at higher max_tokens once.
      if (bedrockResp.stop_reason === "max_tokens" && a.attempt < attempts.length) continue;
      return {
        topicId: topic.id,
        topic: topic.topic,
        locale: topic.locale,
        outcome: "ERROR",
        reason: lastFailReason,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
      };
    }

    // Truncation heuristic: parser succeeded structurally but the content
    // is suspiciously thin — short body (<400 words) or <3 FAQs — and the
    // model spent most of the budget. Bedrock returns stop_reason="tool_use"
    // for completed tool calls even when output hits max_tokens mid-stream,
    // so we can't trust stop_reason alone. Use quality signals + a near-cap
    // output-tokens check as the trigger.
    const wordsInBody = payload.bodyMdx.split(/\s+/).filter(Boolean).length;
    const hitNearCap = bedrockResp.usage.output_tokens >= a.maxTokens * 0.95;
    const looksTruncated =
      (wordsInBody < 400 && hitNearCap) ||
      payload.faqs.length < 3;
    if (looksTruncated && a.attempt < attempts.length) {
      lastFailReason = `truncated-on-attempt-${a.attempt} (faqs=${payload.faqs.length}, words=${wordsInBody}, out=${bedrockResp.usage.output_tokens}/${a.maxTokens})`;
      continue;
    }
    break; // good — proceed to gate
  }

  if (!payload || "error" in payload || !toolUse) {
    return {
      topicId: topic.id,
      topic: topic.topic,
      locale: topic.locale,
      outcome: "ERROR",
      reason: lastFailReason || "unknown-failure",
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
    };
  }
  const attemptsTag = usedAttempts > 1 ? ` (retry-x${usedAttempts - 1})` : "";

  // 4. Run the quality gate.
  const gate = runQualityGate({
    title: payload.title,
    answerBlock: payload.answerFirst,
    body: payload.bodyMdx,
    faqs: payload.faqs,
    sourceRefs: grounding.refs,
  });

  // 5. Persist.
  const finalSlug = await ensureUniqueSlug(payload.slug, locale, options.dryRun ?? false);
  const willPublish = gate.verdict === "PUBLISH" && !options.reviewFirst;

  if (options.dryRun) {
    return {
      topicId: topic.id,
      topic: topic.topic,
      locale: topic.locale,
      outcome: willPublish ? "PUBLISH" : "REVIEW",
      reason: (gate.verdict === "PUBLISH" ? "dry-run-would-publish" : `gate:${gate.hardFails.join(",")||gate.score}`) + attemptsTag,
      postSlug: finalSlug,
      gate,
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
    };
  }

  const now = new Date();
  await db.insert(blogPosts).values({
    slug: finalSlug,
    locale,
    title: payload.title,
    excerpt: payload.excerpt,
    bodyMdx: payload.bodyMdx,
    heroImageUrl: null,
    categorySlug: grounding.suggestedCategorySlug,
    tags: Array.from(new Set([...(payload.tags ?? []), ...grounding.suggestedTags])).slice(0, 8),
    authorSlug: process.env.GENERATOR_DEFAULT_AUTHOR ?? "moshiur-rahman",
    status: willPublish ? "published" : "review",
    publishedAt: willPublish ? now : null,
    scheduledFor: null,
    faqJson: payload.faqs,
    answerFirst: payload.answerFirst,
    sourceRefs: grounding.refs,
    gateScores: gate as unknown as object,
    ogTitle: payload.seoTitle ?? payload.title,
    readingTime: payload.readingTime ?? Math.max(3, Math.round(payload.bodyMdx.split(/\s+/).length / 200)),
    seoTitle: payload.seoTitle,
    seoDescription: payload.seoDescription,
    targetKeyword: topic.targetKeyword,
  });

  await db
    .update(contentTopics)
    .set({
      status: willPublish ? "published" : "review",
      postSlug: finalSlug,
      gateScores: gate as unknown as object,
      groundingMatch: { kinds: grounding.kinds, refs: grounding.refs },
      faqJson: payload.faqs,
      publishedAt: willPublish ? now : null,
      updatedAt: now,
    })
    .where(eq(contentTopics.id, topic.id));

  if (willPublish) {
    // Refresh the public caches + IndexNow.
    try {
      updateTag(BLOG_TAG);
      revalidatePath("/blog");
      revalidatePath(`/blog/${finalSlug}`);
      await pingIndexNow([
        `${SITE.url}/blog`,
        `${SITE.url}/blog/${finalSlug}`,
      ]).catch(() => {});
    } catch {
      // Cache APIs can throw outside a request context (e.g. CLI script).
      // Public reads will simply pick up the new post on next revalidate.
    }
  }

  return {
    topicId: topic.id,
    topic: topic.topic,
    locale: topic.locale,
    outcome: willPublish ? "PUBLISH" : "REVIEW",
    reason: (willPublish ? "gate-pass" : `gate:${gate.hardFails.join(",") || `score-${gate.score}`}`) + attemptsTag,
    postSlug: finalSlug,
    gate,
    inputTokens: totalInputTokens,
    outputTokens: totalOutputTokens,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────

type EmitPostInput = {
  slug: string;
  title: string;
  excerpt: string;
  answerFirst: string;
  bodyMdx: string;
  faqs: { q: string; a: string }[];
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  readingTime?: number;
};

function parseEmitPostInput(raw: Record<string, unknown>): EmitPostInput | { error: string } {
  function asStr(k: string): string | null {
    const v = raw[k];
    return typeof v === "string" ? v : null;
  }
  function asFaqs(): { q: string; a: string }[] | null {
    const v = raw["faqs"];
    if (!Array.isArray(v)) return null;
    const out: { q: string; a: string }[] = [];
    for (const item of v) {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const q = typeof o.q === "string" ? o.q : null;
      const a = typeof o.a === "string" ? o.a : null;
      if (!q || !a) return null;
      out.push({ q, a });
    }
    return out;
  }
  const slug = asStr("slug");
  const title = asStr("title");
  const excerpt = asStr("excerpt");
  const answerFirst = asStr("answerFirst");
  const bodyMdx = asStr("bodyMdx");
  const faqs = asFaqs();
  if (!slug || !title || !excerpt || !answerFirst || !bodyMdx || !faqs) {
    return { error: "missing-required-field" };
  }
  const tagsRaw = raw["tags"];
  const tags = Array.isArray(tagsRaw)
    ? tagsRaw.filter((t): t is string => typeof t === "string")
    : undefined;
  const readingTimeRaw = raw["readingTime"];
  const readingTime = typeof readingTimeRaw === "number" ? Math.round(readingTimeRaw) : undefined;

  return {
    slug: slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 90),
    title,
    excerpt,
    answerFirst,
    bodyMdx,
    faqs,
    tags,
    seoTitle: asStr("seoTitle") ?? undefined,
    seoDescription: asStr("seoDescription") ?? undefined,
    readingTime,
  };
}

async function ensureUniqueSlug(baseSlug: string, locale: string, dryRun: boolean): Promise<string> {
  if (dryRun) return baseSlug;
  let candidate = baseSlug;
  let n = 1;
  // Cheap loop: at most a handful of retries in practice.
  while (true) {
    const [existing] = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, candidate), eq(blogPosts.locale, locale)))
      .limit(1);
    if (!existing) return candidate;
    n += 1;
    candidate = `${baseSlug}-${n}`;
    if (n > 20) return `${baseSlug}-${Date.now().toString(36)}`;
  }
}
