#!/usr/bin/env tsx
//
// Smoke test for the blog generator pipeline. Runs Bedrock + gate against
// 4–8 hand-picked in-memory topics — no DB writes, no need for .env.staging.
// Used for the FIRST smoke run before the staging DB is wired.
//
// Usage:
//   AWS_PROFILE=eventpulse npx tsx scripts/smoke-generator.ts
//   AWS_PROFILE=eventpulse npx tsx scripts/smoke-generator.ts --bn        # BN only
//   AWS_PROFILE=eventpulse npx tsx scripts/smoke-generator.ts --print 1   # print full samples for topic indices

import { invokeModel, BEDROCK_MODEL_ID, BEDROCK_REGION } from "../src/lib/bedrock";
import { resolveGrounding } from "../src/lib/generator/grounding-resolver";
import { buildSystemPrompt, buildUserPrompt, EMIT_POST_TOOL } from "../src/lib/generator/prompts";
import { runQualityGate } from "../src/lib/quality-gate";

type FakeTopic = {
  id: string;
  topic: string;
  locale: "en" | "bn";
  category: string;
  targetKeyword: string | null;
  priority: number;
  status: string;
  groundingHint: object | null;
  groundingMatch: object | null;
  gateScores: object | null;
  postSlug: string | null;
  scheduledFor: Date | null;
  publishedAt: Date | null;
  faqJson: object | null;
  createdAt: Date;
  updatedAt: Date;
};

const NOW = new Date();
function fake(over: Partial<FakeTopic>): FakeTopic {
  return {
    id: "smoke-" + Math.random().toString(36).slice(2, 8),
    topic: "",
    locale: "en",
    category: "blog",
    targetKeyword: null,
    priority: 50,
    status: "queued",
    groundingHint: null,
    groundingMatch: null,
    gateScores: null,
    postSlug: null,
    scheduledFor: null,
    publishedAt: null,
    faqJson: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...over,
  };
}

// Hand-picked: mirrors the first few rows the real queue would pop.
// One per kind so we test each grounding pathway.
const ALL_TOPICS: FakeTopic[] = [
  fake({
    topic: "Political PR in Dhaka — buyer signals, channels and a budget framework",
    targetKeyword: "political pr dhaka",
    groundingHint: { service: "political-pr", location: "dhaka" },
  }),
  fake({
    topic: "Paid Ads for e-commerce brands in Bangladesh",
    targetKeyword: "paid ads for e-commerce",
    groundingHint: { service: "paid-ads", industry: "e-commerce" },
  }),
  fake({
    topic: "Hospitality marketing in Cox's Bazar — what hotels actually need",
    targetKeyword: "hospitality marketing cox's bazar",
    groundingHint: { service: "hospitality", location: "coxs-bazar" },
  }),
  fake({
    topic: "AEO — what Bangladeshi marketers need to know in 2026",
    targetKeyword: "answer engine optimization",
    groundingHint: { glossary: "aeo" },
  }),
  fake({
    topic: "Digital marketing in Chattogram — population, buyer behaviour and the channels that work",
    targetKeyword: "digital marketing chattogram",
    groundingHint: { location: "chattogram" },
  }),
  fake({
    topic: "What political PR actually costs in Bangladesh — a transparent budget breakdown",
    targetKeyword: "political pr pricing bangladesh",
    groundingHint: { service: "political-pr" },
  }),
  fake({
    topic: "Social Media — বাংলাদেশের জন্য সম্পূর্ণ গাইড",
    locale: "bn",
    targetKeyword: "social media",
    groundingHint: { service: "social-media", requires: "native-bn" },
  }),
  fake({
    topic: "SEO & website fundamentals — বাংলাদেশের ব্র্যান্ডদের জন্য",
    locale: "bn",
    targetKeyword: "seo website",
    groundingHint: { service: "seo-website", requires: "native-bn" },
  }),
];

