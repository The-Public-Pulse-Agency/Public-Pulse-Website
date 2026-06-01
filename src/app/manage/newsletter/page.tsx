import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { desc, eq, sql } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { newsletterIssues, subscribers } from "@/db/schema";
import { buildDraftAction, deleteIssueAction, sendIssueAction } from "./actions";
import { ConfirmButton } from "../_components/ConfirmButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const STATUS_TONE: Record<string, string> = {
  draft: "bg-slate-200 text-slate-700",
  sending: "bg-blue-100 text-blue-700",
  sent: "bg-emerald-100 text-emerald-700",
};

export default async function NewsletterAdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/manage/sign-in");

  const [stats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      confirmed: sql<number>`count(*) filter (where status = 'confirmed')::int`,
      pending: sql<number>`count(*) filter (where status = 'pending')::int`,
      unsubscribed: sql<number>`count(*) filter (where status = 'unsubscribed')::int`,
    })
    .from(subscribers);

  const issues = await db
    .select()
    .from(newsletterIssues)
    .orderBy(desc(newsletterIssues.createdAt))
    .limit(50);

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Newsletter</h1>
          <p className="mt-1 text-sm text-slate-500">
            {stats?.confirmed ?? 0} confirmed · {stats?.pending ?? 0} pending · {stats?.unsubscribed ?? 0} unsubscribed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/manage/subscribers"
            className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Subscribers
          </Link>
          <form action={buildDraftAction}>
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white"
            >
              Build new draft
            </button>
          </form>
        </div>
      </header>

      <p className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Cron runs the 1st & 15th @ 09:00 UTC. By default it drafts an issue for review here. Set <code className="rounded bg-slate-100 px-1 text-xs">GENERATOR_AUTOSEND_DIGEST=true</code> on the Lambda to autosend instead. List-Unsubscribe headers are on every digest send (RFC 8058 one-click).
      </p>

      {issues.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No newsletter issues yet — click <strong>Build new draft</strong>.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Posts</th>
                <th className="p-3">Status</th>
                <th className="p-3">Sent / Failed</th>
                <th className="p-3">Created</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {issues.map((it) => (
                <tr key={it.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-mono text-xs text-slate-500">№ {String(it.issueNumber).padStart(2, "0")}</td>
                  <td className="p-3">
                    <Link href={`/manage/newsletter/${it.id}`} className="font-semibold text-brand-navy hover:underline">
                      {it.subject}
                    </Link>
                    <div className="text-[11px] text-slate-500">{it.preheader}</div>
                  </td>
                  <td className="p-3 text-xs text-slate-600">{it.posts.length}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_TONE[it.status] ?? "bg-slate-200 text-slate-700"}`}>
                      {it.status}
                    </span>
                    <div className="mt-1 text-[10px] text-slate-500">by {it.createdBy}</div>
                  </td>
                  <td className="p-3 text-xs text-slate-600">
                    {it.status === "sent" ? `${it.sentCount} / ${it.failedCount}` : "—"}
                  </td>
                  <td className="p-3 text-[11px] text-slate-500">
                    {new Date(it.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/manage/newsletter/${it.id}`}
                        className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold hover:bg-slate-100"
                      >
                        Review
                      </Link>
                      {it.status === "draft" && (
                        <>
                          <ConfirmButton
                            action={async () => { "use server"; await sendIssueAction(it.id); }}
                            confirmMessage={`Send "${it.subject || "this issue"}" to ${stats?.confirmed ?? 0} confirmed subscribers? This cannot be undone.`}
                            className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                          >
                            Send to {stats?.confirmed ?? 0}
                          </ConfirmButton>
                          <ConfirmButton
                            action={async () => { "use server"; await deleteIssueAction(it.id); }}
                            confirmMessage={`Delete draft "${it.subject || "this issue"}"? This cannot be undone.`}
                            className="rounded-full border border-red-300 px-3 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </ConfirmButton>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* Refer to eq to keep import used downstream too */
void eq;
