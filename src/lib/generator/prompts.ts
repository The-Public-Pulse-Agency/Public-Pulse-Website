// Prompt builders for the blog generator.
//
// Hard rules (encoded in system + reinforced in user message):
//   • Cite EVERY grounding ref by slug or phrase in the body — quality gate
//     refuses the post otherwise.
//   • AnswerBlock: 40–60 words, lead with the answer, ≤1 use of the brand
//     name "Public Pulse".
//   • ≥3 FAQs, each 1-paragraph answers.
//   • Body ≥600 words, ##/### headings, no first-person plural fluff.
//   • BN posts are written by the BN-native prompt; never translated.
//
// Output contract: the model must use the `emit_post` tool exactly once.

import type { ResolvedGrounding } from "./grounding-resolver";

export const EMIT_POST_TOOL = {
  name: "emit_post",
  description:
    "Emit the finished blog post as a single structured payload. MUST be called exactly once.",
  input_schema: {
    type: "object",
    properties: {
      slug: {
        type: "string",
        description: "URL slug — lowercase, hyphens, no diacritics, no slashes. ≤90 chars. For BN posts use a transliterated EN slug (so URLs stay clean).",
      },
      title: { type: "string", description: "Page H1 (English or Bengali per locale). ≤150 chars." },
      excerpt: {
        type: "string",
        description: "1–2 sentence summary for the listing card. 120–280 chars.",
      },
      answerFirst: {
        type: "string",
        description: "40–60 word self-contained answer for the AnswerBlock. Lead with the answer; cite specifics from the FACTS block; mention 'Public Pulse Agency' at most once.",
      },
      bodyMdx: {
        type: "string",
        description: "Full body markdown: ≥600 words. Use ## and ### headings. NO MDX components. NO 'TL;DR' or 'In conclusion' filler. Cite every grounding slug at least once.",
      },
      faqs: {
        type: "array",
        minItems: 3,
        items: {
          type: "object",
          properties: {
            q: { type: "string", description: "1-sentence question, ending in '?'." },
            a: { type: "string", description: "2–4 sentence answer. Plain prose." },
          },
          required: ["q", "a"],
        },
      },
      tags: {
        type: "array",
        items: { type: "string" },
        maxItems: 8,
        description: "Short lowercase tags (1-3 words each).",
      },
      seoTitle: { type: "string", description: "≤60 chars. Different from the H1 — punchier, includes target keyword." },
      seoDescription: { type: "string", description: "140–160 chars. Hook + outcome + brand." },
      readingTime: {
        type: "integer",
        minimum: 3,
        maximum: 25,
        description: "Estimated minutes at 200 wpm.",
      },
    },
    required: ["slug", "title", "excerpt", "answerFirst", "bodyMdx", "faqs", "seoTitle", "seoDescription", "readingTime"],
  },
} as const;

const SHARED_RULES_EN = `
HARD RULES:
1. Use the emit_post tool exactly once. Never write prose outside the tool.
2. Cite every slug in REQUIRED_REFS at least once in bodyMdx (either as the slug
   itself or as the de-hyphenated phrase). The publish-gate refuses posts that
   don't.
3. AnswerBlock (answerFirst): 40–60 words. Lead with the answer. Reference one
   concrete fact from FACTS. Mention "Public Pulse Agency" at most once.
4. ≥3 FAQs, each Q ends in "?".
5. Body ≥600 words. Use ## and ### headings. No "In conclusion", "TL;DR",
   "In today's fast-paced world", or LLM-tell filler.
6. Never invent numbers, founder names, study citations, or company history.
   Stick to the FACTS block and well-known general knowledge.
7. No emojis. No exclamation points. No second-person hard sells ("YOU MUST...").
8. Bangladesh context throughout — use Dhaka neighbourhood names, BDT, Facebook
   (still dominant in BD), Bkash, Nagad, real local phenomena.
9. Internal-link friendly: when you mention a glossary term that appears in FACTS,
   write its name in plain text; the renderer auto-links it.
`.trim();

