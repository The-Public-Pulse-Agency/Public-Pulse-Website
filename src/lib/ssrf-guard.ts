// SSRF defenses for tools that fetch user-supplied URLs.
//
// Threat model: the /tools/seo-audit endpoint runs inside an AWS Lambda
// that can reach AWS metadata service (169.254.169.254) for IAM creds, or
// any internal IP if the Lambda is ever moved into a VPC. An attacker who
// can supply a URL must NOT be able to point us at private space.
//
// Defense layers (all required):
//   1. URL parse + protocol/port allowlist (http(s), 80/443).
//   2. DNS resolve the host and reject if ANY resolved address is private.
//   3. Pin the fetch to the validated IP via a custom `lookup` callback
//      so DNS-rebinding can't swap the address between resolve and connect.
//   4. Cap response body size to prevent OOM.
//   5. Disable automatic redirects; caller decides whether to follow + revalidate.

import { lookup as dnsLookupCb } from "node:dns";
import { promisify } from "node:util";
import { Agent, fetch as undiciFetch } from "undici";

const dnsLookup = promisify(dnsLookupCb);

const ALLOW_PORTS = new Set([80, 443]);
const MAX_BODY_BYTES = 1_048_576; // 1 MB — plenty for a homepage HTML

// IPv4 CIDR matcher. Each range = [base, mask-bits].
const IPV4_BLOCKED: Array<[string, number]> = [
  ["0.0.0.0", 8],      // "this network"
  ["10.0.0.0", 8],     // RFC1918
  ["100.64.0.0", 10],  // CGNAT
  ["127.0.0.0", 8],    // loopback
  ["169.254.0.0", 16], // link-local incl. 169.254.169.254 (AWS IMDS)
  ["172.16.0.0", 12],  // RFC1918
  ["192.0.0.0", 24],   // protocol assignments
  ["192.0.2.0", 24],   // TEST-NET-1
  ["192.168.0.0", 16], // RFC1918
  ["198.18.0.0", 15],  // benchmarking
  ["198.51.100.0", 24],// TEST-NET-2
  ["203.0.113.0", 24], // TEST-NET-3
  ["224.0.0.0", 4],    // multicast
  ["240.0.0.0", 4],    // reserved
];

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const v = parseInt(p, 10);
    if (!Number.isInteger(v) || v < 0 || v > 255) return null;
    n = (n << 8) | v;
  }
  // Force unsigned (JS bitwise is signed 32-bit).
  return n >>> 0;
}

function isPrivateIPv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  if (n === null) return false;
  for (const [baseStr, bits] of IPV4_BLOCKED) {
    const base = ipv4ToInt(baseStr)!;
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    if ((n & mask) === (base & mask)) return true;
  }
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::" || lower === "::1") return true;
  // IPv4-mapped IPv6 (::ffff:a.b.c.d) — extract the v4 and recheck.
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  const numericMapped = lower.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (numericMapped) {
    const hi = parseInt(numericMapped[1], 16);
    const lo = parseInt(numericMapped[2], 16);
    if (Number.isFinite(hi) && Number.isFinite(lo)) {
      const v4 = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
      return isPrivateIPv4(v4);
    }
  }
  // Link-local: fe80::/10
  if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) return true;
  // Unique-local: fc00::/7  (fc00..fdff)
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
  // Multicast: ff00::/8
  if (lower.startsWith("ff")) return true;
  return false;
}

function isPrivateAddress(ip: string, family: number): boolean {
  return family === 6 ? isPrivateIPv6(ip) : isPrivateIPv4(ip);
}

export type SafeFetchResult =
  | { ok: true; status: number; html: string; ms: number; headers: Headers }
  | { ok: false; reason: "invalid-url" | "blocked-host" | "fetch-failed" | "too-large" | "timeout"; ms: number };

/**
 * Safely fetch a user-supplied URL.
 *
 *   - Validates protocol (http/https), port (80/443).
 *   - DNS-resolves the hostname and rejects ANY private address.
 *   - Pins the fetch to the validated IP (DNS-rebind defense).
 *   - Disables auto-redirect — call again with the redirect target if
 *     you want to follow, so each hop is re-validated.
 *   - Caps body to 1 MB and timeout to `timeoutMs`.
 *
 * Returns a typed result; never throws.
 */
