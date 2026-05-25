import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "@/styles/globals.css";

import { SITE } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";
import {
  localBusinessSchema,
  organizationSchema,
  professionalServiceSchema,
  websiteSchema,
} from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SocialSidebar } from "@/components/layout/SocialSidebar";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { Tracking, TrackingNoscript } from "@/components/analytics/Tracking";
import { CursorGlow, ScrollProgress } from "@/components/motion";
import { StickyBar, ExitIntent } from "@/components/lead-capture";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  ...buildMetadata({
    title: `${SITE.name} | Best Digital Marketing Agency in Bangladesh`,
    description:
      "Bangladesh's 360° digital marketing & political PR agency. Political PR, social media, content, paid ads, hospitality, branding, SEO. Call +880 1717-714676.",
    path: "/",
  }),
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-BD" className={`${inter.variable} reveal-ready`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-paper text-ink">
        {/* Safety kill-switch: 2.5s after load, drop reveal-ready so no element
            can stay invisible if IntersectionObserver fails to fire. */}
        <Script id="reveal-killswitch" strategy="afterInteractive">
          {`setTimeout(function(){document.documentElement.classList.remove('reveal-ready')},2500);`}
        </Script>
        <Tracking />
        <TrackingNoscript />
        <JsonLd
          data={[
            organizationSchema(),
            websiteSchema(),
            localBusinessSchema(),
            professionalServiceSchema(),
          ]}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-paper focus:shadow-lg"
        >
          Skip to content
        </a>
        <ScrollProgress />
        <CursorGlow />
        <Header />
        <main id="main">{children}</main>
        <SocialSidebar />
        <Footer />
        <WhatsAppFab />
        <StickyBar />
        <ExitIntent />
      </body>
    </html>
  );
}
