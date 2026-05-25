"use client";

import { useState, useTransition } from "react";
import { ArrowUpRight } from "lucide-react";

type Props = {
  /** Used for attribution in the subscribers table (source field). */
  source?: string;
  /** "dark" inverts copy/colors for use on the ink section in the footer. */
  variant?: "light" | "dark";
};

type FormState = "idle" | "ok" | "err";

export function NewsletterSignup({ source = "footer", variant = "light" }: Props) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [state, setState] = useState<FormState>("idle");
  const [pending, startTransition] = useTransition();

  const dark = variant === "dark";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    startTransition(async () => {
      try {
        const res = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, source, website }),
        });
        setState(res.ok ? "ok" : "err");
        if (res.ok) setEmail("");
      } catch {
        setState("err");
      }
    });
  }

  if (state === "ok") {
    return (
      <p
        className={`text-sm ${dark ? "text-white/80" : "text-ink/70"}`}
        role="status"
        aria-live="polite"
      >
        Got it — check your inbox for the welcome email.
      </p>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
      aria-label="Newsletter signup"
    >
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        aria-hidden
        autoComplete="off"
        className="hidden"
      />
      <label htmlFor={`newsletter-${source}`} className="sr-only">
        Email
      </label>
      <input
        id={`newsletter-${source}`}
        type="email"
        required
        inputMode="email"
        autoComplete="email"
        placeholder="you@brand.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={`form-input flex-1 ${dark ? "bg-paper text-ink" : ""}`}
        aria-invalid={state === "err" ? "true" : "false"}
      />
      <button type="submit" className="btn btn-orange" disabled={pending}>
        {pending ? "Subscribing…" : "Subscribe"}
        {!pending && <ArrowUpRight className="h-4 w-4" aria-hidden />}
      </button>
      {state === "err" && (
        <p
          className={`mt-1 text-xs ${dark ? "text-white/70" : "text-ink/55"} basis-full`}
          role="alert"
        >
          Something went wrong — try again in a moment.
        </p>
      )}
    </form>
  );
}
