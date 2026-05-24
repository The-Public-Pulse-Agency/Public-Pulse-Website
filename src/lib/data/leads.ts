// Lead reads — /manage only. Not cached (admin pages are dynamic).

import "server-only";
import { desc, eq, and } from "drizzle-orm";
import { db } from "@/db/client";
import { leads, type Lead } from "@/db/schema";

export async function listLeads(opts: { archived?: boolean } = {}): Promise<Lead[]> {
  const where = opts.archived === undefined
    ? undefined
    : eq(leads.archived, opts.archived);
  const q = db.select().from(leads).orderBy(desc(leads.submittedAt));
  return where ? q.where(where) : q;
}

export async function markLeadRead(id: string): Promise<void> {
  await db.update(leads).set({ read: true }).where(eq(leads.id, id));
}

export async function archiveLead(id: string): Promise<void> {
  await db.update(leads).set({ archived: true, read: true }).where(eq(leads.id, id));
}

export async function unarchiveLead(id: string): Promise<void> {
  await db.update(leads).set({ archived: false }).where(eq(leads.id, id));
}

export async function unreadCount(): Promise<number> {
  const rows = await db
    .select({ id: leads.id })
    .from(leads)
    .where(and(eq(leads.read, false), eq(leads.archived, false)));
  return rows.length;
}
