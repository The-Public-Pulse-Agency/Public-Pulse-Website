import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// AI crawlers are EXPLICITLY ALLOWED — see docs/SEO-AEO-GEO.md "robots.txt policy".
// Removing these is a deliberate policy reversal and must be documented in JOURNEY.md.

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Universal — allow public site, disallow admin and auth callbacks
      { userAgent: "*", allow: "/", disallow: ["/manage", "/manage/", "/api/auth"] },
      { userAgent: "Googlebot", allow: "/", disallow: ["/manage", "/manage/", "/api/auth"] },
      { userAgent: "Bingbot", allow: "/", disallow: ["/manage", "/manage/", "/api/auth"] },
      // AI crawlers explicitly allowed for public content; admin still off-limits
      { userAgent: "GPTBot", allow: "/", disallow: ["/manage", "/manage/", "/api/auth"] },
      { userAgent: "ClaudeBot", allow: "/", disallow: ["/manage", "/manage/", "/api/auth"] },
      { userAgent: "PerplexityBot", allow: "/", disallow: ["/manage", "/manage/", "/api/auth"] },
      { userAgent: "Google-Extended", allow: "/", disallow: ["/manage", "/manage/", "/api/auth"] },
      { userAgent: "facebookexternalhit", allow: "/" },
      { userAgent: "Twitterbot", allow: "/" },
      { userAgent: "LinkedInBot", allow: "/" },
      { userAgent: "WhatsApp", allow: "/" },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
