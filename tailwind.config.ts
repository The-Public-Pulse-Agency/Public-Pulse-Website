import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // ── Avoora-inspired palette: B&W base + saturated orange accent ──
        "ink": "#0A0A0A",
        "ink-soft": "#1A1A1A",
        "paper": "#FFFFFF",
        "paper-alt": "#F5F5F5",
        "paper-tint": "#EDEDED",
        "brand-orange": "#FF5C00",
        "brand-orange-soft": "#FF7A2E",
        "brand-orange-deep": "#E04E00",
        // Legacy aliases (keep so any unmigrated markup still compiles)
        "brand-navy": "#0A0A0A",
        "brand-navy-soft": "#1A1A1A",
        "brand-teal": "#FF5C00",
        "brand-teal-soft": "#FF7A2E",
        "brand-teal-deep": "#E04E00",
        "brand-teal-tint": "#FFE6D6",
        "brand-red": "#FF5C00",
        "surface-alt": "#F5F5F5",
        "surface-tint": "#EDEDED",
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
        // Avoora-tuned: big bold headlines with tight tracking
        mega: ["clamp(3.25rem, 6vw + 1rem, 7.5rem)", { lineHeight: "0.95", letterSpacing: "-0.04em" }],
        display: ["clamp(2.5rem, 4vw + 1rem, 5.5rem)", { lineHeight: "1.02", letterSpacing: "-0.035em" }],
        h1: ["clamp(2rem, 2.5vw + 1rem, 3.75rem)", { lineHeight: "1.08", letterSpacing: "-0.025em" }],
        h2: ["clamp(1.75rem, 1.5vw + 1rem, 2.75rem)", { lineHeight: "1.12", letterSpacing: "-0.02em" }],
        h3: ["clamp(1.125rem, 0.5vw + 1rem, 1.5rem)", { lineHeight: "1.25", letterSpacing: "-0.01em" }],
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
        btn: "9999px",
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
