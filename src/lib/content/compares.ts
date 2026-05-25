// /compare/<slug> pages — in-house vs agency, channel comparisons,
// tool vs tool. Each compare seeds an Article with FAQPage + AnswerBlock.

export type ComparePoint = { dimension: string; left: string; right: string };
export type Compare = {
  slug: string;
  title: string;
  description: string;
  answer: string;
  leftLabel: string;
  rightLabel: string;
  points: ComparePoint[];
  /** Plain-prose recommendation. */
  recommendation: string;
  glossaryRefs?: string[];
  groundingRefs: string[];
  ready: boolean;
  datePublished: string;
};

export const COMPARES: Compare[] = [
  {
    slug: "agency-vs-in-house-marketing-bangladesh",
    title: "Agency vs in-house marketing team — which makes sense for a Bangladesh brand?",
    description:
      "Honest side-by-side comparison: cost, speed, range of skills, accountability, and brand control for an in-house marketing team vs an integrated agency in Bangladesh.",
    answer:
      "Below BDT 5 lakh/month total marketing spend, an integrated agency is more honest economically — you get strategy + creative + paid + analytics for the salary of one mid-level manager. Above BDT 15 lakh/month with stable channel mix, in-house starts to win on speed-of-iteration and brand depth.",
    leftLabel: "Integrated Agency (Public Pulse)",
    rightLabel: "In-house Marketing Team",
    points: [
      {
        dimension: "Monthly cost (entry)",
        left: "BDT 75k–150k retainer covers strategy + 2-3 channels + reporting",
        right: "BDT 80k+ for one mid-level manager (no creative, no media-buy depth)",
      },
      {
        dimension: "Range of skills on day 1",
        left: "Strategy, creative, paid, content, PR, analytics — same room",
        right: "Whatever the one person knows; gaps need 2-3 more hires",
      },
      {
        dimension: "Speed to launch a campaign",
        left: "Days to weeks — playbooks already exist from other clients",
        right: "Weeks to months for first hire to build internal process",
      },
      {
        dimension: "Brand depth (12+ months in)",
        left: "Good, but capped — agency knows BD market but not your specific muscle memory",
        right: "Wins on depth — internal team lives the brand daily",
      },
      {
        dimension: "Accountability when things break",
        left: "One client lead owns the relationship + the KPI",
        right: "Internal politics + reporting lines can fuzz it",
      },
    ],
    recommendation:
      "Start with an agency until you've validated the channel mix and have stable monthly spend > BDT 10 lakh. Hire in-house for ownership of the muscles you'll exercise weekly; keep the agency for specialist surges (political PR cycles, brand re-launches).",
    glossaryRefs: ["roas"],
    groundingRefs: ["brand-building", "paid-ads"],
    ready: true,
    datePublished: "2026-05-25",
  },
  {
    slug: "facebook-vs-google-ads-bangladesh",
    title: "Facebook Ads vs Google Ads — which works better in Bangladesh?",
    description:
      "Channel comparison for paid-ads spend in Bangladesh: Meta's reach + creator culture vs Google's intent + search demand. Cost, audience, creative requirements per platform.",
    answer:
      "Facebook still drives more reach + conversions for most Bangladesh consumer brands because of dominant social usage + DTC + Foodpanda-style discovery. Google Ads outperforms for high-intent verticals (B2B, real estate, education enquiry, healthcare appointments) where someone is actively searching.",
    leftLabel: "Facebook / Meta Ads",
    rightLabel: "Google Ads (Search + YouTube)",
    points: [
      {
        dimension: "Best for",
        left: "Discovery, brand-building, lower-intent conversion, video-led storytelling",
        right: "High-intent capture — someone already searching for what you sell",
      },
      {
        dimension: "Audience reach in BD",
        left: "~45M+ active Bangladeshi users; near-universal mobile reach",
        right: "Wide but more transactional; YouTube ~50M+ but skews younger urban",
      },
      {
        dimension: "Creative format",
        left: "Heavy video + carousel + lifestyle imagery",
        right: "Plain-text search ads + responsive display + YouTube video",
      },
      {
        dimension: "Typical entry CPC",
        left: "BDT 3-15 depending on audience + creative quality",
        right: "BDT 10-100 depending on keyword competition",
      },
      {
        dimension: "Signal loss to iOS / blockers",
        left: "Significant; mitigated by Meta Conversions API",
        right: "Lower; Google's own tag handles most signal natively",
      },
    ],
    recommendation:
      "Run both. Use Facebook for top-of-funnel discovery + retargeting; use Google Search for the last-mile high-intent click. Split budget 70/30 (FB/Google) for most consumer brands, flipped 30/70 for high-intent B2B/services.",
    glossaryRefs: ["roas", "ctr", "meta-conversions-api"],
    groundingRefs: ["paid-ads"],
    ready: true,
    datePublished: "2026-05-25",
  },
];

export function getCompare(slug: string): Compare | undefined {
  return COMPARES.find((c) => c.slug === slug);
}
