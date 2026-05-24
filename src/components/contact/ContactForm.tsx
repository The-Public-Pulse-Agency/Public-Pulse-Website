"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/lib/contact-schema";
import { submitContact } from "@/app/contact/actions";
import { SERVICES } from "@/lib/services";

export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const [serverState, setServerState] = useState<
    | { status: "idle" }
    | { status: "success" }
    | { status: "error"; message: string }
  >({ status: "idle" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      serviceInterest: undefined,
      message: "",
      website: "", // honeypot
    },
    mode: "onBlur",
  });

  const onSubmit = (data: ContactInput) => {
    setServerState({ status: "idle" });
    startTransition(async () => {
      const result = await submitContact(data);
      if (result.ok) {
        reset();
        setServerState({ status: "success" });
        return;
      }
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          setError(field as keyof ContactInput, { message: message ?? "Invalid" });
        }
      }
      setServerState({ status: "error", message: result.error });
    });
  };

  if (serverState.status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-slate-200 bg-white p-8"
      >
        <p className="text-eyebrow uppercase text-brand-red">Thanks</p>
        <h3 className="mt-3 font-serif text-2xl font-medium text-brand-navy">
          We&rsquo;ve got your message.
        </h3>
        <p className="mt-3 text-slate-700">
          Expect a reply within 24 hours, Sunday through Thursday. For anything urgent,
          WhatsApp is the fastest channel.
        </p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-slate-200 bg-white p-8 md:p-10"
    >
      {/* Honeypot — visually + screen-reader hidden, tabindex out of order */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Don&rsquo;t fill this field
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("website")}
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Your name" id="name" error={errors.name?.message} required>
          <input
            id="name"
            type="text"
            autoComplete="name"
            aria-invalid={!!errors.name}
            className="form-input"
            {...register("name")}
          />
        </Field>
        <Field label="Email" id="email" error={errors.email?.message} required>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            className="form-input"
            {...register("email")}
          />
        </Field>
        <Field label="Phone (optional)" id="phone" error={errors.phone?.message}>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            className="form-input"
            {...register("phone")}
          />
        </Field>
        <Field
          label="Service you need"
          id="serviceInterest"
          error={errors.serviceInterest?.message}
        >
          <select
            id="serviceInterest"
            aria-invalid={!!errors.serviceInterest}
            className="form-input"
            defaultValue=""
            {...register("serviceInterest")}
          >
            <option value="">Pick a service…</option>
            {SERVICES.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
            <option value="not-sure">Not sure yet</option>
          </select>
        </Field>
      </div>

      <Field
        label="What are you trying to grow?"
        id="message"
        error={errors.message?.message}
        required
        className="mt-5"
      >
        <textarea
          id="message"
          rows={6}
          aria-invalid={!!errors.message}
          className="form-input resize-y"
          placeholder="Brief us in a few sentences. What's the goal, what have you tried, what's in the way?"
          {...register("message")}
        />
      </Field>

      {serverState.status === "error" && (
        <p
          role="alert"
          className="mt-5 rounded-md border border-brand-red/30 bg-brand-red/5 px-4 py-3 text-sm text-brand-red"
        >
          {serverState.message}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-meta text-slate-500">
          We reply within 24 hours, Sun–Thu.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="cta-primary inline-flex items-center justify-center rounded-full bg-brand-red px-7 py-3.5 font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send brief →"}
        </button>
      </div>
    </form>
  );
}

// ─── Field helper ────────────────────────────────────────────────────────

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
};

function Field({ id, label, error, required, className = "", children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold text-brand-navy">
        {label}
        {required && <span className="ml-1 text-brand-red">*</span>}
      </label>
      <div className="mt-2">{children}</div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-brand-red">
          {error}
        </p>
      )}
    </div>
  );
}
