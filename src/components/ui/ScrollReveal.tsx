"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Wraps content with a class that animates into view on first scroll-intersect.
//
// SSR contract: the content is always present in the HTML. The opacity:0
// reveal styles in globals.css are gated on `html.reveal-ready`, which is
// added by the inline bootstrap script in app/layout.tsx AND then removed
// after a 2.5s safety timeout so content can never stay invisible.
//
// Defensive layers (any one keeps content visible):
//   1. Initial-render check: if element is anywhere within ~2 viewport
//      heights, mark visible immediately on mount (covers homepage-load
//      flicker, where everything fits roughly in one continuous viewport).
//   2. IntersectionObserver with a wide rootMargin fires on scroll.
//   3. A 1.5s setTimeout per element force-reveals — covers IO failure
//      (rare browser bugs, page hidden during throttling).
//   4. The bootstrap script's 2.5s kill-switch (in app/layout.tsx) removes
//      `html.reveal-ready` entirely as the final fail-safe.
//
// `prefers-reduced-motion: reduce` users get content without animation.

type Props = {
  children: ReactNode;
  className?: string;
  /** Stagger value in milliseconds; useful when revealing a grid of siblings. */
  delayMs?: number;
};

export function ScrollReveal({ children, className = "", delayMs = 0 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // ── Layer 1: immediate reveal for anything within ~2 viewport heights.
    const rect = el.getBoundingClientRect();
    const generousBottom = window.innerHeight * 2;
    if (rect.top < generousBottom && rect.bottom > -window.innerHeight) {
      el.classList.add("is-visible");
      return;
    }

    // ── Layer 3: hard timeout safety net.
    const fallback = window.setTimeout(() => {
      el.classList.add("is-visible");
    }, 1500);

    // ── Layer 2: IntersectionObserver fires on scroll. Wide bottom rootMargin
    //    so reveal triggers ~1 viewport before the element enters the screen.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
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
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
