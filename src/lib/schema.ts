// JSON-LD builders. Always go through this module — never hand-roll.
// Cross-references use stable @id URIs so Google/AI crawlers can stitch
// the graph together across pages.

import { SITE, absoluteUrl } from "./site";
import { PULSE_GROUP } from "./group";
import { SERVICES } from "./services";

const ORG_ID = SITE.organizationId;
const WEBSITE_ID = `${SITE.url}/#website`;

// ─── Site-wide: Organization (knowledge-panel-ready, BRAND-ONLY) ────────
//
// HARD RULE: NO `founder`, NO `employee`, NO Person references. The brand
// is the entity. Owners exist (privately, on the legal entity); the agency
// presents itself as an organization, not as a personality. Adding a named
// founder here would change the knowledge-graph shape and is intentionally
// out of scope.

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.name,
    legalName: SITE.name,
    alternateName: ["Public Pulse", "Public Pulse Agency Bangladesh"],
    url: SITE.url,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/og-image.jpg"),
      width: 1200,
      height: 630,
    },
    image: absoluteUrl("/og-image.jpg"),
    description: SITE.description,
    slogan: "Reach that moves. Narratives that hold.",
    foundingDate: "2024",
    foundingLocation: {
      "@type": "Place",
      name: `${SITE.contact.address.locality}, Bangladesh`,
    },
    email: SITE.contact.email,
    telephone: SITE.contact.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.contact.address.locality,
      addressRegion: SITE.contact.address.region,
      addressCountry: SITE.contact.address.country,
    },
    areaServed: [
      { "@type": "Country", name: "Bangladesh" },
      { "@type": "AdministrativeArea", name: "South Asia" },
    ],
    knowsAbout: [
      // The 9 services we deliver — what Google should associate this entity with.
      ...SERVICES.filter((s) => s.ready).map((s) => s.serviceType),
      "Digital marketing in Bangladesh",
      "Political PR",
      "Answer Engine Optimization",
      "Generative Engine Optimization",
    ],
    knowsLanguage: ["en"],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: SITE.contact.phone,
        email: SITE.contact.email,
        areaServed: "BD",
        availableLanguage: ["en"],
      },
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: SITE.contact.phone,
        url: SITE.contact.whatsapp,
        areaServed: "BD",
        availableLanguage: ["en"],
      },
    ],
    sameAs: [
      SITE.social.facebook,
      SITE.social.instagram,
      SITE.contact.mapsPlaceUrl, // Google Maps Place — entity disambiguation
      // Authoritative external profiles for entity disambiguation can be
      // appended here as they're created (LinkedIn, Wikidata, etc.).
    ].filter(Boolean),
    identifier: [
      { "@type": "PropertyValue", propertyID: "BIN", value: SITE.contact.legal.bin },
      { "@type": "PropertyValue", propertyID: "TradeLicense", value: SITE.contact.legal.tradeLicense },
    ],
    parentOrganization: {
      "@type": "Organization",
      "@id": PULSE_GROUP.id,
      name: PULSE_GROUP.name,
      url: PULSE_GROUP.url,
    },
  };
}

// ─── Site-wide: WebSite + SearchAction ──────────────────────────────────

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE.url,
    name: SITE.name,
    publisher: { "@id": ORG_ID },
    inLanguage: SITE.language,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ─── LocalBusiness (apex + per-location pages) ──────────────────────────

export type LocalBusinessSchemaInput = {
  /** When emitted for a /locations/<city> page, set the city explicitly. */
  city?: string;
  /** Override the URL — defaults to apex. */
  url?: string;
};

export function localBusinessSchema(input: LocalBusinessSchemaInput = {}) {
  const locality = input.city ?? SITE.contact.address.locality;
  const url = input.url ?? SITE.url;
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${url}#localbusiness`,
    name: SITE.name,
    url,
    image: absoluteUrl("/og-image.jpg"),
    description: SITE.description,
    telephone: SITE.contact.phone,
    email: SITE.contact.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: locality,
      addressRegion: SITE.contact.address.region,
      addressCountry: SITE.contact.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.contact.address.lat,
      longitude: SITE.contact.address.lng,
    },
    // Google Maps Place URL — feeds Google Knowledge Graph + Local Pack.
    hasMap: SITE.contact.mapsPlaceUrl,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "09:00",
        closes: "21:00",
      },
    ],
    areaServed: { "@type": "Country", name: "Bangladesh" },
    parentOrganization: { "@id": ORG_ID },
  };
}

// ─── Breadcrumbs ────────────────────────────────────────────────────────

