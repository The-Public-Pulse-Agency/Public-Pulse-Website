import { ImageResponse } from "next/og";

// Dynamic OG image factory — /og?title=<text>&eyebrow=<text>
//
// Edge runtime. 1200×630. Returns PNG. No DB calls. Cache headers tuned
// for CDN reuse (a given title is hashed in the URL so dedup is automatic).

export const runtime = "edge";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const title = (url.searchParams.get("title") || "Public Pulse Agency").slice(0, 140);
  const eyebrow = (url.searchParams.get("eyebrow") || "Public Pulse · Dhaka").slice(0, 60);

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
          {eyebrow}
        </div>

        <div
          style={{
            fontSize: title.length > 70 ? "64px" : "84px",
            fontWeight: 800,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            maxWidth: "1080px",
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
            fontSize: "28px",
            fontWeight: 700,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span>Public</span>
            <span style={{ color: "#FFD0A8" }}>Pulse</span>
          </div>
          <div style={{ opacity: 0.85, fontSize: "20px", fontWeight: 500 }}>
            publicpulse.com.bd
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "cache-control": "public, max-age=86400, s-maxage=31536000, immutable",
      },
    }
  );
}
