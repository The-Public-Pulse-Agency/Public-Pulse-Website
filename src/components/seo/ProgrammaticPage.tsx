import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, ArrowRight, CheckCircle2 } from "lucide-react";
import { GradientHero } from "@/components/seo/GradientHero";
import { Container } from "@/components/ui/Container";
import type { Crumb } from "@/lib/schema";

// Shared shell for every grounded programmatic page (location, industry,
// service×location, service×industry, glossary term, guide, compare).
//
// Every page that uses this gets — for free — the AEO/GEO surface:
//   • Centered chip + h1 + lead
//   • AnswerBlock (40–60 word lift-quote, data-speakable)
//   • Optional callout list (deliverables / steps / dimensions)
//   • FAQ accordion (≥3 = quality gate)
//   • Related-links rail
//   • Closing dark CTA

export type ProgrammaticFaq = { q: string; a: string };
export type ProgrammaticRelated = { href: string; label: string; eyebrow?: string };

type Props = {
  crumbs: Crumb[];
  chip: string;
  /** H1 with optional orange fragment via <Hl>orange-bit</Hl> in JSX. */
  title: ReactNode;
  lead: string;
  /** 40–60 word answer. AEO/GEO surface. Required. */
  answer: string;
  /** Optional follow-up "what is this" question for QAPage feel. */
  answerQuestion?: string;
  /** Render in the middle: callouts, lists, comparison tables, etc. */
  children?: ReactNode;
  /** ≥3 — quality gate hard fail under PHASE 4. */
  faqs: ProgrammaticFaq[];
  /** Cross-links rail. */
  related?: ProgrammaticRelated[];
  /** Final-CTA copy. Plain text only (no HTML) — author the JSX inline if you need formatting. */
  ctaTitle?: ReactNode;
  ctaSub?: ReactNode;
};

/** Inline orange-highlighted hero word. */
export function Hl({ children }: { children: ReactNode }) {
  return <span className="text-brand-orange">{children}</span>;
}

export function ProgrammaticPage(props: Props) {
  const {
    crumbs,
    chip,
    title,
    lead,
    answer,
    answerQuestion,
    children,
    faqs,
    related,
    ctaTitle = (
      <>
        Want help <Hl>doing this</Hl>?
      </>
    ),
    ctaSub = "Free 30-minute consultation. We'll review your situation and propose a plan.",
  } = props;

  return (
    <article>
      <GradientHero
        crumbs={crumbs}
        chip={chip}
        title={title}
        lead={lead}
        answer={answer}
        answerQuestion={answerQuestion}
      />

      {children}

      {/* ─── FAQ (≥3 required by quality gate) ──────────────────────── */}
      <section className="border-t border-ink bg-paper-alt py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-eyebrow uppercase text-brand-orange">FAQ</p>
            <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
              Frequently asked.
            </h2>
            <dl className="mt-10 space-y-4">
              {faqs.map((f) => (
                <div key={f.q} className="rounded-card border border-ink/15 bg-paper p-6">
                  <dt className="font-semibold text-ink">{f.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-ink/70">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      {/* ─── Related rail ───────────────────────────────────────────── */}
      {related && related.length > 0 && (
        <section className="border-t border-ink bg-paper py-20 md:py-24">
          <Container>
            <div className="mx-auto max-w-3xl">
              <p className="text-eyebrow uppercase text-brand-orange">Keep reading</p>
              <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
                Related.
              </h2>
            </div>
            <ul className="mt-10 grid gap-4 md:grid-cols-3">
              {related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="card group flex h-full flex-col">
                    {r.eyebrow && (
                      <span className="text-meta font-semibold uppercase text-brand-orange">
                        {r.eyebrow}
                      </span>
                    )}
                    <h3 className="mt-3 text-h3 font-bold text-ink">{r.label}</h3>
                    <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                      Open
                      <ArrowRight
                        className="h-3.5 w-3.5 transition group-hover:translate-x-1"
                        aria-hidden
                      />
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* ─── Closing CTA ────────────────────────────────────────────── */}
      <section className="border-t border-ink bg-ink py-24 text-paper md:py-28">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-mega font-extrabold leading-[0.95] tracking-tight">{ctaTitle}</h2>
            <p className="mt-6 text-lead text-white/70">{ctaSub}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/contact" className="btn btn-orange">
                Get a free consultation
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </article>
  );
}

// Re-export the bullet-list pattern used by deliverable / step sections.
export function CalloutList({ items }: { items: string[] }) {
  return (
    <section className="bg-paper py-16">
      <Container>
        <ul className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3 rounded-card border border-ink/15 bg-paper p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-orange" aria-hidden />
              <span className="text-sm leading-relaxed text-ink">{item}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
