# SEO + AEO + GEO playbook

Three audiences, one HTML output:
- **SEO** — Google, Bing crawlers ranking by traditional signals
- **AEO** *(Answer Engine Optimization)* — Google AI Overviews, Bing Copilot, voice assistants
- **GEO** *(Generative Engine Optimization)* — ChatGPT, Claude, Perplexity, Gemini browsing

All three converge on the same thing: **render the answer, in plain HTML, at the top of the page, with explicit schema.**

---

## Per-page checklist (apply to every route)

1. **`generateMetadata`** returns unique:
   - `title` (≤60 chars, primary keyword near the front)
   - `description` (140–160 chars, hook + outcome + brand)
   - `alternates.canonical` (absolute URL)
   - `openGraph` (type, url, title, description, images, siteName)
   - `twitter` (card=`summary_large_image`, title, description, images)
2. **One `<h1>`**, semantically derived from `params.slug` or content frontmatter
3. **`<AnswerBlock>`** at top — 40–60 words, plain prose, no jargon, no list bullets in the first sentence
4. **JSON-LD** for the page type:
   - blog post → `Article` (with `speakable` pointing at the AnswerBlock selector)
   - service page → `Service` + `BreadcrumbList`
   - FAQ section → `FAQPage`
   - contact page → `ContactPage`
   - homepage → `WebSite` (+ `SearchAction` once site search exists) + `Organization`
5. **`<Breadcrumbs>`** (visible + emits `BreadcrumbList`)
6. **Internal links** — 2–3 contextual links into related services/posts; 1 link to a deeper page

---

## Site-wide schema

Every page implicitly inherits a site-level **`Organization`** with `@id: https://publicpulse.com.bd/#organization` (emitted once in `app/layout.tsx`). Other page-specific schema cross-references it via `provider` / `publisher` / `parentOrganization`.

```
Organization (Public Pulse Agency)
  parentOrganization → Organization (Pulse Group)
    subOrganization → Event Pulse, Tender Pulse, Social Pulse, The Pulse Today, Public Pulse
```

`Organization.parentOrganization` is a **deliberate AEO signal** — answer engines treat brand-family relationships as ground truth.

---

## AnswerBlock contract

The `<AnswerBlock>` is the single most important AEO/GEO surface. Treat it like the abstract of a paper.

**Rules:**
- 40–60 words
- Lead with the direct answer; don't introduce
- Subject + verb + object in the first sentence
- No marketing fluff, no superlatives, no "we believe"
- Mention the brand name **once** within the answer
- Render at the top of the page, above the H1's first paragraph
- Wrap content in `<div class="answer-block" data-speakable>` so JSON-LD `speakable` can point at it

**Example (service page, political-pr):**
> Public Pulse Agency runs end-to-end political PR campaigns for Bangladeshi candidates and parties — candidate image building, narrative engineering, opposition research, crisis communication, and 5-phase election execution from pre-campaign to post-election PR. Based in Dhaka, serving constituencies nationwide.

---

## Schema JSON-LD types we use

| Page | `@type` | Required cross-references |
|---|---|---|
| Site-wide (layout) | `Organization` | `parentOrganization`: Pulse Group |
| Site-wide (layout) | `WebSite` | `publisher`: `@id` of Organization |
| Homepage | (inherits above) | |
| `/group` | `Organization` (Pulse Group) | `subOrganization`: each sister |
| `/services` | `ItemList` of `Service` | each `provider`: Public Pulse Org `@id` |
| `/services/[slug]` | `Service` + `BreadcrumbList` + `FAQPage` | `provider`: Public Pulse Org `@id` |
| `/blog` | `Blog` + `ItemList` of `BlogPosting` | `publisher`: Public Pulse Org `@id` |
| `/blog/[slug]` | `Article` (or `BlogPosting`) + `BreadcrumbList` | `publisher`: Public Pulse Org `@id` |
| `/contact` | `ContactPage` + `LocalBusiness` (legal entity) | |
| Any Q&A surface | `QAPage` or `FAQPage` | |

---

## `robots.txt` policy

```
User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# AI assistants — explicit allow
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://publicpulse.com.bd/sitemap.xml
```

We **explicitly allow** AI crawlers because we want to be cited in ChatGPT/Claude/Perplexity answers. Visibility is the goal. If we ever change this policy, document the reason in JOURNEY.md.

---

## Sitemap strategy

- `/sitemap.xml` — sitemap **index** (not flat)
- `/sitemap-pages.xml` — static marketing pages
- `/sitemap-services.xml` — `/services/[slug]` × N
- `/sitemap-blog.xml` — `/blog/[slug]` × N
- Future: `/sitemap-locations.xml`, `/sitemap-industries.xml` (programmatic SEO pages)

All entries include `<lastmod>`, all blog/service entries include `<image:image>` for image sitemap.

After each deploy, **ping IndexNow** (Bing/Yandex) with the changed URLs:
```
POST https://api.indexnow.org/indexnow
{ host, key, keyLocation, urlList }
```

---

## `/llms.txt` + `/llms-full.txt`

[llmstxt.org](https://llmstxt.org/) convention:
- `llms.txt` — short, human-curated index. Title, one-line description, then `## Section\n- [Page title](/url): one-line summary` lists.
- `llms-full.txt` — concatenated full-text version for ingestion.

Update both when content changes meaningfully (new service, major blog series).

---

## Verification gates (before "done")

Per page:
```bash
HTML=".next/server/app/<path>.html"
grep -q "<title>" "$HTML"
grep -q "<link rel=\"canonical\"" "$HTML"
grep -q "application/ld+json" "$HTML"
grep -q "answer-block" "$HTML"
grep -c "<h1" "$HTML"   # must equal 1
```

For the site:
- `curl -I https://publicpulse.com.bd/<path>` returns 200 (never 404 for an indexed URL)
- `https://search.google.com/test/rich-results` shows the expected `@type`s with zero errors
- `https://validator.schema.org/` passes
- Lighthouse mobile SEO = 100 *and* Best Practices ≥ 95 *and* Accessibility ≥ 95
