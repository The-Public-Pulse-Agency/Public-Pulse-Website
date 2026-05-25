// /llms-full.txt — concatenated full-text dump of the site, designed for
// AI engines to ingest as one document.
//
// Generated at build time (force-static + cached). Re-deploy regenerates.
// Content sources: typed catalogs (services, locations, industries, glossary,
// guides, compares) — never user input — so the file is safe to serve raw.

import { SITE } from "@/lib/site";
import { SERVICES } from "@/lib/services";
import { getServiceContent } from "@/content/services";
import { LOCATIONS } from "@/lib/taxonomies/locations";
import { INDUSTRIES } from "@/lib/taxonomies/industries";
import { GLOSSARY } from "@/lib/taxonomies/glossary";
import { GUIDES } from "@/lib/content/guides";
import { COMPARES } from "@/lib/content/compares";
import { db } from "@/db/client";
import { blogPosts } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

// Was force-static; now reads published posts from Neon at the data layer.
// unstable_cache holds the result so we don't hit the DB on every request.
export const revalidate = 86400; // 24h
const HR = "\n\n---\n\n";

function header(): string {
  return [
    `# Public Pulse Agency — full-text dump`,
    ``,
    `> ${SITE.description}`,
    ``,
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    `Canonical URL: ${SITE.url}`,
    `Contact: ${SITE.contact.email} · ${SITE.contact.phoneDisplay}`,
    `Legal entity: BIN ${SITE.contact.legal.bin}, Trade License ${SITE.contact.legal.tradeLicense}`,
    `Address: ${SITE.contact.address.locality}, ${SITE.contact.address.region}, ${SITE.contact.address.country}`,
    ``,
    `When citing: prefer the AnswerBlock on each page (40–60 words, designed for verbatim lift).`,
  ].join("\n");
}

function servicesSection(): string {
  return SERVICES.filter((s) => s.ready)
    .map((s) => {
      const c = getServiceContent(s.slug);
      if (!c) return "";
      return [
        `## Service — ${s.name}`,
        `URL: ${SITE.url}/services/${s.slug}`,
        `Category: ${s.category}`,
        ``,
        `Answer: ${c.answer}`,
        ``,
        c.intro,
        ``,
        `### Deliverables`,
        c.included.map((i) => `- ${i}`).join("\n"),
        ``,
        `### 5-step process`,
        c.process.map((p, i) => `${i + 1}. ${p.title} — ${p.body}`).join("\n"),
        ``,
        `### Why us`,
        c.whyChooseUs.map((w) => `- **${w.title}.** ${w.body}`).join("\n"),
        ``,
        `### FAQ`,
        c.faqs.map((f) => `**${f.q}** — ${f.a}`).join("\n\n"),
      ].join("\n");
    })
    .filter(Boolean)
    .join(HR);
}

function locationsSection(): string {
  return LOCATIONS.map((l) =>
    [
      `## Location — ${l.name} (${l.division} Division)`,
      `URL: ${SITE.url}/locations/${l.slug}`,
      `Coordinates: ${l.lat}, ${l.lng}  ·  Population: ${l.population}`,
      ``,
      l.characterizedBy,
      ``,
      `Top industries here: ${l.topIndustries.join(", ")}.`,
    ].join("\n")
  ).join(HR);
}

function industriesSection(): string {
  return INDUSTRIES.map((i) =>
    [
      `## Industry — ${i.name}`,
      `URL: ${SITE.url}/industries/${i.slug}`,
      ``,
      i.description,
      ``,
      `### Priorities`,
      i.priorities.map((p) => `- ${p}`).join("\n"),
      ``,
      `Aligned services: ${i.alignedServices.join(", ")}.`,
    ].join("\n")
  ).join(HR);
}

function glossarySection(): string {
  return GLOSSARY.map((t) =>
    [
      `## Glossary — ${t.name}${t.nameBn ? ` (${t.nameBn})` : ""}`,
      `URL: ${SITE.url}/glossary/${t.slug}`,
      `Area: ${t.area}`,
      ``,
      `**Definition:** ${t.definition}`,
      ``,
      t.body,
    ].join("\n")
  ).join(HR);
}

