import { createAuthor } from "../actions";
import { AuthorForm } from "../AuthorForm";

export const dynamic = "force-dynamic";

export default function NewAuthorPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">New author</h1>
      <p className="mt-1 text-sm text-slate-500">
        Appears on /about and on every post byline. Person JSON-LD is emitted automatically.
      </p>
      <div className="mt-6">
        <AuthorForm action={createAuthor} />
      </div>
    </div>
  );
}
