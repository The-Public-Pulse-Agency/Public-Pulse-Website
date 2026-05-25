"use client";

// Shared internals for motion components. Not exported from the package
// barrel — internal use only.

import { useEffect, useRef, useState } from "react";

/** rAF-throttled function. Returns a function that schedules its inner
 *  callback on the next animation frame at most once. Safe to call from
 *  high-frequency event handlers (mousemove, scroll). */
export function rafThrottle<T extends unknown[]>(fn: (...args: T) => void) {
  let queued = false;
  let lastArgs: T;
  return (...args: T) => {
    lastArgs = args;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fn(...lastArgs);
    });
  };
}

/** Returns true on the client when prefers-reduced-motion: reduce matches.
 *  SSR returns false so the initial render matches non-reduced. The hook
 *  flips after mount if needed (rare; users don't switch mid-session). */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return reduced;
}

/** Returns true on the client when pointer:coarse matches (touch devices).
 *  CSS already disables several primitives via @media (pointer: coarse),
 *  but components also use this to short-circuit JS listener setup. */
export function usePointerCoarse(): boolean {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(pointer: coarse)");
    setCoarse(mq.matches);
    const handler = () => setCoarse(mq.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return coarse;
}

/** Returns true once `ref.current` enters (or has already entered) a
 *  configurable viewport margin. Used to lazy-init below-fold listeners. */
export function useInView(
  ref: React.RefObject<HTMLElement | null>,
  rootMargin = "0px 0px 200px 0px"
): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
            return;
          }
        }
      },
      { rootMargin, threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

/** Always-stable ref to a React state setter so closures captured in
 *  rAF callbacks see the latest value. */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
