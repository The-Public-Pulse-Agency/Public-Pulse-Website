import type { ServiceContent } from "./_types";

export const paidAds: ServiceContent = {
  answer:
    "Public Pulse Agency runs paid-media campaigns on Meta, Google and YouTube for Bangladeshi advertisers — full account build, Pixel and Conversion API setup, daily bid and creative optimization, weekly ROAS reports. We work to a return-on-ad-spend target, not impressions, and report in BDT against your CFO's numbers.",
  intro:
    "Paid media in Bangladesh is cheap if you treat it carelessly and expensive if you don't measure it. We build accounts with proper conversion tracking from day one, kill underperforming creative inside seven days, and double down on what produces revenue — not what produces likes.",
  included: [
    "Meta Ads (Facebook + Instagram): full account setup, audience design, creative testing",
    "Google Ads: Search, Display, Performance Max, YouTube — keyword and bid management",
    "Conversion tracking: Meta Pixel + Conversion API, GA4, Google Ads conversions, server-side wherever possible",
    "Daily account optimization with documented changes — never silent edits",
    "Weekly ROAS reports in BDT, monthly strategy review meeting",
    "Landing-page conversion audits and recommendations",
    // TODO(user): confirm whether TikTok Ads is in scope here or a separate line item under social-media
  ],
  process: [
    { title: "Account & Tracking Audit", body: "We audit your existing accounts and conversion tracking — most accounts we inherit have leaky measurement, and we fix it first." },
    { title: "Strategy & Build", body: "Funnel design, audience mapping, creative brief, naming conventions, budget split across channels and campaign stages." },
    { title: "Creative Production & Launch", body: "We brief and ship at least 6 creatives per channel before launch — no campaign goes live with one ad." },
    { title: "Daily Optimization", body: "Daily bid and budget adjustments; weekly creative refresh; underperformers killed inside seven days." },
    { title: "Weekly Report & Reallocation", body: "Friday report: spend, conversions, CPA, ROAS by campaign. Monday call: reallocate budget into the top quartile." },
  ],
  whyChooseUs: [
    { title: "Built for BDT budgets", body: "We tune for accounts spending ৳50,000–৳20,00,000/month — not 10x that. Tactics, bid strategies and creative volume match real Bangladeshi budgets." },
    { title: "Conversion API set up properly", body: "iOS tracking loss kills most agency reporting. We set up server-side Conversion API and Enhanced Conversions before launch, not after." },
    { title: "No silent edits", body: "Every change to your account is logged with timestamp, rationale and predicted impact. You can audit our work line-by-line." },
    { title: "We sit on your side of the table", body: "We name and shame our own losing creative in reports. Honesty about what's not working is how we get to what does." },
  ],
  faqs: [
    {
      q: "What's a typical monthly ad spend you work with?",
      a: "Most clients spend between ৳1,00,000 and ৳10,00,000/month across Meta and Google combined. We can start lower for testing — ৳50,000/month is enough to learn what works.",
    },
    {
      q: "Do you charge a flat fee or a percentage of ad spend?",
      a: "Both options. Flat retainers start at ৳60,000/month for one channel. Percentage-of-spend is 12–18% depending on volume — drops as your spend grows so the math always favors scaling.",
    },
    {
      q: "How fast will I see ROAS results?",
      a: "Paid social usually shows reliable signal at 14 days; paid search at 7. Real optimization — killing losers and scaling winners — takes 30–60 days. Don't judge a campaign on its first week.",
    },
  ],
};
