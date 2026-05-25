// Site-wide motion + interaction primitives.
//
// Guardrails (all components honor these — see docs/BRAND.md):
//   • Animate ONLY transform + opacity (composite layer; no layout shift).
//   • Mouse/scroll handlers rAF-throttled, passive.
//   • will-change toggled per interaction, removed after.
//   • Lazy-init below-fold via IntersectionObserver — never block LCP/INP.
//   • prefers-reduced-motion: disable all motion, show final states.
//   • pointer:coarse: disable cursor-follower / magnetic / tilt.
//   • Crawlers / no-JS: html.reveal-ready gate keeps content fully visible.

export { CursorGlow } from "./CursorGlow";
export { MagneticButton } from "./MagneticButton";
export { TiltCard } from "./TiltCard";
export { AuroraGradient } from "./AuroraGradient";
export { GradientText } from "./GradientText";
export { ScrollReveal as ScrollRevealV2 } from "./ScrollReveal";
export { Stagger } from "./Stagger";
export { Parallax } from "./Parallax";
export { ScrollProgress } from "./ScrollProgress";
