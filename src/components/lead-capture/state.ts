"use client";

// Frequency-cap + dismiss state via localStorage (cheaper + more reliable
// than cookies for client-only suppression — no Set-Cookie roundtrip,
// stays per-browser, survives across tabs). One key per context for fine
// per-surface suppression, plus a global suppression key so once you've
// SUBSCRIBED, EVERY capture surface stops asking.

const PREFIX = "pp:lc:";
const GLOBAL_KEY = `${PREFIX}global`;

export type SuppressionReason = "subscribed" | "dismissed";

export type SuppressionRecord = {
  reason: SuppressionReason;
  /** Unix epoch ms. */
  at: number;
  /** When this suppression should be re-evaluated. */
  until?: number;
};

const SUBSCRIBED_TTL_MS = 365 * 24 * 60 * 60 * 1000; // a year
const DISMISSED_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const EXIT_INTENT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // exit-intent specifically: 7 days

function read(key: string): SuppressionRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SuppressionRecord;
    if (parsed.until && parsed.until < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function write(key: string, rec: SuppressionRecord): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(rec));
  } catch {
    /* storage full or disabled — silently ignore */
  }
}

/** Should this LeadCapture surface render? */
export function isSuppressed(context: string): boolean {
  if (typeof window === "undefined") return true; // SSR: always start hidden, hydrate to show
  if (read(GLOBAL_KEY)) return true;
  const local = read(`${PREFIX}${context}`);
  if (local) return true;
  return false;
}

/** Called from a one-shot effect after the visitor subscribes anywhere. */
export function markSubscribed(): void {
  write(GLOBAL_KEY, {
    reason: "subscribed",
    at: Date.now(),
    until: Date.now() + SUBSCRIBED_TTL_MS,
  });
}

/** Called when the user clicks the X / dismiss on a surface. */
export function dismissContext(context: string): void {
  const ttl = context === "exit-intent" ? EXIT_INTENT_TTL_MS : DISMISSED_TTL_MS;
  write(`${PREFIX}${context}`, {
    reason: "dismissed",
    at: Date.now(),
    until: Date.now() + ttl,
  });
}

/** Hand-coded clear (for test/debug). */
export function clearAll(): void {
  if (typeof window === "undefined") return;
  for (let i = window.localStorage.length - 1; i >= 0; i--) {
    const k = window.localStorage.key(i);
    if (k && k.startsWith(PREFIX)) window.localStorage.removeItem(k);
  }
}
