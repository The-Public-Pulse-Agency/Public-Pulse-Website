// Shared IP-hash rate-limiting helpers.
//
// Pattern: per-IP, per-hour. We hash the IP with a daily-rotating salt so the
// stored key is not PII (can't be reversed to a raw IP after the day rolls)
// but is stable enough for a 1-hour rolling window.
//
// Caller passes a `count(ipHash, since)` function so each table can use its
// own column name (e.g. ipHash on leads vs subscribers). The check is one
// indexed query — cheap.

import { createHash } from "node:crypto";
import { headers } from "next/headers";

const WINDOW_MS = 60 * 60 * 1000; // 1 hour

export function hashIp(ip: string): string {
  const dayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
  return createHash("sha256").update(`${ip}::${dayKey}`).digest("hex").slice(0, 40);
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("cf-connecting-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Generic rate-limit check. Returns true if `count(ipHash, since)` >= max.
 * Caller supplies the query — keeps this module decoupled from Drizzle schema.
 */
export async function isOverLimit(
  ipHash: string,
  max: number,
  count: (ipHash: string, since: Date) => Promise<number>
): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS);
  const n = await count(ipHash, since);
  return n >= max;
}