export type Crumb = { name: string; path: string };

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

// ─── Service detail page ────────────────────────────────────────────────

export type ServiceSchemaInput = {
  slug: string;
  name: string;
  description: string;
  serviceType: string;
  category?: string;
};

export function serviceSchema(input: ServiceSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(`/services/${input.slug}`)}#service`,
    url: absoluteUrl(`/services/${input.slug}`),
    name: input.name,
    description: input.description,
    serviceType: input.serviceType,
    category: input.category,
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: "Bangladesh" },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "BDT",
    },
  };
}

// ─── Article / BlogPosting ──────────────────────────────────────────────

export type ArticleSchemaInput = {
  slug: string;
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  /** Locale path prefix — e.g. "/bn/blog" for the Bengali variant. */
  pathPrefix?: string;
  /** Article language (defaults to site default). */
  inLanguage?: string;
  section: string;
  tags?: string[];
  wordCount?: number;
};

// Brand byline — used for both the visual byline and the Article schema's
// author/publisher. The site is brand-forward: no named individuals.
export const BRAND_BYLINE = {
  name: SITE.name,
  role: "Editorial team",
} as const;

export function articleSchema(input: ArticleSchemaInput) {
  const prefix = input.pathPrefix ?? "/blog";
  const url = absoluteUrl(`${prefix}/${input.slug}`);
  // Author is always the Organization. No Person. The brand owns the byline.
  const author = { "@id": ORG_ID };
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: input.headline,
    description: input.description,
    image: input.image.startsWith("http") ? input.image : absoluteUrl(input.image),
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author,
    publisher: { "@id": ORG_ID },
    articleSection: input.section,
    keywords: input.tags?.join(", "),
    wordCount: input.wordCount,
    inLanguage: input.inLanguage ?? SITE.language,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".answer-block"],
    },
  };
}

// ─── FAQPage (with Speakable for voice assistants) ───────────────────────

export type Faq = { q: string; a: string };

export function faqPageSchema(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: SITE.language,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".answer-block", "dl > div dt", "dl > div dd"],
    },
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
        inLanguage: SITE.language,
      },
    })),
  };
}

// ─── WebPage (per-page meta for entity stitching) ────────────────────────

export type WebPageInput = {
  /** Page path under SITE.url. */
  path: string;
  /** Page headline / title. */
  name: string;
  description: string;
  /** Optional list of glossary slugs the page mentions inline. */
  mentions?: string[];
  /** Optional canonical entities the page is "about" (Service slug, Place name). */
  about?: string[];
  /** ISO datetime for first publish + last modified. */
  datePublished?: string;
  dateModified?: string;
  /** Keywords (≤10 short phrases). */
  keywords?: string[];
  /** Author name (defaults to Org). */
  author?: string;
  /** Reviewer name for E-E-A-T (defaults to Org). */
  reviewedBy?: string;
};

export function webPageSchema(input: WebPageInput) {
  const url = absoluteUrl(input.path);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: input.name,
    description: input.description,
    inLanguage: SITE.language,
    isPartOf: { "@id": WEBSITE_ID },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: absoluteUrl(
        `/og?title=${encodeURIComponent(input.name)}&eyebrow=Public%20Pulse%20%C2%B7%20Dhaka`
      ),
      width: 1200,
      height: 630,
      // Accessibility + AI-crawler image understanding. Schema.org allows
      // either `caption` or `name` for the alt-text role — using both for
      // belt-and-braces compatibility across validators.
      caption: input.name,
      name: input.name,
    },
    publisher: { "@id": ORG_ID },
    author: {
      "@type": "Organization",
      name: input.author ?? SITE.name,
      url: SITE.url,
    },
    reviewedBy: {
      "@type": "Organization",
      name: input.reviewedBy ?? SITE.name,
      url: SITE.url,
    },
    ...(input.datePublished && { datePublished: input.datePublished }),
    ...(input.dateModified && { dateModified: input.dateModified }),
    ...(input.keywords &&
      input.keywords.length > 0 && { keywords: input.keywords.join(", ") }),
    ...(input.mentions &&
      input.mentions.length > 0 && {
        mentions: input.mentions.map((slug) => ({
          "@type": "DefinedTerm",
          "@id": `${absoluteUrl(`/glossary/${slug}`)}#term`,
        })),
      }),
    ...(input.about &&
      input.about.length > 0 && {
        about: input.about.map((name) => ({
          "@type": "Thing",
          name,
        })),
      }),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".answer-block"],
    },
    potentialAction: {
      "@type": "ReadAction",
      target: [url],
    },
  };
}

