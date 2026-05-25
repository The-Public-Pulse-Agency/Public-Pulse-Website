// Tokens for double opt-in + one-click unsubscribe.
//
// confirmToken: single-use; consumed when the user clicks the link in
//   ConfirmEmail. Cleared from the row on success.
// unsubscribeToken: durable; included in every send so the recipient can
//   one-click out from any message.
//
// Both are URL-safe random strings — no signing/HMAC because the tokens
// are themselves the secret (read from DB, compared in constant time).

import { randomBytes, timingSafeEqual } from "node:crypto";

export function newToken(byteLength = 24): string {
  // base64url, no padding — URL-safe, ~32 chars at 24 bytes.
  return randomBytes(byteLength).toString("base64url");
}

export function tokensEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
