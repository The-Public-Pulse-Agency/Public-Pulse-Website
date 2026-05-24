# Architecture

## Runtime topology

```text
Browser
  │  CloudFront (Edge POPs, ap-southeast-1 + global)
  ▼
┌──────────────────────────────────────────────────┐
│ CloudFront distribution EFMM4G8ZO6TJX            │
│   • / and /static/* → S3 (SSG pages, assets)     │
│   • /_next/* and dynamic routes → Lambda@OpenNext │
└──────────────────────────────────────────────────┘
   │                              │
   ▼                              ▼
 S3 bucket                  Lambda (OpenNext)
 publicpulse.com.bd         • Node 22.x
                            • OUTSIDE VPC
                            • TLS → Neon Postgres
                            • TLS → SES
                            • SSM Parameter Store for secrets
```

## Stack decisions and why

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 App Router | Per-route metadata, streaming, SSG/ISR/SSR side-by-side, mature ecosystem |
| Language | TypeScript strict | Cheapest correctness investment |
| Styling | Tailwind + shadcn/ui | Token-driven brand system, ownership of component code |
| Hosting | SST v3 + OpenNext on AWS | Lives in the same account/region as our other Pulse properties (`739275468267`, `ap-southeast-1`), avoids vendor lock-in vs Vercel |
| Database | Neon Postgres (serverless) | Pay-per-use, autoscaling, no idle cost. **Connect over public TLS — no VPC, no NAT** |
| ORM | Drizzle | Lightweight, SQL-first, edge-friendly |
| Email | Amazon SES | In-account, cheap, integrates with SST |
| Secrets | SSM Parameter Store (`SecureString`) | Free tier covers our volume; Secrets Manager would be $0.40/secret/month for nothing extra |
| Logging | CloudWatch, **7-day retention** by default | Logs are debugging aids, not an archive — long retention is silent cost |
| Cost guardrail | AWS Budgets alert at $5/mo and $25/mo | Catches runaway misconfiguration in days, not at end of month |

## Cost-conscious anti-patterns to refuse

- **No RDS** (or Aurora) — we have Neon
- **No ElastiCache** — use Next's revalidate + CloudFront for HTTP caching; if app caching is needed, use Upstash Redis or a Neon table
- **No NAT Gateway** — the moment something asks for VPC, ask why. The whole stack is built to avoid this
- **No always-on EC2 / Fargate** — Lambda only
- **No Secrets Manager** — SSM Parameter Store
- **No CloudWatch Logs retention = Never** — set retention on every log group

## Rendering strategy per route

| Route pattern | Mode | Reason |
|---|---|---|
| `/` | SSG | static brand content |
| `/about` | SSG | static |
| `/services` | SSG | static index |
| `/services/[slug]` | SSG (generateStaticParams over content) | 9 today, scales to N |
| `/blog` | ISR (revalidate: 3600) | static now, ready for CMS later |
| `/blog/[slug]` | SSG (generateStaticParams over content) | 12 today, scales |
| `/contact` | SSG | static |
| `/group` | SSG | reads from `src/lib/group.ts` |
| `/api/contact` | Edge route handler (future) | form submission → SES |
| `/sitemap.xml` | Built via App Router `sitemap.ts` | sitemap index + per-section |
| `/robots.txt` | Built via App Router `robots.ts` | |
| `/feed.xml` | Route handler | RSS for blog |
| `/llms.txt`, `/llms-full.txt` | `public/` static | AEO/GEO surfaces |

## Provisioned, not yet wired

- **Neon Postgres** project exists in `ap-southeast-1` (region matches our AWS account). Pooled endpoint URL is held by the user and lives in `.env.local` / SSM Parameter Store — **never** in this repo. See [.env.example](../.env.example) for the variable name (`DATABASE_URL` / `DATABASE_URL_DIRECT`). First app integration will be via Drizzle when a route needs persistence.

## Secret handling — non-negotiable

- Local dev: `.env.local` (gitignored). Variable names mirror `.env.example`.
- Production: SSM Parameter Store, type `SecureString`, name pattern `/publicpulse/<env>/<key>`. Read in Lambda via the AWS SDK at cold start.
- **Never** commit a real value. **Never** paste into a chat transcript (it's logged on both ends — rotate immediately if you do).
- Periodically `gh secret list` / `aws ssm describe-parameters` to audit what's where.

## Foundation step 1 — what's wired

- ✅ Next.js 15 + TS strict + Tailwind v3
- ✅ Root layout with `<main>`, brand fonts (DM Sans via `next/font`), tracking scripts preserved
- ✅ SEO core: `src/lib/seo.ts` metadata helpers + `src/lib/schema.ts` JSON-LD builders
- ✅ `<AnswerBlock>`, `<JsonLd>`, `<Breadcrumbs>` components
- ✅ Pulse Group typed config in `src/lib/group.ts` + stub `/group` page + footer "Sister Concerns" block
- ✅ One sample service page (`/services/political-pr`) + one sample blog post (`/blog/digital-marketing-bangladesh-2026`)
- ✅ `robots.ts`, `sitemap.ts`, `feed.xml`, `llms.txt`, `llms-full.txt`
- ⏳ SST v3 + OpenNext deploy config — next step
- ⏳ Neon + Drizzle schema — only when a route needs persistence
- ⏳ SES contact form — separate step
- ⏳ Port the remaining 8 services + 11 blog posts