// ─── CollectionPage (for index pages like /services, /locations, etc.) ───

export function collectionPageSchema(input: {
  path: string;
  name: string;
  description: string;
  items: { url: string; name: string }[];
}) {
  const url = absoluteUrl(input.path);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: input.name,
    description: input.description,
    inLanguage: SITE.language,
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: input.items.length,
      itemListElement: input.items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: it.url.startsWith("http") ? it.url : absoluteUrl(it.url),
        name: it.name,
      })),
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".answer-block"],
    },
  };
}

// ─── ProfessionalService (refinement of LocalBusiness) ───────────────────

export function professionalServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE.url}#professionalservice`,
    name: SITE.name,
    url: SITE.url,
    image: absoluteUrl("/og-image.jpg"),
    description: SITE.description,
    telephone: SITE.contact.phone,
    email: SITE.contact.email,
    priceRange: "$$",
    knowsAbout: [
      "digital marketing",
      "political PR",
      "social media management",
      "paid advertising",
      "search engine optimization",
      "content production",
      "brand building",
      "hospitality marketing",
      "analytics",
      "influencer marketing",
      "Bangladesh",
      "Dhaka",
      "Cox's Bazar",
      "Bengali language marketing",
    ],
    serviceArea: [
      { "@type": "Country", name: "Bangladesh" },
      { "@type": "AdministrativeArea", name: "Dhaka Division" },
      { "@type": "City", name: "Dhaka" },
      { "@type": "City", name: "Chattogram" },
      { "@type": "City", name: "Sylhet" },
      { "@type": "City", name: "Cox's Bazar" },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Public Pulse services",
      itemListElement: [
        "Political PR",
        "Social Media Management",
        "Paid Ads",
        "Content Production",
        "SEO",
        "Hospitality Marketing",
        "Brand Building",
        "Analytics",
        "Influencer Marketing",
      ].map((s) => ({
        "@type": "OfferCatalog",
        name: s,
      })),
    },
    parentOrganization: { "@id": ORG_ID },
  };
}

// ─── QAPage (single Q&A, e.g. an AnswerBlock that answers a literal question) ─

export function qaPageSchema(question: string, answer: string) {
  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    },
  };
}

// ─── SiteNavigationElement (sitelinks signal for Google + Bing) ─────────
// Emits the main nav as a structured ItemList of SiteNavigationElement
// so search engines + AI crawlers can reason about the site's IA. Google
// auto-generates sitelinks based on signals (internal linking + brand
// search volume + sitemap freshness); we can't FORCE them, but emitting
// this gives engines one more confident signal about which URLs are top-level.

export type NavItem = { name: string; url: string };

export function siteNavigationSchema(items: NavItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE.url}/#mainnav`,
    name: "Public Pulse main navigation",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "SiteNavigationElement",
      position: i + 1,
      name: item.name,
      url: item.url.startsWith("http") ? item.url : `${SITE.url}${item.url}`,
    })),
  };
}

// ─── Industry (DefinedTerm-as-vertical) ─────────────────────────────────
// We model an industry vertical as a DefinedTerm in a DefinedTermSet
// (Public Pulse's industry coverage). This gives Google + AI engines a
// crisp entity definition for "{industry} marketing in Bangladesh" and
// stitches the page into the same knowledge graph as Org + WebSite.

export type IndustrySchemaInput = {
  slug: string;
  name: string;
  description: string;
  alignedServiceSlugs: string[];
};

export function industrySchema(input: IndustrySchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${SITE.url}/industries/${input.slug}#term`,
    name: input.name,
    description: input.description,
    termCode: input.slug,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      "@id": `${SITE.url}/industries#set`,
      name: "Public Pulse industry coverage",
      url: `${SITE.url}/industries`,
    },
    additionalType: input.alignedServiceSlugs.map(
      (s) => `${SITE.url}/services/${s}#service`
    ),
  };
}

// ─── AboutPage ───────────────────────────────────────────────────────────
// NOTE: personSchema was intentionally removed — the Org schema (above)
// HARD-FORBIDS Person/founder references for brand-only knowledge-graph
// positioning. If E-E-A-T per-author markup is wanted in the future,
// restore from git history but plumb it through articleSchema only.


export function aboutPageSchema(opts: { path?: string; inLanguage?: string } = {}) {
  const path = opts.path ?? "/about";
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${absoluteUrl(path)}#aboutpage`,
    url: absoluteUrl(path),
    name: `About ${SITE.name}`,
    description: SITE.description,
    inLanguage: opts.inLanguage ?? SITE.language,
    mainEntity: { "@id": ORG_ID },
    isPartOf: { "@id": `${SITE.url}/#website` },
  };
}

