"use client";

import { useEffect, useState } from "react";

// Thin 2px brand-orange bar pinned to the top of the page that grows
// from 0 → 100% as the reader scrolls through the article. Only renders
// when the page is long enough to bother (skips for very short posts).
//
// rAF-throttled, passive scroll listener. Skips when prefers-reduced-motion.

export function ReadingProgress() {
  const [pct, setPct] = useState(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const doc = document.documentElement;
        const total = doc.scrollHeight - window.innerHeight;
        if (total < 300) {
          setEnabled(false);
          return;
        }
        setEnabled(true);
        setPct(Math.min(100, Math.max(0, (window.scrollY / total) * 100)));
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]"
    >
      <div
        className="h-full bg-brand-orange transition-[width] duration-100"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
