"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Wraps content with a class that animates into view on first scroll-intersect.
//
// SSR contract: the content is always present in the HTML. The opacity:0
// reveal styles in globals.css are gated on `html.reveal-ready`, which is only
// added by the inline bootstrap script in app/layout.tsx. No-JS crawlers and
// rendering crawlers without that script see content visible from the start.
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

    // Already-in-viewport content reveals immediately.
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) {
      el.classList.add("is-visible");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            io.unobserve(el);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
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
