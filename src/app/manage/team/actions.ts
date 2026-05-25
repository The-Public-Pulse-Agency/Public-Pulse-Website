"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { authors } from "@/db/schema";
import { AUTHORS_TAG } from "@/lib/data/blog";

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/manage/sign-in");
}

const schema = z.object({
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(180),
  role: z.string().min(2).max(180),
  bio: z.string().min(20).max(2000),
  credentials: z.string().max(500).optional().or(z.literal("")),
  image: z.string().max(500).optional().or(z.literal("")),
  sameAsCsv: z.string().max(1000).optional().default(""),
  email: z.string().email().max(254).optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().min(0).max(1000).default(0),
  visible: z.coerce.boolean().default(true),
});

function refresh() {
  updateTag(AUTHORS_TAG);
  revalidatePath("/about");
  revalidatePath("/manage/team");
}

function parse(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => `${String(i.path[0])}: ${i.message}`).join("; "));
  }
  const d = parsed.data;
  return {
    slug: d.slug,
    name: d.name,
    role: d.role,
    bio: d.bio,
    credentials: d.credentials || null,
    image: d.image || null,
    sameAs: (d.sameAsCsv ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    email: d.email || null,
    displayOrder: d.displayOrder,
    visible: d.visible,
  };
}

export async function createAuthor(formData: FormData) {
  await requireSession();
  const data = parse(formData);
  await db.insert(authors).values(data);
  refresh();
  redirect("/manage/team");
}

export async function updateAuthor(id: string, formData: FormData) {
  await requireSession();
  const data = parse(formData);
  await db
    .update(authors)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(authors.id, id));
  refresh();
  redirect("/manage/team");
}

export async function deleteAuthor(id: string) {
  await requireSession();
  await db.delete(authors).where(eq(authors.id, id));
  refresh();
}
