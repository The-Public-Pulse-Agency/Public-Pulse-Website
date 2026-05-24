"use server";

// All case-study mutations live here. Every successful mutation MUST call
// revalidateTag(CASE_STUDIES_TAG) so the public homepage picks up the change.
// See docs/CACHING.md.

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { caseStudies } from "@/db/schema";
import { CASE_STUDIES_TAG } from "@/lib/data/case-studies";

const caseStudySchema = z.object({
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/, "lowercase letters, numbers, hyphens"),
  industry: z.string().min(2).max(200),
  metric: z.string().min(2).max(120),
  windowLabel: z.string().min(2).max(60),
  summary: z.string().min(20).max(600),
  serviceSlug: z.string().max(120).optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().min(0).max(1000).default(0),
  published: z.boolean().default(false),
});

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/manage/sign-in");
}

function refreshPublic() {
  // Belt-and-braces: invalidate the tag (data layer) AND nudge the homepage
  // path directly. Next 16 split the API — updateTag() is the fire-and-forget
  // invalidate; revalidateTag() requires a CacheLife profile and is for the
  // newer cacheLife system. We want the former.
  updateTag(CASE_STUDIES_TAG);
  revalidatePath("/");
}

export type ActionState = { ok: true } | { ok: false; error: string };

export async function createCaseStudy(formData: FormData): Promise<void> {
  await requireSession();
  const parsed = caseStudySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => `${String(i.path[0])}: ${i.message}`).join("; "));
  }
  const data = parsed.data;
  await db.insert(caseStudies).values({
    slug: data.slug,
    industry: data.industry,
    metric: data.metric,
    windowLabel: data.windowLabel,
    summary: data.summary,
    serviceSlug: data.serviceSlug || null,
    displayOrder: data.displayOrder,
    published: data.published,
    publishedAt: data.published ? new Date() : null,
  });
  refreshPublic();
  redirect("/manage/case-studies");
}

export async function updateCaseStudy(id: string, formData: FormData): Promise<void> {
  await requireSession();
  const parsed = caseStudySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => `${String(i.path[0])}: ${i.message}`).join("; "));
  }
  const data = parsed.data;
  await db
    .update(caseStudies)
    .set({
      slug: data.slug,
      industry: data.industry,
      metric: data.metric,
      windowLabel: data.windowLabel,
      summary: data.summary,
      serviceSlug: data.serviceSlug || null,
      displayOrder: data.displayOrder,
      published: data.published,
      publishedAt: data.published ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(caseStudies.id, id));
  refreshPublic();
  redirect("/manage/case-studies");
}

export async function deleteCaseStudy(id: string): Promise<void> {
  await requireSession();
  await db.delete(caseStudies).where(eq(caseStudies.id, id));
  refreshPublic();
  revalidatePath("/manage/case-studies");
}

export async function togglePublish(id: string, nextValue: boolean): Promise<void> {
  await requireSession();
  await db
    .update(caseStudies)
    .set({
      published: nextValue,
      publishedAt: nextValue ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(caseStudies.id, id));
  refreshPublic();
  revalidatePath("/manage/case-studies");
}
