# Journey log

Newest entries on top. Append an entry at the **end of every session** — this is the canonical session-to-session handoff.

Entry format:

```markdown
## YYYY-MM-DD — <short title>
**Changed:** files / decisions
**Why:** motivation
**Next:** what's still open
```

---

## 2026-05-25 — STEP 6: collapse to single PRODUCTION stage (domain-less), CI cleanup, cutover plan ready

**Decision change:** there is no separate staging stage anymore. The production stack is the only SST stage and is deployed **without** the apex domain attached — it lands on the SST-managed CloudFront URL while `publicpulse.com.bd` stays on the legacy distribution. DNS cutover stays a manual step, scheduled separately.

**No deploys executed this turn.** All work below is code/docs only. The cutover plan is reported but not run — waiting on the user's "cut over" instruction.

**Changed — TASK 1 (production deploy path):**

- **[sst.config.ts](../sst.config.ts):** added a loud "NO CUSTOM DOMAIN IS ATTACHED" banner at the top of the file and replaced the previous staging/prod-domain TODO comments with an explicit, commented-out canonical `domain:` block tied to the cutover step. No behavioral change — the domain block was already commented; the change makes the intent unmissable.
- **[scripts/deploy.sh](../scripts/deploy.sh) (new, replaces `deploy-staging.sh`):** parameterized one-shot deploy. Takes `<stage>` as arg, reads `.env.<stage>`, pushes secrets to SSM, applies Drizzle migrations, runs `sst deploy --stage <stage>`, parses the CloudFront URL out of the output, triggers admin bootstrap, seeds, then runs the verification curls **against the CloudFront URL**. Idempotent. STOPs on:
  - missing `.env.<stage>` or blank required values
  - misconfigured AWS profile
  - SES sender not verified in `ap-southeast-1`
  - the parsed URL containing `publicpulse.com.bd` (extra belt-and-braces guard against accidental domain attachment)
- Final banner prints: `Reachable only at <CloudFront URL>. publicpulse.com.bd is unchanged until DNS cutover.`
- **scripts/deploy-staging.sh:** deleted. `deploy.sh production` covers production; `deploy.sh staging` still works if a staging stage is ever reintroduced.
- **[.env.production.example](../.env.production.example) (new):** mirror of `.env.staging.example`, with `NEXT_PUBLIC_SITE_URL` guidance specifically for the pre-cutover (CloudFront URL) and post-cutover (apex) phases.
- **[.gitignore](../.gitignore):** already excludes `.env.production` (added last turn).

**Changed — TASK 2 (CI cleanup):**

- **[.github/workflows/deploy.yml](../.github/workflows/deploy.yml):** removed the `deploy-staging` job entirely. Triggers retargeted to `main` (push/PR) for `verify`, kept `tags: ['v*']` for `deploy-production`. Production deploy remains gated by `environment: production` (required-reviewer rule) — there is no auto-deploy path. `verify` now builds with `NEXT_PUBLIC_SITE_URL=https://publicpulse.com.bd` (the post-cutover end-state; it only affects canonicals/sitemap/OG in built HTML, which is rebuilt post-cutover anyway).
- **[scripts/setup-oidc.sh](../scripts/setup-oidc.sh):** tightened the OIDC trust policy. Dropped the unused `repo:.../ref:refs/heads/staging` subject; the role can now ONLY be assumed by workflow runs that use the `production` GitHub Environment. **Re-running `bash scripts/setup-oidc.sh` is required to push this tighter trust policy to AWS** (the script is idempotent and just refreshes the policy on the existing role).

**Changed — TASK 3 (docs):**

- **[docs/DEPLOY.md](DEPLOY.md):** full rewrite. Documents the single-production-stage `deploy.sh <stage>` flow, the verify-on-CloudFront-URL contract, the production-only CI/CD trigger table, and the new detailed cutover plan (see below) with rollback.
- **[docs/ENV.md](ENV.md):** updated `NEXT_PUBLIC_SITE_URL` guidance — pre-cutover use the SST-printed CloudFront URL so generated canonicals/sitemap entries match where the site actually lives; post-cutover swap to the apex and redeploy.

**Read-only AWS audit completed this turn (no live state changed):**

| Thing | Value | Implication |
|---|---|---|
| Hosted zone | `Z00453651ICNJYNV229CW` (in account `739275468267`) | We own DNS; cutover is a pure Route 53 change |
| Apex A/AAAA | ALIAS → `d2d44nxwur5g9k.cloudfront.net` (TTL fixed 60s by AWS for ALIAS) | No TTL pre-flight needed |
| Old CloudFront | `EFMM4G8ZO6TJX` — aliases `publicpulse.com.bd`, `www.publicpulse.com.bd`, origin S3 website | Source of truth for current live site |
| ACM cert (us-east-1) | `arn:aws:acm:us-east-1:739275468267:certificate/8a48a7d7-6876-46b0-a54a-167c94022d44`, SANs `publicpulse.com.bd` + `*.publicpulse.com.bd`, ISSUED | **Reusable for the new dist — no new cert request needed** |
| Other zone records | MX (Google), DKIM (Google + Resend), DMARC, `calendar.*` CNAME → Google, `clientfinder.*` family on separate distros | **Untouched by this cutover** |

**Cutover plan reported (NOT EXECUTED — awaiting user "cut over"):**

Approach: `aws cloudfront associate-alias`-based **atomic alias move**, near-zero downtime. Reasoning:

- CloudFront refuses the same alternate-domain-name on two distributions, so we can't just `sst deploy` with the domain block while the old distro still claims apex/www — it fails with `CNAMEAlreadyExists`.
- `associate-alias` is the AWS-blessed atomic move. Once it returns, every CloudFront edge worldwide routes the host header to the new distribution, regardless of Route 53 — both distros share the same anycast IPs, routing is by SNI.
- The destination dist must have the cert pre-attached. Since CloudFront refuses an ACM cert without at least one alias, we pre-stage via a placeholder alias `_cutover.publicpulse.com.bd` (no Route 53 record needed — the alias is purely a CloudFront-side declaration).
- Alternative considered + rejected: remove aliases from old, add to new. Simpler but introduces a 5–15 min planned outage. Not worth it for a public-facing brand site.

The full step-by-step (exact commands, all variables, rollback) is now in [docs/DEPLOY.md § Production DNS cutover](DEPLOY.md). Summary:

1. Edit `sst.config.ts` to add a placeholder `domain: { name: "_cutover.publicpulse.com.bd", cert: "…", dns: false }`. `bash scripts/deploy.sh production`. Cert + placeholder alias now attached to the new dist.
2. `aws cloudfront associate-alias --target-distribution-id <NEW> --alias publicpulse.com.bd --profile eventpulse` — apex flips to new dist at CloudFront edge layer instantly.
3. Same for `www.publicpulse.com.bd`.
4. Update Route 53 A/AAAA ALIAS records to point at `<NEW-DIST-DNS>` (cleanup — propagates in ~2 min via 60s TTL).
5. Edit `sst.config.ts` to canonical `domain: { name: "publicpulse.com.bd", redirects: ["www…"], cert: "…", dns: false }`. Update `NEXT_PUBLIC_SITE_URL` to apex. `bash scripts/deploy.sh production` — rebuilds with apex canonicals.
6. Keep `EFMM4G8ZO6TJX` + `site/` mirror intact for at least 7 days as rollback. Decommission only after a JOURNEY entry confirming stability.