function argHas(flag: string): boolean {
  return process.argv.includes(flag);
}
function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const onlyBn = argHas("--bn");
  const onlyEn = argHas("--en");
  const printIdxArg = argValue("--print");
  const printIdxs = printIdxArg ? printIdxArg.split(",").map(Number) : [];

  const TOPICS = ALL_TOPICS.filter((t) => (onlyBn ? t.locale === "bn" : onlyEn ? t.locale === "en" : true));

  console.log(`\n══ SMOKE — ${TOPICS.length} topics ══`);
  console.log(`Model:  ${BEDROCK_MODEL_ID}`);
  console.log(`Region: ${BEDROCK_REGION}\n`);

  let pass = 0;
  let fail = 0;
  let totalIn = 0;
  let totalOut = 0;
  const fullPayloads: Array<{ topic: string; locale: string; payload: unknown; gate: object }> = [];

  for (let i = 0; i < TOPICS.length; i += 1) {
    const t = TOPICS[i];
    const grounding = resolveGrounding(t as never);
    if (!grounding) {
      console.log(`[${i}] SKIP (null-grounding) — ${t.topic}`);
      continue;
    }
    const started = Date.now();
    let resp;
    try {
      resp = await invokeModel({
        system: buildSystemPrompt(t.locale),
        userMessage: buildUserPrompt({
          topic: t.topic,
          targetKeyword: t.targetKeyword,
          locale: t.locale,
          grounding,
        }),
        tools: [EMIT_POST_TOOL],
        toolChoice: { type: "tool", name: "emit_post" },
        temperature: 0.4,
      });
    } catch (err) {
      console.log(`[${i}] ERROR  ${t.locale}  ${t.topic.slice(0, 70)}  — ${(err as Error).message}`);
      fail += 1;
      continue;
    }

    const tu = resp.content.find((b) => b.type === "tool_use");
    if (!tu || tu.type !== "tool_use") {
      console.log(`[${i}] ERROR  no-tool-use`);
      fail += 1;
      continue;
    }
    const input = tu.input as Record<string, unknown>;
    const body = String(input.bodyMdx ?? "");
    const answer = String(input.answerFirst ?? "");
    const title = String(input.title ?? "");
    const faqs = (input.faqs ?? []) as { q: string; a: string }[];

    const gate = runQualityGate({
      title,
      answerBlock: answer,
      body,
      faqs,
      sourceRefs: grounding.refs,
    });

    const ms = Date.now() - started;
    totalIn += resp.usage.input_tokens;
    totalOut += resp.usage.output_tokens;

    const verdictColor = gate.verdict === "PUBLISH" ? "✓ PUBLISH" : "✗ REVIEW ";
    console.log(
      `[${i}] ${verdictColor}  score=${String(gate.score).padStart(3)}  ${t.locale}  ` +
        `tokens=${resp.usage.input_tokens}→${resp.usage.output_tokens}  ${ms}ms  ` +
        `${title.slice(0, 50)}${title.length > 50 ? "…" : ""}`
    );
    if (gate.hardFails.length) console.log(`        hardFails: ${gate.hardFails.join(" | ")}`);
    if (gate.softFails.length) console.log(`        softFails: ${gate.softFails.map((s) => s.rule).join(", ")}`);

    if (gate.verdict === "PUBLISH") pass += 1;
    else fail += 1;

    if (printIdxs.includes(i)) {
      fullPayloads.push({ topic: t.topic, locale: t.locale, payload: input, gate });
    }
  }

  console.log(`\n── totals ──`);
  console.log(`PUBLISH: ${pass} / ${TOPICS.length}   (${Math.round((pass / TOPICS.length) * 100)}% gate-pass rate)`);
  console.log(`REVIEW:  ${fail} / ${TOPICS.length}`);
  console.log(`Tokens:  in=${totalIn}   out=${totalOut}`);
  // Rough cost @ Haiku 4.5 us prices: in $0.80/MTok + out $4/MTok
  const cost = (totalIn / 1_000_000) * 0.8 + (totalOut / 1_000_000) * 4;
  console.log(`Cost:    ~$${cost.toFixed(4)} (Haiku 4.5 list price)`);

  if (fullPayloads.length > 0) {
    console.log(`\n══ FULL SAMPLES ══`);
    for (const s of fullPayloads) {
      console.log(`\n──── ${s.locale.toUpperCase()} — ${s.topic} ────`);
      const p = s.payload as Record<string, unknown>;
      console.log("title:        ", p.title);
      console.log("slug:         ", p.slug);
      console.log("excerpt:      ", p.excerpt);
      console.log("answerFirst:  ", p.answerFirst);
      console.log("seoTitle:     ", p.seoTitle);
      console.log("seoDescription:", p.seoDescription);
      console.log("readingTime:  ", p.readingTime);
      console.log("tags:         ", JSON.stringify(p.tags));
      console.log("");
      console.log("─── bodyMdx ───");
      console.log(p.bodyMdx);
      console.log("");
      console.log("─── faqs ───");
      for (const f of (p.faqs as { q: string; a: string }[]) ?? []) {
        console.log(`Q: ${f.q}`);
        console.log(`A: ${f.a}`);
        console.log("");
      }
      console.log("─── gate ───");
      console.log(JSON.stringify(s.gate, null, 2));
    }
  } else {
    console.log("\n(rerun with --print <comma-separated-indices> to dump full bodies)");
  }
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
