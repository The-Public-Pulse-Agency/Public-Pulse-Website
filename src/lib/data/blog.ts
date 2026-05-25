// Cached read layer for the blog. Public reads NEVER hit Neon — they hit
// unstable_cache and only revalidate when /manage mutations call
// updateTag('blog'). See docs/CACHING.md.
//
// All functions return [] on DB failure so the homepage / listing page
// prerender even before the secrets are wired (resilience contract).
//
// Note: no `import "server-only"` here because BLOG_TAG (the cache-tag
// constant) is also imported by scripts/generate.ts. next/cache imports
// below remain a transitive server-only signal — a Client Component
// importing them would fail at build time anyway.

import { unstable_cache } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { authors, blogCategories, blogPosts, type BlogPost, type Author, type BlogCategory } from "@/db/schema";

export const BLOG_TAG = "blog";
export const AUTHORS_TAG = "authors";
export const CATEGORIES_TAG = "blog-categories";

// ─── Categories ─────────────────────────────────────────────────────────

export const getCategories = unstable_cache(
  async (): Promise<BlogCategory[]> => {
    try {
      return await db
        .select()
        .from(blogCategories)
        .orderBy(blogCategories.displayOrder);
    } catch {
      return [];
    }
  },
  ["blog:categories:all"],
  { tags: [CATEGORIES_TAG, BLOG_TAG], revalidate: false }
);

export const getCategoryBySlug = unstable_cache(
  async (slug: string): Promise<BlogCategory | null> => {
    try {
      const [row] = await db
        .select()
        .from(blogCategories)
        .where(eq(blogCategories.slug, slug))
        .limit(1);
      return row ?? null;
    } catch {
      return null;
    }
  },
  ["blog:category:by-slug"],
  { tags: [CATEGORIES_TAG, BLOG_TAG], revalidate: false }
);

// ─── Authors ─────────────────────────────────────────────────────────────

export const getAuthors = unstable_cache(
  async (): Promise<Author[]> => {
    try {
      return await db
        .select()
        .from(authors)
        .where(eq(authors.visible, true))
        .orderBy(authors.displayOrder);
    } catch {
      return [];
    }
  },
  ["blog:authors:visible"],
  { tags: [AUTHORS_TAG, BLOG_TAG], revalidate: false }
);

export const getAuthorBySlug = unstable_cache(
  async (slug: string): Promise<Author | null> => {
    try {
      const [row] = await db.select().from(authors).where(eq(authors.slug, slug)).limit(1);
      return row ?? null;
    } catch {
      return null;
    }
  },
  ["blog:author:by-slug"],
  { tags: [AUTHORS_TAG, BLOG_TAG], revalidate: false }
);

// ─── Posts ───────────────────────────────────────────────────────────────

export type PublishedPostSummary = {
  slug: string;
  locale: string;
  title: string;
  excerpt: string;
  heroImageUrl: string | null;
  categorySlug: string;
  tags: string[];
  authorSlug: string;
  publishedAt: Date | null;
  readingTime: number;
};

export const getPublishedPosts = unstable_cache(
  async (locale: string = "en"): Promise<PublishedPostSummary[]> => {
    try {
      const rows = await db
        .select({
          slug: blogPosts.slug,
          locale: blogPosts.locale,
          title: blogPosts.title,
          excerpt: blogPosts.excerpt,
          heroImageUrl: blogPosts.heroImageUrl,
          categorySlug: blogPosts.categorySlug,
          tags: blogPosts.tags,
          authorSlug: blogPosts.authorSlug,
          publishedAt: blogPosts.publishedAt,
          readingTime: blogPosts.readingTime,
        })
        .from(blogPosts)
        .where(and(eq(blogPosts.status, "published"), eq(blogPosts.locale, locale)))
        .orderBy(desc(blogPosts.publishedAt));
      return rows as PublishedPostSummary[];
    } catch {
      return [];
    }
  },
  ["blog:posts:published"],
  { tags: [BLOG_TAG], revalidate: false }
);

export const getPostBySlug = unstable_cache(
  async (slug: string, locale: string = "en"): Promise<BlogPost | null> => {
    try {
      const [row] = await db
        .select()
        .from(blogPosts)
        .where(and(eq(blogPosts.slug, slug), eq(blogPosts.locale, locale)))
        .limit(1);
      // Only return published or scheduled rows whose schedule has elapsed.
      if (!row) return null;
      if (row.status === "published") return row;
      if (
        row.status === "scheduled" &&
        row.scheduledFor &&
        row.scheduledFor.getTime() <= Date.now()
      ) {
        return row;
      }
      return null;
    } catch {
      return null;
    }
  },
  ["blog:post:by-slug"],
  { tags: [BLOG_TAG], revalidate: false }
);

export const getRelatedPosts = unstable_cache(
  async (
    /** Current post slug to exclude. */
    excludeSlug: string,
    /** Same category gets priority. */
    categorySlug: string,
    locale: string = "en",
    limit: number = 3
  ): Promise<PublishedPostSummary[]> => {
    try {
      const rows = await db
        .select({
          slug: blogPosts.slug,
          locale: blogPosts.locale,
          title: blogPosts.title,
          excerpt: blogPosts.excerpt,
          heroImageUrl: blogPosts.heroImageUrl,
          categorySlug: blogPosts.categorySlug,
          tags: blogPosts.tags,
          authorSlug: blogPosts.authorSlug,
          publishedAt: blogPosts.publishedAt,
          readingTime: blogPosts.readingTime,
        })
        .from(blogPosts)
        .where(and(eq(blogPosts.status, "published"), eq(blogPosts.locale, locale), eq(blogPosts.categorySlug, categorySlug)))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(limit + 1);
      return (rows as PublishedPostSummary[]).filter((r) => r.slug !== excludeSlug).slice(0, limit);
    } catch {
      return [];
    }
  },
  ["blog:posts:related"],
  { tags: [BLOG_TAG], revalidate: false }
);

/** Posts referencing a specific service / location / industry slug — drives
 *  the "3 related posts" rail on service pages (topical cluster). */
export const getPostsBySourceRef = unstable_cache(
  async (ref: string, locale: string = "en", limit: number = 3): Promise<PublishedPostSummary[]> => {
    try {
      // Crude but cheap: pull recent published posts + filter in memory by
      // sourceRefs containing the ref. For scale, swap to a GIN index later.
      const rows = await db
        .select({
          slug: blogPosts.slug,
          locale: blogPosts.locale,
          title: blogPosts.title,
          excerpt: blogPosts.excerpt,
          heroImageUrl: blogPosts.heroImageUrl,
          categorySlug: blogPosts.categorySlug,
          tags: blogPosts.tags,
          authorSlug: blogPosts.authorSlug,
          publishedAt: blogPosts.publishedAt,
          readingTime: blogPosts.readingTime,
          sourceRefs: blogPosts.sourceRefs,
        })
        .from(blogPosts)
        .where(and(eq(blogPosts.status, "published"), eq(blogPosts.locale, locale)))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(50);
      return rows
        .filter((r) => Array.isArray(r.sourceRefs) && (r.sourceRefs as string[]).includes(ref))
        .slice(0, limit)
        .map(({ sourceRefs, ...rest }) => {
          void sourceRefs;
          return rest as PublishedPostSummary;
        });
    } catch {
      return [];
    }
  },
  ["blog:posts:by-sourceref"],
  { tags: [BLOG_TAG], revalidate: false }
);
