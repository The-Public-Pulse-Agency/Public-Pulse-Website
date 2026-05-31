import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import {
  fetchPageInsights,
  fetchRecentPagePosts,
  getActivePageToken,
} from "@/lib/facebook-graph";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function PageInsightsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/manage/sign-in");

  const token = await getActivePageToken(session.user.id);

  if (!token) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Page insights</h1>
        <p className="mt-2 text-sm text-slate-500">
          Engagement metrics from your connected Facebook Page.
        </p>
        <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="font-semibold">No Facebook Page connected yet.</p>
          <p className="mt-2">
            Connect a Page to see recent posts, reactions, comments, and impressions for it.
          </p>
          <Link
            href="/manage/connect/facebook"
            className="mt-4 inline-flex items-center rounded-full bg-brand-orange px-5 py-2 text-sm font-semibold text-white"
          >
            Connect Facebook Page →
          </Link>
        </div>
      </div>
    );
  }

  const [postsResult, insightsResult] = await Promise.all([
    fetchRecentPagePosts(token.pageId, token.accessToken, 10),
    fetchPageInsights(token.pageId, token.accessToken),
  ]);

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Page insights</h1>
          <p className="mt-1 text-sm text-slate-500">
            Engagement metrics for <strong>{token.pageName}</strong> ·{" "}
            <code className="rounded bg-slate-100 px-1 text-[11px]">{token.pageId}</code> ·{" "}
            <span className="text-xs">via {token.source === "db" ? "OAuth" : "env token"}</span>
          </p>
        </div>
      </header>

      {/* ─── Page-level insights ──────────────────────────────────────── */}
      <section className="mt-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Last 30 days · page metrics
        </h2>
        {!insightsResult.ok ? (
          <p className="mt-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            Couldn&rsquo;t fetch insights: {insightsResult.error}. This usually means your token is
            missing <code>pages_read_engagement</code> — re-connect after granting that permission.
          </p>
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {insightsResult.data.data.map((metric) => {
              const total = metric.values.reduce((sum, v) => sum + (v.value ?? 0), 0);
              return (
                <div
                  key={metric.name}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {metric.title}
                  </div>
                  <div className="mt-2 text-3xl font-extrabold text-brand-navy">
                    {total.toLocaleString("en-GB")}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {metric.description.slice(0, 100)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── Recent posts ─────────────────────────────────────────────── */}
      <section className="mt-12">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Recent posts · engagement
        </h2>
        {!postsResult.ok ? (
          <p className="mt-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            Couldn&rsquo;t fetch posts: {postsResult.error}
          </p>
        ) : postsResult.data.data.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No recent posts found on this Page.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="p-3">Post</th>
                  <th className="p-3 text-right">Reactions</th>
                  <th className="p-3 text-right">Comments</th>
                  <th className="p-3 text-right">Shares</th>
                  <th className="p-3">Posted</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {postsResult.data.data.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 align-top">
                    <td className="p-3">
                      <div className="line-clamp-3 max-w-md text-slate-800">
                        {p.message ?? <em className="text-slate-400">[no text]</em>}
                      </div>
                    </td>
                    <td className="p-3 text-right font-semibold text-brand-navy">
                      {p.reactions?.summary?.total_count?.toLocaleString("en-GB") ?? 0}
                    </td>
                    <td className="p-3 text-right text-slate-600">
                      {p.comments?.summary?.total_count?.toLocaleString("en-GB") ?? 0}
                    </td>
                    <td className="p-3 text-right text-slate-600">
                      {p.shares?.count?.toLocaleString("en-GB") ?? 0}
                    </td>
                    <td className="p-3 text-[11px] text-slate-500">
                      {new Date(p.created_time).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })}
                    </td>
                    <td className="p-3 text-right">
                      {p.permalink_url && (
                        <a
                          href={p.permalink_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-brand-orange hover:underline"
                        >
                          View ↗
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-8 text-[11px] text-slate-500">
        All data fetched live from the Facebook Graph API. Scoped to the single connected Page. Requires{" "}
        <code className="rounded bg-slate-100 px-1">pages_read_engagement</code> + an active Page Access
        Token.
      </p>
    </div>
  );
}
