import Link from "next/link";
import { listAuthorsAdmin } from "@/lib/data/blog-admin";
import { deleteAuthor } from "./actions";
import { ConfirmButton } from "../_components/ConfirmButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function TeamAdminPage() {
  const rows = await listAuthorsAdmin();
  return (
    <div>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Team / Authors</h1>
          <p className="mt-1 text-sm text-slate-500">
            Visible on /about and every blog byline. Emits Person JSON-LD for E-E-A-T.
          </p>
        </div>
        <Link
          href="/manage/team/new"
          className="inline-flex items-center rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white"
        >
          + New author
        </Link>
      </header>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No authors yet. Add the founder first.
        </p>
      ) : (
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {rows.map((a) => (
            <li key={a.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-brand-navy">{a.name}</h2>
                  <p className="mt-0.5 text-meta uppercase tracking-wider text-brand-orange">
                    {a.role}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{a.bio}</p>
                  {a.credentials && (
                    <p className="mt-2 text-[11px] text-slate-500">{a.credentials}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 text-right">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      a.visible ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {a.visible ? "Visible" : "Hidden"}
                  </span>
                  <span className="text-[11px] text-slate-500">order: {a.displayOrder}</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/manage/team/${a.id}`}
                  className="rounded-full bg-brand-navy px-3 py-1 text-[11px] font-semibold text-white"
                >
                  Edit
                </Link>
                <ConfirmButton
                  action={async () => {
                    "use server";
                    await deleteAuthor(a.id);
                  }}
                  confirmMessage={`Delete team member "${a.name}"? This cannot be undone.`}
                  className="rounded-full border border-red-200 px-3 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50"
                >
                  Delete
                </ConfirmButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
