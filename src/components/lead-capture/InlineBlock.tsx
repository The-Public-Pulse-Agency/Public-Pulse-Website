// Inline value-led block — drops anywhere in a server-rendered page. The
// only client-island is <CaptureForm/> inside. Default white-on-paper-alt
// with a red accent rule + optional dark variant for navy sections.

import type { CaptureContext, Locale } from "./copy";
import { getCopy } from "./copy";
import { CaptureForm } from "./CaptureForm";

export function InlineBlock({
  context,
  locale = "en",
  page,
  variant = "light",
  align = "left",
}: {
  context: CaptureContext;
  locale?: Locale;
  page?: string;
  variant?: "light" | "dark";
  align?: "left" | "center";
}) {
  const t = getCopy(context, locale);
  const dark = variant === "dark";
  const surface = dark
    ? "bg-ink text-paper"
    : "bg-paper-alt text-ink";
  const sub = dark ? "text-white/75" : "text-ink/70";

  return (
    <aside
      className={`relative overflow-hidden rounded-3xl ${surface} px-6 py-10 md:px-12 md:py-14`}
      aria-label={t.title}
    >
      {/* Red accent stripe — brand motif */}
      <span
        aria-hidden
        className="absolute left-0 top-8 h-[3px] w-16 bg-brand-red"
      />
      <div className={`mx-auto max-w-2xl ${align === "center" ? "text-center" : ""}`}>
        {t.eyebrow && (
          <p className={`text-eyebrow ${dark ? "text-brand-red" : "text-brand-red"}`}>
            {t.eyebrow}
          </p>
        )}
        <h2 className="mt-3 text-h2 font-extrabold leading-[1.06] tracking-tight">
          {t.title}
        </h2>
        <p className={`mt-4 text-lead ${sub}`}>{t.sub}</p>
        <div className={`mt-6 ${align === "center" ? "mx-auto max-w-lg" : ""}`}>
          <CaptureForm
            context={context}
            locale={locale}
            page={page}
            variant={variant}
          />
        </div>
      </div>
    </aside>
  );
}
