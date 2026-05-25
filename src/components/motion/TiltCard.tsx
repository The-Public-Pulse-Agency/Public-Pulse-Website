"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { rafThrottle, useInView, usePointerCoarse, usePrefersReducedMotion } from "./_internal";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** Max rotation in degrees (default 6). Larger = circus. */
  maxTilt?: number;
  /** Perspective in px (default 1000). Smaller = more extreme. */
  perspective?: number;
};

/** 3D tilt + sheen sweep on hover. CSS handles the sheen pseudo-element
 *  (animation-free fade-in on hover). JS handles the 3D rotation.
 *
 *  Wrap any block-level content. Card retains its existing styles —
 *  this adds rotation on top via transform. will-change is hoisted on
 *  hover, dropped on leave. Disabled on touch / reduced-motion. */
export function TiltCard({
  children,
  className = "",
  maxTilt = 6,
  perspective = 1000,
  ...rest
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const coarse = usePointerCoarse();
  const inView = useInView(ref);
  const enabled = !reduced && !coarse && inView;

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const onMove = rafThrottle((e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0..1
      const py = (e.clientY - rect.top) / rect.height; // 0..1
      const rx = (py - 0.5) * -2 * maxTilt;
      const ry = (px - 0.5) * 2 * maxTilt;
      el.style.transform = `perspective(${perspective}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    });
    const onEnter = () => {
      el.style.willChange = "transform";
    };
    const onLeave = () => {
      el.style.transform = "";
      el.style.willChange = "";
    };
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      onLeave();
    };
  }, [enabled, maxTilt, perspective]);

  return (
    <div ref={ref} className={`tilt-card ${className}`} {...rest}>
      {children}
    </div>
  );
}
