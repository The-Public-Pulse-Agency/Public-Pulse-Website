import Link from "next/link";
import { listAllBlogPosts, listCategoriesAdmin } from "@/lib/data/blog-admin";
import {
  togglePublishPost,
  bulkPublishAction,
  bulkUnpublishAction,
  bulkDeleteAction,
} from "./actions";
import { BulkForm } from "./BulkForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type SearchParams = {
  status?: string;
  category?: string;
  locale?: string;
  q?: string;
};

export default async function BlogAdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const [rows, categories] = await Promise.all([
    listAllBlogPosts({
      status: sp.status || undefined,
      categorySlug: sp.category || undefined,
      locale: sp.locale || undefined,
      q: sp.q || undefined,
    }),
    listCategoriesAdmin(),
  ]);

  const counts = {
    total: rows.length,
    published: rows.filter((r) => r.status === "published").length,
    draft: rows.filter((r) => r.status === "draft").length,
    review: rows.filter((r) => r.status === "review").length,
    scheduled: rows.filter((r) => r.status === "scheduled").length,
  };

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Blog posts</h1>
          <p className="mt-1 text-sm text-slate-500">
            {counts.total} total · {counts.published} published · {counts.review} in review ·{" "}
            {counts.draft} draft · {counts.scheduled} scheduled
          </p>
        </div>
        <Link
          href="/manage/blog/new"
          className="inline-flex items-center rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white"
        >
          + New post
        </Link>
      </header>

      {/* Filter bar */}
      <form className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-4" method="get">
        <select name="status" defaultValue={sp.status ?? ""} className="form-input">
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="review">Review</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
        </select>
        <select name="category" defaultValue={sp.category ?? ""} className="form-input">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.nameEn}
            </option>
          ))}
        </select>
        <select name="locale" defaultValue={sp.locale ?? ""} className="form-input">
          <option value="">All locales</option>
          <option value="en">English</option>
          <option value="bn">বাংলা</option>
        </select>
        <div className="flex gap-2">
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Search title or slug"
            className="form-input flex-1"
          />
          <button type="submit" className="inline-flex items-center rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-white">
            Filter
          </button>
        </div>
      </form>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No posts match these filters. <Link href="/manage/blog" className="underline">Clear filters</Link>{" "}
          or <Link href="/manage/blog/new" className="underline">create one</Link>.
        </p>
      ) : (
        <BulkForm
          rows={rows.map((r) => ({
            id: r.id,
            title: r.title,
            slug: r.slug,
            status: r.status,
            locale: r.locale,
            categorySlug: r.categorySlug,
            authorSlug: r.authorSlug,
            publishedAt: r.publishedAt?.toISOString() ?? null,
            updatedAt: r.updatedAt.toISOString(),
            readingTime: r.readingTime,
          }))}
          actions={{
            togglePublishPost,
            bulkPublishAction,
            bulkUnpublishAction,
            bulkDeleteAction,
          }}
        />
      )}
    </div>
  );
}