Rollback (documented, not run): two `associate-alias` calls pointing back at `EFMM4G8ZO6TJX` + a Route 53 change-batch reverting the alias targets. SST stack stays up untouched.

**Build verification (no live deploy):**

- ✅ `npm run build` green — 22 routes (same as STEP 5), no regressions; public Static/SSG, `/manage/*` and `/api/auth/*` dynamic
- ✅ `aws sts get-caller-identity --profile eventpulse` → account `739275468267` (`eventpulse-cli`, AdministratorAccess)
- ✅ Verified the wildcard ACM cert `8a48a7d7-…` is ISSUED in us-east-1 and covers both apex + `*.publicpulse.com.bd`
- ✅ Verified the Route 53 zone `Z00453651ICNJYNV229CW` is the live zone, apex is an ALIAS to `d2d44nxwur5g9k.cloudfront.net`, no records other than apex point at the legacy dist
- ✅ Confirmed `sst.config.ts` does NOT attach the apex on any stage — the only `domain:` block in the file is commented out

**What's required from the user before anything goes live:**

1. Populate **`.env.production`** with real values (7 secrets). For the pre-cutover deploy, leave `NEXT_PUBLIC_SITE_URL` blank or fill it with the CloudFront URL printed by SST after the first deploy.
2. Verify the SES sender `info@publicpulse.com.bd` (or the whole domain) in the SES console for `ap-southeast-1`. The deploy script checks and STOPs with the console URL if unverified.
3. Run:
   ```bash
   bash scripts/deploy.sh production
   ```
4. **Verify the new stack on the CloudFront URL it prints.** Walk the verification curls. Test the contact form end-to-end (a lead row should appear in Neon; an email should land at SES_FROM_EMAIL). Sit with it for a day.
5. When ready and explicit, say "cut over" and I'll walk the cutover plan from [docs/DEPLOY.md](DEPLOY.md) one command at a time.

Optionally, any time after step 3 (and ideally before step 5):

```bash
bash scripts/setup-oidc.sh   # tightens the existing role's trust policy (idempotent)
```

Then ensure the `production` GitHub Environment has required-reviewer protection. After that, prod deploys can be triggered via `git tag vX.Y.Z && git push --tags` → approve in the Actions UI.

**Hand-back: run commands.**

```bash
# After .env.production is filled + SES is verified:
bash scripts/deploy.sh production
# → script prints the SST-managed CloudFront URL. That's where you verify.
```

DO NOT run any cutover step (CloudFront `associate-alias`, Route 53 change, `sst.config.ts` domain edit) until I've reported the plan with the *real* new distribution ID/DNS-name filled in and you've explicitly said "cut over."

---

## 2026-05-25 — STEP 5: deploy automation + keyless CI/CD (STAGING deploy gated on `.env.staging`)

**STOPPED before executing the staging deploy.** `.env.staging` is not present. Everything that doesn't require user-only credentials is shipped and ready; the moment the file is populated, `bash scripts/deploy-staging.sh` runs the whole chain end-to-end.

**Fixed (critical, would have broken sign-in):**

- BetterAuth uses **scrypt** (via `@better-auth/utils/password` → `node:crypto`), NOT bcrypt. My earlier docs were wrong. Verified by reading `node_modules/better-auth/dist/crypto/password.mjs`. Refactored:
  - [src/lib/admin-bootstrap.ts](../src/lib/admin-bootstrap.ts) now imports `hashPassword` from `better-auth/crypto` and hashes a **plaintext** `ADMIN_PASSWORD`
  - Env var renamed: `ADMIN_PASSWORD_HASH` → `ADMIN_PASSWORD` everywhere ([sst.config.ts](../sst.config.ts), [docs/ENV.md](ENV.md), [docs/DEPLOY.md](DEPLOY.md))
  - Why this is safer: user provides their chosen plaintext, Lambda hashes it on first /manage hit using BetterAuth's own hasher, format always matches the verifier. No way to get the algorithm wrong.

**Changed (TASK 1 automation):**

- **[.env.staging.example](../.env.staging.example):** one file listing every required var (DATABASE_URL, DATABASE_URL_DIRECT, SES_FROM_EMAIL, SES_REPLY_TO, BETTER_AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, NEXT_PUBLIC_SITE_URL). Commented with where each value comes from.
- **[.gitignore](../.gitignore):** added `.env.staging` and `.env.production` so the populated forms never ship.
- **[scripts/deploy-staging.sh](../scripts/deploy-staging.sh):** the one-shot deploy. In order: load `.env.staging`, fail loudly on blanks, confirm AWS profile, verify SES sender/domain in `ap-southeast-1` (STOPs with SES-console URL if unverified), push each secret via `sst secret set`, `drizzle-kit push`, `sst deploy --stage staging`, extract CloudFront URL from output, curl `/manage` to trigger admin bootstrap, run the seed, then verification curls (cache HIT, /manage no-store + noindex, robots disallow, sitemap exclusion, seed-text check). Idempotent — safe to re-run.

**Changed (TASK 2 CI/CD):**

- Confirmed `eventpulse-cli` carries `AdministratorAccess` via `iam:simulate-principal-policy` — can create the OIDC provider + deploy role. No elevated session needed.
- **[scripts/setup-oidc.sh](../scripts/setup-oidc.sh):** one-time IAM bootstrap. Creates (idempotently):
  - GitHub OIDC identity provider at `token.actions.githubusercontent.com`
  - IAM role `GitHubActionsDeployRole-PublicPulseWebsite` with a **trust policy scoped to THIS repo** (`The-Public-Pulse-Agency/Public-Pulse-Website`), allowing assumption only for:
    - workflow runs on the `staging` branch (`sub: repo:.../ref:refs/heads/staging`)
    - workflow runs that use the `production` environment (`sub: repo:.../environment:production`) — which is required-reviewer-gated
  - Inline policy with SST/OpenNext operational permissions + `iam:*` scoped to SST-managed roles + **SSM read/write scoped to `/sst/publicpulse-website/*` only**. Notes left in the policy for further tag-based tightening.
- **[.github/workflows/deploy.yml](../.github/workflows/deploy.yml):** three-job pipeline.
  - `verify`: typecheck + build. Runs on every push and PR. No AWS access (no OIDC, no role assumption — safe for fork PRs).
  - `deploy-staging`: needs `verify`, runs only on push to `staging`, assumes OIDC role, `sst deploy --stage staging`.
  - `deploy-production`: needs `verify`, runs only on tag `v*`, uses `environment: production` which gates on required reviewers in repo settings, then `sst deploy --stage production`.
- **No long-lived AWS keys anywhere.** GitHub mints short-lived OIDC JWTs per job; AWS STS exchanges them for ~1h credentials scoped to the deploy role only.

**Changed (docs):**

