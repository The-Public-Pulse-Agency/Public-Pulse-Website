import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // ── Avoora-faithful palette (verified against avoora.webflow.io) ──
        // Ink: #111 (avoora exact). Was #0A0A0A — slightly too dark.
        // Brand orange: #FF5911 (avoora exact). Was #FF5C00 — close but not identical.
        // Body text: flat #5D5D5D (avoora exact). Use via `text-mute` token.
        // Dark grey: #4C4C4C — avoora's NEUTRAL primary-button colour.
        "ink": "#111111",
        "ink-soft": "#222222",
        "ink-mute": "#5D5D5D",
        "paper": "#FFFFFF",
        "paper-alt": "#F5F5F5",
        "paper-tint": "#E3E3E3",
        "graphite": "#4C4C4C",
        "brand-orange": "#FF5911",
        "brand-orange-soft": "#FF7A3D",
        "brand-orange-deep": "#E84A00",
        // Legacy aliases (kept so any unmigrated markup still compiles).
        // They point at the new tokens so the visual stays correct.
        "brand-navy": "#111111",
        "brand-navy-soft": "#222222",
        "brand-teal": "#FF5911",
        "brand-teal-soft": "#FF7A3D",
        "brand-teal-deep": "#E84A00",
        "brand-teal-tint": "#FFE6D6",
        "brand-red": "#FF5911",
        "surface-alt": "#F5F5F5",
        "surface-tint": "#E3E3E3",
        whatsapp: "#25D366",
        // Category palette retained for service-card top borders only
        "cat-red": "#D32F2F",
        "cat-blue": "#1565C0",
        "cat-purple": "#6A1B9A",
        "cat-teal": "#0D9488",
        "cat-green": "#2E7D32",
        "cat-orange": "#FF5C00",
        "cat-navy": "#0A0A0A",
        "cat-brown": "#795548",
        "cat-magenta": "#AD1457",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "system-ui", "sans-serif"],
        // serif aliased to sans so legacy markup compiles
        serif: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Avoora-faithful: editorial weight (500/600), VERY tight tracking.
        // Avoora's H1 sits at 129.6px / weight 500 / letter-spacing -8px.
        // Their H2 sits at 60px / weight 600 / letter-spacing -4px.
        // Each token carries its OWN font-weight default so callers don't
        // need to remember `font-medium` / `font-semibold` — and overrides
        // (`font-extrabold` etc.) still win when explicitly applied.
        mega: ["clamp(3.5rem, 7vw + 1rem, 8.5rem)", { lineHeight: "0.92", letterSpacing: "-0.06em", fontWeight: "500" }],
        display: ["clamp(2.75rem, 5vw + 1rem, 6.5rem)", { lineHeight: "0.98", letterSpacing: "-0.055em", fontWeight: "500" }],
        h1: ["clamp(2.25rem, 3vw + 1rem, 4.25rem)", { lineHeight: "1.04", letterSpacing: "-0.045em", fontWeight: "500" }],
        h2: ["clamp(1.875rem, 2vw + 1rem, 3rem)", { lineHeight: "1.08", letterSpacing: "-0.04em", fontWeight: "600" }],
        h3: ["clamp(1.25rem, 0.75vw + 1rem, 1.625rem)", { lineHeight: "1.22", letterSpacing: "-0.02em", fontWeight: "600" }],
        eyebrow: ["0.75rem", { lineHeight: "1.2", letterSpacing: "0.12em" }],
        lead: ["clamp(1.0625rem, 0.25vw + 1rem, 1.25rem)", { lineHeight: "1.55" }],
        body: ["1rem", { lineHeight: "1.6" }],
        meta: ["0.8125rem", { lineHeight: "1.4", letterSpacing: "0.04em" }],
        "display-number": [
          "clamp(3rem, 4vw + 2rem, 6rem)",
          { lineHeight: "1", letterSpacing: "-0.04em" },
        ],
      },
      maxWidth: {
        container: "1280px",
        prose: "65ch",
      },
      borderRadius: {
        // Avoora-faithful: small 6px radius on buttons (was pill 9999px).
        // Pills feel SaaS-y; the small rectangle feels editorial.
        // Card stays 8px, panel 12px (close enough to avoora's quietly rounded forms).
        btn: "6px",
        card: "8px",
        panel: "12px",
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        "marquee-slow": "marquee 80s linear infinite",
        "float": "float 8s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "gradient-drift": "gradient-drift 20s ease infinite",
        "icon-spin-slow": "spin 10s linear infinite",
        "rise": "rise 0.7s cubic-bezier(.16,1,.3,1) both",
        "fade-up": "fade-up 0.5s ease-out both",
        "shimmer": "shimmer 2s linear infinite",
        "tilt": "tilt 6s ease-in-out infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.7", filter: "saturate(1)" },
          "50%": { opacity: "1", filter: "saturate(1.25)" },
        },
        "gradient-drift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        tilt: {
          "0%, 100%": { transform: "rotate(-1deg)" },
          "50%": { transform: "rotate(1deg)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
