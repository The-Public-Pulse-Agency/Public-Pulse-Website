import type { ServiceContent } from "./_types";
import { politicalPr } from "./political-pr";
import { socialMedia } from "./social-media";
import { contentProduction } from "./content-production";
import { paidAds } from "./paid-ads";
import { hospitality } from "./hospitality";
import { brandBuilding } from "./brand-building";
import { seoWebsite } from "./seo-website";
import { analyticsReporting } from "./analytics-reporting";
import { influencerMarketing } from "./influencer-marketing";

const REGISTRY: Record<string, ServiceContent> = {
  "political-pr": politicalPr,
  "social-media": socialMedia,
  "content-production": contentProduction,
  "paid-ads": paidAds,
  hospitality: hospitality,
  "brand-building": brandBuilding,
  "seo-website": seoWebsite,
  "analytics-reporting": analyticsReporting,
  "influencer-marketing": influencerMarketing,
};

export const getServiceContent = (slug: string): ServiceContent | undefined =>
  REGISTRY[slug];

export type { ServiceContent } from "./_types";
