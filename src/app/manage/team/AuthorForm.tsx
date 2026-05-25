"use client";

type Defaults = {
  slug?: string;
  name?: string;
  role?: string;
  bio?: string;
  credentials?: string | null;
  image?: string | null;
  sameAs?: string[];
  email?: string | null;
  displayOrder?: number;
  visible?: boolean;
};

export function AuthorForm({
  action,
  defaults = {},
}: {
  action: (fd: FormData) => Promise<void>;
  defaults?: Defaults;
}) {
  return (
    <form action={action} className="space-y-5 max-w-2xl">
      <Field label="Slug" name="slug" defaultValue={defaults.slug ?? ""} required hint="lowercase letters, numbers, hyphens" />
      <Field label="Name" name="name" defaultValue={defaults.name ?? ""} required />
      <Field label="Role" name="role" defaultValue={defaults.role ?? ""} required />
      <Area label="Bio" name="bio" defaultValue={defaults.bio ?? ""} required rows={4} />
      <Field label="Credentials" name="credentials" defaultValue={defaults.credentials ?? ""} hint="Shown for E-E-A-T (e.g. years experience, certifications)" />
      <Field label="Image URL" name="image" defaultValue={defaults.image ?? ""} />
      <Field
        label="sameAs (comma-separated profile URLs)"
        name="sameAsCsv"
        defaultValue={(defaults.sameAs ?? []).join(", ")}
        hint="Linkedin, X, personal site — feeds into Person schema"
      />
      <Field label="Email" name="email" type="email" defaultValue={defaults.email ?? ""} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Display order" name="displayOrder" type="number" defaultValue={String(defaults.displayOrder ?? 0)} />
        <label className="flex items-center gap-2 text-sm font-semibold text-ink mt-7">
          <input
            type="checkbox"
            name="visible"
            value="true"
            defaultChecked={defaults.visible ?? true}
            className="h-4 w-4"
          />
          Visible
        </label>
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
        <a href="/manage/team" className="text-sm text-slate-500">Cancel</a>
        <button type="submit" className="rounded-full bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white">
          Save
        </button>
      </div>
    </form>
  );
}

function Field({
  label, name, defaultValue, required, type = "text", hint,
}: {
  label: string; name: string; defaultValue?: string; required?: boolean; type?: string; hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-ink">
        {label}{required && <span className="ml-1 text-brand-orange">*</span>}
      </label>
      <input id={name} name={name} type={type} defaultValue={defaultValue} required={required} className="form-input mt-2" />
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

function Area({
  label, name, defaultValue, required, rows = 5,
}: {
  label: string; name: string; defaultValue?: string; required?: boolean; rows?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-ink">
        {label}{required && <span className="ml-1 text-brand-orange">*</span>}
      </label>
      <textarea id={name} name={name} rows={rows} defaultValue={defaultValue} required={required} className="form-input mt-2 resize-y" />
    </div>
  );
}