const SHARED_RULES_BN = `
কঠোর নিয়মাবলী (HARD RULES):
১. শুধুমাত্র একবার emit_post টুল ব্যবহার করুন। টুলের বাইরে কোনো লেখা নয়।
২. REQUIRED_REFS-এ দেওয়া প্রতিটি slug অন্তত একবার বডিতে উল্লেখ করুন (slug-রূপে বা হাইফেন বাদ দিয়ে শব্দরূপে)। পাবলিশ-গেট না মানলে পোস্ট ফেরত পাঠাবে।
৩. answerFirst: ৪০–৬০ ইংরেজি শব্দের সমান বাংলা দৈর্ঘ্য, উত্তর দিয়ে শুরু, FACTS থেকে একটি কংক্রিট তথ্য, "Public Pulse Agency" সর্বোচ্চ একবার।
৪. কমপক্ষে তিনটি FAQ, প্রশ্ন "?" দিয়ে শেষ।
৫. মূল লেখা: কমপক্ষে ৬০০ শব্দের সমতুল্য বাংলা, ## এবং ### শিরোনাম ব্যবহার করুন। "উপসংহারে", "সব মিলিয়ে" জাতীয় ফিলার নয়।
৬. কোনো সংখ্যা, প্রতিষ্ঠাতার নাম, গবেষণা উদ্ধৃতি বা কোম্পানির ইতিহাস তৈরি করবেন না। শুধু FACTS এবং সাধারণ জ্ঞান।
৭. ইমোজি নয়, বিস্ময়বোধক চিহ্ন নয়, "আপনাকে অবশ্যই" জাতীয় hard sell নয়।
৮. পুরো লেখায় বাংলাদেশের প্রসঙ্গ — ঢাকার এলাকার নাম, টাকা (BDT), Facebook (বাংলাদেশে এখনো প্রভাবশালী), bKash, Nagad, প্রকৃত স্থানীয় উদাহরণ।
৯. মেশিন অনুবাদ নয় — বাংলায় স্বাভাবিক বাক্যগঠন। ইংরেজি বাক্য বাংলায় বসাবেন না।

আউটপুট কন্ট্রাক্ট: emit_post টুলের সব ফিল্ড বাংলায় (slug + tags ব্যতীত — সেগুলো ইংরেজিতে)।
`.trim();

export function buildSystemPrompt(locale: "en" | "bn"): string {
  if (locale === "bn") {
    return [
      `আপনি Public Pulse Agency-র জন্য একজন সিনিয়র ডিজিটাল মার্কেটিং স্ট্র্যাটেজিস্ট, যিনি ঢাকা থেকে বাংলাদেশের ব্র্যান্ডদের জন্য practitioner-grade গাইড লেখেন। আপনার পাঠক: বাংলাদেশের ব্র্যান্ড ম্যানেজার, রাজনৈতিক প্রচারণা পরিচালক, রিয়েল এস্টেট মার্কেটিং প্রধান। আপনি ঢাকা/চট্টগ্রাম/সিলেট/কক্সবাজারের বাস্তবতা, BDT বাজেট, Facebook-প্রধান চ্যানেল মিক্স ভালোভাবে জানেন।`,
      ``,
      SHARED_RULES_BN,
    ].join("\n");
  }
  return [
    `You are a senior digital-marketing strategist at Public Pulse Agency, writing practitioner-grade guides for Bangladeshi brands from the Dhaka studio. Audience: BD brand managers, political campaign directors, real-estate marketing heads. You know Dhaka/Chattogram/Sylhet/Cox's Bazar realities, BDT budget bands, the Facebook-led channel mix, and how Bkash/Nagad changes funnel design.`,
    ``,
    SHARED_RULES_EN,
  ].join("\n");
}

export function buildUserPrompt(args: {
  topic: string;
  targetKeyword: string | null;
  locale: "en" | "bn";
  grounding: ResolvedGrounding;
}): string {
  const requiredRefs = args.grounding.refs.map((r) => `- \`${r}\``).join("\n");
  if (args.locale === "bn") {
    return [
      `### বিষয় (Topic)`,
      args.topic,
      ``,
      args.targetKeyword ? `টার্গেট কীওয়ার্ড: ${args.targetKeyword}` : "",
      ``,
      `### REQUIRED_REFS (প্রতিটি অন্তত একবার বডিতে উল্লেখ করুন)`,
      requiredRefs,
      ``,
      `### FACTS — Public Pulse-র ক্যাটালগ থেকে যাচাইকৃত তথ্য`,
      args.grounding.facts,
      ``,
      `এই FACTS-এর বাইরের কোনো সংখ্যা, নাম বা দাবি ব্যবহার করবেন না। সাধারণ industry জ্ঞান গ্রহণযোগ্য।`,
      ``,
      `এখন emit_post টুল কল করুন।`,
    ]
      .filter(Boolean)
      .join("\n");
  }
  return [
    `### TOPIC`,
    args.topic,
    ``,
    args.targetKeyword ? `Target keyword: ${args.targetKeyword}` : "",
    ``,
    `### REQUIRED_REFS (cite each at least once in bodyMdx)`,
    requiredRefs,
    ``,
    `### FACTS — verified specifics from the Public Pulse catalog`,
    args.grounding.facts,
    ``,
    `Use no numbers, names, or claims outside these FACTS. General industry knowledge is fine.`,
    ``,
    `Now call the emit_post tool.`,
  ]
    .filter(Boolean)
    .join("\n");
}
