"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { rafThrottle, useInView, usePointerCoarse, usePrefersReducedMotion } from "./_internal";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** Scroll multiplier. 0.2 = subtle, 0.5 = pronounced. Negative scrolls
   *  the element opposite to the viewport. Default 0.2. */
  speed?: number;
  /** When true, also tracks mouse position for a small XY parallax. Only
   *  enabled on pointer:fine. Default false. */
  mouse?: boolean;
  /** Mouse parallax strength in px. Default 8. */
  mouseStrength?: number;
};

/** Scroll-driven (and optionally mouse-driven) parallax wrapper. Updates
 *  `transform: translate3d()` via rAF. Lazy-initializes on intersect to
 *  avoid wasting frames on off-screen content. Disabled under reduced
 *  motion (renders children with no transform). */
export function Parallax({
  children,
  speed = 0.2,
  mouse = false,
  mouseStrength = 8,
  className = "",
  style,
  ...rest
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const coarse = usePointerCoarse();
  const inView = useInView(ref, "0px 0px 50% 0px");
  const enabled = !reduced && inView;
  const mouseEnabled = enabled && mouse && !coarse;

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    let mx = 0;
    let my = 0;
    let sy = 0;

    const apply = rafThrottle(() => {
      el.style.transform = `translate3d(${mx.toFixed(2)}px, ${(sy + my).toFixed(2)}px, 0)`;
    });

    const onScroll = rafThrottle(() => {
      const rect = el.getBoundingClientRect();
      // Convert "how far the element is from viewport center" to a px offset.
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      sy = center * speed * -1;
      apply();
    });

    const onMouse = mouseEnabled
      ? rafThrottle((e: MouseEvent) => {
          mx = ((e.clientX / window.innerWidth) - 0.5) * 2 * mouseStrength;
          my = ((e.clientY / window.innerHeight) - 0.5) * 2 * mouseStrength;
          apply();
        })
      : null;

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    if (onMouse) window.addEventListener("mousemove", onMouse, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (onMouse) window.removeEventListener("mousemove", onMouse);
    };
  }, [enabled, mouseEnabled, speed, mouseStrength]);

  return (
    <div ref={ref} className={className} style={style} {...rest}>
      {children}
    </div>
  );
}