- [docs/ENV.md](ENV.md): `ADMIN_PASSWORD_HASH` → `ADMIN_PASSWORD`, rotation procedure updated (delete the user row + redeploy to re-bootstrap).
- [docs/DEPLOY.md](DEPLOY.md): replaced the manual-command staging section with the `scripts/deploy-staging.sh` flow, kept a manual fallback. Added a full CI/CD section: one-time `scripts/setup-oidc.sh`, GitHub repo-variable setup, day-to-day trigger table, how to ship a prod deploy via release tag with reviewer approval.

**Build verification:** `npm run build` green after the scrypt refactor — 22 routes, all public Static/SSG, all `/manage/*` and `/api/auth/*` dynamic. Workflow YAML parses cleanly (3 jobs, conditions wired correctly).

**What's required from the user before the deploy can actually run:**

1. Populate **`.env.staging`** with real values (7 secrets — see `.env.staging.example`). I cannot fill these for you and will not invent placeholders.
2. Verify the SES sender **`info@publicpulse.com.bd`** (or the whole `publicpulse.com.bd` domain) in the SES console for `ap-southeast-1`. The deploy script checks and STOPs with the console URL if unverified.

Then:

```bash
bash scripts/deploy-staging.sh        # first deploy
bash scripts/setup-oidc.sh             # one-time CI/CD enable (any time)
# After setup-oidc, add the printed role ARN to GitHub repo Variables as
# AWS_DEPLOY_ROLE_ARN, then create the "production" GitHub Environment with
# required reviewer protection. Subsequent staging deploys are automatic on
# push to "staging".
```

**Validation I COULD do this turn (no live deploy):**

- ✅ AWS profile `eventpulse` works → account `739275468267` (alias `biztool`)
- ✅ `eventpulse-cli` has `AdministratorAccess` → can run `setup-oidc.sh`
- ✅ `.env.staging.example` lists every var, comments on origin/format
- ✅ `.gitignore` excludes `.env.staging` / `.env.production`
- ✅ Workflow YAML parses; jobs gated correctly per the spec
- ✅ Build green after scrypt refactor

**Validation that needs the live deploy** (TASK 1 verification curls + a real test lead in Neon) — will run once `.env.staging` is in place and `scripts/deploy-staging.sh` completes. Per the spec: I'm stopping before any production deploy.

**Next:**

- User: fill `.env.staging`, verify SES, run `bash scripts/deploy-staging.sh`.
- User: run `bash scripts/setup-oidc.sh`, copy the printed ARN to GitHub repo Variables as `AWS_DEPLOY_ROLE_ARN`, create the `production` GitHub Environment with required reviewers.
- After staging is live and verified, the manual DNS-cutover steps in [docs/DEPLOY.md § Production cutover](DEPLOY.md) stay yours.

---

## 2026-05-25 — STEP 4 / TASK 6: deploy handoff — gated on user actions

**Status: code complete, deploy not executed.**

This step requires actions only the user can take: setting real secrets (Neon URL, bcrypt admin hash, BetterAuth secret) into SSM, configuring the AWS CLI profile, and running `sst deploy` against the user's AWS account `739275468267`. An agent should NOT execute these — they touch the user's billable account and require credentials the user has explicitly chosen to manage out-of-band.

What ships when the user runs the deploy:

