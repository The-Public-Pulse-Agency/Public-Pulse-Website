/// <reference path="./.sst/platform/config.d.ts" />

// SST v3 (Ion) — OpenNext deployment for publicpulse.com.bd.
//
// ════════════════════════════════════════════════════════════════════════════
// NO CUSTOM DOMAIN IS ATTACHED ON ANY STAGE.
//
// The `domain` block in the Nextjs component is intentionally commented out
// for every stage. Every `sst deploy` lands on the SST-managed CloudFront URL
// (e.g. dXXXX.cloudfront.net). Apex publicpulse.com.bd / www stays on the
// legacy distribution until a separate, manual DNS-cutover step performed by
// the user — documented in docs/DEPLOY.md § "Production cutover".
//
// If you ever uncomment a `domain:` block here, you are doing the cutover.
// Do not do that without the user's explicit go-ahead.
// ════════════════════════════════════════════════════════════════════════════
//
// Stages:
//   • production → the live infra. Deployed via `bash scripts/deploy.sh production`.
//     CloudFront URL only — DNS cutover is a separate manual step.
//   • <other>    → only spin up if you reintroduce a staging-style stage; would
//                  also need a matching .env.<stage>.
//
// Secrets: every credential is an sst.Secret stored in AWS SSM Parameter Store
// (SecureString) under /sst/publicpulse-website/<stage>/. Set values once per
// stage with `sst secret set <NAME> <value> --stage <stage>` before deploy.
// See docs/ENV.md for the full list and how to get each value.

