import type { ServiceContent } from "./_types";

export const politicalPr: ServiceContent = {
  answer:
    "Public Pulse Agency runs end-to-end political PR campaigns for Bangladeshi candidates and parties — candidate image building, narrative engineering, opposition research, crisis communication, and a five-phase election execution from pre-campaign positioning to post-election PR. Based in Dhaka, serving constituencies nationwide.",
  intro:
    "Elections in Bangladesh are won as much in perception as at the polling booth. We help candidates, parties, and political organizations build a coherent public narrative, defend it under pressure, and convert reach into votes.",
  included: [
    "Candidate personal branding — photo, video, biography, public service documentation",
    "Constituency opinion surveys and local-hero narrative mapping",
    "Rival/opposition analysis and counter-narrative playbooks",
    "Five-phase election PR: pre-campaign → mobilization → peak → polling day → post-election",
    "Crisis communication retainer with 24-hour response SLA",
    "Debunking, fact-checking, and proactive media outreach",
    // TODO(user): confirm whether we offer voter-data segmentation here or keep it as a separate engagement
  ],
  process: [
    { title: "Initial Consultation", body: "Free discovery call to understand the seat, the opposition, and the timeline." },
    { title: "Research & Strategy", body: "Constituency survey, rival analysis, audience segmentation, narrative design." },
    { title: "Production & Launch", body: "All creative produced in-house; ground-team and digital activated together." },
    { title: "Monitor & Optimize", body: "Daily sentiment tracking, A/B narrative tests, rapid pivots when news shifts." },
    { title: "Report & Scale", body: "Weekly KPI reports; budget reallocation across constituencies, polling booths, demographics." },
  ],
  whyChooseUs: [
    { title: "Integrated, not just digital", body: "Narrative, digital reach, ground-team coordination, and crisis response run as one campaign — under one accountable team." },
    { title: "NDA-protected by default", body: "Every engagement is contracted under NDA. We never work directly competing candidates in the same constituency in the same cycle." },
    { title: "24-hour crisis SLA", body: "When the news cycle turns against you at 11pm, a strategist and a creative are awake and on it by midnight." },
    { title: "Bangladesh-native team", body: "Our strategists, copywriters, and field coordinators are Bangladeshi — not parachuted in. We understand constituency politics here." },
  ],
  faqs: [
    {
      q: "Do you only work with one party?",
      a: "No. We work with candidates and parties across the spectrum, but never with directly competing candidates in the same constituency during the same cycle. All engagements are NDA-protected.",
    },
    {
      q: "How early should a campaign engage you?",
      a: "Ideally 6–9 months before polling. We can run condensed 90-day playbooks but the earlier we start, the cheaper and more effective the narrative work is.",
    },
    {
      q: "Is this digital-only, or do you also handle ground operations?",
      a: "Both. Our political PR is integrated — narrative, digital reach, ground-team coordination, and crisis response run as one campaign.",
    },
  ],
};
