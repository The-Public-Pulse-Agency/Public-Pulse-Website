#!/usr/bin/env tsx
//
// Blog generator CLI. Run with:
//
//   # Small smoke batch (default 8 posts, mixed locales):
//   AWS_PROFILE=eventpulse npx tsx scripts/generate.ts --max 8
//
//   # EN only / BN only:
//   AWS_PROFILE=eventpulse npx tsx scripts/generate.ts --max 5 --locale en
//
//   # Review-first (publishes nothing — every gate-pass goes to /manage/blog as draft):
//   AWS_PROFILE=eventpulse npx tsx scripts/generate.ts --max 3 --review-first
//
//   # Dry-run (no DB writes, no Bedrock spend? — it still calls Bedrock, but
//   #         doesn't persist. Use to inspect output quality):
//   AWS_PROFILE=eventpulse npx tsx scripts/generate.ts --max 2 --dry-run
//
// Env this needs:
//   AWS_PROFILE (or default chain) for Bedrock + SDK
//   DATABASE_URL_DIRECT for Drizzle reads/writes (loaded from .env.staging
//     by default — pass --env <path> to override)
//   BEDROCK_MODEL_ID (optional)  — defaults to us.anthropic.claude-haiku-4-5-...
//   BEDROCK_REGION   (optional)  — defaults to us-east-1
//
// Stops on the per-run cap; safe to re-run (idempotent — already-generated
// topics are short-circuited).

import { config as loadEnv } from "dotenv";
import { resolve } from "path";

function parseArgs() {
  const args = process.argv.slice(2);
  const out: { max?: number; locale?: "en" | "bn"; reviewFirst?: boolean; dryRun?: boolean; env?: string; topicIds?: string[] } = {};
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === "--max") out.max = Number(args[++i]);
    else if (a === "--locale") out.locale = args[++i] === "bn" ? "bn" : "en";
    else if (a === "--review-first") out.reviewFirst = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--env") out.env = args[++i];
    else if (a === "--topics") out.topicIds = args[++i].split(",").filter(Boolean);
  }
  return out;
}

async function main() {
  const argv = parseArgs();
  const envPath = argv.env ?? resolve(process.cwd(), ".env.staging");
  loadEnv({ path: envPath });
  // Drizzle reads DATABASE_URL at module load (HTTP driver). The CLI script
  // needs the DIRECT URL because the pooled URL refuses long-lived sessions.
  if (process.env.DATABASE_URL_DIRECT && !process.env.DATABASE_URL) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_DIRECT;
  }
  if (!process.env.DATABASE_URL) {
    console.error(
      `error: DATABASE_URL not set. Looked in ${envPath}. Pass --env <path> or set in shell.`
    );
    process.exit(1);
  }

  // Dynamic import — Drizzle client + run.ts both rely on env being set.
  const { runGenerator } = await import("../src/lib/generator/run");

  const report = await runGenerator({
    maxPosts: argv.max ?? 8,
    locale: argv.locale,
    reviewFirst: argv.reviewFirst,
    dryRun: argv.dryRun,
    topicIds: argv.topicIds,
  });

  // Headline numbers
  console.log("\n══════════════ GENERATOR REPORT ══════════════");
  console.log(`Model:           ${report.modelId}`);
  console.log(`Region:          ${report.region}`);
  console.log(`Considered:      ${report.considered}`);
  console.log(`Generated:       ${report.generated}`);
  console.log(`  → published:   ${report.published}`);
  console.log(`  → review:      ${report.reviewQueued}`);
  console.log(`Skipped/errors:  ${report.skipped}`);
  const gates = report.results.filter((r) => r.gate);
  if (gates.length > 0) {
    const pass = gates.filter((r) => r.gate!.verdict === "PUBLISH").length;
    const avg = Math.round(gates.reduce((a, r) => a + r.gate!.score, 0) / gates.length);
    console.log(`Gate pass rate:  ${pass}/${gates.length} (${Math.round((pass / gates.length) * 100)}%)`);
    console.log(`Avg gate score:  ${avg}`);
  }
  console.log(`Total tokens:    in=${report.totalInputTokens}  out=${report.totalOutputTokens}`);
  console.log("\nPer-topic results:");
  for (const r of report.results) {
    const score = r.gate ? `score=${r.gate.score}` : "";
    const fails = r.gate?.hardFails.length ? `hardFails=[${r.gate.hardFails.join("|")}]` : "";
    console.log(`  [${r.outcome.padEnd(7)}] ${r.locale} ${r.topic.slice(0, 70)}`);
    if (r.postSlug) console.log(`              → /blog/${r.postSlug}`);
    if (r.reason) console.log(`              reason: ${r.reason}`);
    if (score || fails) console.log(`              ${score} ${fails}`);
  }
  console.log("═══════════════════════════════════════════════\n");
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
