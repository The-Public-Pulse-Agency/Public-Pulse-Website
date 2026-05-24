import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Migrations run against the DIRECT (non-pooled) Neon endpoint — pooled
// endpoints reject the DDL statements migrations need.
// Local dev: set DATABASE_URL_DIRECT in .env.local.
// Production: read from SSM via `sst shell` (see docs/DEPLOY.md).

const url =
  process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "DATABASE_URL_DIRECT (preferred) or DATABASE_URL must be set to run drizzle-kit"
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
