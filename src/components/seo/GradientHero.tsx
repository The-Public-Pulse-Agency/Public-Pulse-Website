import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, MessageCircleMore } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import type { Crumb } from "@/lib/schema";
import { SITE } from "@/lib/site";

// Re-usable "homepage-vibe" hero for every page type. Mega wordmark on the
// left, optional gradient panel on the right with sales-team card and
// avoora-style cloud bg. AnswerBlock anchored below.
//
// Variants:
//   • "panel"   — full avoora gradient panel right side (default)
//   • "compact" — just the headline + chip; no right panel (use for the
//                   minimal AnswerBlock-only pages where the gradient noise
//                   would distract)

type Variant = "panel" | "compact";

type Props = {
  crumbs: Crumb[];
  chip: string;
  title: ReactNode;
  lead: string;
  /** AEO/GEO 40–60 word block, required. */
  answer: string;
  answerQuestion?: string;
  /** "Book a free audit" → "/contact" by default. Override per page if needed. */
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  variant?: Variant;
  /** Panel-only — replaces the default "Sales team online" card. */
  rightPanel?: ReactNode;
};

const SECONDARY_CTA = { label: "WhatsApp", href: SITE.contact.whatsapp };

export function GradientHero({
  crumbs,
  chip,
  title,
  lead,
  answer,
  answerQuestion,
  primaryCtaLabel = "Book a free audit",
  primaryCtaHref = "/contact",
  variant = "panel",
  rightPanel,
}: Props) {
  return (
    <section className="relative overflow-hidden bg-paper">
      <Container className="relative pt-10 pb-12 md:pt-14 md:pb-16">
        <Breadcrumbs crumbs={crumbs} />

        <div
          className={`mt-8 grid items-end gap-8 lg:gap-10 ${
            variant === "panel" ? "lg:grid-cols-12" : ""
          }`}
        >
          <div className={variant === "panel" ? "lg:col-span-7" : "max-w-5xl"}>
            <span className="chip chip-orange">{chip}</span>
            <h1 className="mt-6 text-mega font-extrabold tracking-tight text-ink leading-[0.95]">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lead text-ink/70">{lead}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={primaryCtaHref} className="btn btn-primary">
                {primaryCtaLabel}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href={SECONDARY_CTA.href}
                rel="noopener noreferrer"
                target="_blank"
                className="btn btn-secondary"
              >
                <MessageCircleMore className="h-4 w-4" aria-hidden />
                {SECONDARY_CTA.label}
              </a>
            </div>
          </div>

          {variant === "panel" && (
            <div className="lg:col-span-5">
              {rightPanel ?? <DefaultSalesPanel />}
            </div>
          )}
        </div>

        <div className="mt-12 max-w-3xl">
          <AnswerBlock question={answerQuestion}>{answer}</AnswerBlock>
        </div>
      </Container>
    </section>
  );
}

/** Default right-side gradient panel — Sales team availability card. */
function DefaultSalesPanel() {
  return (
    <Link
      href="/contact"
      aria-label="Sales team online — available 09:00–21:00 Asia/Dhaka"
      className="group relative block overflow-hidden rounded-panel p-6 text-paper transition hover:-translate-y-0.5"
      style={{
        background: `radial-gradient(60% 80% at 80% 20%, #FF5C00 0%, transparent 60%), radial-gradient(80% 80% at 20% 80%, #2563EB 0%, transparent 60%), linear-gradient(135deg, #14B8A6 0%, #0A0A0A 100%)`,
      }}
    >
      <div className="flex items-center gap-2 text-meta uppercase tracking-wider text-paper/80">
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30"
        />
        Sales team online
      </div>
      <p className="mt-3 text-h3 font-bold leading-tight">Talk to us now.</p>
      <p className="mt-1 text-sm text-paper/80">
        Reply usually under 2 hours on WhatsApp · Sat–Thu, 09:00–21:00 BD.
      </p>
      <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink">
        Let&rsquo;s talk
        <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-brand-orange">
          <ArrowUpRight className="h-2.5 w-2.5 text-paper" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
