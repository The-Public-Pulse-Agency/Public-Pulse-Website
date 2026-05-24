import type { ServiceContent } from "./_types";

export const analyticsReporting: ServiceContent = {
  answer:
    "Public Pulse Agency sets up GA4, Google Tag Manager, Meta Pixel and Conversion API for Bangladeshi advertisers, then builds Looker Studio dashboards that surface marketing ROI in BDT against revenue. Monthly reports that pass an audit — and that your CFO will actually read instead of forwarding to the marketing team for translation.",
  intro:
    "Marketing reports usually answer the wrong question. Yours should answer one thing: did this month's spend produce more revenue than it cost? Our analytics stack is built backwards from that question.",
  included: [
    "GA4 setup or migration from Universal Analytics, with proper event schema",
    "Google Tag Manager: container build, naming conventions, version control",
    "Meta Pixel + Conversion API (server-side via Cloudflare Worker or your backend)",
    "Google Ads conversions, Enhanced Conversions, offline conversion imports",
    "Looker Studio dashboards: campaign-level, channel-level, executive-level",
    "Monthly ROI report in BDT with attribution model documented",
    "Quarterly attribution review — which channels actually drove revenue, which got false credit",
    // TODO(user): confirm whether GA4 BigQuery export + custom modeling is in scope or sold as an upsell
  ],
  process: [
    { title: "Stack Audit", body: "We inventory every tracking pixel, every Tag Manager container, every GA4 property — and document what's broken, duplicated or sending bad data." },
    { title: "Rebuild & Validate", body: "Clean GTM container, GA4 event schema, server-side Meta Conversion API, Google Ads Enhanced Conversions. We validate every event with real test transactions before signing off." },
    { title: "Dashboard Build", body: "Looker Studio dashboards at three altitudes — campaign-detail for the buyer, channel-summary for the marketing lead, ROI-only for the CFO." },
    { title: "Monthly Reporting Cadence", body: "Monthly PDF report + 30-min review call. Spend, conversions, CPA, ROAS, contribution-margin if we have the data." },
    { title: "Quarterly Attribution Review", body: "Every 90 days we re-examine which channels truly drove revenue using multi-touch attribution — and reallocate next quarter's budget accordingly." },
  ],
  whyChooseUs: [
    { title: "Server-side first", body: "iOS tracking loss is real. We deploy Conversion API server-side from day one, recovering 20–40% of conversion signal most agencies leave on the table." },
    { title: "BDT-native reporting", body: "Reports are in taka, against your actual revenue, against your actual COGS where available — not in dollars with a vague 'ROAS' figure." },
    { title: "Auditable container", body: "Our GTM containers are version-controlled with clear naming. You can hand them to another agency in 30 minutes if you ever need to — and that fact alone is why most clients stay." },
    { title: "We say no to vanity dashboards", body: "If a metric won't change a decision, it doesn't go on the dashboard. Pages that nobody reads are debt, not value." },
  ],
  faqs: [
    {
      q: "We're still on Universal Analytics — can you migrate us?",
      a: "Yes. GA4 migration is a 3–4 week project. We rebuild the event schema, set up GTM properly, validate against your old data, and keep both systems live during the transition.",
    },
    {
      q: "How much does the analytics service cost?",
      a: "Setup is a one-time project (typically ৳1,50,000–৳4,00,000 depending on stack complexity). Monthly reporting + maintenance retainer starts at ৳35,000/month and scales with the number of channels and properties.",
    },
    {
      q: "Do you replace our marketing team, or work with them?",
      a: "We work with them. Our job is to give the marketing team a trustworthy measurement layer so their decisions get made on real data — not to take over campaign execution unless that's also in scope.",
    },
  ],
};
