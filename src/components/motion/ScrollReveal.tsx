"use client";

import { useEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { usePrefersReducedMotion } from "./_internal";

type Direction = "up" | "down" | "left" | "right";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** Default "up" (content slides up into view). */
  from?: Direction;
  /** Distance traveled in px. Default 24. */
  distance?: number;
  /** Delay in ms (for manual staggering — for grids use <Stagger>). */
  delayMs?: number;
};

const AXIS: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
};

/** Directional scroll-reveal. CSS handles the transition; this hook
 *  toggles `.is-visible` on intersect (with a hard 1.5s timeout safety
 *  net so content can never get stuck invisible).
 *
 *  Composes ONLY transform + opacity (no layout). Under reduced-motion,
 *  fires `is-visible` immediately so users see the final state.
 *
 *  v2 vs the original ScrollReveal: adds direction + uses CSS custom
 *  props for distance so multiple instances on a page share a single
 *  CSS rule. */
export function ScrollReveal({
  children,
  from = "up",
  distance = 24,
  delayMs = 0,
  className = "",
  style,
  ...rest
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      el.classList.add("is-visible");
      return;
    }

    // Immediate reveal if already near the viewport (covers above-the-fold
    // content + the homepage where everything fits in ~1 viewport).
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 1.5 && rect.bottom > -window.innerHeight * 0.5) {
      el.classList.add("is-visible");
      return;
    }

    // Hard timeout — if IO never fires, force-reveal at 1.5s.
    const fallback = window.setTimeout(() => {
      el.classList.add("is-visible");
    }, 1500);

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-visible");
            io.unobserve(el);
            window.clearTimeout(fallback);
          }
        }
      },
      { rootMargin: "0px 0px 100% 0px", threshold: 0 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, [reduced]);

  const axis = AXIS[from];
  const inlineStyle: CSSProperties = {
    ...style,
    ["--rv-x" as string]: `${axis.x * distance}px`,
    ["--rv-y" as string]: `${axis.y * distance}px`,
    ["--rv-delay" as string]: `${delayMs}ms`,
  };

  return (
    <div ref={ref} className={`reveal-v2 ${className}`} style={inlineStyle} {...rest}>
      {children}
    </div>
  );
}
