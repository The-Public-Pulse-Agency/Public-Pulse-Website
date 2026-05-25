"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { subscribers } from "@/db/schema";

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/manage/sign-in");
}

export async function setSubscriberStatusAction(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("next") ?? "");
  if (!id || (next !== "subscribed" && next !== "unsubscribed")) return;
  await db
    .update(subscribers)
    .set({
      status: next,
      unsubscribedAt: next === "unsubscribed" ? new Date() : null,
    })
    .where(eq(subscribers.id, id));
  revalidatePath("/manage/subscribers");
}
