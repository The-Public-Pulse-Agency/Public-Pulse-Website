"use client";

import { useState } from "react";
import Link from "next/link";

type Row = {
  id: string;
  title: string;
  slug: string;
  status: string;
  locale: string;
  categorySlug: string;
  authorSlug: string;
  publishedAt: string | null;
  updatedAt: string;
  readingTime: number;
};

type Actions = {
  togglePublishPost: (id: string, nextValue: boolean) => Promise<void>;
  bulkPublishAction: (fd: FormData) => Promise<void>;
  bulkUnpublishAction: (fd: FormData) => Promise<void>;
  bulkDeleteAction: (fd: FormData) => Promise<void>;
};

const STATUS_TONE: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700",
  review: "bg-amber-100 text-amber-700",
  draft: "bg-slate-200 text-slate-700",
  scheduled: "bg-blue-100 text-blue-700",
};

export function BulkForm({ rows, actions }: { rows: Row[]; actions: Actions }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allChecked = rows.length > 0 && selected.size === rows.length;

  const toggleAll = () =>
    setSelected(allChecked ? new Set() : new Set(rows.map((r) => r.id)));
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <div className="mt-6">
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-navy bg-brand-navy px-4 py-3 text-white">
          <p className="text-sm font-semibold">{selected.size} selected</p>
          <div className="flex flex-wrap gap-2">
            <BulkButton ids={[...selected]} label="Publish" action={actions.bulkPublishAction} variant="primary" />
            <BulkButton ids={[...selected]} label="Unpublish" action={actions.bulkUnpublishAction} variant="ghost" />
            <BulkButton
              ids={[...selected]}
              label="Delete"
              action={actions.bulkDeleteAction}
              variant="danger"
              confirm={`Delete ${selected.size} post(s)? This cannot be undone.`}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  aria-label="Select all"
                />
              </th>
              <th className="p-3">Title</th>
              <th className="p-3">Status</th>
              <th className="p-3">Locale</th>
              <th className="p-3">Category</th>
              <th className="p-3">Published</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-3 align-top">
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => toggleOne(r.id)}
                    aria-label={`Select ${r.title}`}
                  />
                </td>
                <td className="p-3">
                  <Link href={`/manage/blog/${r.id}`} className="font-semibold text-brand-navy hover:underline">
                    {r.title}
                  </Link>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    /blog/{r.slug} · {r.readingTime} min read
                  </div>
                </td>
                <td className="p-3 align-top">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      STATUS_TONE[r.status] ?? "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="p-3 align-top">
                  <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase">
                    {r.locale === "bn" ? "বাংলা" : "EN"}
                  </span>
                </td>
                <td className="p-3 align-top text-slate-700">{r.categorySlug}</td>
                <td className="p-3 align-top text-slate-500 text-[11px]">
                  {r.publishedAt ? new Date(r.publishedAt).toLocaleDateString("en-GB") : "—"}
                </td>
                <td className="p-3 align-top">
                  <div className="flex flex-wrap gap-2">
                    <form
                      action={async () => {
                        await actions.togglePublishPost(r.id, r.status !== "published");
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold hover:bg-slate-100"
                      >
                        {r.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BulkButton({
  ids,
  label,
  action,
  variant,
  confirm,
}: {
  ids: string[];
  label: string;
  action: (fd: FormData) => Promise<void>;
  variant: "primary" | "ghost" | "danger";
  confirm?: string;
}) {
  const cls =
    variant === "primary"
      ? "bg-brand-orange text-white"
      : variant === "danger"
        ? "bg-red-600 text-white"
        : "bg-white text-brand-navy border border-white/40";
  return (
    <form
      action={async (fd) => {
        if (confirm && !window.confirm(confirm)) return;
        await action(fd);
      }}
    >
      {ids.map((id) => (
        <input key={id} type="hidden" name="ids" value={id} />
      ))}
      <button type="submit" className={`rounded-full px-4 py-1.5 text-xs font-semibold ${cls}`}>
        {label}
      </button>
    </form>
  );
}
