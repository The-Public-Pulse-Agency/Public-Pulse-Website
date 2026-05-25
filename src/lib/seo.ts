import type { Metadata } from "next";
import { SITE, absoluteUrl } from "./site";

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
  noIndex?: boolean;
  /** Eyebrow text for the dynamic OG factory (defaults to chip text). */
  ogEyebrow?: string;
  /** When set, uses the dynamic /og?title=&eyebrow= factory instead of the static OG. */
  useDynamicOg?: boolean;
};

const DEFAULT_OG = "/og-image.jpg";

function warnIfLong(label: string, value: string, max: number) {
  if (value.length > max && process.env.NODE_ENV !== "production") {
    console.warn(
      `[seo] ${label} is ${value.length} chars (recommended ≤ ${max}): "${value}"`
    );
  }
}

export function buildMetadata(input: BuildMetadataInput): Metadata {
  const {
    title,
    description,
    path,
    ogImage,
    ogType = "website",
    publishedTime,
    modifiedTime,
    authors,
    section,
    tags,
    noIndex,
    ogEyebrow,
    // Default to static OG. The dynamic /og factory works at build time and
    // returns a per-title PNG, but on first request it can cold-start slowly;
    // opt-in per page if you want the dynamic image.
    useDynamicOg = false,
  } = input;

  warnIfLong("title", title, 60);
  warnIfLong("description", description, 160);

  const canonical = absoluteUrl(path);
  const resolvedOg = useDynamicOg
    ? absoluteUrl(
        `/og?title=${encodeURIComponent(title)}&eyebrow=${encodeURIComponent(
          ogEyebrow ?? "Public Pulse · Dhaka"
        )}`
      )
    : (ogImage ?? DEFAULT_OG).startsWith("http")
    ? (ogImage ?? DEFAULT_OG)
    : absoluteUrl(ogImage ?? DEFAULT_OG);

  return {
    metadataBase: new URL(SITE.url),
    title,
    description,
    keywords: tags?.join(", "),
    applicationName: SITE.name,
    creator: SITE.name,
    publisher: SITE.name,
    referrer: "strict-origin-when-cross-origin",
    formatDetection: { email: false, address: false, telephone: false },
    alternates: {
      canonical,
      languages: {
        en: canonical,
        "x-default": canonical,
      },
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
    openGraph: {
      type: ogType,
      url: canonical,
      title,
      description,
      siteName: SITE.name,
      locale: SITE.locale,
      images: [{ url: resolvedOg, width: 1200, height: 630, alt: title }],
      ...(ogType === "article" && {
        publishedTime,
        modifiedTime: modifiedTime ?? publishedTime,
        authors,
        section,
        tags,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [resolvedOg],
      site: SITE.twitter,
      creator: SITE.twitter,
    },
    other: {
      // Geo meta (legacy but still consumed by some crawlers)
      "geo.region": SITE.contact.address.region,
      "geo.placename": SITE.contact.address.locality,
      "geo.position": `${SITE.contact.address.lat};${SITE.contact.address.lng}`,
      "ICBM": `${SITE.contact.address.lat}, ${SITE.contact.address.lng}`,
      // Mobile-app hints
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
      "apple-mobile-web-app-title": SITE.shortName,
      "mobile-web-app-capable": "yes",
      "msapplication-TileColor": "#0A0A0A",
      "msapplication-tap-highlight": "no",
      // Color scheme + theme hints (browsers tint UI chrome to match)
      "color-scheme": "light",
      "theme-color": "#0A0A0A",
    },
  };
}