- 22 routes total: 5 SSG static (about/blog/contact/group/services), 10 SSG dynamic (1 blog + 9 services), 6 dynamic ƒ-routes (/manage/*, /api/auth/*), plus sitemap/robots/feed/llms
- 100% of public pages SSG/Static at the edge; ZERO DB calls on the visitor request path
- `/manage` auth-gated (BetterAuth), `no-store`, `noindex`, robots-disallowed
- Contact form: validate → write to Neon → email via SES, all server-action, `no-store`
- Homepage Selected Results: tag-cached via `unstable_cache(['case-studies:published'], { tags: ['case-studies'] })`, invalidated by `updateTag('case-studies')` from /manage CRUD
- Resilient: homepage prerenders even when DB is unreachable (the section is hidden, the page still ships)

### To deploy staging (user runs these)

```bash
# 0. Pre-flight
aws sts get-caller-identity --profile eventpulse   # must return 739275468267
aws ses list-identities --region ap-southeast-1 --profile eventpulse | grep publicpulse.com.bd
# If the domain or sender isn't verified, do that first in the SES console.

# 1. Set the 7 secrets (one-time per stage)
npx sst secret set DATABASE_URL "<neon pooled url>" --stage staging
npx sst secret set DATABASE_URL_DIRECT "<neon direct url>" --stage staging
npx sst secret set SES_FROM_EMAIL "info@publicpulse.com.bd" --stage staging
npx sst secret set SES_REPLY_TO "info@publicpulse.com.bd" --stage staging
npx sst secret set BETTER_AUTH_SECRET "$(openssl rand -base64 32)" --stage staging
npx sst secret set ADMIN_EMAIL "<your email>" --stage staging
npx sst secret set ADMIN_PASSWORD_HASH "$(node -e "require('bcryptjs').hash(process.argv[1], 12).then(console.log)" 'YourActualPassword')" --stage staging

# 2. Apply migrations to Neon (uses DATABASE_URL_DIRECT in .env.local)
npx drizzle-kit push

# 3. Seed a placeholder case study so the homepage section renders something
npx tsx src/db/seed.ts

# 4. Deploy
AWS_PROFILE=eventpulse npx sst deploy --stage staging

# 5. Note the CloudFront URL printed by SST. Then verify:
URL="<that url>"
# Cache HIT on second request
curl -sI "$URL/" | grep -iE 'x-cache|cache-control'
curl -sI "$URL/" | grep -iE 'x-cache|cache-control'
# /manage no-store + noindex
curl -sI "$URL/manage" | grep -iE 'cache-control|x-robots-tag'
# robots.txt disallows /manage
curl -s "$URL/robots.txt" | grep -i manage
# Sitemap excludes /manage
curl -s "$URL/sitemap.xml" | grep -c manage   # must be 0
```

Paste the cache-HIT output back into a follow-up JOURNEY entry and we'll continue.

### Production DNS cutover (deliberately manual)

Documented end-to-end in [docs/DEPLOY.md § Production cutover](DEPLOY.md). The agent will NOT execute these steps; per the STEP 3 spec, DNS goes through the user.

Summary of what's pending on the user side:

1. Verify SES domain `publicpulse.com.bd` + sender `info@publicpulse.com.bd` in `ap-southeast-1`.
2. Set 7 SSM secrets for the `staging` stage (commands above).
3. Run `npx drizzle-kit push` against the Neon DB.
4. Run `AWS_PROFILE=eventpulse npx sst deploy --stage staging`.
5. Walk through the verification block + report the cache-HIT output.
6. When confident, repeat with `--stage production` and perform the Route 53 alias change documented in [DEPLOY.md](DEPLOY.md).

### What's still on the backlog after the deploy

- Pre-generate AVIF/WebP variants for the 12 blog hero JPGs (currently CloudFront caches the runtime-optimizer output — fine for low traffic, worth replacing before any campaign push)
- Port the remaining 11 blog posts into `src/content/posts/<slug>.ts`
- Confirm Pulse Group taglines/colors/wordmarks; clear `// TODO(user):` markers in `src/lib/group.ts`, `src/app/page.tsx` (stats + case studies), `src/app/about/page.tsx` (real team bios + photos + sameAs links), `src/app/group/page.tsx` (group narrative)
- Replace the seed case study with real ones via /manage after the deploy is live
- Once a campaign is running, add a simple `/case-studies/[slug]` route reading from the same cached data layer

---

## 2026-05-25 — STEP 4 / TASK 5: homepage "Selected results" reads from the cached data layer

**Changed:**

- [src/app/page.tsx](../src/app/page.tsx): the placeholder `CASE_STUDIES` constant is gone. `HomePage` is now `async`, calls `await getPublishedCaseStudies()` from the cached data layer at build/revalidate time, and renders the section. If the list is empty, the section is omitted entirely — no broken empty headline.
- [src/lib/data/case-studies.ts](../src/lib/data/case-studies.ts): wrapped the underlying query in a try/catch that returns `[]` when the DB is unreachable. This is the resilience contract — the homepage MUST render even at build time before SSM secrets are wired, or during a Neon outage.
- The `unstable_cache` wrapper + `tags: ['case-studies']` are unchanged. Public reads are cached at the data layer; CDN caches the rendered page on top.

**Why:**

- The data layer being safe-by-default (returns `[]` on error, never throws) is what lets the public homepage stay prerendered. A throwing data function would make `/` a hard-fail route — the whole point of the cache-first architecture is that DB hiccups never reach the visitor.
- Empty-state handling is at the page level (the section is conditionally rendered). No skeleton, no "no case studies yet" placeholder on the public page — that would be worse than no section at all.

**Build verification:** `npm run build` green. 22 routes. Homepage `/` is `○` (Static) — single build-time `getPublishedCaseStudies()` call (which returned `[]` because DATABASE_URL isn't set locally), zero DB calls on subsequent visitor requests.

**End-to-end flow now wired:**

1. Visitor `GET /` → CloudFront cache hit → static HTML → **0 DB queries**
2. Admin signs into `/manage`, creates a case study, hits Publish → server action calls `db.insert(…)` + `updateTag('case-studies')` + `revalidatePath('/')`
3. Next 16 invalidates the `case-studies` tag → `unstable_cache` re-runs `getPublishedCaseStudies()` on next request → new SSG HTML → CloudFront cache populated with the updated page
4. Next visitor sees the new case study, **0 DB queries** on their request

This closes GLOBAL RULE B end-to-end.

**Next:** TASK 6 — staging deploy. This step requires actions only the user can perform (setting SSM secrets that include their real Neon credentials + admin bcrypt hash, plus running `sst deploy` against their AWS account). I'm stopping at this boundary and handing off with exact commands.

---

## 2026-05-25 — STEP 4 / TASK 4: BetterAuth, /manage shell, leads inbox, case-studies CRUD

**Changed:**

- **[src/lib/auth.ts](../src/lib/auth.ts):** BetterAuth instance — Drizzle adapter, `emailAndPassword.enabled: true`, `disableSignUp: true` (the only admin is provisioned via env), `cookieCache` enabled so most requests skip a session DB hit.
- **[src/lib/auth-client.ts](../src/lib/auth-client.ts):** thin `createAuthClient` for the sign-in form.
- **[src/lib/admin-bootstrap.ts](../src/lib/admin-bootstrap.ts):** idempotent `ensureAdminUser()` — on first /manage hit, inserts the single admin row using `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` (bcrypt) from env. Module-scoped `bootstrapped` flag so warm Lambdas skip the existence check.
- **[src/app/api/auth/[...all]/route.ts](../src/app/api/auth/[...all]/route.ts):** BetterAuth route handler at `/api/auth/*`, `dynamic = "force-dynamic"`.
- **[src/app/manage/layout.tsx](../src/app/manage/layout.tsx):** the admin shell. Sets `dynamic = "force-dynamic"`, `revalidate = 0`, `fetchCache = "force-no-store"`. Emits `robots: { index: false, follow: false, nocache: true }` + `x-robots-tag: noindex, nofollow, noarchive, nosnippet`. Checks session via `auth.api.getSession()`, redirects to `/manage/sign-in` if absent. Renders header w/ Leads / Case Studies nav + Sign out.
- **[/manage/sign-in](../src/app/manage/sign-in/page.tsx) + SignInForm:** email/password form posting via `authClient.signIn.email()`.
- **[src/app/robots.ts](../src/app/robots.ts):** added explicit `Disallow: /manage, /manage/, /api/auth` for every user-agent (public + AI crawlers).
- **[src/lib/data/case-studies.ts](../src/lib/data/case-studies.ts):** tagged cache layer — `getPublishedCaseStudies = unstable_cache(...)` with `tags: ['case-studies']` and `revalidate: false` (tag-only invalidation). Plus admin-only `listAllCaseStudies()` and `getCaseStudyById()` which bypass cache.
- **[src/lib/data/leads.ts](../src/lib/data/leads.ts):** admin-only lead reads + mutation helpers (`markLeadRead`, `archiveLead`, `unarchiveLead`, `unreadCount`).
- **[/manage/leads](../src/app/manage/leads/page.tsx) + actions.ts:** inbox UI with `?view=archived` filter, "new" badge for unread, per-row mark-read / archive / unarchive server actions that each `requireSession()` first.
- **[/manage/case-studies](../src/app/manage/case-studies/page.tsx) + new + [id]:** full CRUD. The `actions.ts` here is the load-bearing one — every successful mutation calls `updateTag('case-studies')` AND `revalidatePath('/')` so the homepage refreshes without a redeploy. Same `requireSession()` gate.
- **[/manage/case-studies/CaseStudyForm.tsx](../src/app/manage/case-studies/CaseStudyForm.tsx):** plain HTML form posting to a server action — zero client JS — used by both `new` and `[id]` pages.

**Bugfixes during this task:**

- **Next 16 `revalidateTag` API change**: now requires `(tag, profile)`. Switched to `updateTag(tag)` which is the fire-and-forget invalidate intended for read-your-own-writes mutation flows. Documented in [src/app/manage/case-studies/actions.ts](../src/app/manage/case-studies/actions.ts).
- **Zod v4 issue type change**: `issue.path[0]` is now `string | number | symbol` — coerced via `String(...)`.
- **DB client init at module load broke `next build`**: refactored [src/db/client.ts](../src/db/client.ts) to lazy-initialize via Proxy. Build no longer needs `DATABASE_URL` set; first DB query in deployed Lambda triggers init.

**Build verification:** `npm run build` green, 22 routes (was 21). New `ƒ (Dynamic)` routes: `/api/auth/[...all]`, `/manage/case-studies`, `/manage/case-studies/[id]`, `/manage/case-studies/new`, `/manage/leads`, `/manage/sign-in`. All public marketing pages remain `○` (Static) / `●` (SSG).

**Public-surface safety check:**

- `/manage/*` → dynamic, `no-store`, noindex, robots disallow ✓
- `/api/auth/*` → dynamic, no-store ✓
- `/contact` POST → server action, no-store (Next default) ✓
- Public site → 100% SSG/ISR, no DB calls on the request path ✓

**Next:** TASK 5 — replace homepage CASE_STUDIES constant with `getPublishedCaseStudies()` from the cached data layer; graceful empty-state; confirm a public GET still makes zero DB queries.

---

## 2026-05-25 — STEP 4 / TASK 3: contact form wired (RHF + Zod + honeypot + IP-hash rate limit + SES)

**Changed:**

- **[src/lib/contact-schema.ts](../src/lib/contact-schema.ts):** Zod schema shared between client and server. Service-interest enum is derived from `SERVICES` so adding a new service auto-extends the form. Includes the honeypot `website` field (`z.string().max(0)`).
- **[src/app/contact/actions.ts](../src/app/contact/actions.ts):** `"use server"` action `submitContact()` —
  1. Zod validate (returns per-field errors on fail)
  2. Honeypot: if `website` non-empty, silent `{ok:true}` so bots learn nothing
  3. Rate-limit: hash IP+daily-salt with SHA-256 (no raw IP stored — that's PII), reject if ≥3 submissions from same hash in past hour
  4. `db.insert(leads).returning(...)` writes the lead to Neon
  5. SES `SendEmailCommand` notifies `info@publicpulse.com.bd` — wrapped in try/catch so SES failure doesn't lose the lead
  6. Returns `{ok:true}` or `{ok:false, error, fieldErrors?}`
- **[src/components/contact/ContactForm.tsx](../src/components/contact/ContactForm.tsx):** Client component, React Hook Form + `zodResolver`, `mode: "onBlur"`. Fields: name, email, phone, service-interest select (populated from `SERVICES`), message textarea. Hidden honeypot `website` input (`-left-[9999px]`, `tabindex=-1`, `aria-hidden`). Submits via `useTransition` so the button shows a pending state. Three UI states: idle / success (replaces the form with a thank-you panel) / error (inline alert + per-field messages).
- **[.form-input](../src/styles/globals.css):** added the form-input utility class — 16px font (prevents iOS focus-zoom), navy focus ring, red ring when `aria-invalid="true"`.
- **[src/app/contact/page.tsx](../src/app/contact/page.tsx):** the placeholder section now mounts `<ContactForm />`.

**Why:**

- Server action means no API route boilerplate, no CSRF token plumbing — Next handles both, and the response inherits `cache-control: no-store` automatically (server actions are never cached).
- One Zod schema for client + server is the cheapest way to keep validation honest. Client-side validation is purely UX; the server runs it again.
- IP-hashed rate limit avoids storing raw IPs (PII concern) but still catches the dominant bot pattern of N submissions/hour. The check is a single indexed query (`idx_leads_ip_hash` not added — covered by the unread index for now, can promote to a partial index if rate-limit becomes hot).
- Honeypot + rate limit covers ~99% of automated spam without a captcha. Captcha is a UX tax; we'll add reCAPTCHA Enterprise only if abuse actually happens.
- SES failure is logged but does NOT roll back the lead — losing a lead is worse than a missing email, and we can always re-email by reading `/manage/leads`.

**Build verification:** `npm run build` green, 21 routes. `/contact` is still `○` (Static) — the form is a client island inside a SSG page; the server action is the only request-path code and inherits `no-store`.

**Next:** TASK 4 — BetterAuth wiring + `/manage` layout with `no-store` + `noindex` + robots disallow + leads inbox + case-studies CRUD that calls `revalidateTag('case-studies')`.

---

## 2026-05-25 — STEP 4 / TASK 2: SST v3 + Drizzle + Neon scaffolding, infra docs

**Changed:**

- **Deps:** `sst@^3` (Ion), `drizzle-orm@^0.45`, `drizzle-kit@latest` (dev), `@neondatabase/serverless`, `@aws-sdk/client-ses`, `@aws-sdk/client-ssm`, `better-auth`, `react-hook-form`, `zod`, `@hookform/resolvers`, `tsx` (dev). Drizzle had to land on ≥0.45 to satisfy better-auth's peer.
- **[sst.config.ts](../sst.config.ts):** SST v3 (Ion) configuration. Region `ap-southeast-1`. `sst.aws.Nextjs("Web")` (OpenNext under the hood) with `link: [DATABASE_URL, SES_FROM_EMAIL, SES_REPLY_TO, BETTER_AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD_HASH]`. Lambda runtime `nodejs22.x`, OUTSIDE VPC, `permissions: ses:Send*`. Image optimizer at 1536 MB. Per-stage budget alarm ($5 staging / $25 production) emails `info@publicpulse.com.bd` on 80% actual + 100% forecast. Production domain block is commented — DNS cutover stays manual per the user.
- **[drizzle.config.ts](../drizzle.config.ts):** points at `src/db/schema.ts`, outputs migrations to `src/db/migrations/`, dialect `postgresql`. Reads `DATABASE_URL_DIRECT` first (pooled endpoints reject DDL), falls back to `DATABASE_URL`.
- **[src/db/schema.ts](../src/db/schema.ts):** four logical groups —
  - `leads` (id, name, email, phone, service_interest, message, submitted_at, ip_hash, user_agent, read, archived) with indexes on `submitted_at desc` and `(read, archived)`
  - `case_studies` (id, slug unique, industry, metric, window_label, summary, service_slug, display_order, published, published_at, timestamps)
  - BetterAuth tables (`user`, `session`, `account`, `verification`) — matching the v1.x shape so Drizzle owns the migration
- **[src/db/client.ts](../src/db/client.ts):** Neon HTTP client + Drizzle, marked `import "server-only"` so it can never bundle into a client component. Fails loudly at module load if `DATABASE_URL` is missing.
- **[src/db/seed.ts](../src/db/seed.ts):** one-off seed (`npx tsx src/db/seed.ts`) that inserts a single placeholder case study so the homepage data layer has something to read on first build.
- **[tsconfig.json](../tsconfig.json):** excluded `sst.config.ts`, `.sst/`, `.open-next/` from Next's TypeScript pass — SST type-checks its own config with platform types generated by `sst init`.
- **Docs:** [docs/CACHING.md](CACHING.md) (the load-bearing policy doc — per-route cache table, tag inventory, refresh path, verification commands), [docs/ENV.md](ENV.md) (every secret, how to get it, how to set it via SST + local dev workflow), [docs/DEPLOY.md](DEPLOY.md) (staging-first deploy steps, verification block, production cutover, rollback procedure).

**Why:**

- SST v3 (Ion) is the only sane way to get OpenNext + per-stage isolation + secret management + budget alarms in one config file with zero CDK boilerplate. Pulumi semantics under the hood, but the surface area we touch is one component.
- Drizzle over Neon HTTP (not WebSocket) means Lambda spins up, makes one HTTPS round-trip per query, spins down — no connection pool, no warmup, no VPC, no NAT. The whole point of the architecture.
- Schema-first migrations (Drizzle + drizzle-kit) keep the DB in source control and reviewable in PRs. Push-based for now; we'll switch to generate+migrate once the schema is stable.
- CACHING.md is the load-bearing doc. Anyone touching a route now has the policy in writing: SSG/ISR by default, `no-store` only on `/manage` + the contact POST + auth callbacks. No exceptions without a JOURNEY entry.

**Build verification:** `npm run build` green, 21 routes, no DB calls at build time (homepage doesn't read case_studies yet — that's TASK 5).

**Next:** TASK 3 — wire the contact form (React Hook Form + Zod, honeypot, IP-hash rate limit, server action that writes to Neon + emails via SES, `cache-control: no-store`).

---

## 2026-05-25 — STEP 4 / TASK 1: marketing shell complete (premium /about + /contact)

**Changed:**

- Schema builders: added `personSchema()`, `aboutPageSchema()`, `contactPageSchema()` to [src/lib/schema.ts](../src/lib/schema.ts). Person entries cross-reference the site Organization via `worksFor @id` for E-E-A-T.
- [src/app/about/page.tsx](../src/app/about/page.tsx): full rewrite matching homepage editorial language. Sections: navy hero + dark `<AnswerBlock>`; "Our story" 2-col; team grid with 3 Person cards (one Person JSON-LD per team member, all wired to Org `@id`); closing CTA. `// TODO(user):` marker for real bios, photos, and `sameAs` profile links.
- [src/app/contact/page.tsx](../src/app/contact/page.tsx): navy hero with dark `<AnswerBlock>`, three direct-channel cards (WhatsApp / phone / email) with brand-color left borders, and a placeholder form-host section that TASK 3 fills in. Already emits `ContactPage` + `BreadcrumbList`.
- Sitemap unchanged — /about and /contact have been entries since STEP 1.

**Build verification:** `npm run build` green, 21 routes, both new pages prerender as SSG with their JSON-LD intact.

**Next:** TASK 2 — SST v3, Neon + Drizzle, infra docs.

---

## 2026-05-24 — STEP 3: design system + premium homepage + Pulse Group showcase

**Changed:**

- **Design system formalized in [docs/BRAND.md](BRAND.md).** Editorial direction: navy as the dominant surface, red as the single accent, generous whitespace, asymmetric layouts, no SaaS-template tropes. Type scale, 8-pt spacing rhythm, hover and scroll-reveal motion language, reduced-motion contract — all spelled out.
- **Fraunces added.** Variable serif loaded via `next/font/google` with the `opsz` axis enabled in [src/app/layout.tsx](../src/app/layout.tsx). DM Sans stays as the body family. Tailwind `font-serif → var(--font-fraunces)`, `font-sans → var(--font-dm-sans)`. `// TODO(user):` marker left in `layout.tsx` to swap to Space Grotesk in one place if preferred.
- **Type scale + tokens** in [tailwind.config.ts](../tailwind.config.ts): `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-eyebrow`, `text-lead`, `text-body`, `text-meta`, `text-display-number`. All use `clamp()` for fluid mobile-to-desktop scaling — no JS, no breakpoint cliffs, CLS-safe. Added `brand-navy-soft`, `surface-cream` color tokens and `max-w-prose: 65ch`.
- **Motion language** in [src/styles/globals.css](../src/styles/globals.css):
  - `.reveal` opacity 0 → 1 + translateY 16 → 0 over 700 ms, `cubic-bezier(.16, 1, .3, 1)` — only active when `html.reveal-ready` class is present
  - `.card-hover` lifts -2px with soft shadow
  - `.cta-primary` scales 1.02 on hover
  - `@media (prefers-reduced-motion: reduce)` zeroes all of the above
  - `.bg-grain` subtle 3% white-dot noise for dark sections (no SVG needed, pure CSS gradient)
- **SSR contract preserved:** `<Script id="reveal-bootstrap" strategy="beforeInteractive">` in [layout.tsx](../src/app/layout.tsx) adds `html.reveal-ready` synchronously. Without JS, the reveal CSS rule never matches, so no-JS crawlers see content visible from byte one — opacity:0 is never applied.
- **Components**: [`<ScrollReveal>`](../src/components/ui/ScrollReveal.tsx) (client, IntersectionObserver, auto-reveals already-in-viewport content) and [`<Container>`](../src/components/ui/Container.tsx) (max-1200, consistent 24/32 px gutters).
- **Skip-to-content link** added in layout for keyboard a11y.
- **Homepage rewrite** [src/app/page.tsx](../src/app/page.tsx): five sections:
  1. **Hero** — full-bleed navy, asymmetric 7/5 grid. Fraunces display headline ("Reach that *moves*. Narratives that *hold*.") on the left, dark-variant `<AnswerBlock>` + primary CTA ("Get a free PR audit") + WhatsApp CTA on the right. Stat strip (50+ / 300%+ / 10+ / 24/7) revealed below.
  2. **Services** — white, asymmetric eyebrow + lead, 9 cards in 3-col grid. Each card has a thin top border in its category color and surfaces "Explore →" on hover.
  3. **Pulse Group** — full-bleed navy, asymmetric narrative + 5 sister-brand mini-cards rendered from [src/lib/group.ts](../src/lib/group.ts), each with a left border in the brand's own color.
  4. **Selected results** — cream surface, 3 case-study cards with large Fraunces stat numerals. `// TODO(user):` markers asking you to replace the 3 placeholder case studies with real client names/numbers (or NDA-anonymized industry descriptors).
  5. **Closing CTA** — full-bleed navy, large Fraunces headline + primary CTA + phone number CTA.
- **/group rewrite** [src/app/group/page.tsx](../src/app/group/page.tsx): full-bleed navy hero with asymmetric Fraunces headline ("Five brands. One *country*.") and dark-variant `<AnswerBlock>`; below it, 5 full-width editorial brand cards (12-col grid each, wordmark + name on the left, tagline center, "Visit site →" right); closing cream-surface section. `// TODO(user):` marker for the group narrative (founding year, leadership).
- **Footer & header** — kept; Sister Concerns block in [Footer.tsx](../src/components/layout/Footer.tsx) already reads from `SISTER_BRANDS` so all 5 brands appear in the footer of every page.
- **Sitemap** — no change needed; homepage and `/group` were already in [src/app/sitemap.ts](../src/app/sitemap.ts) from STEP 1.

**Why:**

- The previous homepage was a Tailwind-default arrangement (left-aligned H1, button row, 3-col card grid). It said nothing — premium agencies don't look like SaaS landing pages from 2021. Editorial typography + Fraunces + asymmetric grid + navy dominance immediately signals "publication, not Notion site."
- Hero `<AnswerBlock>` at the top means AI engines (Google AI Overviews, ChatGPT, Perplexity, Claude) have a tight, branded, quotable answer for "what is Public Pulse?" — and that answer ships in the SSR HTML on every prerender.
- Pulse Group is rendered FROM the typed [group.ts](../src/lib/group.ts) registry, so adding/removing/renaming a sister brand is a one-file edit and propagates to: footer (every page), homepage section, /group cards, and the `pulseGroupSchema` JSON-LD graph. One source of truth.
- The reveal-bootstrap pattern (only animate when JS marks the page ready) is the cheapest way to keep SEO content visible to non-rendering crawlers while still getting the motion polish on the human-rendered page.
- Stats and case studies are placeholders with `// TODO(user):` markers because pretending we have audited numbers would be worse than leaving them clearly marked.

**Build verification (`npm run build`, Next 16.2.6, 21 routes, all green):**

`/` (homepage) generated HTML contains:

- `<title>` = `Public Pulse Agency | Best Digital Marketing Agency in Bangladesh` ✓
- canonical = `https://publicpulse.com.bd` ✓
- `<h1>` count = **1** — `Reach that moves. Narratives that hold.` (Fraunces serif, italic-red accents) ✓
- **Hero `<AnswerBlock>`** present: `class="answer-block-dark"` + `data-speakable=""` attribute, containing the 50–55-word agency-summary paragraph ✓
- **2 JSON-LD blocks** (both inherited from layout): `Organization @id=…/#organization` and `WebSite @id=…/#website` ✓

`/group` generated HTML contains:

- `<title>` = `Pulse Group — Five Bangladesh-focused brands` ✓
- canonical = `https://publicpulse.com.bd/group` ✓
- `<h1>` count = **1** — `Five brands. One country.` (Fraunces, italic-red accent on "country") ✓
- Dark `<AnswerBlock>` present with `data-speakable=""` ✓
- **4 JSON-LD blocks**: `Organization (Public Pulse)`, `WebSite`, **`Organization @id=https://pulsegroup.bd/#organization` with `subOrganization` array of 5 brands** (Public Pulse Agency, Event Pulse, Tender Pulse, Social Pulse, The Pulse Today — each with `name` + `url`), and `BreadcrumbList` ✓
- All 5 brand names present in visible HTML ✓

**Next:**

- Port the 11 remaining blog posts using a `src/content/posts/<slug>.ts` pattern mirroring the services content split. The first post is still embedded in [src/lib/posts.ts](../src/lib/posts.ts) and should migrate out.
- Build out an `/about` long-form story page using the same editorial language as the new homepage.
- Pass through homepage stats and case studies — clear the 4 + 3 `TODO(user):` markers in [src/app/page.tsx](../src/app/page.tsx).
- Confirm or rewrite the Pulse Group narrative — clear the `TODO(user):` marker in [src/app/group/page.tsx](../src/app/group/page.tsx).
- Wire SST v3 + OpenNext for the deploy path; ship the first real Lighthouse run from the live URL.
- Generate AVIF/WebP variants for the 12 blog hero JPGs once the build pipeline includes `sharp`.

---

## 2026-05-24 — STEP 2: security bump (Next 16 / React 19) + all 9 services live

**Changed:**

- **Framework bump.** `next` `15.0.3 → 16.2.6`, `react` `19.0.0-rc → 19.2.6`, `react-dom` `19.0.0-rc → 19.2.6`, `@types/react` `18 → 19`, added `eslint-config-next@^16.2.6`. Closes CVE-2025-66478 and CVE-2025-55182 (critical RSC RCE). [next.config.ts](../next.config.ts) updated: `experimental.typedRoutes` → top-level `typedRoutes` (Next 16 deprecation). `tsconfig.json` auto-updated by the Next 16 build to `jsx: react-jsx` and added `.next/dev/types/**/*.ts` to `include`.
- **9 service detail pages now live.** Catalog [src/lib/services.ts](../src/lib/services.ts) extended with `seoTitle` (≤60 chars) and `seoDescription` (140–160 chars) per service; all 9 flipped `ready: true`. Long-form content extracted out into per-service files under [src/content/services/](../src/content/services/) — one TypeScript module per slug behind a typed [`ServiceContent`](../src/content/services/_types.ts) and a [`getServiceContent(slug)`](../src/content/services/index.ts) lookup. Each file ships answer (40–60w), intro, 5–7 deliverables, 5-step process, 3–4 *Why choose us* reasons, and 3 FAQs. Copy is genuinely distinct per service (Bangladesh-specific specifics — BDT budgets, Cox's Bazar/Sylhet/Dhaka, OTAs, Foodpanda, Conversion API, etc.). `// TODO(user):` markers left at the 9 places I'd want your input.
- **Route updated.** [src/app/services/[slug]/page.tsx](../src/app/services/[slug]/page.tsx) now reads from `getServiceContent`, picks up the new `seoTitle`/`seoDescription` for metadata, and renders a new **Why choose Public Pulse for [service]?** section between the 5-step Process and the FAQ block.
- **Services index** [src/app/services/page.tsx](../src/app/services/page.tsx): removed the "Coming soon" tag (all 9 ready).
- **Sitemap** [src/app/sitemap.ts](../src/app/sitemap.ts) — no code change; it reads `SERVICES.filter(s => s.ready)` so flipping all 9 ready automatically added them. Sitemap now contains 9 `/services/<slug>` URLs.

**Why:**

- Patched Next first because shipping behind a known critical CVE is a non-starter even pre-deploy — and bumping early avoids type/API drift building up.
- Per-service content files (instead of one big `service-content.ts`) scale to 18 or 90 services without becoming a merge-conflict magnet, and each file diff stays reviewable.
- Why-choose-us is a deliberate AEO surface — answer engines (Google AI Overviews, ChatGPT, Perplexity) frequently quote comparative/competitive claims back to users; making them schema-friendly bullets gives them a structured surface to pull from.
- Distinct, specific copy per service (vs. boilerplate clones) is what gets these pages out of the "duplicate content" trap. Generic copy is worse than no copy at SEO time.

**Build verification (`npm run build`, Next 16.2.6 Turbopack, 21 routes generated):**

```text
● /services/[slug]                  (SSG)
  ├ /services/political-pr
  ├ /services/social-media
  ├ /services/content-production
  └ [+6 more paths]                  ← analytics-reporting, brand-building, hospitality, influencer-marketing, paid-ads, seo-website
```

All 9 service URLs are now in `dist/sitemap.xml`. **AUDIT.md finding #H1 (9 service URLs returning 404) is structurally closed** — they're real prerendered pages with their own `<head>` and content.

**Per-route HTML validation (2 different routes, picked for content distinctness):**

`/services/political-pr`:

- `<title>` = `Political PR Agency Bangladesh | Public Pulse` (45 chars) ✓
- canonical = `https://publicpulse.com.bd/services/political-pr` ✓
- `<h1>` count = **1**, text = `Political PR & Image Building` ✓
- AnswerBlock: `class="answer-block my-6"` with `data-speakable=""` ✓
- 5 JSON-LD blocks: `Organization (#organization)`, `WebSite (#website)`, `Service (.../political-pr#service)`, `BreadcrumbList`, `FAQPage` ✓

`/services/paid-ads` (genuinely distinct content — Meta/Google/Pixel/ROAS, not PR/elections):

- `<title>` = `Paid Ads Agency Bangladesh — Meta, Google | Public Pulse` (56 chars) ✓
- canonical = `https://publicpulse.com.bd/services/paid-ads` ✓
- `<h1>` count = **1**, text = `Paid Ads & Campaigns` ✓
- AnswerBlock: `class="answer-block my-6"` with `data-speakable=""` ✓
- 5 JSON-LD blocks: `Organization`, `WebSite`, `Service (.../paid-ads#service)`, `BreadcrumbList`, `FAQPage` ✓

**Next:**

- Port the 11 remaining blog posts using the same `src/content/posts/<slug>.ts` pattern (currently only `digital-marketing-bangladesh-2026` has long-form copy in [src/lib/posts.ts](../src/lib/posts.ts) and should be migrated out).
- Pass through service copy with the user to remove the 9 `TODO(user):` markers (mostly scope-confirmation questions on overlapping services).
- Wire up SST v3 + OpenNext for the deploy path.
- Build a real contact form on `/contact` and an Edge Route Handler that emails via SES.
- Generate AVIF/WebP variants for the 12 blog hero JPGs (use `next/image` defaults once we wire up the build pipeline).

---

## 2026-05-24 — Foundation step 1: project memory + Next.js scaffold + SEO core + verified samples

**Changed:**

- Project memory written: [CLAUDE.md](../CLAUDE.md), [docs/ARCHITECTURE.md](ARCHITECTURE.md), [docs/SEO-AEO-GEO.md](SEO-AEO-GEO.md), [docs/BRAND.md](BRAND.md), [docs/JOURNEY.md](JOURNEY.md) (this file)
- Next.js 15 App Router scaffold at repo root: [package.json](../package.json), [tsconfig.json](../tsconfig.json) (strict), [next.config.ts](../next.config.ts), [tailwind.config.ts](../tailwind.config.ts) with the AUDIT.md brand palette, [postcss.config.mjs](../postcss.config.mjs), [src/styles/globals.css](../src/styles/globals.css)
- SEO core: [src/lib/seo.ts](../src/lib/seo.ts) (metadata builder), [src/lib/schema.ts](../src/lib/schema.ts) (typed JSON-LD: Organization with `parentOrganization → Pulse Group`, WebSite, Service, Article, BreadcrumbList, FAQPage, QAPage), [src/lib/site.ts](../src/lib/site.ts) (brand constants + tracking IDs)
- Components: [JsonLd](../src/components/seo/JsonLd.tsx), [AnswerBlock](../src/components/seo/AnswerBlock.tsx), [Breadcrumbs](../src/components/seo/Breadcrumbs.tsx), [Header](../src/components/layout/Header.tsx), [Footer](../src/components/layout/Footer.tsx) (with Sister Concerns block), [WhatsAppFab](../src/components/layout/WhatsAppFab.tsx), [Tracking](../src/components/analytics/Tracking.tsx) (preserved GTM-TNK2J29K, GA4 G-WVF3TSEL3Q, Meta Pixel 938966755334049)
- Pulse Group config + page: [src/lib/group.ts](../src/lib/group.ts) — Public Pulse + Event Pulse + Tender Pulse + Social Pulse + The Pulse Today. Taglines/colors are **best-guess placeholders**, confirm with user. [/group page](../src/app/group/page.tsx) live.
- Sample content live: [/services/political-pr](../src/app/services/[slug]/page.tsx) (full template — H1, AnswerBlock, What's Included, 5-step Process, FAQ, Related Services, CTA), [/blog/digital-marketing-bangladesh-2026](../src/app/blog/[slug]/page.tsx) (full template — H1, hero `<Image>`, AnswerBlock, 5 sections, FAQ, CTA). Other 8 services + 11 posts are listed in catalogs with `ready: false` so they appear in the index pages but are excluded from `generateStaticParams`/sitemap until content lands.
- Stubs: [/about](../src/app/about/page.tsx), [/contact](../src/app/contact/page.tsx), [/not-found](../src/app/not-found.tsx)
- Crawling/discovery: [src/app/robots.ts](../src/app/robots.ts) (explicit Allow for GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot), [src/app/sitemap.ts](../src/app/sitemap.ts), [src/app/feed.xml/route.ts](../src/app/feed.xml/route.ts), [public/llms.txt](../public/llms.txt), [public/llms-full.txt](../public/llms-full.txt)
- Static assets copied from `site/` to `public/`: favicons, og-image, blog hero JPG
- `.gitignore` extended for `.next/`, `out/`, `.sst/`, `.open-next/`

**Why:**

- Per CLAUDE.md, project memory is set up first so future sessions resume with full context. JOURNEY.md is the canonical handoff and every session ends with an entry.
- SEO is built once, correctly, and lives in a single module (`src/lib/schema.ts`) so per-page JSON-LD is type-safe, cross-referenced via stable `@id`, and impossible to forget.
- AnswerBlock + speakable selector + JSON-LD Article = the AEO/GEO surface ChatGPT/Claude/Perplexity quote from. Putting it in place on day one is much cheaper than retrofitting.
- Two sample pages (one service, one post) are enough to prove the template; the remaining 8 + 11 are mechanical content fills against the same components.

**Build verification (`npm run build` succeeded, 14 routes generated):**

```text
Route (app)                                    Size     First Load JS
○ /                                            195 B           109 kB
● /blog/[slug]                                 5.32 kB         114 kB
  └ /blog/digital-marketing-bangladesh-2026
● /services/[slug]                             195 B           109 kB
  └ /services/political-pr
○ /sitemap.xml, /robots.txt, /feed.xml         ...

○ Static  ● SSG
```

Generated HTML inspection of `.next/server/app/services/political-pr.html`:

- `<title>` = `Political PR & Image Building in Bangladesh | Public Pulse Agency` ✓ (page-specific, NOT homepage's)
- `<link rel="canonical" href="https://publicpulse.com.bd/services/political-pr"/>` ✓ (page-specific, NOT homepage's)
- `<h1>` count = **1**, text = `Political PR & Image Building` ✓
- AnswerBlock present: `class="answer-block my-6"` with `data-speakable=""` ✓
- **5 JSON-LD blocks emitted**: `Organization (#organization)`, `WebSite (#website)`, `Service (.../political-pr#service)`, `BreadcrumbList`, `FAQPage` ✓

This directly fixes the top-3 HIGH findings from AUDIT.md (no SSR head, missing Service schema, missing BreadcrumbList) for this one route. Pattern is reusable for the remaining 8 services + 11 blog posts.

**Next:**

- **Heads-up:** `next@15.0.3` was installed and npm warned of CVE-2025-66478. Bump to latest patched `15.x` next session (will likely also stable-out `react@19`). Doesn't block the foundation but should not ship to prod.
- Port the remaining 8 service pages (one-liner already in `SERVICES`; flip `ready: true` once long-form content lands).
- Port the remaining 11 blog posts (same pattern: flip `ready: true` per slug).
- Confirm Pulse Group taglines, colors, and exact wordmark for each sister concern (current values in [src/lib/group.ts](../src/lib/group.ts) are placeholders).
- Wire up SST v3 + OpenNext deploy config so we can replace `deploy.sh` / the old `site/` static mirror.
- Wire up Amazon SES + a real contact form on `/contact`.
- Add IndexNow ping in the deploy step once SST is configured.
- Decide whether to delete `site/` (the legacy static mirror) or keep it as a rollback artifact during the cutover.
