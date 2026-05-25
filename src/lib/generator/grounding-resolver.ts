// Turn a topic row's groundingHint into a structured, fact-rich payload that
// gets injected verbatim into the LLM prompt. The prompt template instructs
// the model to cite these facts; the quality gate refuses to publish anything
// that doesn't reference them.
//
// This is the moat: every paragraph the model writes is grounded in a
// real Bangladesh datum (population, top industries, deliverable list,
// glossary definition) that we control, not invented.

// Note: no `import "server-only"` — this module is also imported by the
// CLI smoke + generator scripts. Server-boundary is enforced by callers
// (e.g. src/lib/generator/run.ts uses next/cache which is server-only).
import type { ContentTopic } from "@/db/schema";
import { SERVICES } from "@/lib/services";
import { LOCATIONS } from "@/lib/taxonomies/locations";
import { INDUSTRIES } from "@/lib/taxonomies/industries";
import { GLOSSARY } from "@/lib/taxonomies/glossary";
import { getServiceContent } from "@/content/services";

export type ResolvedGrounding = {
  /** Slugs to write into blog_posts.sourceRefs (and which the gate verifies the
   *  body cites). Each MUST appear in the rendered body. */
  refs: string[];
  /** Suggested category for the new post. */
  suggestedCategorySlug: string;
  /** Suggested tags (short phrases). */
  suggestedTags: string[];
  /** Plain-text facts block injected into the prompt. */
  facts: string;
  /** Service / location / industry / glossary kinds present. */
  kinds: string[];
};

type RawHint = Record<string, unknown>;

function getStr(o: RawHint, k: string): string | undefined {
  const v = o[k];
  return typeof v === "string" && v ? v : undefined;
}

export function resolveGrounding(topic: ContentTopic): ResolvedGrounding | null {
  const hint = (topic.groundingHint ?? null) as RawHint | null;
  if (!hint) return null;

  const serviceSlug = getStr(hint, "service");
  const locationSlug = getStr(hint, "location");
  const industrySlug = getStr(hint, "industry");
  const glossarySlug = getStr(hint, "glossary");

  const service = serviceSlug ? SERVICES.find((s) => s.slug === serviceSlug) : undefined;
  const location = locationSlug ? LOCATIONS.find((l) => l.slug === locationSlug) : undefined;
  const industry = industrySlug ? INDUSTRIES.find((i) => i.slug === industrySlug) : undefined;
  const glossary = glossarySlug ? GLOSSARY.find((g) => g.slug === glossarySlug) : undefined;

  if (!service && !location && !industry && !glossary) return null;

  const refs: string[] = [];
  const facts: string[] = [];
  const tags: string[] = [];
  const kinds: string[] = [];
  let suggestedCategorySlug = topic.category || "blog";

  if (service) {
    refs.push(service.slug);
    kinds.push("service");
    tags.push(service.shortName.toLowerCase());
    suggestedCategorySlug = guessCategoryForService(service.slug);
    const content = getServiceContent(service.slug);
    facts.push(`## SERVICE — ${service.name} (slug: \`${service.slug}\`)`);
    facts.push(`Category: ${service.category}.  Type: ${service.serviceType}.`);
    facts.push(`One-liner: ${service.oneLiner}`);
    if (content) {
      facts.push(`AnswerBlock (canonical): ${content.answer}`);
      facts.push(`Lede: ${content.intro}`);
      facts.push(`Deliverables (use these exact wordings):`);
      content.included.forEach((d) => facts.push(`- ${d}`));
      facts.push(`5-step process:`);
      content.process.forEach((p, i) => facts.push(`${i + 1}. **${p.title}** — ${p.body}`));
      facts.push(`Why-choose-us pillars:`);
      content.whyChooseUs.forEach((w) => facts.push(`- **${w.title}.** ${w.body}`));
    }
  }

  if (location) {
    refs.push(location.slug);
    kinds.push("location");
    tags.push(location.name.toLowerCase());
    facts.push("");
    facts.push(`## LOCATION — ${location.name} (${location.nameBn}, ${location.division} division, slug: \`${location.slug}\`)`);
    facts.push(`Population: ${location.population}. Coordinates: ${location.lat}, ${location.lng}.`);
    facts.push(`Characterised by: ${location.characterizedBy}`);
    facts.push(`Top industries here: ${location.topIndustries.join(", ")}.`);
  }

  if (industry) {
    refs.push(industry.slug);
    kinds.push("industry");
    tags.push(industry.name.toLowerCase());
    facts.push("");
    facts.push(`## INDUSTRY — ${industry.name} (${industry.nameBn}, slug: \`${industry.slug}\`)`);
    facts.push(`Description: ${industry.description}`);
    facts.push(`Priorities (rank-ordered): ${industry.priorities.join("; ")}.`);
    facts.push(`Aligned services from our catalog: ${industry.alignedServices.join(", ")}.`);
  }

  if (glossary) {
    refs.push(glossary.slug);
    kinds.push("glossary");
    tags.push(glossary.name.toLowerCase());
    suggestedCategorySlug = "ai-aeo-geo";
    facts.push("");
    facts.push(`## GLOSSARY — ${glossary.name}${glossary.nameBn ? ` (${glossary.nameBn})` : ""} (slug: \`${glossary.slug}\`)`);
    facts.push(`Area: ${glossary.area}`);
    facts.push(`Canonical definition: ${glossary.definition}`);
    if (glossary.body) facts.push(`Extended explanation: ${glossary.body}`);
  }

  // Always anchor on Public Pulse identity so the model can't invent the agency.
  facts.push("");
  facts.push(`## ABOUT PUBLIC PULSE AGENCY`);
  facts.push(
    `Bangladesh-based 360° digital marketing and political PR studio founded in Dhaka in 2024. ` +
      `BIN 009043032-0102; Trade License TRAD/DNCC/037136/2025. Contact: info@publicpulse.com.bd, +880 1717-714676. ` +
      `Sister concern within Pulse Group. Bills in BDT from a Bangladesh-registered entity. ` +
      `Serves 50+ active clients across 10+ industries.`
  );

  return {
    refs,
    suggestedCategorySlug,
    suggestedTags: Array.from(new Set(tags)),
    facts: facts.join("\n"),
    kinds,
  };
}

/** Best-fit blog category given a service slug — keeps category facets tidy. */
function guessCategoryForService(serviceSlug: string): string {
  const map: Record<string, string> = {
    "political-pr": "political-pr",
    "paid-ads": "paid-media",
    "social-media": "social-media",
    "seo-website": "seo",
    "brand-building": "branding",
    "content-production": "content",
    hospitality: "hospitality",
    "analytics-reporting": "analytics",
    "influencer-marketing": "influencer",
  };
  return map[serviceSlug] ?? "blog";
}
