// JSON-LD builders. Always go through this module — never hand-roll.
// Cross-references use stable @id URIs so Google/AI crawlers can stitch
// the graph together across pages.

import { SITE, absoluteUrl } from "./site";

const ORG_ID = SITE.organizationId;
const WEBSITE_ID = `${SITE.url}/#website`;

// ─── Site-wide: Organization (with Pulse Group as parent) ───────────────

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.name,
    url: SITE.url,
    logo: absoluteUrl("/og-image.jpg"),
    description: SITE.description,
    email: SITE.contact.email,
    telephone: SITE.contact.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.contact.address.locality,
      addressCountry: SITE.contact.address.country,
    },
    sameAs: [SITE.social.facebook, SITE.social.instagram],
    foundingDate: "2024",
    areaServed: { "@type": "Country", name: "Bangladesh" },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: SITE.contact.phone,
        contactType: "customer service",
        areaServed: "BD",
        availableLanguage: ["en", "bn"],
      },
    ],
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
  authorName?: string;
  section: string;
  tags?: string[];
  wordCount?: number;
};

export function articleSchema(input: ArticleSchemaInput) {
  const url = absoluteUrl(`/blog/${input.slug}`);
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
    author: {
      "@type": "Organization",
      name: input.authorName ?? SITE.name,
      url: SITE.url,
    },
    publisher: { "@id": ORG_ID },
    articleSection: input.section,
    keywords: input.tags?.join(", "),
    wordCount: input.wordCount,
    inLanguage: SITE.language,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".answer-block"],
    },
  };
}

// ─── FAQPage ────────────────────────────────────────────────────────────

export type Faq = { q: string; a: string };

export function faqPageSchema(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
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

// ─── Person (E-E-A-T for team members on /about) ─────────────────────────

export type PersonSchemaInput = {
  name: string;
  jobTitle: string;
  /** Path or absolute URL to a profile photo if available. */
  image?: string;
  /** External profile links (LinkedIn, X, personal site) — fed into sameAs. */
  sameAs?: string[];
};

export function personSchema(input: PersonSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: input.name,
    jobTitle: input.jobTitle,
    worksFor: { "@id": ORG_ID },
    ...(input.image && {
      image: input.image.startsWith("http") ? input.image : absoluteUrl(input.image),
    }),
    ...(input.sameAs && input.sameAs.length > 0 && { sameAs: input.sameAs }),
  };
}

// ─── AboutPage ───────────────────────────────────────────────────────────

export function aboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: absoluteUrl("/about"),
    mainEntity: { "@id": ORG_ID },
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
