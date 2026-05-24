export const SITE = {
  name: "Public Pulse Agency",
  shortName: "Public Pulse",
  url: "https://publicpulse.com.bd",
  description:
    "Bangladesh's 360° digital marketing and political PR agency. Political PR, social media, content production, paid ads, hospitality marketing, branding, SEO and analytics — under one roof in Dhaka.",
  locale: "en_BD",
  language: "en",
  twitter: "@publicpulse_bd",
  themeColor: "#D32F2F",
  contact: {
    phone: "+8801717714676",
    phoneDisplay: "+880 1717-714676",
    email: "info@publicpulse.com.bd",
    whatsapp: "https://wa.me/message/TBIM4KYTCFPEI1",
    address: {
      locality: "Dhaka",
      region: "BD-13",
      country: "BD",
      lat: 23.8103,
      lng: 90.4125,
    },
    legal: {
      bin: "009043032-0102",
      tradeLicense: "TRAD/DNCC/037136/2025",
    },
  },
  social: {
    facebook: "https://web.facebook.com/publicpulse.agency",
    instagram: "https://www.instagram.com/publicpulse_agency/",
  },
  tracking: {
    gtm: "GTM-TNK2J29K",
    ga4: "G-WVF3TSEL3Q",
    metaPixel: "938966755334049",
  },
  organizationId: "https://publicpulse.com.bd/#organization",
} as const;

export const absoluteUrl = (path: string) =>
  `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
