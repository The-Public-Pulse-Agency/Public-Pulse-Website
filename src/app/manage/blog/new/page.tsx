import { listAuthorsAdmin, listCategoriesAdmin } from "@/lib/data/blog-admin";
import { createBlogPost } from "../actions";
import { PostForm } from "../PostForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function NewBlogPostPage() {
  const [categories, authors] = await Promise.all([
    listCategoriesAdmin(),
    listAuthorsAdmin(),
  ]);
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">New blog post</h1>
      <p className="mt-1 text-sm text-slate-500">
        Drafts are invisible to the public. Move to <strong>Published</strong> to flip it live.
      </p>
      <div className="mt-6">
        <PostForm
          action={createBlogPost}
          categories={categories.map((c) => ({ slug: c.slug, nameEn: c.nameEn }))}
          authors={authors.map((a) => ({ slug: a.slug, name: a.name }))}
        />
      </div>
    </div>
  );
}
