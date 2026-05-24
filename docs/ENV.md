# Environment variables

Every secret lives in **AWS SSM Parameter Store** as a `SecureString`, set via SST:

```bash
npx sst secret set <NAME> <value> --stage <stage>
```

`.env.local` mirrors these for local dev only. **Never commit a real value.** `.env.example` shows the shape only.

## Required for every stage

| Name | Purpose | How to get it |
|---|---|---|
| `DATABASE_URL` | Neon connection string — **pooled** endpoint (host includes `-pooler`). Used by Lambda at runtime. | Neon Console → Project → Connect → "Pooled connection" |
| `DATABASE_URL_DIRECT` | Neon connection string — **direct** (non-pooled) endpoint. Used ONLY by drizzle-kit migrations (pooled endpoint rejects DDL). | Neon Console → "Direct connection" |
| `RESEND_API_KEY` | API key for [Resend](https://resend.com) — handles ALL transactional email. Replaces AWS SES. | Resend Dashboard → API Keys → create one scoped to `Sending access` only. |
| `RESEND_FROM_EMAIL` | Sender address (recommended `info@publicpulse.com.bd`). The sender's domain must be a "verified" domain in Resend — DKIM records under `resend._domainkey.<domain>` in Route 53. | Resend Dashboard → Domains → confirm `publicpulse.com.bd` shows "verified". |
| `RESEND_REPLY_TO` | Reply-to address — usually same as `RESEND_FROM_EMAIL`. | — |
| `BETTER_AUTH_SECRET` | 32+ byte random string used to sign session cookies. | `openssl rand -base64 32` |
| `ADMIN_EMAIL` | Email of the single admin user that can sign into `/manage`. | Your call. |
| `ADMIN_PASSWORD` | **Plaintext** password for the admin user. Stored in SSM as a `SecureString` (encrypted at rest, KMS-managed, only the Lambda role can read it). On first `/manage` hit, the Lambda calls BetterAuth's own `hashPassword()` (scrypt PHC) and writes the hash to Postgres. After bootstrap, the SSM value can be rotated/removed if desired. **Do not pre-hash this — algorithm mismatches break sign-in.** | Pick a strong password (16+ chars, mixed). Generate with `openssl rand -base64 24` if you want a random one. |
| `NEXT_PUBLIC_SITE_URL` | Used by BetterAuth as `baseURL` and by absolute-URL builders. Drives canonicals, sitemap entries, OG image URLs. | **Pre-cutover production**: the SST-printed CloudFront URL (e.g. `https://dXXXX.cloudfront.net`) so links work where the site actually lives. **Post-cutover**: `https://publicpulse.com.bd`. Redeploy after changing it so the rebuilt HTML carries the new canonicals. |

## Optional / future

| Name | Purpose |
|---|---|
| `INDEXNOW_KEY` | Key for IndexNow ping after deploy. Generate with `uuidgen` (lowercase, no dashes). |
| `SENTRY_DSN` | If we wire Sentry for error monitoring. |

## How SST exposes these to Lambda

`sst.Secret("NAME")` reads the parameter at deploy time and exposes it to the linked Lambda as `process.env.NAME`. The `link: […]` array in [sst.config.ts](../sst.config.ts) controls which secrets each function can see.

## Local development workflow

```bash
# First time
cp .env.example .env.local
# Fill in DATABASE_URL, DATABASE_URL_DIRECT, ADMIN_EMAIL, ADMIN_PASSWORD,
# BETTER_AUTH_SECRET, SES_FROM_EMAIL, NEXT_PUBLIC_SITE_URL.

# Apply migrations
npx drizzle-kit push

# Seed one placeholder case study
npx tsx src/db/seed.ts

# Run the app
npm run dev
```

## Deploy-time workflow

```bash
# One-time per stage — set every secret listed above
npx sst secret set DATABASE_URL "postgresql://…" --stage staging
npx sst secret set DATABASE_URL_DIRECT "postgresql://…" --stage staging
npx sst secret set RESEND_API_KEY "re_…" --stage staging
npx sst secret set RESEND_FROM_EMAIL "info@publicpulse.com.bd" --stage staging
# … etc.

# Verify what's stored (values redacted in output)
npx sst secret list --stage staging

# Deploy
npx sst deploy --stage staging
```

After secrets change, you must redeploy — Lambda only re-reads env at cold start.

## Rotation cadence

| Secret | Cadence | How |
|---|---|---|
| `DATABASE_URL` / `DATABASE_URL_DIRECT` | When a teammate leaves with access | Neon Console → Reset password → `sst secret set …` → redeploy |
| `BETTER_AUTH_SECRET` | Annually, or on any session-leak suspicion | New `openssl rand -base64 32` → `sst secret set` → redeploy. **This invalidates all sessions.** |
| `RESEND_API_KEY` | On suspected compromise, or when a teammate with access leaves | Resend Dashboard → API Keys → revoke old + create new → `sst secret set RESEND_API_KEY '…' --stage <stage>` → redeploy |
| `ADMIN_PASSWORD` | Whenever the admin changes their password | `sst secret set ADMIN_PASSWORD '…' --stage <stage>` → redeploy → **then** delete the admin row from Postgres so the bootstrap re-runs on next /manage hit (`delete from "user" where email='…'`). Tedious, but it's a one-person admin — happens rarely. |

All rotations get a JOURNEY.md entry with the date and reason.
