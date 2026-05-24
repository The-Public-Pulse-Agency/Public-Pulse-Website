# publicpulse.com.bd — SEO Audit & Rebuild Reference

**Audit date:** 2026-05-24
**Live site:** https://publicpulse.com.bd
**Crawler:** WebFetch + curl (no-JS) and Chrome DevTools MCP (rendered DOM + Lighthouse)
**Constraint:** infrastructure (S3 + CloudFront + Route 53 in `ap-southeast-1`) is fixed; rebuild is application-only.

---

## TL;DR — top 5 things to fix

1. **The 9 service detail URLs in `sitemap.xml` return HTTP 404.** No static HTML exists at `/services/<slug>` — CloudFront serves the homepage body as the S3 NoSuchKey error page. Google will not index any service page. This single issue tanks ~50% of the site's potential organic surface.
2. **All non-blog pages route through React but React never updates `<title>`, `<meta>`, or `<link rel=canonical>`.** On `/services/political-pr` the document title and canonical are still the homepage's — even after the SPA has rendered. The site behaves as if `react-helmet` was never installed.
3. **Schema is misclassified everywhere.** Every one of the 17 indexable URLs ships exactly one JSON-LD block — the same `LocalBusiness`. No `Article` on blog posts, no `Service`/`Offer` on service pages, no `BreadcrumbList`, `FAQPage`, `Organization`, or `WebSite` (with `SearchAction`). All structured-data search features are unavailable.
4. **Identical static `<h1>` on every page.** The SEO fallback `<h1>` inside `#root` is the homepage's H1 on all 17 files. HTML-only crawlers see 17 pages claiming to be the homepage. (React renders the right H1 on the client; pure-HTML and many AI crawlers don't.)
5. **No `Cache-Control` headers on the hashed JS bundle.** `assets/index-CpBUpK7y.js` is content-hashed (safe to cache forever) but has no `Cache-Control`. Set `public, max-age=31536000, immutable` on `/assets/*` and `no-cache` on HTML.

Plus 12 ready-made hero images (`blog-*.jpg`) sit unused — the React code never references them, so every blog post is image-less.

---

## Crawl coverage

26 URLs in `sitemap.xml` → 17 backed by static HTML, 9 missing (all `/services/<slug>` pages).

| URL | HTTP | Body size | Notes |
|---|---|---|---|
| `/` | **200** | 10,498 B | homepage HTML |
| `/about` | 302 → `/about/` (200, 10,406 B) | | trailing-slash redirect |
| `/services` | 302 → `/services/` (200, 10,394 B) | | trailing-slash redirect |
| `/blog` | 302 → `/blog/` (200, 10,402 B) | | trailing-slash redirect |
| `/contact` | 302 → `/contact/` (200, 10,322 B) | | trailing-slash redirect |
| `/services/political-pr` | **404** | 10,498 B | NoSuchKey from S3, body = homepage |
| `/services/social-media` | **404** | 10,498 B | same |
| `/services/content-production` | **404** | 10,498 B | same |
| `/services/paid-ads` | **404** | 10,498 B | same |
| `/services/hospitality` | **404** | 10,498 B | same |
| `/services/brand-building` | **404** | 10,498 B | same |
| `/services/seo-website` | **404** | 10,498 B | same |
| `/services/analytics-reporting` | **404** | 10,498 B | same |
| `/services/influencer-marketing` | **404** | 10,498 B | same |
| `/blog/<slug>` × 12 | 200 | ~10.3 kB each | per-page static HTML exists |
| `/this-page-does-not-exist-12345` | **404** | 10,498 B | real 404, body = homepage |

### 404 handling

- Unknown URLs return **HTTP 404** with the homepage body. This is **correct** for a SPA (Google sees the 404 status and de-indexes; browsers render the React app, which can show a routed 404 page).
- The problem is that the 9 service URLs in the sitemap also fall into this bucket. The site is **advertising 9 URLs to Google that all return 404**.

### Trailing-slash redirects

All `/<page>` URLs 302-redirect to `/<page>/`. Sitemap entries don't use trailing slashes, so every entry costs a wasted hop. Either:
- update `sitemap.xml` to use trailing slashes everywhere, or
- ship S3 keys at both `<page>` and `<page>/index.html` (rebuild can pick the form it wants).

---

## Per-page SEO inventory

