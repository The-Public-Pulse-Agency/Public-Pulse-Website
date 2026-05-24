import type { ServiceContent } from "./_types";

export const seoWebsite: ServiceContent = {
  answer:
    "Public Pulse Agency runs SEO and builds websites for Bangladeshi businesses — local SEO, technical SEO, on-page optimization, schema markup, and conversion-focused website builds in Next.js or WordPress. We aim for traffic that converts, not traffic that bounces, and we measure rankings against the queries your customers actually type.",
  intro:
    "SEO without a fast, well-structured website is wasted; a website without SEO is invisible. We do both, in sequence — the website is built to rank from day one, and the SEO program is built around what the website is actually good at.",
  included: [
    "Technical SEO audit: crawlability, indexability, Core Web Vitals, schema",
    "On-page SEO: titles, meta descriptions, header structure, internal linking, image optimization",
    "Local SEO: Google Business Profile setup, citation cleanup, review-generation flow",
    "Schema markup: Organization, LocalBusiness, Article, Service, FAQPage, BreadcrumbList",
    "Website development: Next.js or WordPress, mobile-first, accessibility-aware, fast",
    "Monthly rankings, traffic and conversion reports",
    "Content briefs for blog and service pages (writing is a separate line item if you need it)",
    // TODO(user): confirm default CMS choice — TenderPulse is Next.js, some hospitality clients prefer WordPress for in-house editing
  ],
  process: [
    { title: "Audit", body: "Full technical and on-page audit of your existing site, plus a keyword opportunity report for the next 12 months." },
    { title: "Fix & Build", body: "Address technical debt, ship missing schema, rebuild slow pages. Or — if the site can't be saved — design and build a new one." },
    { title: "Content & Internal Linking", body: "Brief in pillar pages, fix orphan pages, build the internal-link graph between services, blog and case studies." },
    { title: "Local SEO Activation", body: "Google Business Profile fully optimized, citations cleaned up across local directories, review-generation flow live." },
    { title: "Monthly Reporting", body: "Rankings, organic traffic, conversion rate, Core Web Vitals — and what we shipped this month against last month's plan." },
  ],
  whyChooseUs: [
    { title: "We build the site we'll have to rank", body: "When SEO and dev are the same team, no one can blame the other for slow pages or missing schema. Accountability is built in." },
    { title: "Schema and AEO from day one", body: "Article, Service, FAQPage, BreadcrumbList — done at build time, not bolted on later. Your pages are eligible for AI Overviews, Bing Copilot and ChatGPT citations." },
    { title: "Core Web Vitals as a discipline", body: "LCP under 2.5s, CLS under 0.1, INP under 200ms — measured weekly, fixed weekly. No 'launched and forgot it' performance." },
    { title: "We rank our own site for SEO Bangladesh", body: "If you can't see us in the Google results that brought you here, fire us. Eat-your-own-dog-food is the only credible SEO pitch." },
  ],
  faqs: [
    {
      q: "How long until SEO produces real traffic?",
      a: "New domains: 6–12 months before organic traffic becomes a meaningful channel. Established domains we're fixing: 60–90 days for initial wins, 6 months for a defensible ranking position.",
    },
    {
      q: "Next.js or WordPress — which should we choose?",
      a: "Next.js for marketing sites you'll grow into programmatic SEO, complex pricing pages, or SaaS dashboards. WordPress when an in-house non-technical team will publish blog posts and edit pages weekly. We're fluent in both.",
    },
    {
      q: "Do you guarantee a #1 ranking?",
      a: "No reputable SEO does. We guarantee the work — audit, fixes, content, schema, link building, monthly reports — and a clear forecast of expected traffic against keyword difficulty. Anyone promising rank #1 is selling you a refund opportunity.",
    },
  ],
};
