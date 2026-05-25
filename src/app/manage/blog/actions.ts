"use server";

// /manage/blog mutations. Every successful mutation:
//   • Calls updateTag(BLOG_TAG) so cached reads refresh
//   • revalidatePath('/blog'), revalidatePath('/bn/blog') and the specific
//     /blog/<slug> route
//   • Fires pingIndexNow() for the changed URLs (best-effort)

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { and, eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { blogPosts } from "@/db/schema";
import { BLOG_TAG } from "@/lib/data/blog";
import { pingIndexNow } from "@/lib/indexnow";
import { SITE } from "@/lib/site";

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/manage/sign-in");
}

function postUrl(locale: string, slug: string): string {
  return `${SITE.url}${locale === "bn" ? "/bn/blog" : "/blog"}/${slug}`;
}

function refreshPublic(slug?: string, locale: string = "en") {
  updateTag(BLOG_TAG);
  revalidatePath("/blog");
  revalidatePath("/bn/blog");
  revalidatePath("/");
  if (slug) {
    revalidatePath(locale === "bn" ? `/bn/blog/${slug}` : `/blog/${slug}`);
    void pingIndexNow([
      `${SITE.url}/blog`,
      `${SITE.url}/bn/blog`,
      postUrl(locale, slug),
    ]).catch(() => {});
  } else {
    void pingIndexNow([`${SITE.url}/blog`, `${SITE.url}/bn/blog`]).catch(() => {});
  }
}

const FaqArray = z.array(z.object({ q: z.string().min(2).max(300), a: z.string().min(2).max(1500) }));
const StrArray = z.array(z.string().min(1).max(120));

const postSchema = z.object({
  slug: z.string().min(2).max(140).regex(/^[a-z0-9-]+$/, "lowercase letters, numbers, hyphens"),
  locale: z.enum(["en", "bn"]).default("en"),
  title: z.string().min(5).max(180),
  excerpt: z.string().min(10).max(400),
  bodyMdx: z.string().min(50),
  heroImageUrl: z.string().max(500).optional().or(z.literal("")),
  categorySlug: z.string().min(2).max(60),
  authorSlug: z.string().min(2).max(60),
  tagsCsv: z.string().max(500).optional().default(""),
  status: z.enum(["draft", "review", "scheduled", "published"]).default("draft"),
  publishedAt: z.string().optional().or(z.literal("")),
  scheduledFor: z.string().optional().or(z.literal("")),
  answerFirst: z.string().min(40).max(900),
  faqJson: z.string().default("[]"),
  sourceRefsCsv: z.string().max(500).optional().default(""),
  ogTitle: z.string().max(180).optional().or(z.literal("")),
  readingTime: z.coerce.number().int().min(1).max(120).default(5),
  seoTitle: z.string().max(80).optional().or(z.literal("")),
  seoDescription: z.string().max(200).optional().or(z.literal("")),
  targetKeyword: z.string().max(120).optional().or(z.literal("")),
});

function parsePayload(formData: FormData) {
  const parsed = postSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => `${String(i.path[0])}: ${i.message}`).join("; "));
  }
  const d = parsed.data;
  const tags = (d.tagsCsv ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const sourceRefs = (d.sourceRefsCsv ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  let faqs: { q: string; a: string }[] = [];
  try {
    const raw = JSON.parse(d.faqJson || "[]");
    faqs = FaqArray.parse(raw);
  } catch {
    throw new Error("faqJson must be valid JSON of [{ q, a }, ...]");
  }
  // Validate string arrays via Zod too.
  StrArray.parse(tags);
  StrArray.parse(sourceRefs);

  return {
    slug: d.slug,
    locale: d.locale,
    title: d.title,
    excerpt: d.excerpt,
    bodyMdx: d.bodyMdx,
    heroImageUrl: d.heroImageUrl || null,
    categorySlug: d.categorySlug,
    authorSlug: d.authorSlug,
    tags,
    status: d.status,
    publishedAt: d.publishedAt ? new Date(d.publishedAt) : null,
    scheduledFor: d.scheduledFor ? new Date(d.scheduledFor) : null,
    answerFirst: d.answerFirst,
    faqJson: faqs,
    sourceRefs,
    ogTitle: d.ogTitle || null,
    readingTime: d.readingTime,
    seoTitle: d.seoTitle || null,
    seoDescription: d.seoDescription || null,
    targetKeyword: d.targetKeyword || null,
  };
}

export async function createBlogPost(formData: FormData): Promise<void> {
  await requireSession();
  const data = parsePayload(formData);
  // Auto-set publishedAt when status flips to published and field is empty.
  if (data.status === "published" && !data.publishedAt) {
    data.publishedAt = new Date();
  }
  await db.insert(blogPosts).values(data);
  refreshPublic(data.slug, data.locale);
  redirect("/manage/blog");
}

export async function updateBlogPost(id: string, formData: FormData): Promise<void> {
  await requireSession();
  const data = parsePayload(formData);
  if (data.status === "published" && !data.publishedAt) {
    data.publishedAt = new Date();
  }
  await db
    .update(blogPosts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(blogPosts.id, id));
  refreshPublic(data.slug, data.locale);
  redirect("/manage/blog");
}

export async function deleteBlogPost(id: string): Promise<void> {
  await requireSession();
  const [row] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
  refreshPublic(row?.slug, row?.locale ?? "en");
  revalidatePath("/manage/blog");
}

export async function togglePublishPost(id: string, nextValue: boolean): Promise<void> {
  await requireSession();
  const [row] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  if (!row) return;
  await db
    .update(blogPosts)
    .set({
      status: nextValue ? "published" : "draft",
      publishedAt: nextValue ? row.publishedAt ?? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, id));
  refreshPublic(row.slug, row.locale);
  revalidatePath("/manage/blog");
}

export async function bulkUpdateStatus(ids: string[], nextStatus: "published" | "draft" | "review"): Promise<void> {
  await requireSession();
  if (ids.length === 0) return;
  await db
    .update(blogPosts)
    .set({
      status: nextStatus,
      publishedAt: nextStatus === "published" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(inArray(blogPosts.id, ids));
  refreshPublic();
  revalidatePath("/manage/blog");
}

export async function bulkDelete(ids: string[]): Promise<void> {
  await requireSession();
  if (ids.length === 0) return;
  await db.delete(blogPosts).where(inArray(blogPosts.id, ids));
  refreshPublic();
  revalidatePath("/manage/blog");
}

// Form-action wrappers (so admin pages can call them via <form action={...}>)
export async function bulkPublishAction(formData: FormData) {
  const ids = formData.getAll("ids").map(String);
  await bulkUpdateStatus(ids, "published");
}
export async function bulkUnpublishAction(formData: FormData) {
  const ids = formData.getAll("ids").map(String);
  await bulkUpdateStatus(ids, "draft");
}
export async function bulkDeleteAction(formData: FormData) {
  const ids = formData.getAll("ids").map(String);
  await bulkDelete(ids);
}
void and;
