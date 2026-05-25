"use client";

import { useState } from "react";

type CategoryOpt = { slug: string; nameEn: string };
type AuthorOpt = { slug: string; name: string };

type FaqRow = { q: string; a: string };

export type PostFormDefaults = {
  slug?: string;
  locale?: "en" | "bn";
  title?: string;
  excerpt?: string;
  bodyMdx?: string;
  heroImageUrl?: string | null;
  categorySlug?: string;
  authorSlug?: string;
  tags?: string[];
  status?: "draft" | "review" | "scheduled" | "published";
  publishedAt?: string | null;
  scheduledFor?: string | null;
  answerFirst?: string;
  faqJson?: FaqRow[];
  sourceRefs?: string[];
  ogTitle?: string | null;
  readingTime?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  targetKeyword?: string | null;
};

export function PostForm({
  action,
  defaults = {},
  categories,
  authors,
}: {
  /** Server action — accepts FormData. */
  action: (fd: FormData) => Promise<void>;
  defaults?: PostFormDefaults;
  categories: CategoryOpt[];
  authors: AuthorOpt[];
}) {
  const [faqs, setFaqs] = useState<FaqRow[]>(
    defaults.faqJson && defaults.faqJson.length > 0
      ? defaults.faqJson
      : [
          { q: "", a: "" },
          { q: "", a: "" },
          { q: "", a: "" },
        ]
  );

  const setFaq = (i: number, key: keyof FaqRow, val: string) => {
    setFaqs((prev) => prev.map((row, idx) => (idx === i ? { ...row, [key]: val } : row)));
  };

  const addFaq = () => setFaqs((prev) => [...prev, { q: "", a: "" }]);
  const removeFaq = (i: number) => setFaqs((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <form action={action} className="space-y-6">
      {/* Hidden JSON field for FAQs */}
      <input type="hidden" name="faqJson" value={JSON.stringify(faqs)} />

      <Section title="Core">
        <Field label="Slug" name="slug" defaultValue={defaults.slug ?? ""} required hint="lowercase letters, numbers, hyphens" />
        <Field label="Title" name="title" defaultValue={defaults.title ?? ""} required />
        <FieldArea
          label="Excerpt (≤400 chars)"
          name="excerpt"
          defaultValue={defaults.excerpt ?? ""}
          required
          rows={3}
        />
        <FieldArea
          label="Answer-first (40–60 words) — the AEO surface"
          name="answerFirst"
          defaultValue={defaults.answerFirst ?? ""}
          required
          rows={4}
          hint="Lands in <AnswerBlock> at the top of the post. Lead with the answer; no fluff."
        />
        <FieldArea
          label="Body (MDX/Markdown)"
          name="bodyMdx"
          defaultValue={defaults.bodyMdx ?? ""}
          required
          rows={20}
        />
      </Section>

      <Section title="Meta">
        <div className="grid gap-4 md:grid-cols-2">
          <Select label="Status" name="status" defaultValue={defaults.status ?? "draft"} options={[
            { value: "draft", label: "Draft" },
            { value: "review", label: "Review" },
            { value: "scheduled", label: "Scheduled" },
            { value: "published", label: "Published" },
          ]} />
          <Select label="Locale" name="locale" defaultValue={defaults.locale ?? "en"} options={[
            { value: "en", label: "English" },
            { value: "bn", label: "বাংলা (native authoring only)" },
          ]} />
          <Select label="Category" name="categorySlug" defaultValue={defaults.categorySlug ?? ""} options={[
            { value: "", label: "— pick —" },
            ...categories.map((c) => ({ value: c.slug, label: c.nameEn })),
          ]} required />
          <Select label="Author" name="authorSlug" defaultValue={defaults.authorSlug ?? ""} options={[
            { value: "", label: "— pick —" },
            ...authors.map((a) => ({ value: a.slug, label: a.name })),
          ]} required />
          <Field label="Tags (CSV)" name="tagsCsv" defaultValue={(defaults.tags ?? []).join(", ")} />
          <Field
            label="Source refs (CSV slugs)"
            name="sourceRefsCsv"
            defaultValue={(defaults.sourceRefs ?? []).join(", ")}
            hint="e.g. paid-ads, dhaka, real-estate"
          />
          <Field
            label="Hero image URL"
            name="heroImageUrl"
            defaultValue={defaults.heroImageUrl ?? ""}
          />
          <Field
            label="Reading time (min)"
            name="readingTime"
            type="number"
            defaultValue={String(defaults.readingTime ?? 5)}
          />
          <Field
            label="Published at (ISO datetime)"
            name="publishedAt"
            type="datetime-local"
            defaultValue={defaults.publishedAt ? toLocalDt(defaults.publishedAt) : ""}
          />
          <Field
            label="Scheduled for (ISO datetime)"
            name="scheduledFor"
            type="datetime-local"
            defaultValue={defaults.scheduledFor ? toLocalDt(defaults.scheduledFor) : ""}
          />
        </div>
      </Section>

      <Section title="SEO">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="SEO title (≤60 chars)" name="seoTitle" defaultValue={defaults.seoTitle ?? ""} />
          <Field label="Target keyword" name="targetKeyword" defaultValue={defaults.targetKeyword ?? ""} />
          <Field label="OG title override" name="ogTitle" defaultValue={defaults.ogTitle ?? ""} />
          <FieldArea
            label="SEO description (140–160 chars)"
            name="seoDescription"
            defaultValue={defaults.seoDescription ?? ""}
            rows={3}
            wrapClass="md:col-span-2"
          />
        </div>
      </Section>

      <Section title={`FAQs (${faqs.length} — minimum 3 to publish)`}>
        <div className="space-y-4">
          {faqs.map((row, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-meta uppercase text-slate-500">FAQ {i + 1}</p>
                <button
                  type="button"
                  onClick={() => removeFaq(i)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
              <input
                value={row.q}
                onChange={(e) => setFaq(i, "q", e.target.value)}
                placeholder="Question"
                className="form-input mt-3"
              />
              <textarea
                value={row.a}
                onChange={(e) => setFaq(i, "a", e.target.value)}
                placeholder="Answer"
                rows={4}
                className="form-input mt-3 resize-y"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addFaq}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold"
          >
            + Add FAQ
          </button>
        </div>
      </Section>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-slate-200 bg-paper px-4 py-3">
        <a href="/manage/blog" className="text-sm text-slate-500 hover:text-ink">Cancel</a>
        <button type="submit" className="inline-flex items-center rounded-full bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white">
          Save
        </button>
      </div>
    </form>
  );
}

function toLocalDt(iso: string): string {
  // datetime-local wants "YYYY-MM-DDTHH:MM"
  return new Date(iso).toISOString().slice(0, 16);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">{title}</h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
  hint,
  wrapClass,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
  hint?: string;
  wrapClass?: string;
}) {
  return (
    <div className={wrapClass}>
      <label htmlFor={name} className="block text-sm font-semibold text-ink">
        {label}
        {required && <span className="ml-1 text-brand-orange">*</span>}
      </label>
      <input id={name} name={name} type={type} defaultValue={defaultValue} required={required} className="form-input mt-2" />
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

function FieldArea({
  label,
  name,
  defaultValue,
  required,
  rows = 5,
  hint,
  wrapClass,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  rows?: number;
  hint?: string;
  wrapClass?: string;
}) {
  return (
    <div className={wrapClass}>
      <label htmlFor={name} className="block text-sm font-semibold text-ink">
        {label}
        {required && <span className="ml-1 text-brand-orange">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        required={required}
        className="form-input mt-2 resize-y font-mono text-[13px]"
      />
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

function Select({
  label,
  name,
  defaultValue,
  options,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-ink">
        {label}
        {required && <span className="ml-1 text-brand-orange">*</span>}
      </label>
      <select id={name} name={name} defaultValue={defaultValue} required={required} className="form-input mt-2">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
