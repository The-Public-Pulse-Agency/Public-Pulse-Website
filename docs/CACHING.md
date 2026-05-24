# Caching policy

The single most important architecture rule:

> **The public site is 100% statically cached at CloudFront. Every public page is SSG or ISR. ZERO database calls on the public request path.**

Dynamic public data (currently just `case_studies` for the homepage results section) is read **only at build/revalidate time** through a tagged cached data layer. Visitors never trigger a database read. Content edits in `/manage` call `revalidateTag()` / `revalidatePath()` — that is the only way public pages refresh.

Why this matters: Lambda invocations, Neon compute time, and CloudFront cache-miss origin requests are all things we pay for. A typical agency site gets bursty traffic from press hits and social shares. Caching is what keeps the AWS bill ≪ $25/mo even at thousand-visit spikes.

---

## Per-route decisions

| Route | Mode | TTL on CDN | Cache headers | Refresh trigger |
|---|---|---|---|---|
| `/` | ISR (revalidate via tag) | 1y, swr=1y | `s-maxage=31536000, stale-while-revalidate=31536000` | `revalidateTag('case-studies')` from /manage |
| `/about` | SSG | 1y | same | redeploy |
| `/services` | SSG | 1y | same | redeploy |
| `/services/[slug]` × 9 | SSG | 1y | same | redeploy |
| `/blog` | ISR (1h) | 1h, swr=1y | `s-maxage=3600, stale-while-revalidate=31536000` | revalidate timer or redeploy |
| `/blog/[slug]` | SSG | 1y | same as /about | redeploy |
| `/contact` (GET) | SSG | 1y | same | redeploy |
| `/group` | SSG | 1y | same | redeploy |
| `/sitemap.xml` | ISR (1h) | 1h, swr=1y | `s-maxage=3600, stale-while-revalidate=31536000` | revalidate timer |
| `/robots.txt` | SSG | 1y | same as /about | redeploy |
| `/feed.xml` | SSG | 1h | `public, max-age=3600, s-maxage=3600` | redeploy |
| `/llms.txt`, `/llms-full.txt` | Static (public/) | 30d | `public, max-age=2592000` | redeploy |
| **`/contact` POST (form submit)** | **`no-store`** | — | `cache-control: no-store, no-cache, must-revalidate` | write path only |
| **`/manage/*`** | **`no-store`** | — | `cache-control: no-store, no-cache, must-revalidate, private`<br>+ `x-robots-tag: noindex, nofollow` | per-request, never cached |
| **`/api/auth/*` (BetterAuth)** | **`no-store`** | — | `cache-control: no-store` | per-request |

`/_next/static/*` and content-hashed image variants from the image optimizer carry `cache-control: public, max-age=31536000, immutable` (default OpenNext / SST behavior — confirm in DEPLOY.md verification step).

---

## The cached data layer

All public-facing DB reads MUST go through `src/lib/data/*.ts` modules. Each module wraps queries with `unstable_cache` and a stable tag list. Direct `db.select()` calls from a public page are a bug.

```ts
// src/lib/data/case-studies.ts (pattern)
import { unstable_cache } from "next/cache";
import { db } from "@/db/client";
import { caseStudies } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";

export const getPublishedCaseStudies = unstable_cache(
  async () =>
    db
      .select()
      .from(caseStudies)
      .where(eq(caseStudies.published, true))
      .orderBy(desc(caseStudies.displayOrder), desc(caseStudies.publishedAt)),
  ["case-studies:published"],   // cache key
  { tags: ["case-studies"], revalidate: false }, // revalidate ONLY via tag
);
```

### Refresh path

`/manage` mutations (create / update / publish / unpublish / delete) MUST call:

```ts
import { revalidateTag, revalidatePath } from "next/cache";

revalidateTag("case-studies");
revalidatePath("/");             // belt-and-braces for the homepage
```

This is the *only* way a public page picks up content changes. No polling, no per-request DB hit, no SSR fallback.

### Tag inventory

| Tag | Read by | Invalidated by |
|---|---|---|
| `case-studies` | `getPublishedCaseStudies` (homepage) | /manage case-study CRUD |
| `leads` | (internal — /manage only) | new lead inserts |

Keep this table updated. A tag that nothing reads is dead code; a read that nothing invalidates is a stale-data bug.

---

## CloudFront cache behaviors (managed by SST/OpenNext)

OpenNext's Nextjs construct in [sst.config.ts](../sst.config.ts) wires these automatically. We rely on it; no custom CloudFront cache policies unless we hit a specific problem.

- **Default behavior** → Lambda (server) — but only fires on cache miss. Static pages cache at the edge for 1y on first hit.
- **`/_next/static/*`** → S3, `cache-control: public, max-age=31536000, immutable` (content-hashed filenames)
- **`/_next/image*`** → Image-optimizer Lambda; output cached at CloudFront (~1y for hashed variants). Each format/size combo is computed ONCE per origin POP.
- **ISR cache backing store** → S3 bucket (OpenNext default). Tag cache → DynamoDB (only used if revalidateTag is called; minimal cost given our low write volume).

---

## Image policy

- **Fixed blog hero images** (12 JPGs in `public/blog-*.jpg`) → served from S3 directly via `<Image>` — CloudFront caches the optimized variants at the edge after first request.
- **No per-request runtime image processing**. The first request to `/blog/<slug>` cold-starts the image optimizer ONCE per image variant; every subsequent request hits CloudFront cache.
- **TODO(user):** before going to production, pre-generate AVIF + WebP variants and ship them in `public/` (or move to a CDN like Cloudinary). The current approach is fine until traffic > 100k/mo.

---

## What is NOT cached, and why

| Path | Why uncached |
|---|---|
| `/manage/*` | Authenticated, dynamic per-user, contains private data |
| `/contact` POST | Write path — must hit the server, must invalidate any cached form-response state |
| `/api/auth/*` | Session establishment, sets cookies |
| Any future webhook endpoint | Idempotency aside, never safe to cache |

These paths emit `cache-control: no-store` from the response. They are the only routes that result in a Lambda invocation per request.

---

## Verification

Run these against the live deploy and paste the output into a JOURNEY entry:

```bash
# Cache HIT on a public page (run twice — second hit should be "Hit from cloudfront")
curl -sI "$URL/" | grep -iE 'x-cache|cache-control'
curl -sI "$URL/" | grep -iE 'x-cache|cache-control'

# /manage MUST be no-store (and 401/redirect without auth)
curl -sI "$URL/manage" | grep -iE 'cache-control|x-robots-tag|x-cache'

# Contact POST MUST be no-store
curl -sI -X POST "$URL/contact" | grep -iE 'cache-control|x-cache'
```

A public GET to `/` after deploy + warm-up should produce:

```
x-cache: Hit from cloudfront
cache-control: public, s-maxage=…, stale-while-revalidate=…
```

If you see `Miss from cloudfront` on a repeat hit, the cache key is mis-configured or the response is varying on a header it shouldn't vary on. Open an item in JOURNEY.md and investigate before merging.
