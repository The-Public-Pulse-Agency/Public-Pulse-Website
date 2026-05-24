import type { Metadata } from "next";
import { SITE, absoluteUrl } from "./site";

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
  noIndex?: boolean;
};

const DEFAULT_OG = "/og-image.jpg";

// 60 / 158 char SEO budgets — runtime-warn (not throw) so we still ship if a
// page slightly overflows; the dev sees the warning in the build log.
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
    ogImage = DEFAULT_OG,
    ogType = "website",
    publishedTime,
    modifiedTime,
    authors,
    section,
    tags,
    noIndex,
  } = input;

  warnIfLong("title", title, 60);
  warnIfLong("description", description, 160);

  const canonical = absoluteUrl(path);
  const image = ogImage.startsWith("http") ? ogImage : absoluteUrl(ogImage);

  return {
    metadataBase: new URL(SITE.url),
    title,
    description,
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, "max-image-preview": "large" },
    openGraph: {
      type: ogType,
      url: canonical,
      title,
      description,
      siteName: SITE.name,
      locale: SITE.locale,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
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
      images: [image],
    },
    other: {
      "geo.region": SITE.contact.address.region,
      "geo.placename": SITE.contact.address.locality,
      "geo.position": `${SITE.contact.address.lat};${SITE.contact.address.lng}`,
    },
  };
}
