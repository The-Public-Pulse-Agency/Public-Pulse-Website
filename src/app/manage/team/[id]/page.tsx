import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { authors } from "@/db/schema";
import { updateAuthor } from "../actions";
import { AuthorForm } from "../AuthorForm";

export const dynamic = "force-dynamic";

export default async function EditAuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.select().from(authors).where(eq(authors.id, id)).limit(1);
  if (!row) notFound();
  const action = updateAuthor.bind(null, row.id);
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Edit author</h1>
      <p className="mt-1 text-sm text-slate-500">/about/authors/{row.slug}</p>
      <div className="mt-6">
        <AuthorForm
          action={action}
          defaults={{
            slug: row.slug,
            name: row.name,
            role: row.role,
            bio: row.bio,
            credentials: row.credentials,
            image: row.image,
            sameAs: (row.sameAs as string[] | null) ?? [],
            email: row.email,
            displayOrder: row.displayOrder,
            visible: row.visible,
          }}
        />
      </div>
    </div>
  );
}
