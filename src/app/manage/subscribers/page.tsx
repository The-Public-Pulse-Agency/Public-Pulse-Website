import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, ilike, or, eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { subscribers } from "@/db/schema";
import { setSubscriberStatusAction } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type SearchParams = { q?: string; status?: string };

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/manage/sign-in");
  const sp = await searchParams;

  const where = [];
  if (sp.q) {
    const q = `%${sp.q}%`;
    where.push(or(ilike(subscribers.email, q), ilike(subscribers.source, q))!);
  }
  if (sp.status) where.push(eq(subscribers.status, sp.status));

  const rows = await db
    .select()
    .from(subscribers)
    .where(where.length > 0 ? where[0] : undefined)
    .orderBy(desc(subscribers.createdAt))
    .limit(1000);

  const [stats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where status = 'subscribed')::int`,
      unsubscribed: sql<number>`count(*) filter (where status = 'unsubscribed')::int`,
    })
    .from(subscribers);

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Newsletter subscribers</h1>
          <p className="mt-1 text-sm text-slate-500">
            {stats?.total ?? 0} total · {stats?.active ?? 0} active · {stats?.unsubscribed ?? 0} unsubscribed
          </p>
        </div>
        <a
          href="/manage/subscribers/export.csv"
          className="inline-flex items-center rounded-full bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white"
        >
          Export CSV
        </a>
      </header>

      <form method="get" className="mt-6 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search email or source"
          className="form-input flex-1 min-w-[200px]"
        />
        <select name="status" defaultValue={sp.status ?? ""} className="form-input">
          <option value="">All</option>
          <option value="subscribed">Subscribed</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
        <button
          type="submit"
          className="inline-flex items-center rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-white"
        >
          Filter
        </button>
      </form>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No subscribers match these filters.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-3">Email</th>
                <th className="p-3">Status</th>
                <th className="p-3">Source</th>
                <th className="p-3">Signed up</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-mono text-[12px] text-brand-navy">{r.email}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        r.status === "subscribed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{r.source ?? "—"}</td>
                  <td className="p-3 text-[11px] text-slate-500">
                    {new Date(r.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="p-3">
                    <form
                      action={async (fd) => {
                        "use server";
                        await setSubscriberStatusAction(fd);
                      }}
                    >
                      <input type="hidden" name="id" value={r.id} />
                      <input
                        type="hidden"
                        name="next"
                        value={r.status === "subscribed" ? "unsubscribed" : "subscribed"}
                      />
                      <button
                        type="submit"
                        className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold hover:bg-slate-100"
                      >
                        {r.status === "subscribed" ? "Unsubscribe" : "Re-subscribe"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-[11px] text-slate-500">
        <Link href="/api/newsletter" className="underline">/api/newsletter</Link> is the write
        endpoint. Welcome emails fire via Resend.
      </p>
    </div>
  );
}
