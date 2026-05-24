import type { ReactNode } from "react";

// 40–60 word quotable answer rendered at the top of content pages.
// Selector ".answer-block" is referenced by Article schema's `speakable` field.
// Lead with the answer; no fluff. See docs/SEO-AEO-GEO.md for the contract.

type AnswerBlockProps = {
  /** The literal question this block answers — optional but helps QAPage schema. */
  question?: string;
  children: ReactNode;
};

export function AnswerBlock({ question, children }: AnswerBlockProps) {
  return (
    <section
      className="answer-block my-6"
      aria-labelledby={question ? "answer-question" : undefined}
      data-speakable=""
    >
      {question ? (
        <h2
          id="answer-question"
          className="text-sm font-semibold uppercase tracking-wide text-brand-teal mb-2"
        >
          {question}
        </h2>
      ) : null}
      <div className="text-[17px] leading-relaxed text-slate-800">{children}</div>
    </section>
  );
}
