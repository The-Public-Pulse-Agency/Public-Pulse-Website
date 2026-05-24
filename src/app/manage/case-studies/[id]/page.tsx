import { notFound } from "next/navigation";
import { getCaseStudyById } from "@/lib/data/case-studies";
import { CaseStudyForm } from "../CaseStudyForm";
import { updateCaseStudy } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function EditCaseStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await getCaseStudyById(id);
  if (!row) notFound();

  const action = updateCaseStudy.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-3xl font-medium text-brand-navy">Edit case study</h1>
      <p className="mt-3 text-sm text-slate-600">
        Saving with &ldquo;Publish&rdquo; checked refreshes the homepage cache via
        <code className="mx-1">revalidateTag(&apos;case-studies&apos;)</code>.
      </p>
      <div className="mt-8">
        <CaseStudyForm action={action} initial={row} submitLabel="Save changes" />
      </div>
    </div>
  );
}
