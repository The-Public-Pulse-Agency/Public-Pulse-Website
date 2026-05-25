"use client";

// Slim dismissible sticky bar at the bottom of the viewport. Desktop-only
// by default (mobile=false) — Google penalizes mobile intrusive
// interstitials, and the inline blocks already cover mobile capture.
//
// Zero-CLS: fixed position with `bottom: 0`, never reflows page content.
// Suppressed on /manage, /contact, /confirm, /unsubscribe, and once the
// user has subscribed or dismissed.

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";

import { dismissContext, isSuppressed } from "./state";
import { CaptureForm } from "./CaptureForm";
import { getCopy, type Locale } from "./copy";

const CONTEXT = "sitewide";
const HIDDEN_PATH_PREFIXES = [
  "/manage",
  "/contact",
  "/confirm",
  "/unsubscribe",
  "/api",
];

export function StickyBar({ locale = "en", delayMs = 4000 }: { locale?: Locale; delayMs?: number }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  // Path-based suppression must run sync — checks for /manage etc. before
  // even setting up the timer.
  const pathSuppressed = HIDDEN_PATH_PREFIXES.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (pathSuppressed) return;
    // pointer:coarse → skip (mobile)
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;
    if (isSuppressed(CONTEXT)) return;

    const t = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(t);
  }, [pathSuppressed, delayMs]);

  if (!visible || pathSuppressed) return null;

  const t = getCopy(CONTEXT, locale);

  const dismiss = () => {
    dismissContext(CONTEXT);
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Newsletter signup"
      className="fixed inset-x-0 bottom-0 z-40 hidden md:block"
    >
      <div className="border-t border-ink/10 bg-ink text-paper shadow-2xl">
        <div className="max-w-container mx-auto flex items-center gap-6 px-6 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-orange">
              {t.eyebrow}
            </p>
            <p className="mt-0.5 truncate text-[15px] font-semibold text-paper">
              {t.title}
            </p>
          </div>
          <div className="flex-1 max-w-[420px]">
            <CaptureForm
              context={CONTEXT}
              locale={locale}
              page={pathname ?? undefined}
              variant="dark"
              hideChannelTabs
            />
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t.dismiss}
            className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
