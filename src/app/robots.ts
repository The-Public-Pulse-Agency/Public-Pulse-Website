import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// AI crawlers are EXPLICITLY ALLOWED — see docs/SEO-AEO-GEO.md "robots.txt
// policy". Reversing this is a deliberate policy change and must be
// documented in JOURNEY.md.
//
// Each AI bot family gets its own rule (rather than relying on User-agent: *)
// because some bots short-circuit and ignore the wildcard rule when their
// specific UA is named. Being explicit makes us safe across all of them.

const ADMIN_DISALLOW = ["/manage", "/manage/", "/api/auth", "/api/newsletter"];

type Rule = {
  userAgent: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
  crawlDelay?: number;
};

export default function robots(): MetadataRoute.Robots {
  const allow = (userAgent: string | string[]): Rule => ({
    userAgent,
    allow: "/",
    disallow: ADMIN_DISALLOW,
  });

  return {
    rules: [
      // Universal — covers anything not specifically named below.
      allow("*"),

      // Search engines we actively want.
      allow("Googlebot"),
      allow("Googlebot-Image"),
      allow("Googlebot-News"),
      allow("Bingbot"),
      allow("Slurp"),
      allow("DuckDuckBot"),
      allow("Baiduspider"),
      allow("YandexBot"),
      allow("Applebot"),
      allow("Sogou"),

      // AI / LLM crawlers — EXPLICITLY ALLOWED. We want our pages cited in
      // ChatGPT / Claude / Gemini / Perplexity answers.
      allow("GPTBot"),
      allow("OAI-SearchBot"),
      allow("ChatGPT-User"),
      allow("ClaudeBot"),
      allow("anthropic-ai"),
      allow("Claude-Web"),
      allow("PerplexityBot"),
      allow("Perplexity-User"),
      allow("Google-Extended"),
      allow("Googlebot-Extended"),
      allow("Applebot-Extended"),
      allow("Bytespider"),
      allow("Amazonbot"),
      allow("DuckAssistBot"),
      allow("Meta-ExternalAgent"),
      allow("Meta-ExternalFetcher"),
      allow("FacebookBot"),
      allow("Diffbot"),
      allow("YouBot"),
      allow("CCBot"),
      allow("Cohere-AI"),
      allow("PetalBot"),
      allow("AwarioRssBot"),
      allow("AwarioSmartBot"),

      // Social / OG previewers — allow the whole site (no admin gate matters
      // here because they only fetch OG metadata).
      { userAgent: "facebookexternalhit", allow: "/" },
      { userAgent: "Twitterbot", allow: "/" },
      { userAgent: "LinkedInBot", allow: "/" },
      { userAgent: "WhatsApp", allow: "/" },
      { userAgent: "Slackbot", allow: "/" },
      { userAgent: "TelegramBot", allow: "/" },
      { userAgent: "Discordbot", allow: "/" },
      { userAgent: "redditbot", allow: "/" },
      { userAgent: "Pinterest", allow: "/" },

      // SEO research crawlers — allow, no reason to block research tooling.
      allow("AhrefsBot"),
      allow("SemrushBot"),
      allow("Mj12bot"),
      allow("DotBot"),
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