### Homepage `/`
- **Title:** `Public Pulse Agency | Best Digital Marketing Agency in Bangladesh` (78 chars — slightly long, will truncate in SERPs)
- **Description:** `Public Pulse Agency — Bangladesh's leading digital marketing agency. Political PR, Social Media, Content Production, Paid Ads, Hospitality Marketing, Brand Building & SEO. Call +880 1717-714676` (200 chars — **too long**, Google caps ~160)
- **Canonical:** `https://publicpulse.com.bd/` ✓
- **Robots:** `index, follow, max-image-preview:large` ✓
- **OG:** complete (type, url, title, description, image 1200×630, site_name, locale) ✓
- **Twitter:** `summary_large_image` complete ✓
- **JSON-LD:** `LocalBusiness` only — missing `Organization`, `WebSite` (with `SearchAction` for sitelinks search), `BreadcrumbList`
- **Static H1 (fallback):** `Public Pulse Agency — Best Digital Marketing & Political PR Agency in Bangladesh`
- **Rendered H1 (post-JS):** `We Build Brands. We Drive Growth.`
- **Visible H2s:** `9 Core Services`, `Industries We Serve`, `Ready to grow?`, `Latest Articles`
- **Image formats:** zero `<img>` elements on the rendered homepage (hero is all-text + emoji)

### `/about/`
- **Title:** `About Public Pulse Agency | Digital Marketing Agency Bangladesh` ✓
- **Description:** `Learn about Public Pulse Agency — Bangladesh's leading digital marketing agency. 50+ clients, 10+ industries, 300%+ growth.` ✓
- **Canonical:** `https://publicpulse.com.bd/about` ✓
- **JSON-LD:** still only `LocalBusiness` — should add `AboutPage` + `Organization`
- **Static H1:** homepage H1 (wrong)
- **Rendered H1:** `About Public Pulse Agency` ✓
- **Visible H2s:** Our Story, Our Mission, Our Vision, What We Do, Why Choose Public Pulse Agency?, Industries We Serve, How We Work — 5-Step Process, Ready to Work With Us?
- Contains BIN `009043032-0102` and Trade License `TRAD/DNCC/037136/2025` — surface in `Organization` schema

### `/services/`
- **Title:** `Our Services | Public Pulse Agency — 9 Digital Marketing Services` ✓
- **Description:** `Political PR, Social Media, Content, Paid Ads, Hospitality, Branding, SEO, Analytics and Influencer Marketing.` ✓ (concise; could add value prop)
- **Canonical:** `https://publicpulse.com.bd/services` ✓
- **JSON-LD:** only `LocalBusiness` — should add `ItemList` of 9 `Service` items + `BreadcrumbList`
- **Static H1:** homepage H1 (wrong)
- **Rendered H1:** `Our Services` ✓
- **Visible H2s:** the 9 service names + `Flexible Pricing Plans` + `Not Sure Which Service You Need?`

