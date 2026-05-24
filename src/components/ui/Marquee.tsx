import type { ReactNode } from "react";

// Continuous-loop marquee. Items repeat twice in the DOM so the CSS
// `translateX(-50%)` keyframe creates a seamless infinite loop.
// Pause on hover so users can read what's there.

type MarqueeProps = {
  children: ReactNode;
  /** Visual gap between items inside one half of the loop. */
  gapClass?: string;
  /** Override the default 40s loop duration. */
  durationSec?: number;
  className?: string;
};

export function Marquee({
  children,
  gapClass = "gap-12",
  durationSec,
  className = "",
}: MarqueeProps) {
  const style = durationSec ? { animationDuration: `${durationSec}s` } : undefined;
  return (
    <div className={`group overflow-hidden ${className}`} aria-hidden="true">
      <div
        className={`marquee-track ${gapClass} pr-[var(--mq-gap,3rem)] group-hover:[animation-play-state:paused]`}
        style={style}
      >
        <div className={`flex shrink-0 items-center ${gapClass}`}>{children}</div>
        <div className={`flex shrink-0 items-center ${gapClass}`}>{children}</div>
      </div>
    </div>
  );
}
