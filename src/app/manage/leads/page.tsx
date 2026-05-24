import { listLeads } from "@/lib/data/leads";
import { getService } from "@/lib/services";
import { markReadAction, archiveAction, unarchiveAction } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const showArchived = view === "archived";
  const rows = await listLeads({ archived: showArchived });

  return (
    <div>
      <header className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-medium text-brand-navy">
          {showArchived ? "Archived leads" : "Leads"}
        </h1>
        <nav aria-label="Lead filter" className="flex gap-3 text-sm">
          <a
            href="/manage/leads"
            className={`rounded-full px-3 py-1 ${!showArchived ? "bg-brand-navy text-white" : "text-slate-600 hover:text-brand-red"}`}
          >
            Inbox
          </a>
          <a
            href="/manage/leads?view=archived"
            className={`rounded-full px-3 py-1 ${showArchived ? "bg-brand-navy text-white" : "text-slate-600 hover:text-brand-red"}`}
          >
            Archived
          </a>
        </nav>
      </header>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          {showArchived ? "Nothing archived yet." : "No leads yet. They'll appear here in real-time."}
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {rows.map((lead) => {
            const svc = lead.serviceInterest ? getService(lead.serviceInterest) : undefined;
            return (
              <li
                key={lead.id}
                className={`rounded-2xl border bg-white p-6 ${lead.read ? "border-slate-200" : "border-brand-red/40"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-serif text-xl font-medium text-brand-navy">
                        {lead.name}
                      </h2>
                      {!lead.read && (
                        <span className="rounded-full bg-brand-red px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          New
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      <a href={`mailto:${lead.email}`} className="hover:text-brand-red">{lead.email}</a>
                      {lead.phone && (
                        <>
                          {" · "}
                          <a href={`tel:${lead.phone}`} className="hover:text-brand-red">{lead.phone}</a>
                        </>
                      )}
                    </p>
                    <p className="mt-1 text-meta uppercase text-slate-500">
                      {svc ? svc.name : lead.serviceInterest ?? "no service specified"}
                      {" · "}
                      {new Date(lead.submittedAt).toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!lead.read && (
                      <form action={async () => { "use server"; await markReadAction(lead.id); }}>
                        <button type="submit" className="rounded-full border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100">
                          Mark read
                        </button>
                      </form>
                    )}
                    {showArchived ? (
                      <form action={async () => { "use server"; await unarchiveAction(lead.id); }}>
                        <button type="submit" className="rounded-full border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100">
                          Unarchive
                        </button>
                      </form>
                    ) : (
                      <form action={async () => { "use server"; await archiveAction(lead.id); }}>
                        <button type="submit" className="rounded-full border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100">
                          Archive
                        </button>
                      </form>
                    )}
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-slate-700">{lead.message}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