### `/services/<slug>/` × 9 — ALL 404
- **HTTP status:** 404 from S3 (NoSuchKey)
- **Document title (post-JS):** **`Public Pulse Agency | Best Digital Marketing Agency in Bangladesh`** — i.e. the homepage's. React Router renders the right page in the DOM but never updates `<head>`.
- **Document description (post-JS):** homepage's
- **Canonical (post-JS):** **`https://publicpulse.com.bd/`** — all 9 service pages canonicalize to the homepage
- **OG (post-JS):** homepage's OG title, description, image
- **JSON-LD (post-JS):** `LocalBusiness` only (homepage's)
- **Static H1:** homepage H1 (wrong)
- **Rendered H1:** correct per page, e.g. `Political PR & Image Building`
- **Rendered H2 pattern (observed on `political-pr`):** `What's Included`, `Our Process`, `Why Choose Us for Political PR?`, `Related Services`, `Interested in Political PR?`
- **Rendered H3 pattern:** 5-step process (`Initial Consultation`, `Research & Strategy`, `Production & Launch`, `Monitor & Optimize`, `Report & Scale`) + 3 related-service cards
- **Missing schema:** `Service` (with `provider`, `serviceType`, `areaServed`, `offers`), `BreadcrumbList`, `FAQPage` if the page adds FAQs

### `/blog/`
- **Title:** `Blog | Public Pulse Agency — Digital Marketing Insights` ✓
- **Description:** `Expert articles on digital marketing, political PR, social media, SEO and brand building in Bangladesh.` ✓
- **Canonical:** `https://publicpulse.com.bd/blog` ✓
- **JSON-LD:** only `LocalBusiness` — should add `Blog` + `ItemList` of posts + `BreadcrumbList`
- **Static H1:** homepage H1 (wrong)
- **Rendered H1:** `Blog & Articles` ✓
- All 12 posts surfaced as H2s on the index ✓

### `/blog/<slug>/` × 12
- **Title:** unique per file ✓
- **Description:** unique per file but **very thin** (e.g. `"Complete guide to digital marketing in Bangladesh 2026."` — 53 chars; should be 140-160 with a hook)
- **Canonical:** correct ✓
- **`og:type`:** **`website`** — should be **`article`** for blog posts
- **OG description = title only.** No separate compelling OG description.
- **JSON-LD:** still only `LocalBusiness` — should be `Article` / `BlogPosting` with `author`, `datePublished`, `dateModified`, `image`, `publisher`, `mainEntityOfPage`, `wordCount`, `articleSection`
- **Missing image:** rendered DOM has **zero `<img>`** despite a matching `blog-<slug>.jpg` (28–42 kB) sitting in the bucket and served at 200. All 12 posts ship without their hero image.
- **Static H1:** homepage H1 (wrong)
- **Rendered H1:** correct, e.g. `Digital Marketing in Bangladesh 2026: The Complete Guide`
- **Internal linking:** post body has only 1 H3 (`Want expert advice?` CTA). No related-post links, no in-text cross-links to services, no in-text cross-links to other posts.
- **Word count:** ~5–9 paragraphs visible — short for guides claiming `12–14 min` read time on the index cards. Either content is missing in render, or read-times are inflated.

### `/contact/`
- **Title:** `Contact Public Pulse Agency | Free Consultation Dhaka` ✓
- **Description:** `Get a free digital marketing consultation. WhatsApp: +880 1717-714676. We reply within 24 hours.` ✓
- **Canonical:** `https://publicpulse.com.bd/contact` ✓
- **JSON-LD:** only `LocalBusiness` — should add `ContactPage` and surface contact channels in `Organization.contactPoint`
- **Rendered H1:** `Let's Talk` ✓
- **CTAs:** WhatsApp deep link, `tel:+8801717-714676`, `mailto:info@publicpulse.com.bd`
- **No HTML form.** Lead capture is 100% via WhatsApp/Call/Email click-through. Adding a real form (name/phone/service/message) materially helps both conversions and Meta/Google ad-click attribution.

---

## `robots.txt` & `sitemap.xml`

### `robots.txt` — fine
```
User-agent: *  → Allow: /
Sitemap: https://publicpulse.com.bd/sitemap.xml
Per-bot allow rules for Googlebot, Bingbot, facebookexternalhit, Twitterbot, LinkedInBot, WhatsApp
```
- ✓ sitemap referenced
- ⚠ no explicit disallow for `/assets/` (not required, but conventional)
- ⚠ no AI-crawler stance (`GPTBot`, `ClaudeBot`, `Google-Extended`, `PerplexityBot`, `CCBot`) — pick allow or disallow deliberately
- ⚠ `Crawl-delay: 1` for Googlebot — Googlebot **ignores** `Crawl-delay`; harmless but pointless

### `sitemap.xml` — multiple problems
- Lists 9 URLs that return 404 (the service detail pages). **Remove or fix.**
- No trailing slashes — every entry triggers a 302 redirect on crawl
- No `<lastmod>` on the 9 service pages or 12 blog posts
- No image sitemap (`<image:image>` per page) despite having OG images and 12 blog hero JPGs
- No `<changefreq>` on most entries
- Only one sitemap — fine at this size, but split blog + main when the corpus grows

---

## Lighthouse scores

Run via Chrome DevTools MCP in mobile mode. Note: this Lighthouse build does **not** include a numeric Performance category — perf data comes from a separate trace below.

| Page | Accessibility | Best Practices | SEO | Agentic Browsing |
|---|---|---|---|---|
| `/` | **87** | **81** | 100 | 100 |
| `/blog/digital-marketing-bangladesh-2026/` | **87** | **81** | 100 | 100 |
| `/services/political-pr` | n/a — 404 prevents audit | n/a | n/a | n/a |

**Caveat: SEO 100 is misleading.** Lighthouse's SEO score only checks title/description/viewport/canonical/robots/`lang` — it does not detect the canonical-points-to-homepage problem, the missing schema, the 9 404'd URLs in the sitemap, or the duplicate static H1. Treat the 100 as "no basic mistakes," not "SEO is good."

### Failing audits (both pages, identical)
- **Deprecated API:** Meta Pixel (`fbevents.js`) uses Attribution Reporting which is being removed by Chrome. Out of your control; ignore.
- **Color contrast:** `#94a3b8` (slate-400) on white = 2.56:1, fails WCAG AA (needs 4.5:1). Multiple instances. Bump to slate-500 (`#64748b` = 4.78:1) or slate-600.
- **No `<main>` landmark:** add `<main>` to the root layout for screen-reader navigation.

### Performance (from Chrome DevTools `performance_start_trace`, unthrottled desktop)
| Page | LCP | TTFB | Render delay | CLS |
|---|---|---|---|---|
| `/` | **1,145 ms** | 1 ms | 1,144 ms | 0.00 |
| `/blog/digital-marketing-bangladesh-2026/` | **1,058 ms** | 0.7 ms | 1,057 ms | 0.00 |

Numbers are great on a fast connection, but the **entire LCP budget is render delay** — i.e. waiting for the React bundle to parse, evaluate, and render. Throttled mobile (4G + mid-tier CPU) will balloon this. The fix is SSG (per-page rendered HTML) so first paint doesn't depend on JS.

---

## Bundle & assets

### JS bundle — single chunk, no code-splitting
- `site/assets/index-CpBUpK7y.js` — **343 KB raw / 106 KB gzipped**
- Single file = no route-level code splitting, no lazy boundary for blog content
- No source map shipped (good for security; bad for debugging)
- Loaded as `<script type="module" crossorigin src=…>` in `<head>` — render-blocking until the browser preloads and evaluates it

### Render-blocking resources (in document `<head>`)
1. Google Fonts CSS: `fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap` — has `&display=swap` ✓ but still render-blocks
2. Main JS bundle: `/assets/index-CpBUpK7y.js`
3. Inline GTM bootstrap + GA4 `gtag.js` (`async` ✓) + Meta Pixel (sync `<script>`, **not async** — should be deferred)

### Cache headers — missing
| Resource | `Cache-Control` | Recommendation |
|---|---|---|
| `/` (HTML) | none | `Cache-Control: public, max-age=0, must-revalidate` (or `no-cache`) |
| `/assets/index-*.js` | none | `Cache-Control: public, max-age=31536000, immutable` (hashed filename, safe) |
| `*.jpg`, `*.png`, `*.ico` | none | `Cache-Control: public, max-age=2592000` (30d) |

`deploy.sh` should set per-prefix `--cache-control` flags during `aws s3 sync`.

### Image formats — all JPG, no `<picture>`
- All 12 blog hero images are JPG (28–42 kB each, fine sizes but obsolete format)
- `og-image.jpg` is **96 kB** — the heaviest single image; convert to optimized JPG (~40 kB) or keep JPG for max OG compatibility but re-encode at quality 78
- No WebP or AVIF variants
- No `<picture>` with multiple `<source>` for format negotiation
- Rebuild should ship `.webp` + `.avif` + `.jpg` fallback, and use Vite's `?as=picture` or `vite-imagetools`

### Lazy-loading
- Not applicable on current site — there are no `<img>` tags in the rendered DOM at all
- In the rebuild, mark all non-LCP images as `loading="lazy"` and the hero LCP image as `fetchpriority="high"`

### Third-party tags
- GTM `GTM-TNK2J29K`
- GA4 `G-WVF3TSEL3Q` (plus a second `GT-PZV7LNFJ` referenced in inline `config` calls — unused?)
- Meta Pixel `938966755334049`
- These all fire on every page. Defer Pixel + GTM until interaction or `requestIdleCallback` to reclaim ~200ms LCP on slow networks.

---

## Internal linking gaps

Mapped via rendered DOM:

| Source | → Targets | Gap |
|---|---|---|
| Home | 9 service cards, 3 blog cards, About/Contact, Free Consult CTA | only 3 of 12 blog posts surface; rotate or show "View All" → /blog |
| /services | all 9 service detail cards, pricing CTA, contact CTA | no link to /blog (educational content for top-of-funnel) |
| Service detail (political-pr) | "Related Services" links to 3 sibling services, CTA to /contact | **no link to any blog post**; no link back to /services index |
| /blog | 12 post cards | no category filter, no tags, no service-area cross-links |
| Blog post | **only the "Want expert advice?" CTA** — no in-text links to services or related posts | the single biggest internal-linking miss; each post should link to 2–3 related posts + 1 relevant service |
| /about | no body links to specific services or case studies | should link to /services and to relevant blog posts |
| /contact | no body links | fine for a contact page |

**Net effect:** PageRank-style equity from the 12 blog posts pools at the homepage CTA and dies. Add 3–5 contextual internal links per blog post (related posts in same category + the service it sells).

---

## Findings — prioritized

### 🔴 HIGH (do these first, biggest SEO uplift)

| # | Finding | Where | Fix |
|---|---|---|---|
| H1 | 9 service detail URLs return 404; all are in sitemap | `/services/<slug>` × 9 | Ship per-page static HTML for all 9 service routes in the rebuild (Vite SSG, see "Rebuild" below) |
| H2 | React doesn't update `<title>`/`<meta>`/`<link rel=canonical>` after route changes | every route | Add a head-management lib (`react-helmet-async` or `@unhead/react`) **AND** pre-render every route at build time so the head is correct without JS |
| H3 | All pages canonicalize to homepage when rendered by React | service pages, blog posts | Fixed automatically by H2 + per-page SSG |
| H4 | No `Article` schema on blog posts | `/blog/<slug>` × 12 | Inject per-post JSON-LD `Article`/`BlogPosting` with author, dates, image, publisher, wordCount, articleSection |
| H5 | No `Service` / `ItemList` schema on service pages | `/services/<slug>` + `/services` | Per-page `Service` JSON-LD; `ItemList` of `Service` on /services |
| H6 | No `BreadcrumbList` anywhere | all sub-pages | Inject on every non-home page + render a visible breadcrumb UI |
| H7 | Identical static `<h1>` on every page | every `index.html` | Each page's SSG output must contain its own correct `<h1>` server-side |
| H8 | Sitemap lists 404 URLs and has no trailing slashes | `sitemap.xml` | Regenerate from build manifest; include `<lastmod>` for every URL; add image sitemap entries |
| H9 | Blog posts ship without their hero image | `/blog/<slug>` | Reference `blog-<slug>.{avif,webp,jpg}` from the post component; mark first one `fetchpriority="high"` |
| H10 | Blog meta descriptions are 1 sentence | `/blog/<slug>` × 12 | Rewrite each to 140-160 chars with a hook + outcome + CTA word |
| H11 | `og:type=website` on blog posts | `/blog/<slug>` × 12 | Set `og:type=article`; add `article:author`, `article:published_time`, `article:section`, `article:tag` |

### 🟡 MEDIUM (do once HIGH is shipping)

| # | Finding | Fix |
|---|---|---|
| M1 | No `Organization` or `WebSite` schema on home | Add both; `WebSite` should include `potentialAction: SearchAction` once site search exists |
| M2 | No `FAQPage` schema anywhere | Add 3–5 FAQs per service page + per blog post; mark with `FAQPage` schema |
| M3 | Contact page has no HTML form | Add a real form (name/phone/service/message) → submits to Formspree/Netlify Forms/SES via an API endpoint; mirrors via WhatsApp/email |
| M4 | No `Cache-Control` headers on any asset | Update `deploy.sh` to set per-prefix `--cache-control` (`immutable` on `/assets/*`, short on HTML) |
| M5 | No WebP/AVIF; only JPG | Ship 3 formats via `<picture>`; use Vite imagetools or sharp at build time |
| M6 | Internal linking: blog posts don't link to services or related posts | Add 2 contextual `<Link to=/services/...>` per post + a "Related posts" component (3 cards) |
| M7 | Color contrast 2.56:1 on slate-400 text | Replace with slate-500 or darker for body copy |
| M8 | Missing `<main>` landmark | Wrap page content in `<main>` |
| M9 | Long homepage meta description (200 chars) | Trim to ≤160 |
| M10 | Lifelong meta `keywords` tag | Remove (Google ignores; signals "amateur SEO") |
| M11 | Trailing-slash 302s on `/about`, `/services`, `/blog`, `/contact` | Either update sitemap to include `/`, or configure S3 to serve at both keys |
| M12 | No `humans.txt`, no `security.txt`, no `manifest.webmanifest` for PWA | Add `site.webmanifest` with theme color, icons, name |
| M13 | Meta Pixel loads synchronously in `<head>` | Move to body-end with `async`, or load after first user interaction |
| M14 | Two GA configs referenced (`G-WVF3TSEL3Q` and `GT-PZV7LNFJ`) | Audit and remove the unused one |
| M15 | No `hreflang` tags | Add `<link rel=alternate hreflang="en-bd">` and `hreflang="x-default"` if you stay English-only; required if you later add Bangla |

### 🟢 LOW (polish)

| # | Finding | Fix |
|---|---|---|
| L1 | No `<link rel=alternate type=application/rss+xml>` for the blog | Generate `/blog/rss.xml` at build |
| L2 | No view-transitions / SPA route announcements | Optional UX polish |
| L3 | `Crawl-delay: 1` for Googlebot in `robots.txt` (Googlebot ignores it) | Remove |
| L4 | No explicit AI-crawler stance in `robots.txt` | Decide: allow `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended` or block. Default to allow for visibility. |
| L5 | Single 343 KB JS bundle, no code splitting | Route-level lazy imports for blog templates and service templates |
| L6 | No 404 page UI in React Router | Add a branded 404 with search and top links |
| L7 | No `Content-Security-Policy` or `Strict-Transport-Security` headers | CloudFront response headers policy (infra change — out of scope) |

---

## TASK 2 — Rebuild reference

### Brand identity (extracted from live site)

**Logo:** wordmark — `PUBLIC` (bold, uppercase) + `pulse.agency` (lighter weight). Two-line stacked in header. No icon mark visible.

**Color palette** (from computed styles)

| Role | Hex / RGB | Use |
|---|---|---|
| Primary brand red | `#D32F2F` rgb(211, 47, 47) | theme-color, primary CTAs, link accents |
| Deep navy | `#0F1B3D` rgb(15, 27, 61) | H1/H2 headings color, dark section backgrounds |
| Body text | `#1E293B` slate-800 | default body color |
| Muted text | `#94A3B8` slate-400 (⚠ low contrast) | metadata — **switch to slate-500/600** |
| Surface light | `#FFFFFF` | default page background |
| Surface alt | `#F5F7FA` | section alt backgrounds |
| Border / divider | `#E2E8F0` slate-200 | hairline borders |
| WhatsApp green | `#25D366` rgb(37, 211, 102) | floating WhatsApp chat button |
| Facebook blue | `#1877F2` | social CTA |
| Instagram pink | `#E4405F` | social CTA |
| Category tints (7% opacity overlays) | `#D32F2F` red, `#1565C0` blue, `#6A1B9A` purple, `#00897B` teal, `#2E7D32` green, `#EF6C00` orange, `#0F1B3D` navy, `#795548` brown, `#AD1457` magenta | service-card background washes, blog category chips |

These 9 category tints map 1:1 to the 9 services and the blog category chips (`Digital Marketing`, `Political PR`, `Hospitality`, etc.) — preserve them.

**Typography**

| Where | Family | Weight | Size |
|---|---|---|---|
| All headings & body | `DM Sans` (Google Fonts), `sans-serif` fallback | 400/500/600/700/800 (all 5 weights loaded) | — |
| H1 | DM Sans 800 | 72 px (desktop) / smaller on mobile | line-height 1.08 |
| H2 | DM Sans 700–800 | ~48 px | — |
| Body | DM Sans 400 | 16 px | line-height 1.6 |

DM Sans is the only font family. Keep it.

**Layout patterns**

- Fixed white nav bar with wordmark left, link list center-right, `Free Consultation` red pill CTA far right
- Floating WhatsApp button bottom-right (green circle, emoji `💬`)
- Hero: centered large heading + subhead + two CTAs (primary red `Get Free Consultation`, secondary outline `Our Services →`), 4 stat tiles below (`50+ Active Clients`, `300%+ Avg Growth`, `10+ Industries`, `24/7 Support`)
- Service cards: emoji top-left, H3 title, one-line description, full card is a link, faint category-color tint background
- Industry stat grid: emoji + percentage delta + label, 8 industries on home (Resorts, Restaurants, E-Commerce, Fashion, Healthcare, Education, Real Estate, Startups)
- "Latest Articles" / blog index cards: category chip top, H3 title, date + read-time meta
- Footer: 4 columns — wordmark + social, Services links, Blog/Contact links, contact info — plus BIN + Trade License microcopy
- Sections alternate between white and `#F5F7FA` surface

### Inventory — 9 services (URL, slug, H1, one-liner)

Pulled from rendered DOM + homepage cards.

| # | URL | H1 (rendered) | One-line summary (homepage card) |
|---|---|---|---|
| 1 | `/services/political-pr` | Political PR & Image Building | Candidate image building, crisis management, election campaigns, narrative making. |
| 2 | `/services/social-media` | Social Media Management | Facebook, Instagram, YouTube, TikTok — full platform management. |
| 3 | `/services/content-production` | Content Production | Video, photo, motion graphics, drone shoots — strategy-driven content. |
| 4 | `/services/paid-ads` | Paid Ads & Campaigns | Meta, Google, YouTube — maximum ROI at minimum cost. |
| 5 | `/services/hospitality` | Hospitality Marketing | Resorts, restaurants, hotels — from Cox's Bazar to Sylhet. |
| 6 | `/services/brand-building` | Brand Building & Design | Logo, identity, packaging — make your brand unforgettable. |
| 7 | `/services/seo-website` | SEO & Website Development | Rank #1 on Google. Professional websites that convert. |
| 8 | `/services/analytics-reporting` | Analytics & Performance Reporting | Data dashboards, ROI tracking, actionable insights. |
| 9 | `/services/influencer-marketing` | Influencer & KOL Marketing | Micro to mega influencers — authentic campaigns that convert. |

**Service detail template** (observed on `political-pr`, presumed for the other 8):
- Hero with H1 + intro paragraph
- `<h2>What's Included</h2>` — bulleted scope-of-work
- `<h2>Our Process</h2>` — 5-step `<h3>` cards: Initial Consultation → Research & Strategy → Production & Launch → Monitor & Optimize → Report & Scale
- `<h2>Why Choose Us for [Service]?</h2>`
- `<h2>Related Services</h2>` — 3 sibling-service cards
- `<h2>Interested in [Service]?</h2>` — CTA to /contact

### Inventory — 12 blog posts

| # | URL | Title | Category | Date | Read | Hero image (already in bucket) |
|---|---|---|---|---|---|---|
| 1 | `/blog/digital-marketing-bangladesh-2026` | Digital Marketing in Bangladesh 2026: The Complete Guide | Digital Marketing | Apr 13, 2026 | 12 min | `blog-digital-marketing-bangladesh-2026.jpg` |
| 2 | `/blog/political-pr-election-strategy` | Political PR & Election Campaign Strategy: The Definitive Guide | Political PR | Apr 10, 2026 | 14 min | `blog-political-pr-election-strategy.jpg` |
| 3 | `/blog/restaurant-marketing-dhaka` | Restaurant Marketing in Dhaka: How to Boost Orders by 60% | Hospitality | Apr 5, 2026 | 10 min | `blog-restaurant-marketing-dhaka.jpg` |
| 4 | `/blog/facebook-ads-guide-bangladesh` | Facebook Ads Guide: Running Profitable Campaigns in Bangladesh | Paid Ads | — | — | `blog-facebook-ads-guide-bangladesh.jpg` |
| 5 | `/blog/brand-building-startup-guide` | Brand Building for Startups: Complete Guide from Zero to Hero | Branding | — | — | `blog-brand-building-startup-guide.jpg` |
| 6 | `/blog/resort-marketing-coxs-bazar` | Resort Marketing in Cox's Bazar: How to Boost Bookings by 45% | Hospitality | — | — | `blog-resort-marketing-coxs-bazar.jpg` |
| 7 | `/blog/content-production-video-tips` | How Video Content Will Transform Your Business in 2026 | Content | — | — | `blog-content-production-video-tips.jpg` |
| 8 | `/blog/seo-guide-bangladesh-business` | SEO Guide: How to Rank Your Business #1 on Google in Bangladesh | SEO | — | — | `blog-seo-guide-bangladesh-business.jpg` |
| 9 | `/blog/ecommerce-growth-strategy` | E-Commerce Growth Strategy: Scaling Online Sales in Bangladesh 2026 | E-Commerce | — | — | `blog-ecommerce-growth-strategy.jpg` |
| 10 | `/blog/influencer-marketing-bangladesh` | Influencer Marketing in Bangladesh: The Complete Strategy Guide | Influencer | — | — | `blog-influencer-marketing-bangladesh.jpg` |
| 11 | `/blog/google-ads-search-display` | Google Ads Mastery: Search & Display Advertising for Bangladesh | Paid Ads | — | — | `blog-google-ads-search-display.jpg` |
| 12 | `/blog/crisis-management-pr-guide` | Crisis Management & PR: Protecting Your Brand's Reputation | PR | — | — | `blog-crisis-management-pr-guide.jpg` |

Categories shown above match the chip colors on the live blog cards. Confirm dates 4–12 and read-times during rebuild (the live blog index renders them but our snapshot only captured the 3 featured on the home page).

### Rebuild — recommended file structure

Vite + React 18 + TypeScript + Tailwind + shadcn/ui, with `vite-ssg` for per-route static HTML generation. This is critical: SSG (not just SPA) is what makes every URL show up to Google with the correct `<head>` and visible body — fixing H1/H2/H3/H7 in one shot.

```
publicpulse-website/
├── deploy.sh                       # existing — extend with --cache-control flags
├── preview.sh                      # existing
├── pull.sh                         # existing
├── README.md
├── AUDIT.md                        # this file
├── package.json
├── tsconfig.json
├── vite.config.ts                  # vite + vite-ssg + imagetools plugins
├── tailwind.config.ts              # extend theme.colors with brand palette
├── postcss.config.js
├── index.html                      # shell template (head minus per-page tags)
├── public/
│   ├── favicon.ico, favicon-16x16.png, favicon-32x32.png, favicon-192x192.png
│   ├── apple-touch-icon.png
│   ├── og-image.jpg                # re-encode at q78
│   ├── robots.txt                  # regenerated, with AI-crawler stance
│   ├── site.webmanifest            # NEW — PWA manifest
│   └── (images/ promoted into src/assets/blog/* for hashing)
├── src/
│   ├── main.tsx                    # vite-ssg entry: routes + setup head/router
│   ├── App.tsx                     # <Outlet/> + global layout
│   ├── routes.tsx                  # central route table consumed by vite-ssg crawler
│   ├── layouts/
│   │   ├── RootLayout.tsx          # <main>, header, footer, WhatsApp floater
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── WhatsAppFab.tsx
│   ├── components/
│   │   ├── ui/                     # shadcn/ui generated: button, card, badge, sheet, ...
│   │   ├── Seo.tsx                 # wraps @unhead/react — title/description/canonical/OG/Twitter/JSON-LD
│   │   ├── JsonLd.tsx              # typed builders for Organization, Article, Service, BreadcrumbList, FAQPage
│   │   ├── Breadcrumbs.tsx         # visible + emits BreadcrumbList JSON-LD
│   │   ├── ServiceCard.tsx
│   │   ├── BlogCard.tsx
│   │   ├── StatTile.tsx
│   │   ├── CategoryChip.tsx
│   │   ├── Faq.tsx                 # <details>/<summary> + FAQPage JSON-LD
│   │   ├── RelatedPosts.tsx
│   │   ├── ContactForm.tsx         # NEW — replaces click-only contact
│   │   └── Picture.tsx             # <picture> with avif/webp/jpg sources + lazy + fetchpriority
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   ├── ServicesIndex.tsx
│   │   ├── ServiceDetail.tsx       # dynamic, one per slug — reads from content/services
│   │   ├── BlogIndex.tsx
│   │   ├── BlogPost.tsx            # dynamic, one per slug — reads from content/posts
│   │   ├── Contact.tsx
│   │   └── NotFound.tsx            # branded 404
│   ├── content/
│   │   ├── services/
│   │   │   ├── political-pr.mdx
│   │   │   ├── social-media.mdx
│   │   │   ├── content-production.mdx
│   │   │   ├── paid-ads.mdx
│   │   │   ├── hospitality.mdx
│   │   │   ├── brand-building.mdx
│   │   │   ├── seo-website.mdx
│   │   │   ├── analytics-reporting.mdx
│   │   │   └── influencer-marketing.mdx
│   │   └── posts/
│   │       └── (12 MDX files, slugs as listed above)
│   ├── lib/
│   │   ├── content.ts              # MDX frontmatter loader (title, description, ogImage, author, date, category, faqs, relatedSlugs)
│   │   ├── seo.ts                  # helpers: buildTitle, truncateDescription, canonical
│   │   ├── schema.ts               # @types/schema-dts builders
│   │   └── tracking.ts             # GA4 + Meta Pixel + GTM dataLayer helpers (lazy-init)
│   ├── assets/
│   │   ├── blog/                   # 12 hero JPGs → imagetools → avif+webp+jpg
│   │   └── og/                     # OG generation source if you template OG images
│   └── styles/
│       └── globals.css             # tailwind base + DM Sans @font-face (self-host or preconnect+swap)
├── scripts/
│   ├── generate-sitemap.ts         # crawl routes + content frontmatter → sitemap.xml (with <lastmod>, <image:image>)
│   ├── generate-rss.ts             # blog RSS
│   └── check-links.ts              # crawl built /dist for broken links and orphan pages
└── dist/                           # vite-ssg output — what deploy.sh syncs to S3
```

**Build pipeline**

1. `vite build` → `vite-ssg build` pre-renders every route in `routes.tsx` to its own `index.html` with correct `<head>` and visible body
2. `scripts/generate-sitemap.ts` reads from the same route table + MDX frontmatter, emits `dist/sitemap.xml` with `<lastmod>` + `<image:image>`
3. `scripts/generate-rss.ts` emits `dist/blog/rss.xml`
4. `deploy.sh` syncs `dist/` to S3 with per-prefix `--cache-control`:
   ```
   aws s3 sync dist/ s3://publicpulse.com.bd/ \
     --exclude "assets/*" \
     --cache-control "public, max-age=0, must-revalidate"
   aws s3 sync dist/assets s3://publicpulse.com.bd/assets/ \
     --cache-control "public, max-age=31536000, immutable"
   aws s3 sync dist/ s3://publicpulse.com.bd/ \
     --exclude "*" --include "*.jpg" --include "*.png" --include "*.webp" --include "*.avif" \
     --cache-control "public, max-age=2592000"
   ```
5. CloudFront invalidation on `/*`

**Key dependencies**

```
"react": "^18.3", "react-dom": "^18.3", "react-router-dom": "^6",
"vite": "^5", "vite-ssg": "^0.24", "vite-imagetools": "^7",
"@unhead/react": "^1", "schema-dts": "^1",
"tailwindcss": "^3", "@tailwindcss/typography": "^0",
"clsx": "*", "class-variance-authority": "*",
"@radix-ui/react-*": (whatever shadcn pulls in)
"@mdx-js/rollup": "^3", "remark-gfm": "*", "rehype-slug": "*"
```

shadcn primitives needed: `Button`, `Card`, `Badge`, `Sheet` (mobile nav), `Accordion` (FAQs), `Input`, `Textarea`, `Select`, `Toast` (form feedback).

---

## Quick wins (no rebuild required)

Edits the user can ship from the current `site/` mirror today, before the React rewrite is done:

1. **Remove the 9 service URLs from `sitemap.xml`** (they 404; sending Google to dead URLs is worse than not advertising them)
2. **Switch all sitemap URLs to trailing-slash form** to skip the 302 hops
3. **Trim the homepage `<meta name="description">`** from 200 → 158 chars
4. **Set `Cache-Control` headers in `deploy.sh`** with the 3 `aws s3 sync` blocks above + a CloudFront invalidation
5. **Re-encode `og-image.jpg`** at quality 78 → ~40 kB
6. **Remove `<meta name="keywords">`** from all 17 files (Google ignores; signals weak SEO)
7. **Decide on AI crawlers** in `robots.txt` and add explicit rules
8. **Add `<meta name="robots" content="noindex">` to the 9 service detail URLs** — wait, no, the static HTML doesn't exist for them; instead, **add `<meta name="robots" content="noindex">` to the `/services/political-pr` etc. routes via React when the route is a 404** so that even if Google JS-renders them, it knows not to index. The real fix is making them 200 pages with content (rebuild).

Items 1, 2, 3, 4, 5, 6, 7 are 15-minute changes against the existing `site/` mirror and the existing `deploy.sh`. They will not regress anything.
