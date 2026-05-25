// Neon HTTP client + Drizzle.
//
// Why neon-http (not neon WebSocket / pg pool):
//   • Stateless — one HTTPS round-trip per query. Perfect for Lambda; no
//     connection pool to manage, no warmup, no NAT/VPC overhead.
//   • Cold-start friendly.
//   • Server-only. Marked with `import "server-only"` so it can never be
//     bundled into a client component by mistake.
//
// READ PATH: ALL public reads MUST go through the cached data layer in
//   src/lib/data/* (unstable_cache + tags), never call `db.select()` from a
//   public page directly. See docs/CACHING.md.
//
// IMPORTANT: lazy-initialized. The client is built on first use (not at module
// load) so `next build` doesn't require DATABASE_URL — SST sets it at deploy
// time and Lambda picks it up at cold start.
//
// Note: no `import "server-only"` here because this module is also loaded by
// CLI scripts (scripts/generate.ts, src/db/seed-*.ts). Server boundary is
// enforced by callers — cached read paths use next/cache (server-only), and
// admin server actions check session before any DB query.

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export { schema };

type DB = NeonHttpDatabase<typeof schema>;

let _db: DB | null = null;
let _sql: NeonQueryFunction<false, false> | null = null;

function init(): DB {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Set it in .env.local (dev) or via `sst secret set DATABASE_URL` (deploy)."
    );
  }
  _sql = neon(url);
  _db = drizzle(_sql, { schema });
  return _db;
}

// Proxy that defers initialization until the first property access.
// Drizzle calls like `db.select()` will trigger `init()` on demand.
export const db = new Proxy({} as DB, {
  get(_target, prop) {
    const instance = _db ?? init();
    const value = (instance as unknown as Record<string | symbol, unknown>)[
      prop as string | symbol
    ];
    return typeof value === "function" ? value.bind(instance) : value;
  },
}) as DB;
