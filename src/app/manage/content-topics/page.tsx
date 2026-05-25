import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { contentTopics } from "@/db/schema";
import {
  createTopicAction,
  deleteTopicAction,
  generateNowStub,
  setTopicStatusAction,
} from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type SearchParams = { q?: string; status?: string; locale?: string; category?: string };

const STATUS_TONE: Record<string, string> = {
  queued: "bg-blue-100 text-blue-700",
  generated: "bg-emerald-100 text-emerald-700",
  published: "bg-emerald-200 text-emerald-900",
  review: "bg-amber-100 text-amber-800",
  skipped: "bg-slate-200 text-slate-700",
};

export default async function ContentTopicsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/manage/sign-in");
  const sp = await searchParams;

  const filters = [] as ReturnType<typeof eq>[];
  if (sp.status) filters.push(eq(contentTopics.status, sp.status));
  if (sp.locale) filters.push(eq(contentTopics.locale, sp.locale));
  if (sp.category) filters.push(eq(contentTopics.category, sp.category));
  if (sp.q) {
    const q = `%${sp.q}%`;
    filters.push(or(ilike(contentTopics.topic, q), ilike(contentTopics.targetKeyword, q))!);
  }

  const rows = await db
    .select()
    .from(contentTopics)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(contentTopics.priority, desc(contentTopics.createdAt))
    .limit(500);

  const [stats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      queued: sql<number>`count(*) filter (where status = 'queued')::int`,
      generated: sql<number>`count(*) filter (where status = 'generated')::int`,
      review: sql<number>`count(*) filter (where status = 'review')::int`,
      published: sql<number>`count(*) filter (where status = 'published')::int`,
      skipped: sql<number>`count(*) filter (where status = 'skipped')::int`,
    })
    .from(contentTopics);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Content topic queue</h1>
          <p className="mt-1 text-sm text-slate-500">
            {stats?.total ?? 0} topics · {stats?.queued ?? 0} queued · {stats?.review ?? 0} review ·{" "}
            {stats?.published ?? 0} published · {stats?.skipped ?? 0} skipped (null grounding)
          </p>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-brand-navy">Add a topic</h2>
        <p className="mt-1 text-xs text-slate-500">
          Grounding is mandatory — paste a JSON object (e.g. <code>{"{ \"service\": \"political-pr\" }"}</code>)
          or shortcut form <code>service:political-pr</code>. A topic without grounding is skipped immediately,
          so no LLM tokens are spent on it.
        </p>
        <form action={createTopicAction} className="mt-4 grid gap-3 md:grid-cols-2">
          <input name="topic" required placeholder="Topic — e.g. How political PR works in Cox's Bazar" className="form-input md:col-span-2" />
          <input name="targetKeyword" placeholder="Target keyword (optional)" className="form-input" />
          <input name="category" defaultValue="blog" placeholder="Category — blog / guides / compares" className="form-input" />
          <select name="locale" defaultValue="en" aria-label="Locale" className="form-input">
            <option value="en">English</option>
            <option value="bn">বাংলা (native authoring only)</option>
          </select>
          <input name="priority" type="number" defaultValue={100} aria-label="Priority" placeholder="Priority (lower = sooner)" className="form-input" />
          <textarea
            name="groundingHint"
            placeholder='{"service":"political-pr"} or service:political-pr'
            className="form-input md:col-span-2 min-h-[80px] font-mono text-xs"
          />
          <button
            type="submit"
            className="md:col-span-2 inline-flex items-center justify-center rounded-full bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white"
          >
            Add to queue
          </button>
        </form>
      </section>

      <form method="get" className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <input name="q" defaultValue={sp.q ?? ""} placeholder="Search topic / keyword" className="form-input flex-1 min-w-[200px]" />
        <select name="status" defaultValue={sp.status ?? ""} aria-label="Filter by status" className="form-input">
          <option value="">All statuses</option>
          <option value="queued">Queued</option>
          <option value="generated">Generated</option>
          <option value="review">Review</option>
          <option value="published">Published</option>
          <option value="skipped">Skipped</option>
        </select>
        <select name="locale" defaultValue={sp.locale ?? ""} aria-label="Filter by locale" className="form-input">
          <option value="">All locales</option>
          <option value="en">EN</option>
          <option value="bn">BN</option>
        </select>
        <input name="category" defaultValue={sp.category ?? ""} placeholder="Category" className="form-input" />
        <button type="submit" className="rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-white">
          Filter
        </button>
      </form>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No topics match these filters.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-3">Topic</th>
                <th className="p-3">Status</th>
                <th className="p-3">Locale</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Grounding</th>
                <th className="p-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 align-top hover:bg-slate-50">
                  <td className="p-3">
                    <div className="font-semibold text-brand-navy">{r.topic}</div>
                    {r.targetKeyword ? (
                      <div className="text-[11px] text-slate-500">→ {r.targetKeyword}</div>
                    ) : null}
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">{r.category}</div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_TONE[r.status] ?? "bg-slate-100 text-slate-700"}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-xs text-slate-600">{r.locale}</td>
                  <td className="p-3 font-mono text-xs text-slate-600">{r.priority}</td>
                  <td className="p-3">
                    {r.groundingHint != null ? (
                      <code className="block whitespace-pre-wrap break-all rounded bg-slate-100 px-2 py-1 text-[10px] text-slate-700">
                        {JSON.stringify(r.groundingHint)}
                      </code>
                    ) : (
                      <span className="text-[11px] text-red-600">null — skipped</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {r.status === "queued" && (
                        <form action={generateNowStub}>
                          <input type="hidden" name="id" value={r.id} />
                          <button
                            type="submit"
                            className="rounded-full border border-emerald-300 px-3 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50"
                          >
                            Generate now
                          </button>
                        </form>
                      )}
                      {r.status !== "skipped" && (
                        <form action={setTopicStatusAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="next" value="skipped" />
                          <button
                            type="submit"
                            className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Skip
                          </button>
                        </form>
                      )}
                      {r.status === "skipped" && r.groundingHint != null && (
                        <form action={setTopicStatusAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="next" value="queued" />
                          <button
                            type="submit"
                            className="rounded-full border border-blue-300 px-3 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50"
                          >
                            Re-queue
                          </button>
                        </form>
                      )}
                      <form action={deleteTopicAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-red-200 px-3 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[11px] text-slate-500">
        The Bedrock generator pipeline is not wired yet —
        <strong> Generate now </strong>moves a topic to <code>review</code> so you can author the post by hand in /manage/blog/new.
        See <code>docs/JOURNEY.md</code> for the pipeline spec.
      </p>
    </div>
  );
}
