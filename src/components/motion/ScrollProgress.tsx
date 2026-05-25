"use client";

import { useEffect } from "react";
import { rafThrottle, usePrefersReducedMotion } from "./_internal";

/** Top-of-page progress bar that tracks document scroll. CSS handles the
 *  gradient + positioning; this hook just writes scaleX via CSS custom prop
 *  on the .scroll-progress element. Single passive scroll listener,
 *  rAF-throttled. Mounts hidden under reduced-motion. */
export function ScrollProgress() {
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const el = document.querySelector<HTMLElement>(".scroll-progress");
    if (!el) return;
    const update = rafThrottle(() => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const p = docHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / docHeight)) : 0;
      el.style.transform = `scaleX(${p})`;
    });
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [reduced]);

  // Rendered always so reduced-motion users still get the structure (bar
  // just stays at scaleX(0) — invisible 2px stripe).
  return <div className="scroll-progress" aria-hidden="true" />;
}
