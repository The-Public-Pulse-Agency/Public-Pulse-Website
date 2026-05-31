import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { and, desc, sql, isNotNull, inArray } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { messengerEvents } from "@/db/schema";
import { getActivePageToken } from "@/lib/facebook-graph";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type Conversation = {
  senderId: string;
  lastText: string | null;
  lastAt: Date;
  unread: number;
  total: number;
};

export default async function MessengerInboxPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/manage/sign-in");

  const token = await getActivePageToken(session.user.id);

  // Group events by sender — most recent inbound first. Drizzle's typed
  // select + groupBy returns a proper Array (db.execute() returns a
  // wrapper object on neon-http, which broke .map()).
  const rows = await db
    .select({
      senderId: messengerEvents.senderId,
      lastAt: sql<Date>`max(${messengerEvents.receivedAt})`,
      unread: sql<number>`count(*) filter (where ${messengerEvents.handled} = false and ${messengerEvents.eventType} in ('message','postback'))::int`,
      total: sql<number>`count(*)::int`,
      lastText: sql<string | null>`(array_agg(${messengerEvents.text} order by ${messengerEvents.receivedAt} desc) filter (where ${messengerEvents.text} is not null))[1]`,
    })
    .from(messengerEvents)
    .where(
      and(
        isNotNull(messengerEvents.senderId),
        inArray(messengerEvents.eventType, ["message", "postback", "messaging_optins"])
      )
    )
    .groupBy(messengerEvents.senderId)
    .orderBy(desc(sql`max(${messengerEvents.receivedAt})`))
    .limit(100);

  const convs: Conversation[] = rows
    .filter((r): r is typeof r & { senderId: string } => r.senderId !== null)
    .map((r) => ({
      senderId: r.senderId,
      lastText: r.lastText,
      lastAt: r.lastAt instanceof Date ? r.lastAt : new Date(r.lastAt as unknown as string),
      unread: Number(r.unread),
      total: Number(r.total),
    }));

  const totalUnread = convs.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Messenger inbox</h1>
          <p className="mt-1 text-sm text-slate-500">
            {convs.length} conversation{convs.length === 1 ? "" : "s"} · {totalUnread} unread
          </p>
        </div>
        <div className="flex items-center gap-3">
          {token ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {token.pageName} · {token.source === "db" ? "OAuth" : "env"}
            </span>
          ) : (
            <Link
              href="/manage/connect/facebook"
              className="inline-flex items-center rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white"
            >
              Connect Facebook Page →
            </Link>
          )}
        </div>
      </header>

      {!token && (
        <p className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          No Facebook Page is connected. Inbound messages still land in the database via the webhook, but
          you can&rsquo;t reply until a Page Access Token is configured.{" "}
          <Link href="/manage/connect/facebook" className="font-semibold underline">
            Connect a Page →
          </Link>
        </p>
      )}

      {convs.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No conversations yet. When someone messages your Facebook Page, it will appear here within seconds.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-3">Sender</th>
                <th className="p-3">Last message</th>
                <th className="p-3">Messages</th>
                <th className="p-3">Last activity</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {convs.map((c) => (
                <tr key={c.senderId} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-mono text-[11px] text-brand-navy">
                    {c.senderId.slice(0, 12)}…
                    {c.unread > 0 && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-brand-orange px-2 py-0.5 text-[10px] font-bold text-white">
                        {c.unread} new
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-slate-700">
                    <div className="line-clamp-2 max-w-md">{c.lastText ?? "—"}</div>
                  </td>
                  <td className="p-3 text-xs text-slate-500">{c.total}</td>
                  <td className="p-3 text-[11px] text-slate-500">
                    {c.lastAt.toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/manage/messenger/${c.senderId}`}
                      className="inline-flex items-center rounded-full bg-brand-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-navy/85"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-[11px] text-slate-500">
        Webhook endpoint:{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5">/api/messenger/webhook</code> · Stored in{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5">messenger_events</code> table
      </p>
    </div>
  );
}