// ─── ContactPage ─────────────────────────────────────────────────────────

export function contactPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: absoluteUrl("/contact"),
    mainEntity: { "@id": ORG_ID },
  };
}

// ─── HowTo (guides / playbooks) ─────────────────────────────────────────

export type HowToStep = { name: string; text: string; image?: string };
export type HowToSchemaInput = {
  slug: string;
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string; // ISO 8601 duration, e.g. "PT30M"
  estimatedCost?: { value: number; currency?: string };
  tool?: string[];
  image?: string;
};

export function howToSchema(input: HowToSchemaInput) {
  const url = absoluteUrl(`/guides/${input.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${url}#howto`,
    name: input.name,
    description: input.description,
    url,
    ...(input.image && {
      image: input.image.startsWith("http") ? input.image : absoluteUrl(input.image),
    }),
    ...(input.totalTime && { totalTime: input.totalTime }),
    ...(input.estimatedCost && {
      estimatedCost: {
        "@type": "MonetaryAmount",
        currency: input.estimatedCost.currency ?? "BDT",
        value: input.estimatedCost.value,
      },
    }),
    ...(input.tool && input.tool.length > 0 && { tool: input.tool }),
    step: input.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.image && { image: s.image.startsWith("http") ? s.image : absoluteUrl(s.image) }),
    })),
    inLanguage: SITE.language,
  };
}

// ─── DefinedTerm + DefinedTermSet (glossary) ────────────────────────────

export type DefinedTermInput = {
  /** Slug under /glossary/<slug>. */
  slug: string;
  /** Display term (English). */
  name: string;
  /** Definition (1–2 sentences max — schema.org best practice). */
  description: string;
  /** Bangla translation of the term, optional. */
  termBn?: string;
  /** Subject area — feeds inDefinedTermSet. */
  area?: string;
};

export function definedTermSchema(input: DefinedTermInput) {
  const url = absoluteUrl(`/glossary/${input.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${url}#term`,
    name: input.name,
    description: input.description,
    url,
    termCode: input.slug,
    ...(input.termBn && { alternateName: input.termBn }),
    inDefinedTermSet: { "@id": absoluteUrl("/glossary#set") },
  };
}

export function definedTermSetSchema(terms: { slug: string; name: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${absoluteUrl("/glossary")}#set`,
    name: "Public Pulse Glossary",
    description:
      "Digital marketing and political PR vocabulary used by Public Pulse, defined for the Bangladesh market.",
    url: absoluteUrl("/glossary"),
    hasDefinedTerm: terms.map((t) => ({
      "@type": "DefinedTerm",
      "@id": `${absoluteUrl(`/glossary/${t.slug}`)}#term`,
      name: t.name,
      url: absoluteUrl(`/glossary/${t.slug}`),
    })),
    inLanguage: SITE.language,
  };
}

// ─── Review + AggregateRating (case studies) ────────────────────────────

export type ReviewSchemaInput = {
  /** What was reviewed — typically the Service @id. */
  itemReviewed: string;
  /** Free-text quote / body of the testimonial. */
  body: string;
  /** Numeric rating, e.g. 5. */
  rating: number;
  /** Max possible rating, e.g. 5. */
  bestRating?: number;
  authorName: string;
  authorJobTitle?: string;
};

export function reviewSchema(input: ReviewSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: { "@id": input.itemReviewed },
    reviewRating: {
      "@type": "Rating",
      ratingValue: input.rating,
      bestRating: input.bestRating ?? 5,
    },
    reviewBody: input.body,
    author: {
      "@type": "Person",
      name: input.authorName,
      ...(input.authorJobTitle && { jobTitle: input.authorJobTitle }),
    },
  };
}

export type AggregateRatingInput = {
  itemReviewed: string;
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
};

export function aggregateRatingSchema(input: AggregateRatingInput) {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    itemReviewed: { "@id": input.itemReviewed },
    ratingValue: input.ratingValue,
    bestRating: input.bestRating ?? 5,
    reviewCount: input.reviewCount,
  };
}

// ─── ItemList (for filterable index pages like /case-studies, /glossary) ─

export type ItemListEntry = { url: string; name: string };

export function itemListSchema(name: string, items: ItemListEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: it.url.startsWith("http") ? it.url : absoluteUrl(it.url),
      name: it.name,
    })),
  };
}
