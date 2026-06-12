"use client";

// Client-side analytics event helper. Centralizes event names + payload
// shapes so we can change vendors (GA4 → Plausible, etc.) without touching
// callsites.
//
// Events fire to:
//   - GA4 (via window.gtag) — only if consent has been granted
//   - Meta Pixel (via window.fbq) — only if consent has been granted
//   - dataLayer (always) — so GTM tags can react
//
// Consent is honored: the CookieConsent component gates the underlying
// scripts. If consent isn't granted, gtag/fbq are undefined and we no-op.

type EventName =
  | "cta_click"            // any primary CTA click (book, contact, brief)
  | "form_started"         // first input focus on a form
  | "form_submitted"       // server confirmed receipt
  | "form_error"           // server returned validation/rate-limit error
  | "scroll_50pct"         // reader hit 50% scroll on a long-form page
  | "scroll_90pct"         // reader almost finished the page
  | "booking_started"      // clicked through to /book or Cal.com
  | "search_used"          // submitted a search query
  | "newsletter_signup"    // submitted email to capture form
  | "outbound_click"       // clicked an external link
  | "video_played"         // video element first play
  | "service_matcher_completed"
  | "audit_tool_completed";

type EventProps = {
  /** Free-text label — distinguishes variants (e.g. "header", "blog-end"). */
  label?: string;
  /** Which surface fired this (page path or component name). */
  surface?: string;
  /** Optional monetary value, e.g. for a booking. */
  value?: number;
  /** Free-form additional context — flattened into GA params. */
  [k: string]: string | number | boolean | null | undefined;
};

// Window typings (gtag, fbq, dataLayer) are declared in
// src/components/analytics/CookieConsent.tsx — re-declaring here would
// cause TS2717 (subsequent property declarations must match).

export function track(name: EventName, props: EventProps = {}): void {
  if (typeof window === "undefined") return;

  // GA4 — gtag is only defined if user consented + script loaded.
  if (typeof window.gtag === "function") {
    window.gtag("event", name, props);
  }

  // Meta Pixel — map a few standard events to Meta's catalog.
  if (typeof window.fbq === "function") {
    if (name === "form_submitted" || name === "newsletter_signup") {
      window.fbq("track", "Lead", { content_name: props.label ?? name });
    } else if (name === "booking_started") {
      window.fbq("track", "Schedule", { content_name: props.label ?? "Cal.com" });
    } else if (name === "search_used") {
      window.fbq("track", "Search", { search_string: props.label ?? "" });
    } else {
      window.fbq("trackCustom", name, props);
    }
  }

  // dataLayer — always push (cheap, no consent needed for client-side
  // dataLayer events; GTM tags inside the container honor consent mode).
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...props });
}

// Helpers for common patterns ─────────────────────────────────────────

/** Wire a click handler that fires a CTA event then calls onClick. */
export function ctaClick(label: string, onClick?: () => void) {
  return (e?: { preventDefault?: () => void }) => {
    track("cta_click", { label, surface: typeof window !== "undefined" ? window.location.pathname : undefined });
    onClick?.();
    void e;
  };
}

/** Scroll-depth tracker — mount once per long-form page. */
export function useScrollDepth(surface: string): void {
  if (typeof window === "undefined") return;
  // Implementation is a hook variant — see ScrollDepthTracker component.
  void surface;
}
