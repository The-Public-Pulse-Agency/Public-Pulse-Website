import { notFound } from "next/navigation";
import { getBlogPostById, listAuthorsAdmin, listCategoriesAdmin } from "@/lib/data/blog-admin";
import { updateBlogPost, deleteBlogPost } from "../actions";
import { PostForm } from "../PostForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, categories, authors] = await Promise.all([
    getBlogPostById(id),
    listCategoriesAdmin(),
    listAuthorsAdmin(),
  ]);
  if (!post) notFound();

  const updateAction = updateBlogPost.bind(null, post.id);
  const deleteAction = deleteBlogPost.bind(null, post.id);

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Edit post</h1>
          <p className="mt-1 text-sm text-slate-500">
            <code>/blog/{post.slug}</code> · {post.locale === "bn" ? "বাংলা" : "EN"} ·{" "}
            <span className="font-semibold">{post.status}</span>
          </p>
        </div>
        <form action={deleteAction}>
          <button type="submit" className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
            Delete
          </button>
        </form>
      </header>

      {post.gateScores != null && typeof post.gateScores === "object" ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-[12px] text-slate-700">
          <p className="font-semibold uppercase tracking-wider text-slate-500">Quality gate</p>
          <pre className="mt-2 overflow-auto text-[11px] text-slate-800">
            {JSON.stringify(post.gateScores, null, 2)}
          </pre>
        </div>
      ) : null}

      <div className="mt-6">
        <PostForm
          action={updateAction}
          defaults={{
            slug: post.slug,
            locale: post.locale as "en" | "bn",
            title: post.title,
            excerpt: post.excerpt,
            bodyMdx: post.bodyMdx,
            heroImageUrl: post.heroImageUrl,
            categorySlug: post.categorySlug,
            authorSlug: post.authorSlug,
            tags: (post.tags as string[]) ?? [],
            status: post.status as "draft" | "review" | "scheduled" | "published",
            publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : null,
            scheduledFor: post.scheduledFor ? new Date(post.scheduledFor).toISOString() : null,
            answerFirst: post.answerFirst,
            faqJson: (post.faqJson as { q: string; a: string }[]) ?? [],
            sourceRefs: (post.sourceRefs as string[]) ?? [],
            ogTitle: post.ogTitle,
            readingTime: post.readingTime,
            seoTitle: post.seoTitle,
            seoDescription: post.seoDescription,
            targetKeyword: post.targetKeyword,
          }}
          categories={categories.map((c) => ({ slug: c.slug, nameEn: c.nameEn }))}
          authors={authors.map((a) => ({ slug: a.slug, name: a.name }))}
        />
      </div>
    </div>
  );
}
