"use client";

import { useCallback, useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { SITE } from "@/lib/site";

// Cookie consent + consent-gated tracking.
//
// Why this exists:
//   GTM (GTM-TNK2J29K), GA4 (G-WVF3TSEL3Q) and Meta Pixel (938966755334049)
//   set first-party cookies + share data with Google/Meta. EU GDPR / ePrivacy
//   + emerging Bangladesh privacy frameworks require informed consent for
//   non-essential cookies before they're set.
//
// Strategy:
//   • Banner appears once per browser (suppressed via localStorage).
//   • Accept / Reject both persist a decision. Banner never re-asks unless
//     localStorage is cleared.
//   • Scripts only load when consent === 'granted'. Default state is "no
//     tracking" until the user explicitly accepts.
//   • Decision is also broadcast via gtag('consent','update',...) so GTM
//     downstream tags can respect Consent Mode v2 if used.
//   • Reduced-motion + keyboard-friendly + dismissible.
//
// Note: TrackingNoscript was removed from layout — visitors with JS disabled
// can't see/dismiss the banner so we can't lawfully fire <noscript> pixels.

const STORAGE_KEY = "pp_cookie_consent";
type ConsentState = "granted" | "denied" | "pending";

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown };
    _fbq?: unknown;
    gtag?: (...args: unknown[]) => void;
  }
}

function readStored(): ConsentState {
  if (typeof window === "undefined") return "pending";
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "granted" || v === "denied") return v;
  } catch {
    /* localStorage unavailable */
  }
  return "pending";
}

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState>("pending");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConsent(readStored());
  }, []);

  const decide = useCallback((value: "granted" | "denied") => {
    setConsent(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* localStorage unavailable */
    }
    // Broadcast to GTM Consent Mode v2 even if scripts haven't loaded yet —
    // the dataLayer queue picks it up when GTM bootstraps.
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "consent_update",
        ad_storage: value === "granted" ? "granted" : "denied",
        analytics_storage: value === "granted" ? "granted" : "denied",
        ad_user_data: value === "granted" ? "granted" : "denied",
        ad_personalization: value === "granted" ? "granted" : "denied",
      });
    }
  }, []);

  // SSR: render nothing (banner is hydration-only).
  if (!mounted) return null;

  const { gtm, ga4, metaPixel } = SITE.tracking;

  return (
    <>
      {/* Tracking scripts — only injected once consent is explicitly granted */}
      {consent === "granted" && (
        <>
          <Script id="gtm" strategy="afterInteractive">{`
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');
          `}</Script>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">{`
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}');
          `}</Script>
          <Script id="meta-pixel" strategy="afterInteractive">{`
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixel}');fbq('track','PageView');
          `}</Script>
        </>
      )}

      {/* Banner — only when no decision has been made */}
      {consent === "pending" && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          aria-describedby="cookie-consent-text"
          className="fixed inset-x-0 bottom-0 z-[55] border-t border-ink/15 bg-paper px-5 py-5 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.15)] md:px-8 md:py-6"
        >
          <div className="max-w-container mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
            <div className="flex flex-1 items-start gap-3">
              <span
                aria-hidden
                className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-brand-orange/10 text-brand-orange"
              >
                <Cookie className="h-4 w-4" />
              </span>
              <p id="cookie-consent-text" className="text-sm text-ink/80">
                We use cookies for analytics + ad performance (Google Analytics,
                Meta Pixel). They&rsquo;re off until you decide.{" "}
                <Link href="/privacy" className="font-semibold text-brand-orange hover:underline">
                  Privacy policy
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => decide("denied")}
                className="rounded-full border border-ink/20 px-5 py-2 text-sm font-semibold text-ink hover:border-ink hover:bg-ink hover:text-paper"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => decide("granted")}
                className="rounded-full bg-brand-orange px-5 py-2 text-sm font-semibold text-paper hover:bg-brand-orange-deep"
                autoFocus
              >
                Accept all
              </button>
              <button
                type="button"
                aria-label="Dismiss without choosing"
                onClick={() => decide("denied")}
                className="grid h-9 w-9 place-items-center rounded-full text-ink/55 hover:bg-ink/5 hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
