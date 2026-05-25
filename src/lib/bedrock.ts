// Bedrock runtime client for the blog generator.
//
// Model + region are read from env so we never hardcode an account-specific
// inference profile. Defaults pick the Haiku-class cross-region inference
// profile that works in the eventpulse account (us.* prefix → us-east-1).
//
// Why us-east-1 by default: at the time of writing, Haiku 4.5 in ap-southeast-1
// requires an inference profile that isn't yet available cross-region from
// our stack region; the us.* profile in us-east-1 has on-demand throughput
// and the same per-token billing.

// Note: no `import "server-only"` here because this module is also imported
// by scripts/generate.ts and scripts/smoke-generator.ts (Node CLI), which
// would throw at import time. The server-only boundary is enforced by the
// CALLERS of this module (src/lib/generator/run.ts, grounding-resolver.ts).
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

export const BEDROCK_REGION = process.env.BEDROCK_REGION ?? "us-east-1";
export const BEDROCK_MODEL_ID =
  process.env.BEDROCK_MODEL_ID ?? "us.anthropic.claude-haiku-4-5-20251001-v1:0";
/** Soft cap on output tokens for one generation. Bumped to 8000 because
 *  Bengali tokenization is ~3-4× heavier per character; a 600-word BN body
 *  + 3 FAQs + tags + seo fields routinely overflowed the previous 4096 cap. */
export const BEDROCK_MAX_TOKENS = Number(process.env.BEDROCK_MAX_TOKENS ?? 8000);
/** Per-call deadline (ms) before we abort and treat the call as hung.
 *  Default 90s — generous enough for BN posts that take ~30-60s to stream
 *  end-to-end, tight enough that a stalled socket (the STEP 16 issue) fails
 *  fast instead of silently sleeping forever. */
export const BEDROCK_TIMEOUT_MS = Number(process.env.BEDROCK_TIMEOUT_MS ?? 90_000);

let _client: BedrockRuntimeClient | null = null;
function client(): BedrockRuntimeClient {
  if (!_client) _client = new BedrockRuntimeClient({ region: BEDROCK_REGION });
  return _client;
}

export type BedrockToolUse = {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
};

export type BedrockTextBlock = { type: "text"; text: string };

export type BedrockResponse = {
  content: (BedrockToolUse | BedrockTextBlock)[];
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
};

export type InvokeArgs = {
  system: string;
  userMessage: string;
  /** Optional Anthropic-style tools array — used for reliable JSON output. */
  tools?: Array<{
    name: string;
    description: string;
    input_schema: Record<string, unknown>;
  }>;
  /** Force tool_choice (e.g. { type: "tool", name: "emit_post" }). */
  toolChoice?: Record<string, unknown>;
  maxTokens?: number;
  temperature?: number;
};

/** Thrown when a Bedrock call exceeds BEDROCK_TIMEOUT_MS (even after one
 *  retry). Has `name === "BedrockTimeoutError"` so callers can distinguish
 *  from generic SDK errors. */
export class BedrockTimeoutError extends Error {
  readonly attempts: number;
  readonly timeoutMs: number;
  constructor(attempts: number, timeoutMs: number) {
    super(`Bedrock call timed out after ${attempts} attempt(s) at ${timeoutMs}ms each`);
    this.name = "BedrockTimeoutError";
    this.attempts = attempts;
    this.timeoutMs = timeoutMs;
  }
}

async function sendOnce(command: InvokeModelCommand): Promise<BedrockResponse> {
  // Per-call deadline via AbortController. If the underlying HTTP socket
  // hangs (the STEP 16 stall mode — process sleeping with no progress for
  // 6+ minutes), the abort fires, the SDK rejects, and we surface the
  // failure instead of waiting forever.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BEDROCK_TIMEOUT_MS);
  try {
    const resp = await client().send(command, { abortSignal: controller.signal });
    const decoded = new TextDecoder().decode(resp.body);
    return JSON.parse(decoded) as BedrockResponse;
  } finally {
    clearTimeout(timer);
  }
}

function isAbortError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const name = (err as { name?: unknown }).name;
  // AWS SDK v3 throws { name: "AbortError" } when the abortSignal fires.
  // Different runtimes report it slightly differently — accept both.
  return name === "AbortError" || name === "TimeoutError" || name === "RequestAbortedException";
}

export async function invokeModel(args: InvokeArgs): Promise<BedrockResponse> {
  const body = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: args.maxTokens ?? BEDROCK_MAX_TOKENS,
    temperature: args.temperature ?? 0.4,
    system: args.system,
    messages: [{ role: "user", content: args.userMessage }],
    ...(args.tools && { tools: args.tools }),
    ...(args.toolChoice && { tool_choice: args.toolChoice }),
  };

  const command = new InvokeModelCommand({
    modelId: BEDROCK_MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(body),
  });

  // First attempt + one retry on timeout. Non-timeout errors (5xx, validation,
  // throttling) bubble immediately — the caller decides whether to retry the
  // whole call with different content. Two-attempt retry is timeout-specific
  // because hung sockets are usually transient; SDK-level errors usually
  // aren't.
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return await sendOnce(command);
    } catch (err) {
      if (isAbortError(err) && attempt < 2) {
        // Brief jitter so a regional micro-blip doesn't immediately repeat.
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }
      if (isAbortError(err)) {
        throw new BedrockTimeoutError(attempt, BEDROCK_TIMEOUT_MS);
      }
      throw err;
    }
  }
  // Unreachable — the loop above either returns or throws.
  throw new BedrockTimeoutError(2, BEDROCK_TIMEOUT_MS);
}
