import type { MetadataRoute } from "next";
import { SITE, absoluteUrl } from "@/lib/site";
import { SERVICES } from "@/lib/services";
import { POSTS } from "@/lib/posts";

// Foundation step 1 ships a single flat sitemap. We move to a sitemap-index
// + per-section sitemaps (pages, services, blog, locations…) once the URL
// count crosses a few hundred. The data sources (SERVICES, POSTS) are
// already split so partitioning later is mechanical.

const today = new Date().toISOString().slice(0, 10);

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: today, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/about"), lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/services"), lastModified: today, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/blog"), lastModified: today, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/contact"), lastModified: today, changeFrequency: "yearly", priority: 0.7 },
    { url: absoluteUrl("/group"), lastModified: today, changeFrequency: "monthly", priority: 0.6 },
  ];

  // Only ready services/posts are in the sitemap. Don't advertise URLs that
  // return 404 (the single biggest finding in AUDIT.md).
  const servicePages: MetadataRoute.Sitemap = SERVICES.filter((s) => s.ready).map((s) => ({
    url: absoluteUrl(`/services/${s.slug}`),
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = POSTS.filter((p) => p.ready).map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: p.dateModified ?? p.datePublished,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...servicePages, ...blogPages];
}

// Match the site's locale/host hint for the sitemap response.
export const revalidate = 3600;
export const dynamic = "force-static";
// Silence "unused" warning when SITE.url isn't yet used by alt-lang variants.
void SITE.url;
