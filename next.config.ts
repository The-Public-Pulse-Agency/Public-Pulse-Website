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
};

export default nextConfig;
