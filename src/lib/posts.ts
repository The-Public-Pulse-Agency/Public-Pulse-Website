// Blog post catalog. Foundation step 1 ships one fully-built sample
// (digital-marketing-bangladesh-2026). The other 11 are listed so the index
// page, sitemap and RSS already know they exist — content gets filled in later.

export type Post = {
  slug: string;
  title: string;
  description: string;
  category: string;
  categoryColor: string;
  datePublished: string;
  dateModified?: string;
  readMinutes: number;
  hero: string;
  tags: string[];
  ready: boolean;
};

export const POSTS: Post[] = [
  {
    slug: "digital-marketing-bangladesh-2026",
    title: "Digital Marketing in Bangladesh 2026: The Complete Guide",
    description:
      "Bangladesh has 66M social media users and 130M mobile internet subscribers. A practical 2026 guide to channel mix, budgets, and what actually works for local brands.",
    category: "Digital Marketing",
    categoryColor: "cat-red",
    datePublished: "2026-04-13",
    readMinutes: 12,
    hero: "/blog-digital-marketing-bangladesh-2026.jpg",
    tags: ["digital marketing", "Bangladesh", "2026 strategy"],
    ready: true,
  },
  { slug: "political-pr-election-strategy", title: "Political PR & Election Campaign Strategy: The Definitive Guide", description: "How modern Bangladeshi political campaigns are won — narrative, ground game, digital, crisis response.", category: "Political PR", categoryColor: "cat-red", datePublished: "2026-04-10", readMinutes: 14, hero: "/blog-political-pr-election-strategy.jpg", tags: ["political PR", "elections"], ready: false },
  { slug: "restaurant-marketing-dhaka", title: "Restaurant Marketing in Dhaka: How to Boost Orders by 60%", description: "Playbook for Dhaka restaurants — Google Business, food-delivery ads, UGC, and the metric that matters most.", category: "Hospitality", categoryColor: "cat-green", datePublished: "2026-04-05", readMinutes: 10, hero: "/blog-restaurant-marketing-dhaka.jpg", tags: ["restaurants", "hospitality"], ready: false },
  { slug: "facebook-ads-guide-bangladesh", title: "Facebook Ads Guide: Running Profitable Campaigns in Bangladesh", description: "Audience setup, creative testing cadence, and budget thresholds that actually scale in the Bangladesh market.", category: "Paid Ads", categoryColor: "cat-teal", datePublished: "2026-03-28", readMinutes: 11, hero: "/blog-facebook-ads-guide-bangladesh.jpg", tags: ["meta ads", "facebook"], ready: false },
  { slug: "brand-building-startup-guide", title: "Brand Building for Startups: Complete Guide from Zero to Hero", description: "From naming and visual identity to launch — a startup playbook for building a brand customers remember.", category: "Branding", categoryColor: "cat-orange", datePublished: "2026-03-22", readMinutes: 9, hero: "/blog-brand-building-startup-guide.jpg", tags: ["branding", "startups"], ready: false },
  { slug: "resort-marketing-coxs-bazar", title: "Resort Marketing in Cox's Bazar: How to Boost Bookings by 45%", description: "Channel mix, seasonal calendar, and the OTAs that move the needle for Cox's Bazar properties.", category: "Hospitality", categoryColor: "cat-green", datePublished: "2026-03-15", readMinutes: 10, hero: "/blog-resort-marketing-coxs-bazar.jpg", tags: ["resorts", "hospitality"], ready: false },
  { slug: "content-production-video-tips", title: "How Video Content Will Transform Your Business in 2026", description: "Short-form video formats that convert in Bangladesh — and the production process to ship them weekly.", category: "Content", categoryColor: "cat-purple", datePublished: "2026-03-10", readMinutes: 8, hero: "/blog-content-production-video-tips.jpg", tags: ["video", "content"], ready: false },
  { slug: "seo-guide-bangladesh-business", title: "SEO Guide: How to Rank Your Business #1 on Google in Bangladesh", description: "Local SEO, technical SEO, on-page — a step-by-step plan to climb Bangladesh-targeted Google search.", category: "SEO", categoryColor: "cat-navy", datePublished: "2026-03-03", readMinutes: 13, hero: "/blog-seo-guide-bangladesh-business.jpg", tags: ["SEO", "Google"], ready: false },
  { slug: "ecommerce-growth-strategy", title: "E-Commerce Growth Strategy: Scaling Online Sales in Bangladesh 2026", description: "From first 100 orders to 10,000/month — the ladder Bangladeshi e-commerce brands climb.", category: "E-Commerce", categoryColor: "cat-teal", datePublished: "2026-02-25", readMinutes: 12, hero: "/blog-ecommerce-growth-strategy.jpg", tags: ["e-commerce"], ready: false },
  { slug: "influencer-marketing-bangladesh", title: "Influencer Marketing in Bangladesh: The Complete Strategy Guide", description: "Tiers, rates, contracts, FTC compliance, and the campaign structures that actually drive sales here.", category: "Influencer", categoryColor: "cat-magenta", datePublished: "2026-02-18", readMinutes: 11, hero: "/blog-influencer-marketing-bangladesh.jpg", tags: ["influencer"], ready: false },
  { slug: "google-ads-search-display", title: "Google Ads Mastery: Search & Display Advertising for Bangladesh", description: "Account structure, keyword strategy, and bid management for Bangladesh advertisers — Search and Display.", category: "Paid Ads", categoryColor: "cat-teal", datePublished: "2026-02-10", readMinutes: 12, hero: "/blog-google-ads-search-display.jpg", tags: ["google ads"], ready: false },
  { slug: "crisis-management-pr-guide", title: "Crisis Management & PR: Protecting Your Brand's Reputation", description: "A 24-hour crisis playbook for Bangladeshi brands — detection, response, recovery, and rebuild.", category: "PR", categoryColor: "cat-red", datePublished: "2026-02-03", readMinutes: 10, hero: "/blog-crisis-management-pr-guide.jpg", tags: ["crisis", "PR"], ready: false },
];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);

