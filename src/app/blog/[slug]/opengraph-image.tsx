import { ImageResponse } from "next/og";
import { getCategories, getPostBySlug } from "@/lib/data/blog";

// Per-post auto OG. Next.js file convention: this file's default export is
// called as a 1200x630 ImageResponse and wired into <head> for /blog/[slug].
//
// Runtime is nodejs (not edge) because OpenNext-on-Lambda doesn't ship the
// edge runtime entrypoint reliably. ImageResponse works the same.
//
// Cached long-TTL: the image is deterministic per post and cheap to invalidate
// — the URL has a Next-generated content hash in production builds, so the
// CDN can hold it forever.

export const runtime = "nodejs";
export const revalidate = 86400;

export const alt = "Public Pulse Agency blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, "en");
  const title = (post?.ogTitle ?? post?.title ?? "Public Pulse Agency").slice(0, 140);
  const categorySlug = post?.categorySlug;
  const categoryName = categorySlug
    ? (await getCategories()).find((c) => c.slug === categorySlug)?.nameEn ?? categorySlug
    : "Public Pulse · Dhaka";
  const eyebrow = `${categoryName} · publicpulse.com.bd`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          background:
            "radial-gradient(60% 50% at 75% 25%, #2563EB 0%, transparent 60%), radial-gradient(45% 55% at 20% 70%, #FF5C00 0%, transparent 60%), radial-gradient(50% 60% at 85% 85%, #0F766E 0%, transparent 55%), radial-gradient(40% 60% at 40% 30%, #14B8A6 0%, transparent 60%), linear-gradient(135deg, #FF7A2E 0%, #14B8A6 50%, #2563EB 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "20px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            opacity: 0.85,
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "9999px",
              background: "#FF5C00",
            }}
          />
          {eyebrow.toUpperCase()}
        </div>

        <div
          style={{
            fontSize: title.length > 70 ? 64 : 84,
            fontWeight: 800,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            maxWidth: 1080,
            display: "flex",
            color: "#ffffff",
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span>Public</span>
            <span style={{ color: "#FFD0A8" }}>Pulse</span>
          </div>
          <div style={{ opacity: 0.85, fontSize: 20, fontWeight: 500 }}>
            {post?.readingTime ? `${post.readingTime} min read` : "Insights"}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