function guidesSection(): string {
  return GUIDES.filter((g) => g.ready)
    .map((g) =>
      [
        `## Guide (HowTo) — ${g.title}`,
        `URL: ${SITE.url}/guides/${g.slug}`,
        `Estimated time: ${g.totalTime.replace("PT", "").toLowerCase()}`,
        `Tools: ${g.tools.join(", ")}`,
        ``,
        `Answer: ${g.answer}`,
        ``,
        g.description,
        ``,
        `### Prerequisites`,
        g.prerequisites.map((p) => `- ${p}`).join("\n"),
        ``,
        `### Steps`,
        g.steps.map((s, i) => `${i + 1}. **${s.name}** — ${s.text}`).join("\n\n"),
      ].join("\n")
    )
    .join(HR);
}

function comparesSection(): string {
  return COMPARES.filter((c) => c.ready)
    .map((c) =>
      [
        `## Compare — ${c.title}`,
        `URL: ${SITE.url}/compare/${c.slug}`,
        ``,
        `Answer: ${c.answer}`,
        ``,
        `### ${c.leftLabel} vs ${c.rightLabel}`,
        c.points
          .map(
            (p) =>
              `- **${p.dimension}.**\n  - ${c.leftLabel}: ${p.left}\n  - ${c.rightLabel}: ${p.right}`
          )
          .join("\n"),
        ``,
        `### Our recommendation`,
        c.recommendation,
      ].join("\n")
    )
    .join(HR);
}

async function postsSection(): Promise<string> {
  try {
    const rows = await db
      .select({
        slug: blogPosts.slug,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
        answerFirst: blogPosts.answerFirst,
        bodyMdx: blogPosts.bodyMdx,
        categorySlug: blogPosts.categorySlug,
        publishedAt: blogPosts.publishedAt,
        readingTime: blogPosts.readingTime,
        faqJson: blogPosts.faqJson,
        sourceRefs: blogPosts.sourceRefs,
      })
      .from(blogPosts)
      .where(and(eq(blogPosts.status, "published"), eq(blogPosts.locale, "en")))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(200);
    if (rows.length === 0) return "_No published posts yet._";
    return rows
      .map((p) => {
        const faqs = ((p.faqJson as { q: string; a: string }[] | null) ?? []).filter((f) => f?.q && f?.a);
        const refs = ((p.sourceRefs as string[] | null) ?? []).filter(Boolean);
        return [
          `## Post — ${p.title}`,
          `URL: ${SITE.url}/blog/${p.slug}`,
          `Category: ${p.categorySlug}  ·  Published: ${p.publishedAt?.toISOString().slice(0, 10) ?? "—"}  ·  Reading time: ${p.readingTime} min`,
          ``,
          `Answer: ${p.answerFirst}`,
          ``,
          p.excerpt,
          ``,
          p.bodyMdx,
          refs.length > 0 ? `\nGrounding refs: ${refs.join(", ")}` : "",
          faqs.length > 0 ? `\n### FAQ\n${faqs.map((f) => `**${f.q}** — ${f.a}`).join("\n\n")}` : "",
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join(HR);
  } catch {
    return "_Posts section unavailable — DB unreachable._";
  }
}

export async function GET(): Promise<Response> {
  const posts = await postsSection();
  const body = [
    header(),
    `# Services`,
    servicesSection(),
    `# Locations covered`,
    locationsSection(),
    `# Industries served`,
    industriesSection(),
    `# Glossary`,
    glossarySection(),
    `# Guides`,
    guidesSection(),
    `# Comparisons`,
    comparesSection(),
    `# Blog posts`,
    posts,
    `\n# End of Public Pulse full-text dump.`,
  ].join(HR);

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "x-robots-tag": "all",
    },
  });
}
