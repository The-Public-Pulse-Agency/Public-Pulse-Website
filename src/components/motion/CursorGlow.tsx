"use client";

import { useEffect, useRef } from "react";
import { rafThrottle, usePointerCoarse, usePrefersReducedMotion } from "./_internal";

type Props = {
  /** Disable inside touch contexts (auto on pointer:coarse anyway). */
  scope?: "page" | "section";
};

/** A brand-gradient spotlight that trails the cursor. Page-level mounts
 *  once near the root; pass scope="section" to scope the glow to a parent
 *  (the JS still listens window-wide but the CSS is hidden outside the
 *  parent via `display:none` on small screens / parent-less mounts).
 *
 *  CSS classes used: `.cursor-glow` (positioning + gradient).
 *  CSS variables written by JS: --cx (px), --cy (px). */
export function CursorGlow({ scope = "page" }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const coarse = usePointerCoarse();
  const enabled = !reduced && !coarse;

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    let active = false;
    const onMove = rafThrottle((e: MouseEvent) => {
      el.style.setProperty("--cx", `${e.clientX}px`);
      el.style.setProperty("--cy", `${e.clientY}px`);
      if (!active) {
        active = true;
        el.classList.add("is-active");
      }
    });
    const onLeave = () => {
      active = false;
      el.classList.remove("is-active");
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled]);

  // Render nothing under reduced-motion / coarse pointer (CSS hides too,
  // but this also skips the DOM node).
  if (!enabled) return null;

  return <div ref={ref} className="cursor-glow" aria-hidden="true" data-scope={scope} />;
}
