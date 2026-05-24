# publicpulse.com.bd

Production rebuild of the Public Pulse Agency website — a Bangladesh-based digital marketing & political PR agency, sister concern within **Pulse Group**.

Live site: https://publicpulse.com.bd
AWS account: `739275468267` (region `ap-southeast-1`)
CloudFront dist: `EFMM4G8ZO6TJX` · S3 bucket: `publicpulse.com.bd` · Route 53 zone: `Z00453651ICNJYNV229CW` · AWS CLI profile: `eventpulse`

---

## Stack (matches TenderPulse setup)

- **Frontend:** Next.js 15 (App Router) + TypeScript **strict** + Tailwind CSS + shadcn/ui
- **Hosting:** SST v3 (OpenNext) → CloudFront + Lambda + S3 *(infra wiring lands in a later step)*
- **Database:** Neon Postgres (serverless) via Drizzle. **Lambda OUTSIDE VPC**, connect over public TLS. **No RDS. No NAT Gateway.**
- **Email:** Amazon SES
- **Secrets:** SSM Parameter Store (**not** Secrets Manager)
- **Observability:** CloudWatch with short log retention; AWS Budgets alert in place
- **Rendering:** ISR/SSG for marketing + programmatic pages; SSR only where genuinely needed

---

## Always do

- **One unique `<h1>` per page.** Verify it appears in the built SSR HTML, not just after hydration.
- **Every page exports `generateMetadata`** producing a unique title, description, canonical URL, Open Graph, and Twitter card.
- **Every content page emits JSON-LD** using helpers in `src/lib/schema.ts` — never hand-roll. Use the matching `@type` (Article, Service, BreadcrumbList, FAQPage, QAPage) — and `Organization` with `parentOrganization: Pulse Group` site-wide.
- **Every service and blog page renders an `<AnswerBlock>`** at the top — a 40–60 word quotable answer for AEO/GEO (Google AI Overviews, ChatGPT, Perplexity, Claude).
- **`robots.txt` ALLOWS** GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot. Visibility to AI assistants is intentional.
- **Sitemap is built as an index** with per-section sitemaps, designed to scale to thousands of programmatic pages without rewriting.
- **Verify every build:** `cat .next/server/app/<route>.html | grep -E 'title|canonical|application/ld\+json'` before considering the route done.
- **Preserve existing tracking IDs:** GTM `GTM-TNK2J29K`, GA4 `G-WVF3TSEL3Q`, Meta Pixel `938966755334049`.
- **Preserve contact details:** phone `+8801717714676`, WhatsApp deep link `https://wa.me/message/TBIM4KYTCFPEI1`, email `info@publicpulse.com.bd`.

## Never do

- Don't introduce RDS, ElastiCache, NAT Gateway, or any always-on infra. The stack is intentionally serverless-first to keep monthly cost low.
- Don't use Secrets Manager — SSM Parameter Store (`SecureString`) is the standard here.
- Don't hand-roll JSON-LD — always go through `src/lib/schema.ts` so the typed builders enforce required fields and `@id` cross-links between Organization, Service, Article.
- Don't drop the AI-crawler allow rules from `robots.txt`.
- Don't put Lambda inside a VPC. We pay for Neon's connection layer specifically so we can keep Lambda cold-start fast and skip NAT.

## Session log rule (enforced)

At the **end of every session**, append a dated entry to [docs/JOURNEY.md](docs/JOURNEY.md):
- Date + a one-line summary
- What changed (files, decisions)
- Open questions / next steps

This is the canonical handoff between sessions. Without it the next session starts blind.

---

## Imports

@docs/ARCHITECTURE.md
@docs/SEO-AEO-GEO.md
@docs/BRAND.md
@docs/JOURNEY.md
