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

// ─── Site-wide: WebSite (for SearchAction in the future) ────────────────

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE.url,
    name: SITE.name,
    publisher: { "@id": ORG_ID },
    inLanguage: SITE.language,
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
