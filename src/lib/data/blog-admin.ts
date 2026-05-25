// Admin-only blog reads — BYPASS the cache so the manage UI shows
// live mutations immediately.

import "server-only";
import { desc, eq, and, inArray, ilike, or } from "drizzle-orm";
import { db } from "@/db/client";
import { authors, blogCategories, blogPosts, type BlogPost } from "@/db/schema";

export type AdminPostListRow = BlogPost;

export async function listAllBlogPosts(filters?: {
  status?: string;
  categorySlug?: string;
  locale?: string;
  q?: string;
}): Promise<AdminPostListRow[]> {
  const where = [];
  if (filters?.status) where.push(eq(blogPosts.status, filters.status));
  if (filters?.categorySlug) where.push(eq(blogPosts.categorySlug, filters.categorySlug));
  if (filters?.locale) where.push(eq(blogPosts.locale, filters.locale));
  if (filters?.q) {
    const q = `%${filters.q}%`;
    where.push(or(ilike(blogPosts.title, q), ilike(blogPosts.slug, q))!);
  }
  const rows = await db
    .select()
    .from(blogPosts)
    .where(where.length > 0 ? and(...where) : undefined)
    .orderBy(desc(blogPosts.updatedAt))
    .limit(500);
  return rows;
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const [row] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  return row ?? null;
}

export async function listAuthorsAdmin() {
  return db.select().from(authors).orderBy(authors.displayOrder);
}

export async function listCategoriesAdmin() {
  return db.select().from(blogCategories).orderBy(blogCategories.displayOrder);
}

void inArray;
