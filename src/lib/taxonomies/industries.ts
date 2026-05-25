// Real BD verticals — grounding source for:
//   /industries/<slug>           (industry-fit pages)
//   /<service>-for-<slug>        (SERVICE × INDUSTRY matrix)
//
// Each entry has enough domain context that AI-generated AnswerBlock + FAQ
// copy doesn't fabricate. Use the `priorities` field as input prompts to
// hand-author or LLM-author per-page copy.

export type Industry = {
  slug: string;
  name: string;
  nameBn: string;
  /** Plain-prose description of the vertical in BD context. */
  description: string;
  /** What this vertical CARES about — orders the page's value props. */
  priorities: string[];
  /** Services from src/lib/services.ts that this vertical needs most. */
  alignedServices: string[];
};

export const INDUSTRIES: Industry[] = [
  {
    slug: "real-estate",
    name: "Real Estate",
    nameBn: "রিয়েল এস্টেট",
    description:
      "Bangladesh's residential and commercial real-estate market: high-ticket lead generation against long sales cycles, brand trust dominates the buyer journey.",
    priorities: ["lead quality over volume", "trust-signals at scale", "geo-targeted paid social", "video walkthroughs"],
    alignedServices: ["paid-ads", "social-media", "content-production", "seo-website"],
  },
  {
    slug: "e-commerce",
    name: "E-commerce",
    nameBn: "ই-কমার্স",
    description:
      "Bangladesh's digital retail sector: marketplace + DTC mix, COD-dominant payment culture, growing live-commerce on Facebook & TikTok.",
    priorities: ["ROAS on Meta + Google", "creator-driven content", "WhatsApp customer service", "abandoned-cart recovery"],
    alignedServices: ["paid-ads", "influencer-marketing", "social-media", "analytics-reporting"],
  },
  {
    slug: "restaurants-food",
    name: "Restaurants & Food",
    nameBn: "রেস্তোরাঁ ও খাদ্য",
    description:
      "Independent restaurants, food delivery brands, and cloud kitchens — heavy reliance on Foodpanda, hungrynaki, and Instagram-led discovery.",
    priorities: ["food photography", "Foodpanda visibility", "influencer reviews", "festival promotions"],
    alignedServices: ["social-media", "content-production", "influencer-marketing", "brand-building"],
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    nameBn: "স্বাস্থ্যসেবা",
    description:
      "Hospitals, diagnostic chains, telemedicine platforms — compliance-aware comms, patient-trust-building content.",
    priorities: ["doctor profile content", "patient testimonials", "telemedicine UX content", "local SEO"],
    alignedServices: ["content-production", "seo-website", "brand-building", "analytics-reporting"],
  },
  {
    slug: "education",
    name: "Education",
    nameBn: "শিক্ষা",
    description:
      "Schools, coaching centres, university recruitment — admissions-cycle driven demand, peak seasonality in March-July.",
    priorities: ["admissions campaign funnel", "alumni testimonials", "exam-prep content", "scholarship lead capture"],
    alignedServices: ["paid-ads", "content-production", "social-media", "seo-website"],
  },
  {
    slug: "ngo-development",
    name: "NGO & Development",
    nameBn: "এনজিও ও উন্নয়ন",
    description:
      "Bangladeshi NGOs and INGOs — donor reporting, programme-impact storytelling, recruitment campaigns; English+Bangla bilingual default.",
    priorities: ["impact storytelling", "donor reporting", "field-team recruitment", "bilingual content"],
    alignedServices: ["content-production", "political-pr", "brand-building", "social-media"],
  },
  {
    slug: "government",
    name: "Government & Public Sector",
    nameBn: "সরকার ও পাবলিক সেক্টর",
    description:
      "Government ministries, public-sector agencies, and elected officials — citizen-communications, policy explainers, public-information campaigns.",
    priorities: ["plain-language policy explainers", "bilingual reach", "crisis communications", "official-channel content"],
    alignedServices: ["political-pr", "content-production", "social-media"],
  },
  {
    slug: "rmg-garments",
    name: "RMG & Garments",
    nameBn: "তৈরি পোশাক শিল্প",
    description:
      "Bangladesh's $40B+ RMG sector — B2B brand-building, ESG storytelling, buyer-facing corporate communications.",
    priorities: ["ESG / sustainability content", "buyer-facing corporate sites", "factory tour video", "trade-show comms"],
    alignedServices: ["content-production", "brand-building", "seo-website", "political-pr"],
  },
  {
    slug: "hospitality",
    name: "Hospitality",
    nameBn: "আতিথ্য",
    description:
      "Hotels, resorts, MICE venues — direct-booking optimization, OTA management, destination marketing especially in Cox's Bazar, Sylhet, Sundarbans.",
    priorities: ["direct-booking funnel", "OTA optimization", "destination video", "festival promotions"],
    alignedServices: ["hospitality", "paid-ads", "content-production", "influencer-marketing"],
  },
  {
    slug: "fintech",
    name: "Fintech",
    nameBn: "ফিনটেক",
    description:
      "MFS, digital banks, BNPL, insurtech — regulated growth marketing, education-led content, fraud-trust comms.",
    priorities: ["education-led acquisition", "compliance-aware ad creative", "trust storytelling", "BFI partnerships"],
    alignedServices: ["paid-ads", "content-production", "brand-building", "analytics-reporting"],
  },
];

export function getIndustry(slug: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.slug === slug);
}
