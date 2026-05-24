import type { ServiceContent } from "./_types";

export const contentProduction: ServiceContent = {
  answer:
    "Public Pulse Agency produces brand films, social cutdowns, photography, motion graphics, drone footage and UGC content for Bangladeshi brands — shot in Dhaka, Cox's Bazar, Sylhet and on location across the country. Strategy-first scripts, weekly delivery cadence, and content built for the platforms it will actually live on.",
  intro:
    "Most content fails not at the camera, but at the brief. We start by mapping each video and photo against a sales-funnel stage and a platform, then produce only what fits — fast, in Bangla or English, with brand-safe production standards.",
  included: [
    "Brand films and 60-second sales videos in Bangla and English",
    "Social cutdowns sized for Reels, TikTok, YouTube Shorts and Facebook Feed",
    "Studio and on-location product photography",
    "Motion graphics and explainer animations",
    "Drone shoots for hospitality, real estate, events",
    "UGC content briefs, creator coordination and rights management",
    // TODO(user): confirm whether 360°/VR is in scope; we've done it for resorts before but it's expensive
  ],
  process: [
    { title: "Brief & Treatment", body: "We translate your campaign goal into a shot list, mood board, scripts, and a one-page treatment you sign off on." },
    { title: "Pre-Production", body: "Location scout, casting, scheduling, permits. We handle the logistics so you don't lose a week to coordination." },
    { title: "Shoot Day(s)", body: "Director, DOP, sound and grip on set. Daily rushes shared end-of-day so changes happen before edit, not after." },
    { title: "Edit & Versioning", body: "Master edit plus all platform cutdowns produced in one pass — vertical, square, horizontal, with and without captions." },
    { title: "Delivery & Iteration", body: "Final files in your preferred formats. We track performance for 30 days and offer one round of creative iteration based on the data." },
  ],
  whyChooseUs: [
    { title: "Platform-native from the start", body: "Vertical cutdowns are planned at the storyboard, not crammed into a 16:9 frame afterwards. The same shoot day produces 8–12 deliverables, not one." },
    { title: "In-house from script to delivery", body: "Strategists, scriptwriters, director, DOP, editor and motion designer all under one roof. No subcontracting, no handoff delays." },
    { title: "Bangla and English production standards", body: "Brand-safe Bangla voiceover, subtitle accuracy, font choices that work for both scripts. We get the language right." },
    { title: "Built for ad budgets", body: "We produce versions specifically for paid distribution — hook in 3 seconds, captioned-safe, no audio dependency." },
  ],
  faqs: [
    {
      q: "Can you produce in one day, or do you need weeks?",
      a: "A standard one-product social shoot is one day on set, three days in edit — call it ten business days door-to-door. Brand films take three to six weeks. Rush jobs are possible at a 30% premium.",
    },
    {
      q: "Do you own the footage or do we?",
      a: "You own the final deliverables and the raw footage we shoot. Stock and music we license are licensed to your brand. We retain the right to use the work in our portfolio unless you opt out.",
    },
    {
      q: "Where can you shoot?",
      a: "Anywhere in Bangladesh. Most-shot locations are Dhaka studios, Cox's Bazar beaches and resorts, Sylhet's tea estates, Bandarban's hill tracts, and Old Dhaka for heritage shoots.",
    },
  ],
};
