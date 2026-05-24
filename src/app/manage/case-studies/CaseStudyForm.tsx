import { SERVICES } from "@/lib/services";
import type { CaseStudy } from "@/db/schema";

type Props = {
  action: (formData: FormData) => Promise<void>;
  initial?: Partial<CaseStudy>;
  submitLabel: string;
};

// Plain HTML form posting to a server action — no client JS needed.

export function CaseStudyForm({ action, initial, submitLabel }: Props) {
  return (
    <form action={action} className="rounded-2xl border border-slate-200 bg-white p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Slug (URL-safe)" id="slug" required>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            pattern="[a-z0-9\-]+"
            defaultValue={initial?.slug ?? ""}
            className="form-input"
          />
        </Field>
        <Field label="Display order (lower = first)" id="displayOrder">
          <input
            id="displayOrder"
            name="displayOrder"
            type="number"
            min={0}
            max={1000}
            defaultValue={initial?.displayOrder ?? 0}
            className="form-input"
          />
        </Field>
        <Field label="Industry" id="industry" required>
          <input
            id="industry"
            name="industry"
            type="text"
            required
            placeholder="Cox's Bazar resort"
            defaultValue={initial?.industry ?? ""}
            className="form-input"
          />
        </Field>
        <Field label="Metric (the headline number)" id="metric" required>
          <input
            id="metric"
            name="metric"
            type="text"
            required
            placeholder="+47% direct bookings"
            defaultValue={initial?.metric ?? ""}
            className="form-input"
          />
        </Field>
        <Field label="Window label" id="windowLabel" required>
          <input
            id="windowLabel"
            name="windowLabel"
            type="text"
            required
            placeholder="90 days"
            defaultValue={initial?.windowLabel ?? ""}
            className="form-input"
          />
        </Field>
        <Field label="Service" id="serviceSlug">
          <select
            id="serviceSlug"
            name="serviceSlug"
            defaultValue={initial?.serviceSlug ?? ""}
            className="form-input"
          >
            <option value="">— none —</option>
            {SERVICES.map((s) => (
              <option key={s.slug} value={s.slug}>{s.name}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Summary (1–2 sentences)" id="summary" required className="mt-5">
        <textarea
          id="summary"
          name="summary"
          required
          rows={4}
          minLength={20}
          maxLength={600}
          defaultValue={initial?.summary ?? ""}
          className="form-input resize-y"
        />
      </Field>

      <label className="mt-5 flex items-center gap-2 text-sm text-brand-navy">
        <input
          type="checkbox"
          name="published"
          value="true"
          defaultChecked={initial?.published ?? false}
        />
        Publish to homepage
      </label>

      <div className="mt-8 flex items-center justify-end gap-3">
        <button
          type="submit"
          className="cta-primary inline-flex items-center justify-center rounded-full bg-brand-red px-6 py-3 font-semibold text-white"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  required,
  className = "",
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold text-brand-navy">
        {label}
        {required && <span className="ml-1 text-brand-red">*</span>}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
