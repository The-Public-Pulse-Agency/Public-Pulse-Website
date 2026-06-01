import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Phase 6: send AVIF first, then WebP; let Next pick PNG/JPEG fallback. Tuned
  // device + image sizes for the avoora hero gradient + service-tile thumbnails.
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [375, 640, 768, 1024, 1280, 1440, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    // Allow next/image to source from the same-origin /og dynamic factory
    // (used by the per-post blog hero when no static heroImageUrl is set).
    // Next 16 rejects query-string srcs without an explicit localPattern.
    localPatterns: [{ pathname: "/og", search: "" }],
  },
  typedRoutes: true,
  // Phase 6: opportunistic perf — modularize heavy lucide-react imports so each
  // page bundles only the icons it uses (rather than the full barrel).
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  // 301 redirects — migrate old WordPress URLs to their modern equivalent.
  // URLs WITHOUT a modern equivalent are handled by middleware.ts (410 Gone).
  // Trailing slash, capital-S /Service, and similar variations all caught.
  async redirects() {
    return [
      // ── Contact ─────────────────────────────────────────────────────
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/contact-us/", destination: "/contact", permanent: true },

      // ── Services index ──────────────────────────────────────────────
      { source: "/our-services", destination: "/services", permanent: true },
      { source: "/our-services/", destination: "/services", permanent: true },
      { source: "/services/", destination: "/services", permanent: true },

      // ── About / team (old WP used /our-team, /teams, /our-team/) ───
      { source: "/our-team", destination: "/about", permanent: true },
      { source: "/our-team/", destination: "/about", permanent: true },
      { source: "/teams", destination: "/about", permanent: true },
      { source: "/teams/", destination: "/about", permanent: true },

      // ── Inbound URLs we don't have a post at yet — redirect to the
      //    closest published guide so the visitor doesn't 404. ──────
      {
        source: "/blog/facebook-ads-guide-bangladesh",
        destination: "/blog/paid-ads-dhaka-buyer-signals-channels-budget",
        permanent: true,
      },
      {
        // Google-indexed ghost (srsltid referral); no such post exists.
        // Closest match is the content-production pricing guide which
        // covers production scope including video. Kept generic to also
        // catch any future "video-tips" variant inbound link rot.
        source: "/blog/content-production-video-tips",
        destination: "/blog/content-production-pricing-bangladesh",
        permanent: true,
      },

      // ── BN locale retired — site is English-only.
      //    301 every /bn/* path to its English equivalent. Catches
      //    /bn (bare) AND /bn/<any-path>. Includes legacy crawled URLs
      //    like /bn/blog/<slug> (the route never existed but Google
      //    saw them via sitemap hreflang in the old version). ───────
      { source: "/bn", destination: "/", permanent: true },
      { source: "/bn/", destination: "/", permanent: true },
      { source: "/bn/:path*", destination: "/:path*", permanent: true },

      // ── Blog (old WP single posts → blog index; specific slugs
      //         won't have a match in the DB so just go to /blog) ─────
      // /how-businesses-can-leverage-data-for-smarter-decisions/ etc.
      // → handled by middleware 410 (those exact URLs in GONE_EXACT)

      // ── Lost-password / cart → manage sign-in or contact ───────────
      // → handled by middleware 410 (signup is admin-only)
    ];
  },

  // Security + privacy headers, applied to every response.
  // SEO audits (Semrush, SiteCheckup, The Hoth, Seobility) flagged the
  // absence of HSTS + CSP; this closes those + adds standard defense-in-
  // depth headers most modern sites set.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Force HTTPS for 2 years across all subdomains. Once a browser
          // has seen this, it auto-rewrites http://publicpulse.com.bd → https
          // even before contacting the server. Preload-ready.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Prevent MIME-sniffing — browsers must honour the Content-Type.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Don't leak the referrer URL when navigating to other origins.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Block disused browser features by default. Allowlist nothing.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Restrict who can frame us. We don't embed in iframes anywhere.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Content Security Policy. Loose enough to keep GTM / GA4 / Meta
          // Pixel / Bing webmaster / FB Messenger embed all working. Tighter
          // policies break the existing tracking stack.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // 'unsafe-inline' + 'unsafe-eval' needed for GTM + Next inline
              // bootstraps + react-email inline styles. Without it nothing
              // renders.
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://*.facebook.net https://connect.facebook.net https://*.facebook.com",
              "script-src-elem 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://*.facebook.net https://connect.facebook.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: https://www.facebook.com https://*.fbcdn.net https://*.googletagmanager.com https://www.google-analytics.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://www.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://stats.g.doubleclick.net https://www.facebook.com https://graph.facebook.com https://*.facebook.com",
              // cal.com: required for the /book Cal.com booking iframe.
              // *.cal.com covers app.cal.com / embed.cal.com / etc.
              "frame-src 'self' https://www.facebook.com https://*.facebook.com https://www.googletagmanager.com https://cal.com https://*.cal.com",
              "form-action 'self'",
              "base-uri 'self'",
              "frame-ancestors 'self'",
              "object-src 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
      {
        // The /og dynamic factory has its own cache headers (immutable, 1y)
        // and shouldn't get the CSP that blocks inline styles next/og uses.
        // No-op header to ensure /og doesn't get the global block (Next
        // merges; first matching prefix wins).
        source: "/og",
        headers: [{ key: "X-OG-Route", value: "dynamic" }],
      },
    ];
  },
};

export default nextConfig;