export default $config({
  app(input) {
    return {
      name: "publicpulse-website",
      // Production keeps removed resources; staging tears them down on `sst remove`.
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: { region: "ap-southeast-1" },
      },
    };
  },

  async run() {
    const stage = $app.stage;
    const isProd = stage === "production";

    // ─── Secrets (SSM SecureString) ────────────────────────────────────
    // Each one must be set with `sst secret set` before the first deploy.
    const DATABASE_URL = new sst.Secret("DATABASE_URL");
    // Resend handles all transactional email (replaces AWS SES).
    // RESEND_API_KEY is the secret. RESEND_FROM_EMAIL and RESEND_REPLY_TO
    // are also pushed as secrets so they can be rotated per stage without
    // a code change, even though they're not cryptographic secrets.
    const RESEND_API_KEY = new sst.Secret("RESEND_API_KEY");
    const RESEND_FROM_EMAIL = new sst.Secret("RESEND_FROM_EMAIL");
    const RESEND_REPLY_TO = new sst.Secret("RESEND_REPLY_TO");
    const BETTER_AUTH_SECRET = new sst.Secret("BETTER_AUTH_SECRET");
    const ADMIN_EMAIL = new sst.Secret("ADMIN_EMAIL");
    // ADMIN_PASSWORD is the PLAINTEXT password. It's stored in SSM as a
    // SecureString (encrypted at rest, KMS-managed) and only readable by the
    // linked Lambda role. The Lambda hashes it with BetterAuth's scrypt at
    // first /manage hit and writes the hash to Postgres — after that, the
    // SSM value can be rotated/removed if desired.
    //
    // Why plaintext (and not a pre-computed hash): BetterAuth's verifier uses
    // scrypt PHC. Manually generating the matching hash format is fragile —
    // letting BetterAuth's own hashPassword() run on the Lambda guarantees the
    // verifier sees what it expects. See src/lib/admin-bootstrap.ts.
    const ADMIN_PASSWORD = new sst.Secret("ADMIN_PASSWORD");
    // CRON_SECRET protects /api/cron/* endpoints. Generate with `openssl rand -hex 32`.
    const CRON_SECRET = new sst.Secret("CRON_SECRET");
    // ─── Facebook Messenger Platform ───────────────────────────────────
    // MESSENGER_VERIFY_TOKEN — string YOU pick + paste into Meta's webhook
    //   verification field. `openssl rand -hex 32`. Used ONLY at handshake.
    // MESSENGER_PAGE_ACCESS_TOKEN — long-lived page token Meta gives you
    //   after you click "Add Page" in the Messenger setup. Used to send
    //   replies + read user profile.
    // MESSENGER_APP_SECRET — your Facebook App's "App Secret" (under
    //   App Settings → Basic). Used to HMAC-verify every inbound POST so
    //   we know the event actually came from Meta and not an attacker.
    const MESSENGER_VERIFY_TOKEN = new sst.Secret("MESSENGER_VERIFY_TOKEN");
    const MESSENGER_PAGE_ACCESS_TOKEN = new sst.Secret("MESSENGER_PAGE_ACCESS_TOKEN");
    const MESSENGER_APP_SECRET = new sst.Secret("MESSENGER_APP_SECRET");
    // FACEBOOK_APP_ID is technically public (it's in the OAuth URL), but we
    // store it as an SST secret so it can be rotated/changed without a code
    // change. Find it in Meta Dashboard → your App → Settings → Basic.
    const FACEBOOK_APP_ID = new sst.Secret("FACEBOOK_APP_ID");
    // ─── Meta Conversions API (CAPI) ───────────────────────────────────
    // META_CAPI_ACCESS_TOKEN — generated in Events Manager → your Dataset
    //   → Settings → Conversions API → Generate Access Token. Sensitive.
    // META_CAPI_DATASET_ID — the Dataset ID (formerly Pixel ID) to POST
    //   events to. Defaults to 1992777924798448 in code; override here
    //   if you ever rotate / split datasets.
    // META_CAPI_TEST_EVENT_CODE — optional TEST<...> code from Events
    //   Manager → Test Events. When set, all events route to the test
    //   stream instead of production. Leave UNSET for normal operation.
    const META_CAPI_ACCESS_TOKEN = new sst.Secret("META_CAPI_ACCESS_TOKEN");
    const META_CAPI_DATASET_ID = new sst.Secret("META_CAPI_DATASET_ID");
    const META_CAPI_TEST_EVENT_CODE = new sst.Secret("META_CAPI_TEST_EVENT_CODE");

    // ─── Next.js (OpenNext) ────────────────────────────────────────────
    // The Nextjs component handles CloudFront + S3 (static + ISR cache) +
    // Lambda (server) + Image Optimizer Lambda. Cache policy details in
    // docs/CACHING.md.
    const web = new sst.aws.Nextjs("Web", {
      link: [
        DATABASE_URL,
        RESEND_API_KEY,
        RESEND_FROM_EMAIL,
        RESEND_REPLY_TO,
        BETTER_AUTH_SECRET,
        ADMIN_EMAIL,
        ADMIN_PASSWORD,
        CRON_SECRET,
        MESSENGER_VERIFY_TOKEN,
        MESSENGER_PAGE_ACCESS_TOKEN,
        MESSENGER_APP_SECRET,
        FACEBOOK_APP_ID,
        META_CAPI_ACCESS_TOKEN,
        META_CAPI_DATASET_ID,
        META_CAPI_TEST_EVENT_CODE,
      ],
      // Linked secrets are exposed at runtime as Resource.NAME.value AND
      // process.env.NAME for code that reads env directly.
      environment: {
        MESSENGER_VERIFY_TOKEN: MESSENGER_VERIFY_TOKEN.value,
        MESSENGER_PAGE_ACCESS_TOKEN: MESSENGER_PAGE_ACCESS_TOKEN.value,
        MESSENGER_APP_SECRET: MESSENGER_APP_SECRET.value,
        FACEBOOK_APP_ID: FACEBOOK_APP_ID.value,
        META_CAPI_ACCESS_TOKEN: META_CAPI_ACCESS_TOKEN.value,
        META_CAPI_DATASET_ID: META_CAPI_DATASET_ID.value,
        META_CAPI_TEST_EVENT_CODE: META_CAPI_TEST_EVENT_CODE.value,
      },
      // Lambda OUTSIDE VPC by design — Neon over public TLS, no NAT.
      // Resend is called over public HTTPS — no IAM permissions needed.
      // Bedrock is called over public HTTPS but requires bedrock:InvokeModel
      // permission for the Haiku-class cross-region inference profile used
      // by the blog generator (see src/lib/bedrock.ts).
      server: {
        memory: "1024 MB",
        // Bumped from 10s → 60s so the synchronous "Generate now" /
        // "Run batch" admin clicks can complete a Bedrock round-trip
        // (~15s per post). Most other Lambdas finish in <500ms; this is
        // only relevant for /manage/content-topics POSTs.
        timeout: "60 seconds",
        runtime: "nodejs22.x",
        permissions: [
          {
            actions: ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"],
            // Allow any anthropic.* foundation model + any inference profile
            // (the us.* and apac.* prefixes are inference profile ARNs, not
            // model ARNs — they need a separate Resource pattern).
            resources: [
              "arn:aws:bedrock:*::foundation-model/anthropic.*",
              "arn:aws:bedrock:*:*:inference-profile/*",
            ],
          },
        ],
      },
      // Image optimizer: ALSO outside VPC; output cached at CloudFront so a
      // given variant only invokes Lambda once.
      imageOptimization: {
        memory: "1536 MB",
      },
      // ──────────────────────────────────────────────────────────────────
      // DOMAIN: deliberately NOT attached on any stage. See the banner at
      // the top of this file. Production deploys land on the SST-managed
      // CloudFront URL; publicpulse.com.bd does not change until the DNS
      // cutover step in docs/DEPLOY.md is run manually by the user.
      //
      // When the user is ready to cut over, uncomment the block below in
      // the same commit that performs the Route 53 alias change — never
      // ahead of it. SST will request an ACM cert in us-east-1 and bind it
      // to the distribution, but DNS validation will not flip the live
      // apex until the Route 53 record is changed.
      //
      //   ...(isProd && {
      //     domain: {
      //       name: "publicpulse.com.bd",
      //       redirects: ["www.publicpulse.com.bd"],
      //     },
      //   }),
      // ──────────────────────────────────────────────────────────────────
      //
      // PRODUCTION DOMAIN — apex + www. Cert is the existing wildcard
      // (8a48a7d7-..., covers apex + *.publicpulse.com.bd). dns: false
      // because Route 53 is managed manually outside SST so we don't risk
      // SST clobbering MX/DKIM/other records in the zone.
      ...(isProd && {
        domain: {
          name: "publicpulse.com.bd",
          redirects: ["www.publicpulse.com.bd"],
          cert: "arn:aws:acm:us-east-1:739275468267:certificate/8a48a7d7-6876-46b0-a54a-167c94022d44",
          dns: false,
        },
      }),
    });

    // ─── Newsletter digest cron ────────────────────────────────────────
    // EventBridge schedule firing the /api/cron/digest endpoint on the
    // production stack. Bi-weekly (every 2 weeks on Thursday 09:00 UTC ≈
    // 15:00 Dhaka — primary inbox window). On non-prod stages the schedule
    // is disabled so dev never inadvertently mails subscribers.
    //
    // Cron drafts an issue by default. Set env GENERATOR_AUTOSEND_DIGEST=true
    // on the Lambda to autosend instead (writes "sent" rows directly).
    if (isProd) {
      // Day-of-month "1,15" runs on the 1st + 15th — gives a stable
      // ~14-day cadence without the complexity of weekday math.
      new sst.aws.Cron("NewsletterDigest", {
        schedule: "cron(0 9 1,15 * ? *)",
        job: {
          handler: "src/cron/trigger-digest.handler",
          link: [CRON_SECRET],
          environment: {
            DIGEST_URL: $interpolate`${web.url}api/cron/digest`,
          },
          runtime: "nodejs22.x",
          timeout: "120 seconds",
        },
      });
    }

    // ─── AWS Budgets alarm (cost guardrail) ────────────────────────────
    // Two thresholds: $5 (warning) and $25 (action) per month.
    // TODO(user): replace BUDGET_ALERT_EMAIL with the address you actually
    // monitor. Default below uses the agency inbox.
    new aws.budgets.Budget("MonthlyBudget", {
      name: `publicpulse-website-${stage}-monthly`,
      budgetType: "COST",
      limitAmount: isProd ? "25" : "5",
      limitUnit: "USD",
      timeUnit: "MONTHLY",
      notifications: [
        {
          comparisonOperator: "GREATER_THAN",
          notificationType: "ACTUAL",
          threshold: 80,
          thresholdType: "PERCENTAGE",
          subscriberEmailAddresses: ["info@publicpulse.com.bd"],
        },
        {
          comparisonOperator: "GREATER_THAN",
          notificationType: "FORECASTED",
          threshold: 100,
          thresholdType: "PERCENTAGE",
          subscriberEmailAddresses: ["info@publicpulse.com.bd"],
        },
      ],
    });

    return {
      url: web.url,
      stage,
    };
  },
});
