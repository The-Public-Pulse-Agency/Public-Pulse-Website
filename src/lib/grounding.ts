// Grounding matcher for the LLM content pipeline.
//
// Every content_topic in the queue is matched against the real taxonomies
// (services, locations, industries, glossary, case_studies) BEFORE any LLM
// call. If no grounding source can be matched the topic is quarantined and
// SKIPPED — zero spend on null-grounding generations.
//
// Match priority (highest confidence first):
//   1. explicit groundingHint → direct ref lookup
//   2. exact topical keyword in service/industry/location/glossary name
//   3. entity match (service slug appears in keyword)
//   4. category match (industry vertical mentioned)
//   5. null → quarantine

import { SERVICES, type Service } from "./services";
import { LOCATIONS, type Location } from "./taxonomies/locations";
import { INDUSTRIES, type Industry } from "./taxonomies/industries";
import { GLOSSARY, type GlossaryTerm } from "./taxonomies/glossary";

export type GroundingSourceKind =
  | "service"
  | "location"
  | "industry"
  | "glossary"
  | "case-study";

export type GroundingSource =
  | { kind: "service"; ref: Service }
  | { kind: "location"; ref: Location }
  | { kind: "industry"; ref: Industry }
  | { kind: "glossary"; ref: GlossaryTerm }
  | { kind: "case-study"; ref: { id: string; slug: string; industry: string; serviceSlug?: string | null } };

export type GroundingMatch = {
  /** 0..1, higher = more confident the match is meaningful. */
  confidence: number;
  /** Which match strategy fired. */
  via: "hint" | "keyword" | "entity" | "category" | null;
  source: GroundingSource | null;
};

export type GroundingHint =
  | { kind: GroundingSourceKind; slug: string }
  | { kind: "case-study"; id: string };

export type MatchInput = {
  /** Free-text topic, e.g. "Meta CAPI setup for a Cox's Bazar resort". */
  topic: string;
  /** Authored target keyword if you have one. */
  targetKeyword?: string;
  /** Explicit pre-classification, if the author has one. */
  groundingHint?: GroundingHint;
};

/** Single entry point — returns at most ONE source. Use for pre-gen guard. */
export function matchGrounding(input: MatchInput): GroundingMatch {
  const haystack = `${input.topic} ${input.targetKeyword ?? ""}`.toLowerCase();

  // 1. Explicit hint
  if (input.groundingHint) {
    const src = resolveHint(input.groundingHint);
    if (src) return { confidence: 1, via: "hint", source: src };
  }

  // 2. Keyword exact-name match
  for (const svc of SERVICES.filter((s) => s.ready)) {
    if (haystack.includes(svc.shortName.toLowerCase()) || haystack.includes(svc.name.toLowerCase())) {
      return { confidence: 0.95, via: "keyword", source: { kind: "service", ref: svc } };
    }
  }
  for (const loc of LOCATIONS) {
    if (haystack.includes(loc.name.toLowerCase())) {
      return { confidence: 0.9, via: "keyword", source: { kind: "location", ref: loc } };
    }
  }
  for (const ind of INDUSTRIES) {
    if (haystack.includes(ind.name.toLowerCase())) {
      return { confidence: 0.9, via: "keyword", source: { kind: "industry", ref: ind } };
    }
  }
  for (const term of GLOSSARY) {
    if (haystack.includes(term.name.toLowerCase())) {
      return { confidence: 0.85, via: "keyword", source: { kind: "glossary", ref: term } };
    }
  }

  // 3. Entity (slug appears as a token)
  for (const svc of SERVICES.filter((s) => s.ready)) {
    if (tokenIncludes(haystack, svc.slug)) {
      return { confidence: 0.75, via: "entity", source: { kind: "service", ref: svc } };
    }
  }
  for (const loc of LOCATIONS) {
    if (tokenIncludes(haystack, loc.slug)) {
      return { confidence: 0.7, via: "entity", source: { kind: "location", ref: loc } };
    }
  }

  // 4. Category fallback (industry-flavoured noun in text)
  for (const ind of INDUSTRIES) {
    if (ind.priorities.some((p) => haystack.includes(p.toLowerCase().split(" ")[0]))) {
      return { confidence: 0.5, via: "category", source: { kind: "industry", ref: ind } };
    }
  }

  // 5. Null — quarantine
  return { confidence: 0, via: null, source: null };
}

function tokenIncludes(haystack: string, needle: string): boolean {
  const pattern = new RegExp(`(^|[^a-z0-9-])${escapeRe(needle)}([^a-z0-9-]|$)`, "i");
  return pattern.test(haystack);
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function resolveHint(hint: GroundingHint): GroundingSource | null {
  switch (hint.kind) {
    case "service": {
      const ref = SERVICES.find((s) => s.slug === hint.slug);
      return ref ? { kind: "service", ref } : null;
    }
    case "location": {
      const ref = LOCATIONS.find((l) => l.slug === hint.slug);
      return ref ? { kind: "location", ref } : null;
    }
    case "industry": {
      const ref = INDUSTRIES.find((i) => i.slug === hint.slug);
      return ref ? { kind: "industry", ref } : null;
    }
    case "glossary": {
      const ref = GLOSSARY.find((t) => t.slug === hint.slug);
      return ref ? { kind: "glossary", ref } : null;
    }
    case "case-study": {
      // case studies live in Neon; the matcher caller resolves the ID.
      return null;
    }
  }
}
