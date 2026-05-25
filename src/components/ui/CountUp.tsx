"use client";

import { useEffect, useRef, useState } from "react";

// Scroll-triggered count-up. Renders the final value as the SSR HTML so
// crawlers + non-JS users see the real number; JS replaces it with an
// animated 0 → value tween when the element enters the viewport once.
//
// Parses leading "+" / trailing "+" / trailing "%" / "k" / "M" suffixes so
// the visible string preserves the human formatting ("300%+", "10+", "50+").

type Props = {
  /** e.g. "300%+", "50+", "10+", "9" */
  value: string;
  /** Duration of the tween in ms. */
  duration?: number;
  className?: string;
};

function parseValue(raw: string): { num: number; prefix: string; suffix: string } | null {
  const m = raw.match(/^(\D*)([\d.]+)(\D*)$/);
  if (!m) return null;
  const num = Number(m[2]);
  if (Number.isNaN(num)) return null;
  return { prefix: m[1] ?? "", num, suffix: m[3] ?? "" };
}

export function CountUp({ value, duration = 1100, className = "" }: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState<string>(value);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || startedRef.current) return;
    const parsed = parseValue(value);
    if (!parsed) return; // non-numeric values stay literal

    const respectMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (respectMotion) return;

    const run = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const start = performance.now();
      const fmt = (n: number) =>
        `${parsed.prefix}${
          Number.isInteger(parsed.num)
            ? Math.round(n).toLocaleString("en-US")
            : n.toFixed(parsed.num % 1 === 0 ? 0 : 1)
        }${parsed.suffix}`;

      setDisplay(fmt(0));

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        // ease-out cubic for a satisfying decel
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(fmt(parsed.num * eased));
        if (t < 1) requestAnimationFrame(tick);
        else setDisplay(value); // final formatted form
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) run();
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
