import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "soft" | "bright";
};

/** Animated mesh/aurora background — pure CSS (no JS, no JS bundle cost).
 *  Drop inside a `position: relative` parent. Sits at z-index:0 so
 *  positioned siblings render on top. Drifts via conic + radial gradient
 *  with rotate + translate keyframes (transform-only animation).
 *
 *  Use sparingly — one per page (typically the hero). Each instance has
 *  two blurred pseudo-elements; multiple stacked instances will tax GPU.
 *
 *  Disabled under prefers-reduced-motion via globals.css. */
export function AuroraGradient({ variant = "default", className = "", ...rest }: Props) {
  const v = variant === "soft" ? "aurora--soft" : variant === "bright" ? "aurora--bright" : "";
  return <div className={`aurora ${v} ${className}`} aria-hidden="true" {...rest} />;
}
