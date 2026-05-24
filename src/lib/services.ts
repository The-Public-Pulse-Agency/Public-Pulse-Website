// Service catalog. Long-form per-service copy lives in src/content/services/<slug>.ts
// keyed by the same slug. Editing the catalog and editing the content file are
// independent operations.

export type Service = {
  slug: string;
  name: string;
  shortName: string;
  oneLiner: string;
  serviceType: string;
  category: string;
  categoryColor: string;
  emoji: string;
  /** SEO title (≤60 chars) — measured at build time by src/lib/seo.ts */
  seoTitle: string;
  /** SEO meta description (140–160 chars) */
  seoDescription: string;
  /** Set false to hide from generateStaticParams + sitemap (used to stage drafts). */
  ready: boolean;
};

export const SERVICES: Service[] = [
  {
    slug: "political-pr",
    name: "Political PR & Image Building",
    shortName: "Political PR",
    oneLiner:
      "Candidate image building, crisis management, election campaigns, and narrative engineering.",
    serviceType: "Political Public Relations",
    category: "Political PR",
    categoryColor: "cat-red",
    emoji: "🏛️",
    seoTitle: "Political PR Agency Bangladesh | Public Pulse",
    seoDescription:
      "Political PR agency in Dhaka, Bangladesh. Candidate image, narrative engineering, opposition research, crisis comms and a five-phase election PR plan that wins seats.",
    ready: true,
  },
  {
    slug: "social-media",
    name: "Social Media Management",
    shortName: "Social Media",
    oneLiner:
      "Facebook, Instagram, YouTube, TikTok — full platform management for Bangladeshi brands.",
    serviceType: "Social Media Marketing",
    category: "Social Media",
    categoryColor: "cat-blue",
    emoji: "📱",
    seoTitle: "Social Media Marketing Bangladesh | Public Pulse",
    seoDescription:
      "Social media management for Facebook, Instagram, YouTube and TikTok across Bangladesh. Content calendars, Bangla community management, monthly growth and engagement reports.",
    ready: true,
  },
  {
    slug: "content-production",
    name: "Content Production",
    shortName: "Content Production",
    oneLiner:
      "Video, photo, motion graphics, drone shoots — strategy-driven content shot in Bangladesh.",
    serviceType: "Content Production",
    category: "Content",
    categoryColor: "cat-purple",
    emoji: "🎬",
    seoTitle: "Content Production Bangladesh | Public Pulse",
    seoDescription:
      "Brand films, social cutdowns, photography, motion graphics, drone work and UGC — produced in Dhaka and on location across Bangladesh in Bangla and English.",
    ready: true,
  },
  {
    slug: "paid-ads",
    name: "Paid Ads & Campaigns",
    shortName: "Paid Ads",
    oneLiner: "Meta, Google, YouTube — ROAS-focused paid media for Bangladesh.",
    serviceType: "Paid Advertising",
    category: "Paid Ads",
    categoryColor: "cat-teal",
    emoji: "📢",
    seoTitle: "Paid Ads Agency Bangladesh — Meta, Google | Public Pulse",
    seoDescription:
      "Meta, Google and YouTube paid media managed for Bangladesh advertisers. Pixel and Conversion API setup, daily optimization, BDT-budget rigor, weekly ROAS reporting.",
    ready: true,
  },
  {
    slug: "hospitality",
    name: "Hospitality Marketing",
    shortName: "Hospitality",
    oneLiner:
      "Resorts, hotels and restaurants — Cox's Bazar to Sylhet, Dhaka to Chittagong.",
    serviceType: "Hospitality Marketing",
    category: "Hospitality",
    categoryColor: "cat-green",
    emoji: "🏨",
    seoTitle: "Hospitality Marketing Bangladesh | Public Pulse",
    seoDescription:
      "Marketing for Bangladesh resorts, restaurants and hotels — OTA listings, Google Business Profile, food-delivery platform optimization, video tours, occupancy growth.",
    ready: true,
  },
  {
    slug: "brand-building",
    name: "Brand Building & Design",
    shortName: "Branding",
    oneLiner:
      "Logo, identity, packaging, brand guidelines and competitor positioning.",
    serviceType: "Brand Strategy",
    category: "Branding",
    categoryColor: "cat-orange",
    emoji: "🎨",
    seoTitle: "Brand Building Agency Bangladesh | Public Pulse",
    seoDescription:
      "Brand strategy, logo design, visual identity, packaging and brand guidelines for Bangladeshi startups and rebrands. From zero to a brand customers remember.",
    ready: true,
  },
  {
    slug: "seo-website",
    name: "SEO & Website Development",
    shortName: "SEO & Web",
    oneLiner:
      "Local SEO, technical SEO, on-page SEO and conversion-focused website builds.",
    serviceType: "Search Engine Optimization",
    category: "SEO",
    categoryColor: "cat-navy",
    emoji: "🌐",
    seoTitle: "SEO & Web Development Bangladesh | Public Pulse",
    seoDescription:
      "Local SEO, on-page, technical SEO and conversion-focused website development for Bangladesh businesses. Built to rank, built to convert, built to last.",
    ready: true,
  },
  {
    slug: "analytics-reporting",
    name: "Analytics & Performance Reporting",
    shortName: "Analytics",
    oneLiner:
      "GA4, GTM, Meta Pixel setup, Looker Studio dashboards, monthly ROI reports.",
    serviceType: "Marketing Analytics",
    category: "Analytics",
    categoryColor: "cat-brown",
    emoji: "📊",
    seoTitle: "Marketing Analytics Bangladesh | Public Pulse",
    seoDescription:
      "GA4, Google Tag Manager, Meta Pixel and Conversion API setup. Looker Studio dashboards, monthly ROI attribution, and reports your CFO will actually read.",
    ready: true,
  },
  {
    slug: "influencer-marketing",
    name: "Influencer & KOL Marketing",
    shortName: "Influencers",
    oneLiner:
      "Discovery, contracting, campaign management and disclosure compliance.",
    serviceType: "Influencer Marketing",
    category: "Influencer",
    categoryColor: "cat-magenta",
    emoji: "🤳",
    seoTitle: "Influencer Marketing Bangladesh | Public Pulse",
    seoDescription:
      "Bangladesh influencer marketing end-to-end — discovery, tier strategy, contracts, briefs, FTC-compliant disclosure, and performance tracking with verified results.",
    ready: true,
  },
];

export const getService = (slug: string) =>
  SERVICES.find((s) => s.slug === slug);
