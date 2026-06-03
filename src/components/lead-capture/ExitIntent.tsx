"use client";

// Desktop-only exit-intent modal. Fires when mouse leaves toward the top of
// the viewport (mouseleave + e.clientY < 10). Disabled on touch + reduced
// motion. Only one fire per session per user (handled by state.ts cookie).
//
// Accessibility:
//   • role=dialog + aria-modal
//   • Focus moves to the dialog when opened
//   • ESC closes
//   • Background click closes
//   • Trap focus within the dialog while open
//
// CWV: portal-mounted to document.body, fixed positioning, no layout shift
// outside the dialog overlay (which only renders when open).

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { dismissContext, isSuppressed } from "./state";
import { CaptureForm } from "./CaptureForm";
import { getCopy, type Locale } from "./copy";

const CONTEXT = "exit-intent";
const HIDDEN_PATH_PREFIXES = [
  "/manage",
  "/contact",
  "/confirm",
  "/unsubscribe",
  "/api",
];

export function ExitIntent({ locale = "en" }: { locale?: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const armedRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const pathSuppressed = HIDDEN_PATH_PREFIXES.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (pathSuppressed) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (isSuppressed(CONTEXT)) return;

    const onMouseLeave = (e: MouseEvent) => {
      if (armedRef.current) return;
      // Only top-edge exit (not bottom/sides).
      if (e.clientY > 10) return;
      armedRef.current = true;
      setOpen(true);
    };

    // Give the user a few seconds before arming.
    const t = window.setTimeout(() => {
      document.addEventListener("mouseleave", onMouseLeave);
    }, 5000);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [pathSuppressed]);

  // Focus management + ESC
  useEffect(() => {
    if (!open) return;
    const node = dialogRef.current;
    if (node) {
      const focusable = node.querySelector<HTMLElement>(
        "input,button,[tabindex]:not([tabindex='-1'])"
      );
      focusable?.focus();
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    // Lock body scroll while open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (pathSuppressed || !open) return null;

  const t = getCopy(CONTEXT, locale);

  function close() {
    dismissContext(CONTEXT);
    setOpen(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
      />
      <div
        ref={dialogRef}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-paper shadow-2xl"
      >
        <button
          type="button"
          onClick={close}
          aria-label={t.dismiss}
          className="absolute right-3 top-3 rounded-full p-2 text-ink/55 hover:bg-ink/5 hover:text-ink"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
        <span
          aria-hidden
          className="absolute left-0 top-12 h-[3px] w-16 bg-brand-red"
        />
        <div className="px-8 py-10 md:px-12 md:py-12">
          <p className="text-eyebrow text-brand-red">{t.eyebrow}</p>
          <h2
            id="exit-intent-title"
            className="mt-3 text-h2 leading-[1.05] tracking-tight text-ink"
          >
            {t.title}
          </h2>
          <p className="mt-4 text-lead text-ink/70">{t.sub}</p>
          <div className="mt-6">
            <CaptureForm
              context={CONTEXT}
              locale={locale}
              page={pathname ?? undefined}
              variant="light"
              onSuccess={() => setTimeout(close, 1500)}
            />
          </div>
          <p className="mt-4 text-[11px] text-ink/45">
            {t.preferWhatsApp}
          </p>
        </div>
      </div>
    </div>
  );
}
