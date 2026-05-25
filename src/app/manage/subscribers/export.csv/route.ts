// CSV export of all subscribers (admin only). Streamed as text/csv with a
// filename that includes the date so successive exports don't overwrite.

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { subscribers } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(v: string | null | undefined): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(): Promise<Response> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/manage/sign-in");

  const rows = await db.select().from(subscribers).orderBy(desc(subscribers.createdAt));

  const header = "email,status,source,createdAt,confirmedAt,unsubscribedAt\n";
  const body = rows
    .map((r) =>
      [
        csvEscape(r.email),
        csvEscape(r.status),
        csvEscape(r.source),
        csvEscape(r.createdAt.toISOString()),
        csvEscape(r.confirmedAt?.toISOString() ?? ""),
        csvEscape(r.unsubscribedAt?.toISOString() ?? ""),
      ].join(",")
    )
    .join("\n");

  const date = new Date().toISOString().slice(0, 10);
  return new Response(header + body + "\n", {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="publicpulse-subscribers-${date}.csv"`,
      "cache-control": "no-store",
    },
  });
}
