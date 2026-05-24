"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { archiveLead, markLeadRead, unarchiveLead } from "@/lib/data/leads";

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/manage/sign-in");
}

export async function markReadAction(id: string) {
  await requireSession();
  await markLeadRead(id);
  revalidatePath("/manage/leads");
}

export async function archiveAction(id: string) {
  await requireSession();
  await archiveLead(id);
  revalidatePath("/manage/leads");
}

export async function unarchiveAction(id: string) {
  await requireSession();
  await unarchiveLead(id);
  revalidatePath("/manage/leads");
}
