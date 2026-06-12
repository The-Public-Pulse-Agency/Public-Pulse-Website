// Pricing matrix used by /pricing.
//
// Values are STARTING points only — confirmed scope/quote happens on the
// discovery call. Numbers are anchored on the two services that already
// publish pricing (paid-ads, analytics-reporting). The rest are
// industry-typical ranges for Dhaka; the user can adjust via this file
// without touching the page template.
//
// All amounts in BDT (৳) unless noted otherwise.

export type PricingTier = {
  name: "Starter" | "Standard" | "Premium" | "Project";
  monthly?: string;          // e.g. "৳60,000"
  setup?: string;             // e.g. "৳150,000"
  oneTime?: string;           // for non-retainer engagements
  bestFor: string;
  includes: string[];
};

export type ServicePricing = {
  serviceSlug: string;
  displayName: string;
  tiers: PricingTier[];
  notes?: string[];
};

export const PRICING: ServicePricing[] = [
  {
    serviceSlug: "paid-ads",
    displayName: "Paid Ads (Meta + Google)",
    tiers: [
      {
        name: "Starter",
        monthly: "৳60,000+",
        bestFor: "Single-platform campaigns, BDT 100k–300k monthly ad spend",
        includes: [
          "1 platform (Meta or Google)",
          "Campaign setup + creative briefs",
          "Weekly optimisation",
          "Monthly performance report",
        ],
      },
      {
        name: "Standard",
        monthly: "৳1,20,000+",
        bestFor: "Multi-platform, BDT 300k–800k monthly ad spend",
        includes: [
          "Meta + Google together",
          "Creative production (3–5 ad variants/mo)",
          "Bi-weekly optimisation reviews",
          "CAPI + Pixel reconciliation",
          "Monthly report + call",
        ],
      },
      {
        name: "Premium",
        monthly: "৳2,00,000+",
        bestFor: "Full-funnel, BDT 800k+ monthly ad spend",
        includes: [
          "Meta + Google + YouTube",
          "Weekly optimisation reviews",
          "Landing-page conversion-rate work",
          "Advanced attribution + dashboards",
          "Quarterly strategy",
        ],
      },
    ],
    notes: [
      "Quoted media spend is separate from agency fee.",
      "Quoted retainer applies after the first month's setup (~৳50k).",
    ],
  },
  {
    serviceSlug: "analytics-reporting",
    displayName: "Analytics & Reporting",
    tiers: [
      {
        name: "Project",
        setup: "৳1,50,000–৳4,00,000",
        bestFor: "One-time setup: CAPI, GA4, dashboards, attribution",
        includes: [
          "Meta CAPI server-side setup",
          "GA4 + Tag Manager configuration",
          "Looker Studio dashboards",
          "Attribution model audit",
          "Documentation",
        ],
      },
      {
        name: "Standard",
        monthly: "৳35,000+",
        bestFor: "Ongoing dashboards + monthly reporting",
        includes: [
          "Monthly performance dashboard",
          "Tag QA + maintenance",
          "Funnel + event taxonomy reviews",
          "1× 30-min review call/mo",
        ],
      },
    ],
  },
  {
    serviceSlug: "political-pr",
    displayName: "Political PR",
    tiers: [
      {
        name: "Starter",
        monthly: "৳1,50,000+",
        bestFor: "Single constituency, 6+ months pre-poll",
        includes: [
          "Narrative + image positioning",
          "Digital reach (Meta + YouTube)",
          "Weekly sentiment tracking",
          "Crisis protocol on retainer",
        ],
      },
      {
        name: "Premium",
        monthly: "৳3,00,000+",
        bestFor: "Multi-constituency, 90-day execution",
        includes: [
          "5-phase election PR playbook",
          "Ground-team coordination",
          "Opposition research",
          "24h crisis SLA",
          "Polling-day comms",
        ],
      },
    ],
    notes: ["All engagements are NDA-protected."],
  },
  {
    serviceSlug: "social-media",
    displayName: "Social Media Management",
    tiers: [
      {
        name: "Starter",
        monthly: "৳45,000+",
        bestFor: "Single platform, 8 posts/mo",
        includes: [
          "Content calendar",
          "8 posts/month",
          "Community management (1×/day)",
          "Monthly analytics",
        ],
      },
      {
        name: "Standard",
        monthly: "৳85,000+",
        bestFor: "Meta + Instagram, full content + community",
        includes: [
          "Multi-platform calendar",
          "16 posts/mo + 4 reels",
          "Daily community management",
          "Influencer scouting",
          "Bi-weekly analytics",
        ],
      },
    ],
  },
  {
    serviceSlug: "content-production",
    displayName: "Content Production",
    tiers: [
      {
        name: "Project",
        oneTime: "৳50,000–৳5,00,000",
        bestFor: "Brand films, social cutdowns, product photography",
        includes: [
          "Pre-production + script",
          "On-location shoot",
          "Editing + colour",
          "Captioning + delivery",
        ],
      },
    ],
    notes: ["Per-day shoot rates available on request."],
  },
  {
    serviceSlug: "brand-building",
    displayName: "Brand Building & Design",
    tiers: [
      {
        name: "Project",
        oneTime: "৳3,00,000+",
        bestFor: "Logo, identity system, brand guidelines",
        includes: [
          "Discovery + positioning",
          "Logo + identity system",
          "Brand guidelines doc",
          "Launch collateral",
        ],
      },
    ],
  },
  {
    serviceSlug: "seo-website",
    displayName: "SEO + Website",
    tiers: [
      {
        name: "Project",
        oneTime: "৳2,00,000+",
        bestFor: "Marketing site build with on-page SEO",
        includes: [
          "Up to 10 pages",
          "Next.js / Webflow build",
          "On-page SEO + schema",
          "Page-speed optimisation",
          "30-day post-launch support",
        ],
      },
      {
        name: "Standard",
        monthly: "৳40,000+",
        bestFor: "Ongoing SEO retainer",
        includes: [
          "Keyword + content strategy",
          "Monthly technical audits",
          "Quarterly link prospecting",
          "Reporting dashboard",
        ],
      },
    ],
  },
  {
    serviceSlug: "hospitality",
    displayName: "Hospitality Marketing",
    tiers: [
      {
        name: "Standard",
        monthly: "৳1,00,000+",
        bestFor: "Hotel + restaurant brands, direct-booking focus",
        includes: [
          "Paid ads (Meta + Google)",
          "OTA visibility + direct-booking landing pages",
          "Influencer + UGC",
          "Monthly revenue + bookings dashboard",
        ],
      },
    ],
  },
  {
    serviceSlug: "influencer-marketing",
    displayName: "Influencer Marketing",
    tiers: [
      {
        name: "Project",
        oneTime: "৳1,50,000+",
        bestFor: "Single campaign with 3–10 creators",
        includes: [
          "Creator shortlisting + outreach",
          "Brief + content review",
          "Performance tracking",
          "Whitelisting + boosted ads",
        ],
      },
    ],
    notes: ["Creator fees are separate and depend on tier/reach."],
  },
];
