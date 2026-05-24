import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // ── SaaS palette (sister-product parity with tenderpulse) ──
        "brand-navy": "#0F1B3D",
        "brand-navy-soft": "#1A2A52",
        "brand-teal": "#0D9488", // primary accent (Tailwind teal-600)
        "brand-teal-soft": "#14B8A6", // hover (teal-500)
        "brand-teal-deep": "#0F766E", // pressed (teal-700)
        "brand-teal-tint": "#CCFBF1", // tag bg (teal-100)
        // Brand red retained as a SECONDARY accent for legacy reasons
        // (favicon, brand wordmark colour). Don't use on CTAs.
        "brand-red": "#D32F2F",
        // Neutrals
        "surface-alt": "#F8FAFC", // section alternate (slate-50)
        "surface-tint": "#F1F5F9", // pill / chip bg (slate-100)
        whatsapp: "#25D366",
        // Category palette — kept for service-card top borders only
        "cat-red": "#D32F2F",
        "cat-blue": "#1565C0",
        "cat-purple": "#6A1B9A",
        "cat-teal": "#0D9488",
        "cat-green": "#2E7D32",
        "cat-orange": "#EF6C00",
        "cat-navy": "#0F1B3D",
        "cat-brown": "#795548",
        "cat-magenta": "#AD1457",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        // `font-serif` is intentionally an alias to sans now — any legacy
        // `font-serif` markup keeps working without re-introducing a serif.
        serif: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // SaaS-tuned: less dramatic clamps, tighter line-heights for product-style copy.
        display: ["clamp(2.25rem, 3.5vw + 1rem, 4rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        h1: ["clamp(2rem, 2.5vw + 1rem, 3.25rem)", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        h2: ["clamp(1.625rem, 1.5vw + 1rem, 2.25rem)", { lineHeight: "1.2", letterSpacing: "-0.015em" }],
        h3: ["clamp(1.125rem, 0.5vw + 1rem, 1.375rem)", { lineHeight: "1.3", letterSpacing: "-0.005em" }],
        eyebrow: ["0.75rem", { lineHeight: "1.2", letterSpacing: "0.12em" }],
        lead: ["clamp(1.0625rem, 0.25vw + 1rem, 1.25rem)", { lineHeight: "1.55" }],
        body: ["1rem", { lineHeight: "1.6" }],
        meta: ["0.8125rem", { lineHeight: "1.4", letterSpacing: "0.01em" }],
        "display-number": [
          "clamp(2.25rem, 2vw + 1.25rem, 3.25rem)",
          { lineHeight: "1", letterSpacing: "-0.02em" },
        ],
      },
      maxWidth: {
        container: "1200px",
        prose: "65ch",
      },
      borderRadius: {
        // SaaS radii: button 8, card 12, panel 16
        btn: "8px",
        card: "12px",
        panel: "16px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 27, 61, 0.04), 0 1px 3px rgba(15, 27, 61, 0.06)",
        "card-hover": "0 10px 25px -10px rgba(15, 27, 61, 0.18)",
        ring: "0 0 0 1px rgba(15, 27, 61, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
