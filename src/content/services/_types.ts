export type ProcessStep = { title: string; body: string };
export type Faq = { q: string; a: string };
export type WhyChoose = { title: string; body: string };

export type ServiceContent = {
  /** 40–60 word quotable answer for the AnswerBlock + speakable schema. */
  answer: string;
  /** 1–2 sentence lede that follows the AnswerBlock. */
  intro: string;
  /** 5–7 bullets of concrete deliverables. */
  included: string[];
  /** Exactly 5 process steps. */
  process: ProcessStep[];
  /** 3–4 reasons we win this service vs alternatives. */
  whyChooseUs: WhyChoose[];
  /** 3 genuinely useful Q&A pairs. */
  faqs: Faq[];
};
