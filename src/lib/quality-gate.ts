// Pre-publish quality gate for LLM-generated content.
//
// PUBLISH_THRESHOLD = 75. Anything below → REVIEW (manual approval).
// HARD fails short-circuit to REVIEW regardless of score:
//   • no source refs / source ref not referenced in body (phrase form)
//   • fabricated-specific regex bank match (made-up numbers/names)
//   • FAQ < 3
//   • answer-block missing or outside [20, 150] words
//   • placeholder text ("Lorem ipsum", "TODO", "TKTK", "[name]")
//   • word-count < 600
//
// SOFT fails lose points but don't gate.
//
// gateScores JSONB:
//   {
//     verdict: "PUBLISH" | "REVIEW",
//     score: 0..100,
//     hardFails: string[],
//     softFails: { rule: string; weight: number }[],
//     perCategory: { grounding, answerBlock, faq, wordCount, structure, fabrication }
//   }
//
// Re-soak any rule change with 3-5 generator cycles before relying on the
// new score distribution.

export const PUBLISH_THRESHOLD = 75;

export type GateContent = {
  /** Page title. */
  title: string;
  /** The 40–60 word answer block prose. */
  answerBlock: string;
  /** Full body text (markdown / plain text — schema markup stripped). */
  body: string;
  /** FAQ pairs. */
  faqs: { q: string; a: string }[];
  /** Source refs (slugs / IDs) the LLM was supposed to ground in. */
  sourceRefs: string[];
};

export type GateResult = {
  verdict: "PUBLISH" | "REVIEW";
  score: number;
  hardFails: string[];
  softFails: { rule: string; weight: number }[];
  perCategory: {
    grounding: number;
    answerBlock: number;
    faq: number;
    wordCount: number;
    structure: number;
    fabrication: number;
  };
};

// ─── Fabrication signal: regex patterns that almost always indicate made-up
//    specifics. Tune as new failure modes surface.
const FABRICATED_PATTERNS: RegExp[] = [
  /\b(?:founded|established) in \d{4}\b/i, // dates the LLM invents
  /\bover \$?\d{1,3},\d{3} (?:clients|customers|users)\b/i, // made-up scale claims
  /\b(?:CEO|founder) [A-Z][a-z]+ [A-Z][a-z]+\b/, // unnamed-anywhere "exec" names
  /\baccording to (?:a |our )?(?:recent |latest )?study\b/i, // ghost-citation
  /\b\(\s*source:?\s*\)/i, // empty citation parens
];

const PLACEHOLDER_PATTERNS: RegExp[] = [
  /lorem ipsum/i,
  /\bTODO\b/,
  /\bTKTK\b/,
  /\[(?:name|company|date|placeholder|fill in)\]/i,
  /XXX/,
];

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Normalize for slug-vs-prose matching: lowercase, strip diacritics, drop
 *  apostrophes / hyphens / underscores, collapse whitespace. So
 *  "Cox's Bazar", "coxs-bazar", "Cox’s Bāzar" all become "coxs bazar". */
function normalizeForMatch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics
    .toLowerCase()
    .replace(/[''‘’`]/g, "") // strip apostrophes (ASCII + Unicode)
    .replace(/[-_]+/g, " ") // hyphens/underscores → spaces
    .replace(/\s+/g, " ")
    .trim();
}

/** Slug appears in body as-is, as a de-hyphenated phrase, OR as the same
 *  phrase after apostrophe/diacritic-stripping. The grounded entity MUST
 *  still appear — this is just a robust matcher, not a leniency. */
function bodyCitesRef(bodyNormalized: string, ref: string): boolean {
  const refNorm = normalizeForMatch(ref);
  return bodyNormalized.includes(refNorm);
}

export function runQualityGate(content: GateContent): GateResult {
  const hardFails: string[] = [];
  const softFails: { rule: string; weight: number }[] = [];

  // ── Grounding (HARD if missing) ──────────────────────────────────────
  let groundingScore = 100;
  if (content.sourceRefs.length === 0) {
    hardFails.push("no-source-refs");
    groundingScore = 0;
  } else {
    // Each ref must appear in body. We normalize BOTH sides (apostrophes,
    // diacritics, hyphens, case) so "Cox's Bazar" in prose matches the
    // "coxs-bazar" slug. The ref still HAS to be present — this is a robust
    // matcher, not a leniency.
    const bodyNorm = normalizeForMatch(content.body);
    const missing = content.sourceRefs.filter((ref) => !bodyCitesRef(bodyNorm, ref));
    if (missing.length > 0) {
      hardFails.push(`source-ref-not-cited:${missing.join(",")}`);
      groundingScore = Math.max(0, 100 - missing.length * 25);
    }
  }

  // ── AnswerBlock word count (HARD if missing or out of [20, 150]) ─────
  let answerScore = 100;
  const answerWords = wordCount(content.answerBlock);
  if (!content.answerBlock || answerWords < 20 || answerWords > 150) {
    hardFails.push(`answer-block-words:${answerWords}`);
    answerScore = 0;
  } else if (answerWords < 35 || answerWords > 80) {
    // Soft warning: "ideal" is 40–60, but we accept 20–150 hard band.
    softFails.push({ rule: "answer-block-out-of-ideal-band", weight: 5 });
    answerScore = 85;
  }

  // ── FAQ count (HARD if <3) ───────────────────────────────────────────
  let faqScore = 100;
  if (content.faqs.length < 3) {
    hardFails.push(`faq-count:${content.faqs.length}`);
    faqScore = 0;
  }

  // ── Body word count (HARD if <600) ───────────────────────────────────
  let wordCountScore = 100;
  const bodyWords = wordCount(content.body);
  if (bodyWords < 600) {
    hardFails.push(`word-count:${bodyWords}`);
    wordCountScore = 0;
  } else if (bodyWords < 900) {
    softFails.push({ rule: "body-thin", weight: 5 });
    wordCountScore = 80;
  }

  // ── Placeholder text (HARD) ──────────────────────────────────────────
  let structureScore = 100;
  for (const pat of PLACEHOLDER_PATTERNS) {
    if (pat.test(content.body) || pat.test(content.answerBlock)) {
      hardFails.push(`placeholder:${pat.source}`);
      structureScore = 0;
      break;
    }
  }

  // ── Fabrication regex bank (HARD) ────────────────────────────────────
  let fabricationScore = 100;
  for (const pat of FABRICATED_PATTERNS) {
    if (pat.test(content.body)) {
      hardFails.push(`fabricated:${pat.source}`);
      fabricationScore = 0;
      break;
    }
  }

  // ── Aggregate score (weighted average, 100 max) ──────────────────────
  const score = Math.round(
    groundingScore * 0.3 +
      answerScore * 0.15 +
      faqScore * 0.15 +
      wordCountScore * 0.1 +
      structureScore * 0.1 +
      fabricationScore * 0.2 -
      softFails.reduce((acc, f) => acc + f.weight, 0)
  );

  const verdict: GateResult["verdict"] =
    hardFails.length === 0 && score >= PUBLISH_THRESHOLD ? "PUBLISH" : "REVIEW";

  return {
    verdict,
    score: Math.max(0, Math.min(100, score)),
    hardFails,
    softFails,
    perCategory: {
      grounding: groundingScore,
      answerBlock: answerScore,
      faq: faqScore,
      wordCount: wordCountScore,
      structure: structureScore,
      fabrication: fabricationScore,
    },
  };
}
