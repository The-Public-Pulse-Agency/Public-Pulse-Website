import Link from "next/link";
import { listAllCaseStudies } from "@/lib/data/case-studies";
import { deleteCaseStudy, togglePublish } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function CaseStudiesPage() {
  const rows = await listAllCaseStudies();

  return (
    <div>
      <header className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-medium text-brand-navy">
          Case studies
        </h1>
        <Link
          href="/manage/case-studies/new"
          className="cta-primary inline-flex items-center rounded-full bg-brand-red px-5 py-2.5 text-sm font-semibold text-white"
        >
          + New case study
        </Link>
      </header>

      <p className="mt-3 text-sm text-slate-600">
        Published case studies appear on the homepage. Mutations call <code>revalidateTag('case-studies')</code> so the homepage cache refreshes without redeploy.
      </p>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No case studies yet. Create one to populate the homepage results section.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {rows.map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-serif text-xl font-medium text-brand-navy">
                      {c.metric}
                    </h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        c.published
                          ? "bg-cat-green/15 text-cat-green"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {c.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-1 text-meta uppercase text-slate-500">
                    {c.industry} · {c.windowLabel} · order {c.displayOrder}
                  </p>
                  <p className="mt-3 text-slate-700">{c.summary}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/manage/case-studies/${c.id}`}
                    className="rounded-full border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
                  >
                    Edit
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await togglePublish(c.id, !c.published);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-full border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
                    >
                      {c.published ? "Unpublish" : "Publish"}
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await deleteCaseStudy(c.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-full border border-brand-red/40 px-3 py-1 text-sm text-brand-red hover:bg-brand-red/5"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
