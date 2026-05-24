// Pulse Group — typed config powering /group, footer "Sister Concerns",
// and Organization JSON-LD with parentOrganization/subOrganization links.
//
// Taglines and colors below are best-guess placeholders synthesized from each
// brand's domain. Confirm with the user and update; the schema graph downstream
// will reflect whatever lives here.

export type PulseBrand = {
  slug: string;
  name: string;
  url: string;
  tagline: string;
  logoText: { primary: string; secondary: string };
  color: string;
  self?: boolean;
};

export const PULSE_GROUP = {
  id: "https://pulsegroup.bd/#organization",
  name: "Pulse Group",
  url: "https://pulsegroup.bd",
  tagline: "A family of Bangladesh-focused digital businesses.",
} as const;

export const PULSE_BRANDS: PulseBrand[] = [
  {
    slug: "public-pulse",
    name: "Public Pulse Agency",
    url: "https://publicpulse.com.bd",
    tagline: "Digital marketing & political PR agency.",
    logoText: { primary: "PUBLIC", secondary: "pulse.agency" },
    color: "#D32F2F",
    self: true,
  },
  {
    slug: "event-pulse",
    name: "Event Pulse",
    url: "https://eventpulse.com.bd",
    tagline: "End-to-end event management and production.",
    logoText: { primary: "EVENT", secondary: "pulse.com.bd" },
    color: "#1565C0",
  },
  {
    slug: "tender-pulse",
    name: "Tender Pulse",
    url: "https://tenderpulse.com.bd",
    tagline: "Government tenders & e-procurement intelligence.",
    logoText: { primary: "TENDER", secondary: "pulse.com.bd" },
    color: "#2E7D32",
  },
  {
    slug: "social-pulse",
    name: "Social Pulse",
    url: "https://socialpulse.bd",
    tagline: "Community & influencer marketing platform.",
    logoText: { primary: "SOCIAL", secondary: "pulse.bd" },
    color: "#6A1B9A",
  },
  {
    slug: "the-pulse-today",
    name: "The Pulse Today",
    url: "https://pulsetoday.com.bd",
    tagline: "Daily news & analysis for Bangladesh.",
    logoText: { primary: "THE PULSE", secondary: "today" },
    color: "#EF6C00",
  },
];

export const SISTER_BRANDS = PULSE_BRANDS.filter((b) => !b.self);
