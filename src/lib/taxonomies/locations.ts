// Bangladesh divisions + major cities — grounding source for:
//   /locations/<slug>            (LocalBusiness pages)
//   /<service>/<slug>            (SERVICE × LOCATION matrix — scale driver)
// Each entry carries enough real local context for AnswerBlock + FAQ copy
// to be genuinely grounded, not LLM-generic.

export type Location = {
  slug: string;
  /** Display name (English). */
  name: string;
  /** Bangla name — preserved for hand-authored bn pages later. */
  nameBn: string;
  /** Division (BD admin level). */
  division: "Dhaka" | "Chattogram" | "Sylhet" | "Khulna" | "Rajshahi" | "Barishal" | "Mymensingh" | "Rangpur";
  /** Lat/lng for LocalBusiness schema on per-city pages. */
  lat: number;
  lng: number;
  /** Population (rounded) — used in AnswerBlock copy. */
  population: string;
  /** What this place is known for, in plain prose (1-2 lines max). */
  characterizedBy: string;
  /** Industries this location over-indexes on — drives service-fit copy. */
  topIndustries: string[];
};

export const LOCATIONS: Location[] = [
  {
    slug: "dhaka",
    name: "Dhaka",
    nameBn: "ঢাকা",
    division: "Dhaka",
    lat: 23.8103,
    lng: 90.4125,
    population: "10M+",
    characterizedBy:
      "Bangladesh's capital and the country's commercial, political and creative centre. Almost every consumer brand launch, election campaign and corporate PR play in BD touches Dhaka first.",
    topIndustries: ["real-estate", "e-commerce", "fintech", "media", "government"],
  },
  {
    slug: "chattogram",
    name: "Chattogram",
    nameBn: "চট্টগ্রাম",
    division: "Chattogram",
    lat: 22.3569,
    lng: 91.7832,
    population: "4M+",
    characterizedBy:
      "Bangladesh's port city and second-largest urban economy. Home to the country's largest shipping, RMG manufacturing and chemical sectors — B2B-heavy digital marketing demand.",
    topIndustries: ["rmg-garments", "logistics", "manufacturing", "real-estate"],
  },
  {
    slug: "sylhet",
    name: "Sylhet",
    nameBn: "সিলেট",
    division: "Sylhet",
    lat: 24.8949,
    lng: 91.8687,
    population: "0.7M+",
    characterizedBy:
      "Northeast Bangladesh, tea-growing belt with strong diaspora ties to the UK. Tourism, hospitality and overseas-Bangladeshi remittance services dominate the local digital landscape.",
    topIndustries: ["hospitality", "education", "real-estate", "ngo-development"],
  },
  {
    slug: "khulna",
    name: "Khulna",
    nameBn: "খুলনা",
    division: "Khulna",
    lat: 22.8456,
    lng: 89.5403,
    population: "1.5M+",
    characterizedBy:
      "Bangladesh's southwest hub, gateway to the Sundarbans. Mix of shrimp aquaculture, jute trade and emerging tourism.",
    topIndustries: ["hospitality", "ngo-development", "rmg-garments"],
  },
  {
    slug: "rajshahi",
    name: "Rajshahi",
    nameBn: "রাজশাহী",
    division: "Rajshahi",
    lat: 24.3745,
    lng: 88.6042,
    population: "0.9M+",
    characterizedBy:
      "Northwest divisional capital. Education-heavy economy with five public universities; agricultural export hub (mango, silk).",
    topIndustries: ["education", "ngo-development", "real-estate"],
  },
  {
    slug: "coxs-bazar",
    name: "Cox's Bazar",
    nameBn: "কক্সবাজার",
    division: "Chattogram",
    lat: 21.4272,
    lng: 92.0058,
    population: "0.25M+",
    characterizedBy:
      "World's longest natural sea beach. Bangladesh's premier domestic tourism destination — hospitality, resort marketing and travel-influencer campaigns dominate.",
    topIndustries: ["hospitality"],
  },
  {
    slug: "gazipur",
    name: "Gazipur",
    nameBn: "গাজীপুর",
    division: "Dhaka",
    lat: 23.998,
    lng: 90.4203,
    population: "2.6M+",
    characterizedBy:
      "Industrial belt north of Dhaka. Bangladesh's largest concentration of RMG manufacturing plants — corporate communications and B2B marketing demand.",
    topIndustries: ["rmg-garments", "manufacturing", "logistics"],
  },
  {
    slug: "narayanganj",
    name: "Narayanganj",
    nameBn: "নারায়ণগঞ্জ",
    division: "Dhaka",
    lat: 23.6238,
    lng: 90.5,
    population: "1.5M+",
    characterizedBy:
      "Old port city south of Dhaka, historic textile and jute centre. Active local political scene; significant SME retail.",
    topIndustries: ["rmg-garments", "real-estate", "retail"],
  },
  {
    slug: "comilla",
    name: "Comilla",
    nameBn: "কুমিল্লা",
    division: "Chattogram",
    lat: 23.4607,
    lng: 91.181,
    population: "0.4M+",
    characterizedBy:
      "Divisional gateway between Dhaka and Chattogram. Strong consumer-goods presence; cluster of pharma manufacturing.",
    topIndustries: ["fmcg", "pharmaceuticals", "education"],
  },
];

export function getLocation(slug: string): Location | undefined {
  return LOCATIONS.find((l) => l.slug === slug);
}
