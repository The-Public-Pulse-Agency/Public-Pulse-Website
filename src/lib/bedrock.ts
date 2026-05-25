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

  const resp = await client().send(command);
  const decoded = new TextDecoder().decode(resp.body);
  return JSON.parse(decoded) as BedrockResponse;
}
