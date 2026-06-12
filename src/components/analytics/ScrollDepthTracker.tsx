"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

// Mount once per long-form page (blog post, election page, etc.). Fires
// scroll_50pct + scroll_90pct ONCE each per page-load. Doesn't fire if
// the page is too short to have a "50%" (e.g. above-the-fold-only page).

export function ScrollDepthTracker({ surface }: { surface: string }) {
  useEffect(() => {
    const fired = new Set<"50pct" | "90pct">();
    let raf = 0;

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const doc = document.documentElement;
        const total = doc.scrollHeight - window.innerHeight;
        if (total < 400) return; // too short to measure
        const pct = window.scrollY / total;
        if (pct >= 0.5 && !fired.has("50pct")) {
          fired.add("50pct");
          track("scroll_50pct", { surface });
        }
        if (pct >= 0.9 && !fired.has("90pct")) {
          fired.add("90pct");
          track("scroll_90pct", { surface });
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [surface]);

  return null;
}
