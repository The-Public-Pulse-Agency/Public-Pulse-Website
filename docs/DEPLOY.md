# Deploy

The deploy stack is **SST v3 (Ion) + OpenNext** → CloudFront + Lambda + S3, region `ap-southeast-1`, AWS account `739275468267`, profile `eventpulse`.

There is **no staging stage**. The only SST stage is **`production`** — but it is deployed **domain-less** (CloudFront URL only) until the DNS cutover documented at the bottom of this file. The legacy `deploy.sh` / `site/` static-mirror flow stays live until that cutover is complete.

---

## Prerequisites (one-time)

1. **AWS CLI access**: `aws sts get-caller-identity --profile eventpulse` should return account `739275468267`.
2. **SST CLI**: bundled in this repo's `node_modules`. Run via `npx sst <cmd>`.
3. **Resend account + verified domain**: a [Resend](https://resend.com) account with `publicpulse.com.bd` added under Domains and showing **verified**. DKIM records already live in Route 53 under `resend._domainkey.publicpulse.com.bd` from a prior setup — Resend just needs to confirm them. Generate an API key (scoped to `Sending access`) at <https://resend.com/api-keys> and put it in `.env.<stage>` as `RESEND_API_KEY`.
4. **Neon project**: already provisioned. Confirm the pooled endpoint URL works:
   ```bash
   psql "$DATABASE_URL" -c "select now()"
   ```
5. **Secrets set** for the target stage — see [docs/ENV.md](ENV.md) for the full list. The automated path is `scripts/deploy.sh <stage>` which reads `.env.<stage>`; see "Automated deploy" below.

---

## Automated deploy (the only one you should be running by hand)

```bash
# 1. One-time: copy and fill .env.production
cp .env.production.example .env.production
# Edit .env.production — fill every blank. See docs/ENV.md for what each var means.

# 2. One command does everything: secrets → migrations → SST deploy →
#    admin bootstrap → seed → verification curls.
bash scripts/deploy.sh production
```

The script is idempotent — safe to re-run as you tweak `.env.production`. It STOPs with a clear message if:

- `.env.production` is missing or has a blank value (it tells you which one)
- the AWS profile isn't configured
- the `RESEND_API_KEY` is rejected by Resend, or the sender domain isn't verified in the Resend dashboard
- the SST deploy output URL looks like the apex (an extra belt-and-braces guard against accidental domain attachment)

**Output:** the script prints the CloudFront URL it deployed to and a loud `DOMAIN STATUS` banner reminding you that `publicpulse.com.bd` is unchanged. That CloudFront URL (e.g. `https://dXXXX.cloudfront.net`) is where you verify the new stack BEFORE deciding to cut over.

### Manual fallback (only if the script breaks)

```bash
# Set each secret one by one
npx sst secret set DATABASE_URL "<…>" --stage production
# (etc — see .env.production.example for the full list)

# Apply migrations
DATABASE_URL_DIRECT="<…>" npx drizzle-kit push

# Seed
DATABASE_URL="<…>" npx tsx src/db/seed.ts

# Deploy
AWS_PROFILE=eventpulse npx sst deploy --stage production

# Note the printed URL — it's the CloudFront distribution domain like
# dXXXX.cloudfront.net. Save it; you'll use it to verify caching.
```

---

## Verification (after every deploy, before cutover)

Run these against the **SST-managed CloudFront URL** the script prints — **not** `publicpulse.com.bd` (which is still on the legacy stack until cutover).

```bash
URL="https://<sst-cloudfront-url>"

# 1. Cache HIT on the homepage (run twice; second should be Hit from cloudfront)
curl -sI "$URL/" | grep -iE 'x-cache|cache-control|x-amz-cf-pop'
curl -sI "$URL/" | grep -iE 'x-cache|cache-control|x-amz-cf-pop'

# 2. /manage MUST be no-store and noindex
curl -sI "$URL/manage" | grep -iE 'cache-control|x-robots-tag|x-cache'
# Expected: cache-control: no-store, no-cache, must-revalidate, private
#           x-robots-tag: noindex, nofollow

# 3. robots.txt disallows /manage
curl -s "$URL/robots.txt" | grep -i manage

# 4. Sitemap does NOT include /manage
curl -s "$URL/sitemap.xml" | grep -c manage
# Expected: 0

# 5. SEO essentials on a service page
curl -s "$URL/services/political-pr" | grep -oE '<title>[^<]+</title>'
curl -s "$URL/services/political-pr" | grep -oE '"@type":"Service"'

# 6. Contact form smoke test (use a throwaway email)
# Manual: open $URL/contact, submit the form, confirm:
#   • lead row in Neon (table `leads`)
#   • email arrives at SES_FROM_EMAIL inbox
#   • form returns a success state, no console errors
```

Paste the output of (1) into a JOURNEY.md entry as proof.

---

## Keyless CI/CD via GitHub Actions + AWS OIDC

After the first manual deploy verifies the stack works, subsequent production deploys can come from GitHub Actions — no AWS keys stored anywhere — **but only via a release tag with required-reviewer approval**. There is no auto-deploy path.

### One-time IAM setup

```bash
bash scripts/setup-oidc.sh
```

This creates (idempotently):

- A GitHub OIDC identity provider in AWS IAM, referenced by `token.actions.githubusercontent.com`.
- An IAM role `GitHubActionsDeployRole-PublicPulseWebsite` with a trust policy that ONLY allows assumption by:
  - workflow runs that use `environment: production` (which is required-reviewer-gated)
- An inline policy granting the role just enough to operate the SST/OpenNext stack + read this app's SSM parameters under `/sst/publicpulse-website/*`.

When it prints the role ARN, add it to the repo:

- GitHub → Repo Settings → Secrets and variables → **Actions** → **Variables** → New variable
- Name: `AWS_DEPLOY_ROLE_ARN` · Value: the printed ARN
- (A repo variable, not a secret — the ARN identifies a role, not a credential.)

Then create the production environment with required-reviewer protection:

- GitHub → Repo Settings → **Environments** → New environment
- Name: `production`
- Add Required reviewers → add yourself / a teammate.

### Day-to-day flow

| Trigger | Workflow does | Deploys? |
|---|---|---|
| `git push origin main` | typecheck + build only | ❌ |
| PR opened against `main` | typecheck + build only | ❌ (no OIDC) |
| `git tag v1.0.0 && git push --tags` | typecheck + build, waits for required reviewer, then `sst deploy --stage production` | ✅ production (after approval) |
| `push` to any other branch | typecheck + build only | ❌ |

The workflow file is [.github/workflows/deploy.yml](../.github/workflows/deploy.yml). It uses `aws-actions/configure-aws-credentials@v4` with OIDC — the role token is minted at job start and discarded when the job ends, never persisted.

### Triggering a production deploy

```bash
# From main, tag the release commit
git tag -a v1.0.1 -m "release notes"
git push origin v1.0.1
```

The GitHub Actions UI will show the `deploy-production` job waiting on approval. Open the run, click "Review deployments", approve, and the deploy proceeds.

> ⚠ A CI-driven deploy uses whatever SSM secrets are currently set for the `production` stage. It does NOT read `.env.production` (that file is local-only). If you need to change a secret first, set it with `npx sst secret set <NAME> <value> --stage production` before pushing the tag.

---

## Production DNS cutover — DO NOT RUN until explicitly approved

**This is the irreversible step that flips https://publicpulse.com.bd from the legacy S3-mirror to the new SST stack.** It must be performed manually by the user, never by an agent or by CI, and only after the new stack has been verified at its CloudFront URL.

### Discovery snapshot (recorded 2026-05-25)

| Thing | Value |
|---|---|
| Hosted zone | `Z00453651ICNJYNV229CW` (in this AWS account) |
| Apex `A` / `AAAA` | ALIAS → `d2d44nxwur5g9k.cloudfront.net` (TTL fixed at 60s by AWS for ALIAS records) |
| Old CloudFront dist | `EFMM4G8ZO6TJX` — aliases `publicpulse.com.bd`, `www.publicpulse.com.bd` |
| Old origin | S3 website `publicpulse.com.bd.s3-website-ap-southeast-1.amazonaws.com` |
| ACM cert (us-east-1) | `8a48a7d7-6876-46b0-a54a-167c94022d44` — DomainName `publicpulse.com.bd`, SANs `publicpulse.com.bd` + `*.publicpulse.com.bd`, **ISSUED** |
| Other zone records | MX (Google Workspace), DKIM (Google + Resend), DMARC, `calendar.publicpulse.com.bd` (CNAME → Google), `clientfinder.publicpulse.com.bd` family (separate dists). **Unaffected by this cutover.** |

**Implication:** the wildcard ACM cert that currently fronts the legacy distribution **also covers everything we need on the new one**. No new cert request needed — both distros can reference the same ARN.

### Strategy: `aws cloudfront associate-alias` (near-zero downtime)

CloudFront refuses to attach the same alternate domain name to two distributions, so we cannot just add `publicpulse.com.bd` to the new dist while the old one still claims it. The AWS-blessed way to swap an alias from one distribution to another is the `associate-alias` API — it performs an atomic move at the CloudFront edge layer. As soon as it completes, every CloudFront edge worldwide routes requests for that hostname to the new distribution, **regardless of which distribution Route 53 currently points at** (both share the same global anycast IPs and route by SNI). That's what gives us near-zero downtime.

The catch: the destination distribution must already have an SSL certificate attached that covers the alias being moved. And you can't attach a cert in CloudFront without at least one alias. So we pre-stage the cert via a temporary placeholder alias that nothing in the world uses.

**Alternative considered (and rejected):** remove aliases from the old dist first, then add them to the new one. Simpler steps, but the apex is unreachable for the 5–15 min between the two changes + DNS propagation. Not worth it.

### Cutover plan — exact commands

**Phase 0 — gate (you, the human):** the deploy is healthy at the CloudFront URL, you have walked the verification curls, you have tested the contact form end-to-end (lead appears in Neon, SES email arrives), you have sat with it for a day. Only then proceed.

Throughout, replace `<NEW-DIST-ID>` with the new distribution's ID and `<NEW-DIST-DNS>` with its CloudFront DNS name (both printed by `sst deploy`, both also visible in `aws cloudfront list-distributions`).

```bash
# Variables you'll reuse
NEW_DIST_ID="<NEW-DIST-ID>"        # e.g. E2A1BCDEFGH (the SST-managed one)
NEW_DIST_DNS="<NEW-DIST-DNS>"      # e.g. dabc123.cloudfront.net
OLD_DIST_ID="EFMM4G8ZO6TJX"
CERT_ARN="arn:aws:acm:us-east-1:739275468267:certificate/8a48a7d7-6876-46b0-a54a-167c94022d44"
ZONE_ID="Z00453651ICNJYNV229CW"
PROFILE="eventpulse"
```

**Step 1 — pre-attach the wildcard cert to the new distribution via a placeholder alias.**

Edit [sst.config.ts](../sst.config.ts) and replace the commented-out domain block with a **temporary** one:

```ts
domain: {
  name: "_cutover.publicpulse.com.bd",
  cert: "arn:aws:acm:us-east-1:739275468267:certificate/8a48a7d7-6876-46b0-a54a-167c94022d44",
  dns: false, // we manage Route 53 manually for this transition
},
```

(`_cutover.publicpulse.com.bd` is a subdomain we never use; the wildcard cert covers it; no Route 53 record is required because the alias is purely a CloudFront-side declaration of "I accept requests for this host header".)

Deploy:

```bash
bash scripts/deploy.sh production
```

After this, the new distribution has the wildcard cert attached and one placeholder alias.

**Step 2 — atomically move the apex from old → new.**

```bash
aws cloudfront associate-alias \
  --target-distribution-id "$NEW_DIST_ID" \
  --alias publicpulse.com.bd \
  --profile "$PROFILE"
```

The instant this returns 200, every CloudFront edge starts serving `publicpulse.com.bd` from the new distribution. The legacy `EFMM4G8ZO6TJX` no longer claims the apex.

**Step 3 — atomically move www.**

```bash
aws cloudfront associate-alias \
  --target-distribution-id "$NEW_DIST_ID" \
  --alias www.publicpulse.com.bd \
  --profile "$PROFILE"
```

**Step 4 — repoint Route 53 ALIAS records to the new distribution.**

This is cleanup, not functional — the alias move in Steps 2/3 is what flipped the traffic. But Route 53 should match the truth so future diagnostics are clean.

Write `r53-cutover.json`:

```json
{
  "Comment": "Cut publicpulse.com.bd apex+www over to the SST-managed CloudFront distribution",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "publicpulse.com.bd.",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "<NEW-DIST-DNS>",
          "EvaluateTargetHealth": false
        }
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "publicpulse.com.bd.",
        "Type": "AAAA",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "<NEW-DIST-DNS>",
          "EvaluateTargetHealth": false
        }
      }
    }
  ]
}
```

(`Z2FDTNDATAQYW2` is CloudFront's global hosted-zone ID for ALIAS targets — fixed, do not change.)

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id "$ZONE_ID" \
  --change-batch file://r53-cutover.json \
  --profile "$PROFILE"
```

Resolver TTL on the ALIAS is 60s, so most clients pick up the change within ~2 min.

> **Note on www:** the current zone export shows no separate A/AAAA records for `www.publicpulse.com.bd` — yet `www.publicpulse.com.bd` resolves today because clients fall back through how the legacy CloudFront accepts it. If you want explicit `www → CloudFront` records, add them in the same change-batch. Otherwise the redirect handled by the new distribution will only fire for clients that reach it via CloudFront edge directly. Recommend: add the www A/AAAA aliases explicitly.

**Step 5 — verify on the live apex.**

```bash
dig +short publicpulse.com.bd
dig +short www.publicpulse.com.bd

curl -sI https://publicpulse.com.bd/                          # 200, cf-cache headers
curl -sI https://www.publicpulse.com.bd/                       # 301 or 308 → apex
curl -s   https://publicpulse.com.bd/services/political-pr | grep -oE '<title>[^<]+</title>'
curl -s   https://publicpulse.com.bd/group                     | grep -oE '<h1[^>]*>[^<]+</h1>'
curl -s   https://publicpulse.com.bd/contact                   | head -c 200
curl -s   https://publicpulse.com.bd/robots.txt                | head -20
curl -s   https://publicpulse.com.bd/sitemap.xml               | head -20

# Check valid HTTPS cert (no warnings, SAN includes publicpulse.com.bd)
openssl s_client -connect publicpulse.com.bd:443 -servername publicpulse.com.bd </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates -ext subjectAltName
```

**Step 6 — formalize the domain in IaC.**

Once live and verified, edit [sst.config.ts](../sst.config.ts) — replace the placeholder block with the canonical one:

```ts
domain: {
  name: "publicpulse.com.bd",
  redirects: ["www.publicpulse.com.bd"],
  cert: "arn:aws:acm:us-east-1:739275468267:certificate/8a48a7d7-6876-46b0-a54a-167c94022d44",
  dns: false,
},
```

Update `NEXT_PUBLIC_SITE_URL` in `.env.production` to `https://publicpulse.com.bd`, then redeploy:

```bash
bash scripts/deploy.sh production
```

SST will see the aliases already attached and just confirm them; canonical URLs in the rebuilt HTML now point at the apex.

You can optionally clean up the `_cutover.publicpulse.com.bd` placeholder alias by removing it from `sst.config.ts` in this same edit (it isn't doing anything once apex/www are attached).

**Step 7 — leave the legacy stack intact as a rollback for at least 7 days.**

Do not touch `EFMM4G8ZO6TJX` or the legacy S3 bucket contents. After a week of healthy operation, decommission:

```bash
# Only after you're confident — and after a JOURNEY entry
git rm -r site/ deploy.sh preview.sh pull.sh
# Then in the AWS console: disable EFMM4G8ZO6TJX, wait for propagation, delete it.
```

---

## Rollback

If something is wrong post-cutover and not fixable in 10 minutes, reverse Steps 2–4:

```bash
# Move apex back to the legacy distribution
aws cloudfront associate-alias \
  --target-distribution-id EFMM4G8ZO6TJX \
  --alias publicpulse.com.bd --profile eventpulse

aws cloudfront associate-alias \
  --target-distribution-id EFMM4G8ZO6TJX \
  --alias www.publicpulse.com.bd --profile eventpulse

# Re-point Route 53 back at the legacy CloudFront DNS name
# (write r53-rollback.json the same way as r53-cutover.json but with
#  DNSName: "d2d44nxwur5g9k.cloudfront.net.")
aws route53 change-resource-record-sets \
  --hosted-zone-id Z00453651ICNJYNV229CW \
  --change-batch file://r53-rollback.json \
  --profile eventpulse
```

Leave the SST stack up — it isn't serving traffic now, but is intact for the next attempt.
Open a JOURNEY entry with timestamp, symptom, and what triggered the rollback.

---

## Recurring operations

```bash
# Tail Lambda logs from the deployed function
npx sst console --stage production

# Open the live URL
npx sst console --stage production --resource Web

# (No `sst remove` — production stack has `removal: "retain"`.)

# Update a secret without redeploying everything
npx sst secret set BETTER_AUTH_SECRET "<new>" --stage production
# Then redeploy so Lambda reads the new value at cold start
bash scripts/deploy.sh production
```
