// Digital marketing + political PR glossary, EN+BN entries.
// Powers /glossary (DefinedTermSet hub) and /glossary/<slug> (DefinedTerm).
// Cited by service / blog / guide pages via the GlossaryLink component.

export type GlossaryTerm = {
  slug: string;
  /** Display term (English). */
  name: string;
  /** Bangla equivalent — used for hand-authored bn glossary entries. */
  nameBn?: string;
  /** Definition (1–2 sentences). Schema.org best practice: keep short. */
  definition: string;
  /** Longer-form explanation for the /glossary/<slug> body. */
  body: string;
  /** Subject area (used to group terms in the index). */
  area: "Digital Marketing" | "Political PR" | "Paid Media" | "SEO" | "Branding" | "Analytics";
  /** Related term slugs (used for in-glossary cross-links). */
  see?: string[];
};

export const GLOSSARY: GlossaryTerm[] = [
  {
    slug: "answer-block",
    name: "Answer Block",
    nameBn: "উত্তর ব্লক",
    area: "SEO",
    definition:
      "A short 40–60 word self-contained answer placed at the top of a long-form page, designed for AI engines (Google AI Overviews, ChatGPT, Claude, Perplexity) to lift verbatim.",
    body:
      "Answer blocks are the most important AEO/GEO surface on a content page. They give AI engines a complete, citable answer in the page's first viewport so the engine doesn't synthesize one from elsewhere. Public Pulse renders every long-form page's answer block inside a <section class='answer-block' data-speakable> wrapper so the Article JSON-LD's `speakable` cssSelector can target it.",
    see: ["faqpage-schema", "speakable", "geo"],
  },
  {
    slug: "aeo",
    name: "AEO (Answer Engine Optimization)",
    nameBn: "উত্তর ইঞ্জিন অপ্টিমাইজেশন",
    area: "SEO",
    definition:
      "Optimizing a page so AI-driven answer engines — Google AI Overviews, Bing Copilot, voice assistants — cite it as the source for direct answers.",
    body:
      "AEO is the second-generation evolution of SEO. The win-state is no longer the blue link click; it's the citation inside an AI-generated answer. AEO works by combining clear answer-first prose (see Answer Block), explicit JSON-LD with the right @type for the question (FAQPage, HowTo, DefinedTerm), and being the most factually accurate source in your domain so the engine prefers you.",
    see: ["geo", "answer-block", "schema-jsonld"],
  },
  {
    slug: "geo",
    name: "GEO (Generative Engine Optimization)",
    nameBn: "জেনারেটিভ ইঞ্জিন অপ্টিমাইজেশন",
    area: "SEO",
    definition:
      "Optimizing a page so generative engines (ChatGPT, Claude, Perplexity, Gemini) ground their answers in your content when a user asks a related question.",
    body:
      "GEO is what happens after AEO: the engine isn't just citing you, it's grounding its entire generated answer in your prose. The unlock is making sure your content is indexable by the LLM crawlers (GPTBot, ClaudeBot, PerplexityBot — see robots.txt) AND making the content easy to ground in (specific dated facts, plain-language explainers, glossary cross-links).",
    see: ["aeo", "llms-txt", "robots-txt"],
  },
  {
    slug: "faqpage-schema",
    name: "FAQPage Schema",
    nameBn: "FAQPage স্কিমা",
    area: "SEO",
    definition:
      "A schema.org JSON-LD type that marks up a page's FAQ section, telling search engines exactly which question + answer pairs to consider for rich snippets and AI citations.",
    body:
      "Every long-form Public Pulse page emits FAQPage JSON-LD with at least 3 Question + Answer pairs (a HARD gate in the quality pipeline). The questions should match how real users phrase their queries — short, conversational, in their language — not how an SEO team would phrase a keyword.",
    see: ["schema-jsonld", "answer-block"],
  },
  {
    slug: "schema-jsonld",
    name: "JSON-LD Schema",
    nameBn: "JSON-LD স্কিমা",
    area: "SEO",
    definition:
      "Structured data embedded in a <script type='application/ld+json'> tag, describing the page's entities (Service, Article, Organization, FAQPage, etc.) for machines.",
    body:
      "Public Pulse uses typed builders in src/lib/schema.ts so every page emits valid JSON-LD with stable @id URIs that cross-reference Organization. Hand-rolling JSON-LD is banned because field omissions silently kill rich-result eligibility.",
  },
  {
    slug: "llms-txt",
    name: "llms.txt",
    nameBn: "llms.txt",
    area: "SEO",
    definition:
      "A plain-text file at /llms.txt that gives AI engines a curated, link-rich summary of the site to ground from — analogous to robots.txt for crawlers.",
    body:
      "llms.txt follows the llmstxt.org convention. Public Pulse publishes both /llms.txt (curated index) and /llms-full.txt (concatenated full-text). Both serve HTTP 200 directly, never redirects.",
    see: ["geo", "robots-txt"],
  },
  {
    slug: "robots-txt",
    name: "robots.txt",
    nameBn: "robots.txt",
    area: "SEO",
    definition:
      "A plain-text file at /robots.txt that tells crawlers which paths they're allowed to fetch.",
    body:
      "Public Pulse's robots.txt explicitly allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended and Bingbot for the public site, and explicitly disallows /manage and /api/auth. The AI-crawler allow-list is intentional — we want our pages cited in AI answers.",
  },
  {
    slug: "speakable",
    name: "Speakable",
    nameBn: "স্পিকেবল",
    area: "SEO",
    definition:
      "A schema.org property on Article that tells voice assistants (Google Assistant, Alexa) which CSS selector contains the spoken-aloud answer.",
    body:
      "Public Pulse Article schema sets `speakable.cssSelector: ['.answer-block']` so the assistant reads our 40–60 word answer block, not random body copy. Don't rename the .answer-block class without updating src/lib/schema.ts.",
  },
  {
    slug: "political-pr",
    name: "Political PR",
    nameBn: "রাজনৈতিক জনসংযোগ",
    area: "Political PR",
    definition:
      "Public communications strategy for political candidates, parties, and elected officials — candidate image-building, narrative engineering, opposition research, crisis communications.",
    body:
      "In Bangladesh, political PR runs on a five-phase election cycle: pre-campaign positioning, ground research, narrative launch, polling-day execution, post-election PR. Public Pulse runs all five.",
    see: ["narrative-engineering", "opposition-research"],
  },
  {
    slug: "narrative-engineering",
    name: "Narrative Engineering",
    nameBn: "ন্যারেটিভ ইঞ্জিনিয়ারিং",
    area: "Political PR",
    definition:
      "The deliberate construction of a campaign's core message, tested against constituency demographics and refined for sticking power.",
    body:
      "A narrative isn't a slogan. It's a story arc — what the candidate stands for, what they're against, what changes if they win — engineered to be retold by voters in their own words. We test narratives in field interviews before committing media spend.",
    see: ["political-pr"],
  },
  {
    slug: "opposition-research",
    name: "Opposition Research",
    nameBn: "অপজিশন রিসার্চ",
    area: "Political PR",
    definition:
      "Systematic intelligence-gathering on an opponent's record, statements, vulnerabilities, and likely lines of attack — used both to anticipate threats and to brief the candidate's own counter-messaging.",
    body:
      "Done responsibly: published statements, public records, verifiable claims. Used to prepare the candidate, NOT to seed disinformation. Public Pulse maintains an internal ethics standard on what we publish vs what we only brief the candidate on.",
    see: ["political-pr"],
  },
  {
    slug: "meta-conversions-api",
    name: "Meta Conversions API (CAPI)",
    nameBn: "মেটা কনভার্সন এপিআই",
    area: "Paid Media",
    definition:
      "Server-to-server event tracking from your site/CRM to Meta's ad platform, used to recover conversion signal lost to iOS ATT and ad blockers.",
    body:
      "Browser-side Meta Pixel firing drops 30–50%+ of events post-iOS-14.5. CAPI sends the same events from your server so Meta's bidding has a more complete signal. Public Pulse implements both pixel + CAPI on every e-commerce build.",
    see: ["roas"],
  },
  {
    slug: "roas",
    name: "ROAS (Return on Ad Spend)",
    nameBn: "বিজ্ঞাপন ব্যয়ের উপর রিটার্ন",
    area: "Paid Media",
    definition:
      "Revenue generated for every BDT spent on advertising. A ROAS of 4× means BDT 4 of revenue per BDT 1 of ad spend.",
    body:
      "ROAS is the headline metric for e-commerce paid media. The trap: it's a vanity metric in isolation — high ROAS with declining new-customer share is a slow death. Public Pulse reports ROAS alongside new-vs-returning split and contribution-margin ROAS (revenue minus COGS minus ad spend).",
  },
  {
    slug: "ctr",
    name: "CTR (Click-Through Rate)",
    nameBn: "ক্লিক-থ্রু রেট",
    area: "Paid Media",
    definition:
      "The fraction of ad impressions that became clicks. Calculated as clicks ÷ impressions × 100.",
    body:
      "Benchmark CTRs vary wildly by placement: a 1% CTR on Meta feed is industry-average; the same on a search ad is poor. CTR matters as a creative-quality signal but isn't the goal — conversion rate downstream is.",
  },
  {
    slug: "indexnow",
    name: "IndexNow",
    nameBn: "ইনডেক্সনাও",
    area: "SEO",
    definition:
      "An open protocol that lets a site instantly notify participating search engines (Bing, Yandex, Seznam) when a URL is published, updated, or deleted — bypassing crawl-budget delays.",
    body:
      "Public Pulse pings IndexNow on every /manage publish action with the affected URLs. Google does not participate but the major Bing-backed engines do. Our key file lives at /indexnow-key.txt.",
    see: ["robots-txt"],
  },
  {
    slug: "speakable-schema",
    name: "Speakable Schema",
    nameBn: "স্পিকেবল স্কিমা",
    area: "SEO",
    definition:
      "The schema.org SpeakableSpecification — placed on Article or WebPage JSON-LD with a cssSelector that points voice assistants at the prose they should read aloud as the answer.",
    body:
      "Speakable schema is the voice-assistant cousin of FAQPage. Google Assistant and Alexa pick the cssSelector you provide (Public Pulse uses ['.answer-block']) and read it verbatim. The selector should target a 40–60 word self-contained answer; longer passages get truncated mid-sentence on the device. We render every long-form page's answer block inside <section class='answer-block' data-speakable> so the selector matches deterministically.",
    see: ["answer-block", "aeo", "schema-jsonld"],
  },
  {
    slug: "first-party-data",
    name: "First-Party Data",
    nameBn: "ফার্স্ট-পার্টি ডেটা",
    area: "Analytics",
    definition:
      "Customer data the business collected directly — from its own site, app, CRM, point-of-sale or call centre — as opposed to third-party data bought from data brokers or rented from ad platforms.",
    body:
      "First-party data is the strategic asset for Bangladeshi brands as Meta and Google narrow third-party signal (iOS ATT, third-party cookie deprecation). The unlock is a clean Customer ID linked across web, Bkash/Nagad transactions, and WhatsApp inbox so you can build audiences and lookalikes inside Meta CAPI / Google Enhanced Conversions without leaking PII. Public Pulse implements first-party data layers as the foundation of every analytics rebuild.",
    see: ["meta-conversions-api", "attribution-window"],
  },
  {
    slug: "attribution-window",
    name: "Attribution Window",
    nameBn: "অ্যাট্রিবিউশন উইন্ডো",
    area: "Analytics",
    definition:
      "The look-back period an ad platform credits an ad with a conversion — e.g. a 7-day-click 1-day-view window means Meta will count a purchase as the ad's outcome if it happens within 7 days of a click or 1 day of a view.",
    body:
      "Attribution windows are the single most over-looked lever in Bangladeshi paid media reporting. Meta defaults to 7-day-click; a hospitality brand selling 30-day-booking-window resorts is invisible under that default. Public Pulse audits attribution windows before every reporting setup and reconciles to first-party booking data so ROAS reflects reality, not the platform's default look-back. Mixing windows across channels — Google's data-driven model vs Meta's 7-day-click — produces double-counting at the campaign-mix level; we normalize.",
    see: ["roas", "first-party-data"],
  },
  {
    slug: "engagement-rate",
    name: "Engagement Rate",
    nameBn: "এনগেজমেন্ট রেট",
    area: "Digital Marketing",
    definition:
      "The fraction of an audience that interacted with a piece of content — likes, comments, shares, saves, click-throughs — usually expressed as engagements ÷ reach × 100.",
    body:
      "Engagement rate is the dominant proxy metric on Bangladeshi Facebook and Instagram for organic content health. Healthy benchmarks: 2–5% on Facebook, 3–6% on Instagram for branded posts in the BD market; influencer rates run higher (5–12%). The trap is using ER alone to evaluate paid creative — paid CTAs depress ER mechanically while driving the actual KPI. Public Pulse separates organic ER (community signal) from paid CTR / conversion rate (commercial signal) in every monthly report.",
    see: ["ctr", "roas"],
  },
  {
    slug: "core-web-vitals",
    name: "Core Web Vitals",
    nameBn: "কোর ওয়েব ভাইটালস",
    area: "SEO",
    definition:
      "Google's three page-experience metrics — LCP (largest contentful paint, load speed), INP (interaction to next paint, responsiveness), and CLS (cumulative layout shift, visual stability) — used as a ranking signal and surfaced in Search Console.",
    body:
      "Core Web Vitals matter twice in Bangladesh: as a ranking signal Google demonstrably uses, and as a UX-on-3G signal that dominates conversion for hospitality, real estate, and e-commerce sites where buyers research on phones over patchy networks. Pass-thresholds: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1. Public Pulse's standard build (Next.js + OpenNext + CloudFront with AVIF/WebP image responses) ships green CWV on a Bangladeshi 4G device out of the box; the failure mode is usually heavy embeds added later (chat widgets, slow Tag Manager containers).",
    see: ["aeo", "geo"],
  },
  {
    slug: "conversion-api",
    name: "Conversion API",
    nameBn: "কনভার্সন এপিআই",
    area: "Paid Media",
    definition:
      "A server-to-server event protocol — Meta's Conversions API, Google's Enhanced Conversions, TikTok's Events API — that sends conversion data directly from the brand's server to the ad platform, bypassing browser tracking that iOS ATT and ad blockers degrade.",
    body:
      "Conversion API is one of two technical lifts every Bangladeshi e-commerce stack must do post-iOS-14.5 (the other is first-party data). Server-side events restore 30–50% of the conversion signal lost from browser-side pixels. Public Pulse implements Meta CAPI alongside the browser pixel (dedup by event_id), so the platform sees both signals and Meta's bidding has clean attribution. Without CAPI, Meta's algorithm optimizes against a partial dataset and CPA inflates 20–40% over a 6-month decay curve.",
    see: ["meta-conversions-api", "first-party-data", "roas"],
  },
];

export function getGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return GLOSSARY.find((t) => t.slug === slug);
}
