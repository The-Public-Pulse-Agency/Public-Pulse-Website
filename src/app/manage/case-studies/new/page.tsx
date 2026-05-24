import { CaseStudyForm } from "../CaseStudyForm";
import { createCaseStudy } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function NewCaseStudyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-3xl font-medium text-brand-navy">New case study</h1>
      <p className="mt-3 text-sm text-slate-600">
        Saving as draft does not affect the homepage. Toggle &ldquo;Publish&rdquo; to make it live —
        the homepage cache refreshes automatically.
      </p>
      <div className="mt-8">
        <CaseStudyForm action={createCaseStudy} submitLabel="Create" />
      </div>
    </div>
  );
}
