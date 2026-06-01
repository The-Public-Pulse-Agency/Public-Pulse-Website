import type { Metadata } from "next";
import { Suspense } from "react";

import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { GradientHero } from "@/components/seo/GradientHero";
import { Container } from "@/components/ui/Container";
import { getCategories, getPublishedPosts } from "@/lib/data/blog";
import { SITE } from "@/lib/site";
import { BlogFilter } from "@/components/blog/BlogFilter";

// ISR — page is server-rendered once + cached at the CDN. Filters/search
// run on the client (BlogFilter reads useSearchParams), so different
// ?category=&q= variants share the same cached HTML.
// 1h ISR window per CACHING.md — admin mutations also call updateTag('blog')
// for instant cache refresh, so 1h is just the safety-net regeneration cadence.
export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Insights | Public Pulse Agency — Digital Marketing Guides",
  description:
    "Long-form practitioner guides on digital marketing, political PR, paid ads, SEO, hospitality marketing and brand building in Bangladesh.",
  path: "/blog",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Insights", path: "/blog" },
];

export default async function BlogIndexPage() {
  const [posts, categories] = await Promise.all([
    getPublishedPosts("en"),
    getCategories(),
  ]);

  // Serialize Date → ISO string so we can pass through the server/client boundary.
  const serializedPosts = posts.map((p) => ({
    slug: p.slug,
    locale: p.locale,
    title: p.title,
    excerpt: p.excerpt,
    categorySlug: p.categorySlug,
    tags: p.tags ?? [],
    publishedAt: p.publishedAt ? new Date(p.publishedAt).toISOString() : null,
    readingTime: p.readingTime,
  }));
  const serializedCategories = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    nameEn: c.nameEn,
  }));

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          collectionPageSchema({
            path: "/blog",
            name: "Public Pulse Insights",
            description:
              "Practitioner guides for Bangladesh digital marketing and political PR.",
            items: posts.map((p) => ({ url: `/blog/${p.slug}`, name: p.title })),
          }),
          itemListSchema(
            "Public Pulse Insights",
            posts.map((p) => ({ url: `/blog/${p.slug}`, name: p.title }))
          ),
        ]}
      />

      <GradientHero
        crumbs={crumbs}
        chip="Insights"
        title={
          <>
            Notes from the <span className="text-brand-orange">studio</span>.
          </>
        }
        lead={`English + বাংলা · ${posts.length} guide${posts.length === 1 ? "" : "s"} and growing. Long-form practitioner notes for the Bangladesh market.`}
        answer={`The Public Pulse Insights blog publishes long-form practitioner guides for Bangladesh digital marketing and political PR. ${posts.length} published article${posts.length === 1 ? "" : "s"} across ${categories.length} categories — each one grounded in a real service, location or vertical we actually deliver for.`}
      />

      {/* Suspense boundary is required because BlogFilter uses
          useSearchParams — without it Next refuses to statically generate. */}
      <Suspense fallback={null}>
        <BlogFilter posts={serializedPosts} categories={serializedCategories} />
      </Suspense>

    </>
  );
}