export async function safeFetchPublic(rawUrl: string, timeoutMs = 10_000): Promise<SafeFetchResult> {
  const start = Date.now();
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { ok: false, reason: "invalid-url", ms: Date.now() - start };
  }
  if (!/^https?:$/.test(parsed.protocol)) {
    return { ok: false, reason: "invalid-url", ms: Date.now() - start };
  }
  const port = parsed.port
    ? parseInt(parsed.port, 10)
    : parsed.protocol === "https:" ? 443 : 80;
  if (!ALLOW_PORTS.has(port)) {
    return { ok: false, reason: "blocked-host", ms: Date.now() - start };
  }
  const hostname = parsed.hostname;
  if (!hostname || /[\s]/.test(hostname)) {
    return { ok: false, reason: "invalid-url", ms: Date.now() - start };
  }

  // 1. DNS resolve. Pull all addresses and bail if any is private.
  let addrs: Array<{ address: string; family: number }>;
  try {
    addrs = await dnsLookup(hostname, { all: true, verbatim: true });
  } catch {
    return { ok: false, reason: "fetch-failed", ms: Date.now() - start };
  }
  if (addrs.length === 0) {
    return { ok: false, reason: "blocked-host", ms: Date.now() - start };
  }
  for (const a of addrs) {
    if (isPrivateAddress(a.address, a.family)) {
      return { ok: false, reason: "blocked-host", ms: Date.now() - start };
    }
  }

  // 2. DNS-rebinding defense: pin every TCP connect to the FIRST
  //    validated address via undici's connect.lookup callback. The
  //    callback re-validates whatever address we hand to undici (belt-
  //    and-braces) and ALWAYS returns the same pinned address regardless
  //    of the hostname undici asks about — so DNS rebinding can't swap
  //    the IP between our resolve and the actual TCP connect.
  //    SNI/Host header stay correct because we pass parsed.toString()
  //    as the URL; undici routes that hostname to the pinned IP.
  const pin = addrs[0];
  // undici's connect.lookup uses node:dns LookupFunction shape: the
  // callback can receive (err, string, family) OR (err, LookupAddress[]).
  // We always return the single-address form. Cast to LookupFunction
  // because the type union is wide.
  const dispatcher = new Agent({
    connect: {
      lookup: ((
        _hostname: string,
        _opts: unknown,
        cb: (err: Error | null, address: string, family: number) => void
      ) => {
        if (isPrivateAddress(pin.address, pin.family)) {
          // Re-check at connect time. Belt-and-braces.
          cb(new Error("blocked-host"), "", 0);
          return;
        }
        cb(null, pin.address, pin.family);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any,
    },
  });

  // Use AbortController for timeout + body-cap.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await undiciFetch(parsed.toString(), {
      method: "GET",
      redirect: "manual", // don't follow — caller can re-call this fn with the Location to re-validate
      headers: {
        "User-Agent": "PublicPulseSEOAudit/1.0 (+https://publicpulse.com.bd/tools/seo-audit)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: ctrl.signal,
      dispatcher,
    });

    // Read body with size cap.
    const reader = res.body?.getReader();
    if (!reader) {
      clearTimeout(timer);
      const emptyHeaders = new Headers();
      res.headers.forEach((v, k) => emptyHeaders.set(k, v));
      return { ok: true, status: res.status, html: "", ms: Date.now() - start, headers: emptyHeaders };
    }
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        total += value.byteLength;
        if (total > MAX_BODY_BYTES) {
          await reader.cancel().catch(() => {});
          clearTimeout(timer);
          return { ok: false, reason: "too-large", ms: Date.now() - start };
        }
        chunks.push(value);
      }
    }
    clearTimeout(timer);
    const buf = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) {
      buf.set(c, off);
      off += c.byteLength;
    }
    const html = new TextDecoder("utf-8", { fatal: false }).decode(buf);
    // undici Headers is structurally compatible with global Headers but
    // the TS types diverge on Symbol.dispose. Convert to a fresh global
    // Headers to satisfy the caller's type.
    const safeHeaders = new Headers();
    res.headers.forEach((v, k) => safeHeaders.set(k, v));
    return { ok: true, status: res.status, html, ms: Date.now() - start, headers: safeHeaders };
  } catch (err) {
    clearTimeout(timer);
    const name = (err as Error)?.name ?? "";
    if (name === "AbortError") return { ok: false, reason: "timeout", ms: Date.now() - start };
    return { ok: false, reason: "fetch-failed", ms: Date.now() - start };
  } finally {
    // Close the dispatcher's keep-alive sockets so the pinned Agent
    // doesn't leak across invocations (each call creates its own Agent).
    void dispatcher.close().catch(() => {});
  }
}
