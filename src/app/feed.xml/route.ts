import { SITE, absoluteUrl } from "@/lib/site";
import { POSTS } from "@/lib/posts";

export const dynamic = "force-static";

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const items = POSTS.filter((p) => p.ready)
    .sort((a, b) => (a.datePublished < b.datePublished ? 1 : -1))
    .map(
      (p) => `
    <item>
      <title>${escape(p.title)}</title>
      <link>${absoluteUrl(`/blog/${p.slug}`)}</link>
      <guid>${absoluteUrl(`/blog/${p.slug}`)}</guid>
      <pubDate>${new Date(p.datePublished).toUTCString()}</pubDate>
      <category>${escape(p.category)}</category>
      <description>${escape(p.description)}</description>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escape(SITE.name)} — Blog</title>
    <link>${SITE.url}/blog</link>
    <description>Digital marketing, political PR and brand-building insights from ${escape(SITE.name)}, Dhaka.</description>
    <language>en-bd</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
