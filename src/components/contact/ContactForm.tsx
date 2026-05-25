"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, CheckCircle2, ArrowRight } from "lucide-react";
import { contactSchema, type ContactInput } from "@/lib/contact-schema";
import { submitContact } from "@/app/contact/actions";
import { SERVICES } from "@/lib/services";
import { getServiceIcon } from "@/lib/icons";

export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const [serverState, setServerState] = useState<
    | { status: "idle" }
    | { status: "success" }
    | { status: "error"; message: string }
  >({ status: "idle" });
  const [selectedService, setSelectedService] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    setError,
    watch,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      serviceInterest: undefined,
      message: "",
      website: "",
    },
    mode: "onBlur",
  });

  const messageValue = watch("message") ?? "";

  const onSubmit = (data: ContactInput) => {
    setServerState({ status: "idle" });
    startTransition(async () => {
      const result = await submitContact(data);
      if (result.ok) {
        reset();
        setSelectedService("");
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
        className="rounded-panel border border-ink/15 bg-paper p-8 md:p-10"
      >
        <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-orange text-paper">
          <CheckCircle2 className="h-6 w-6" aria-hidden />
        </div>
        <p className="mt-5 text-eyebrow uppercase text-brand-orange">Sent</p>
        <h3 className="mt-3 text-h2 font-extrabold tracking-tight text-ink">
          We&rsquo;ve got your brief.
        </h3>
        <p className="mt-3 text-ink/70">
          Expect a reply within 24 hours, Saturday through Thursday. For anything urgent,
          WhatsApp is the fastest channel.
        </p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="relative rounded-panel border border-ink/15 bg-paper p-6 md:p-8"
    >
      {/* Honeypot */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Don&rsquo;t fill this field
          <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      {/* Service chip picker — toggle buttons, faster than a select */}
      <fieldset>
        <legend className="block text-sm font-semibold text-ink">
          What do you need help with?
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {SERVICES.map((s) => {
            const isActive = selectedService === s.slug;
            const Icon = getServiceIcon(s.slug);
            return (
              <button
                key={s.slug}
                type="button"
                onClick={() => {
                  setSelectedService(s.slug);
                  setValue("serviceInterest", s.slug, { shouldValidate: false });
                }}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-ink bg-ink text-paper"
                    : "border-ink/20 bg-paper text-ink/80 hover:border-ink"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {s.shortName}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setSelectedService("not-sure");
              setValue("serviceInterest", "not-sure", { shouldValidate: false });
            }}
            className={`inline-flex items-center rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
              selectedService === "not-sure"
                ? "border-ink bg-ink text-paper"
                : "border-dashed border-ink/30 bg-paper text-ink/65 hover:border-ink"
            }`}
          >
            Not sure yet
          </button>
        </div>
      </fieldset>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field label="Your name" id="name" error={errors.name?.message} required>
          <input
            id="name"
            type="text"
            autoComplete="name"
            aria-invalid={errors.name ? "true" : "false"}
            className="form-input"
            placeholder="Jane Karim"
            {...register("name")}
          />
        </Field>
        <Field label="Email" id="email" error={errors.email?.message} required>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? "true" : "false"}
            className="form-input"
            placeholder="you@brand.com"
            {...register("email")}
          />
        </Field>
        <Field
          label="Phone (optional)"
          id="phone"
          error={errors.phone?.message}
          className="md:col-span-2"
        >
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            className="form-input"
            placeholder="+880 …"
            {...register("phone")}
          />
        </Field>
      </div>

      <Field
        label="What are you trying to grow?"
        id="message"
        error={errors.message?.message}
        required
        className="mt-5"
        hint={`${messageValue.length} / 2000`}
      >
        <textarea
          id="message"
          rows={6}
          aria-invalid={errors.message ? "true" : "false"}
          maxLength={2000}
          className="form-input resize-y"
          placeholder="What's the goal, what have you tried, what's in the way?"
          {...register("message")}
        />
      </Field>

      {serverState.status === "error" && (
        <p
          role="alert"
          className="mt-5 rounded-card border border-brand-orange/40 bg-brand-orange/10 px-4 py-3 text-sm text-ink"
        >
          {serverState.message}
        </p>
      )}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-meta text-ink/55">
          <span
            aria-hidden
            className="mr-1 inline-block h-1.5 w-1.5 -translate-y-[1px] rounded-full bg-emerald-500 align-middle"
          />
          We reply within 24 hours, Sat–Thu.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="btn btn-orange disabled:opacity-60"
        >
          {pending ? (
            "Sending…"
          ) : (
            <>
              Send brief
              <ArrowRight className="h-4 w-4" aria-hidden />
            </>
          )}
        </button>
      </div>

      <p className="mt-4 text-[11px] text-ink/45">
        <Send className="mr-1 inline-block h-3 w-3" aria-hidden />
        Lands in our inbox the moment you hit send. No marketing emails — we use it only to
        reply.
      </p>
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
  hint?: string;
  children: React.ReactNode;
};

function Field({ id, label, error, required, className = "", hint, children }: FieldProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-semibold text-ink">
          {label}
          {required && <span className="ml-1 text-brand-orange">*</span>}
        </label>
        {hint && <span className="text-[11px] text-ink/45">{hint}</span>}
      </div>
      <div className="mt-2">{children}</div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-brand-orange">
          {error}
        </p>
      )}
    </div>
  );
}