// Long-form body for the fully-built sample post.
export const DIGITAL_MARKETING_2026_CONTENT = {
  answer:
    "Digital marketing in Bangladesh in 2026 means competing for 66 million social media users and 130 million mobile internet subscribers across Facebook, Instagram, TikTok, YouTube, and Google. The winning playbook combines short-form video at the top of funnel, Meta + Google paid ads in the middle, and Google Business Profile plus local SEO at the bottom — measured weekly against revenue, not vanity metrics.",
  sections: [
    {
      heading: "The Bangladesh digital landscape in 2026",
      body: "Bangladesh crossed 66 million active social media users and 130 million mobile internet subscribers in early 2026, with Facebook still dominant, TikTok growing fastest, and YouTube the most-watched long-form platform. Average smartphone data costs have fallen below ৳1/GB on most operators, making video-heavy content economical to consume. For brands, this means the customer is reachable — the question is whether your funnel converts attention into orders.",
    },
    {
      heading: "Why digital marketing is essential for Bangladesh businesses",
      body: "Traditional channels (TV, billboard, print) still drive awareness, but they cannot be measured, segmented, or pivoted weekly. Digital channels can — and the brands winning in 2026 are the ones that ship campaigns weekly, kill what doesn't work in seven days, and double down on what does. The opportunity cost of staying off digital is no longer a lost test; it is a lost market.",
    },
    {
      heading: "Key digital marketing trends for 2026",
      body: "Three trends matter most. (1) Short-form vertical video is the dominant ad format across Meta, TikTok, and YouTube Shorts. (2) AI-assisted content production has compressed the cost of producing 20-second concepts by 5–10x. (3) Google AI Overviews and ChatGPT/Claude/Perplexity browsing are now meaningful sources of inbound traffic — answer-engine optimization is becoming as important as classic SEO.",
    },
    {
      heading: "Building your digital marketing strategy",
      body: "Start with the funnel. Top of funnel: short-form video and influencer reach. Middle of funnel: Meta retargeting ads and Google Search ads. Bottom of funnel: Google Business Profile, local SEO, on-site conversion optimization. Pick one KPI per stage and measure weekly. Don't try to win every channel — pick the two channels your customers actually live on and out-execute on those.",
    },
    {
      heading: "Getting started: your first 90 days",
      body: "Days 1–30: audit existing channels, set up GA4 + Meta Pixel + Google Tag Manager, ship one piece of weekly content. Days 31–60: launch ৳50,000–৳200,000/month paid campaigns on the top channel, set up Google Business Profile, kick off local SEO. Days 61–90: review the data, kill bottom-quartile creative, double down on the top quartile, and document the system so it survives team changes.",
    },
  ],
  faqs: [
    {
      q: "How much does digital marketing cost in Bangladesh in 2026?",
      a: "Entry-level paid campaigns start around ৳50,000/month including ad spend; mid-market brands typically allocate ৳200,000–৳500,000/month split across Meta, Google, and influencer. Agency retainers for full management start at ৳75,000/month.",
    },
    {
      q: "Which channel should a Bangladeshi small business start with?",
      a: "For most local businesses, the first channel is Google Business Profile + Facebook page kept actively updated, with a small ৳15,000–৳30,000/month Meta ad budget testing two creatives at a time. Add a third channel only once the first two are profitable.",
    },
    {
      q: "How long until digital marketing shows results?",
      a: "Paid ads show signal within 7–14 days; meaningful campaign optimization takes 30–60 days. SEO and content investments take 90–180 days to produce compounding traffic. Don't judge the strategy on week-1 numbers.",
    },
  ],
};
