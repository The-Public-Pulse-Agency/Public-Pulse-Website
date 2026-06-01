"use client";

// Core form used inside every LeadCapture variant. Single, focused field
// (email OR phone) — never both at once. Tabbed switch so the user picks
// their preferred channel without seeing two competing inputs.
//
// On success: triggers `markSubscribed()` so EVERY capture surface on the
// site stops asking. Renders a thank-you state in place of the form.

import { useState, useTransition } from "react";
import { ArrowRight } from "lucide-react";

import { markSubscribed } from "./state";
import type { CaptureContext, Locale } from "./copy";
import { getCopy } from "./copy";

type Channel = "email" | "phone";

export type CaptureFormProps = {
  context: CaptureContext;
  locale?: Locale;
  /** Current page path — written to subscribers.capturePage / whatsapp_optin.capturePage. */
  page?: string;
  /** Default channel — most surfaces lead with email; service pages may prefer phone. */
  defaultChannel?: Channel;
  /** Compact form on dark backgrounds. */
  variant?: "light" | "dark" | "ink";
  /** Hides the channel tabs (used by sticky bar — only email field). */
  hideChannelTabs?: boolean;
  /** Called when the user successfully submits (used to auto-close exit modal). */
  onSuccess?: () => void;
};

export function CaptureForm({
  context,
  locale = "en",
  page,
  defaultChannel = "email",
  variant = "light",
  hideChannelTabs = false,
  onSuccess,
}: CaptureFormProps) {
  const t = getCopy(context, locale);
  const [channel, setChannel] = useState<Channel>(defaultChannel);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");
  const [pending, startTransition] = useTransition();

  const dark = variant === "dark" || variant === "ink";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (channel === "email" && !email.trim()) return;
    if (channel === "phone" && (!phone.trim() || !consent)) return;

    startTransition(async () => {
      try {
        if (channel === "email") {
          const res = await fetch("/api/newsletter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: email.trim(),
              source: context,
              page,
              locale,
              website,
            }),
          });
          if (res.ok) {
            markSubscribed();
            setState("ok");
            setEmail("");
            onSuccess?.();
          } else {
            setState("err");
          }
        } else {
          const res = await fetch("/api/whatsapp-optin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: phone.trim(),
              consent: true,
              source: context,
              page,
              locale,
              website,
            }),
          });
          if (res.ok) {
            markSubscribed();
            setState("ok");
            setPhone("");
            onSuccess?.();
          } else {
            setState("err");
          }
        }
      } catch {
        setState("err");
      }
    });
  }

  if (state === "ok") {
    return (
      <div
        className={`text-sm ${dark ? "text-white/85" : "text-ink/70"}`}
        role="status"
        aria-live="polite"
      >
        {channel === "email" ? (
          <>
            <strong className={dark ? "text-white" : "text-ink"}>
              {locale === "bn" ? "ধন্যবাদ — ইনবক্স চেক করুন।" : "Got it — check your inbox to confirm."}
            </strong>
            <p className={`mt-1 text-xs ${dark ? "text-white/65" : "text-ink/55"}`}>
              {locale === "bn"
                ? "কনফার্ম করার পরে আপনি ডাইজেস্ট পাওয়া শুরু করবেন।"
                : "Once you click the link, you'll start receiving the digest."}
            </p>
          </>
        ) : (
          <>
            <strong className={dark ? "text-white" : "text-ink"}>
              {locale === "bn" ? "নম্বর পেয়েছি — শীঘ্রই WhatsApp করব।" : "Got your number — we'll WhatsApp you shortly."}
            </strong>
            <p className={`mt-1 text-xs ${dark ? "text-white/65" : "text-ink/55"}`}>
              {locale === "bn" ? "শনি-বৃহস্পতি, ০৯:০০–২১:০০ BD।" : "Sat–Thu, 09:00–21:00 BD."}
            </p>
          </>
        )}
      </div>
    );
  }

  const inputBase = `form-input ${dark ? "bg-paper text-ink placeholder:text-ink/40" : ""}`;

  return (
    <form onSubmit={submit} className="w-full" aria-label={`Lead capture ${context}`}>
      {/* Honeypot — visually hidden, never receives autofill */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
      />

      {!hideChannelTabs && (
        <div className={`mb-3 inline-flex rounded-full p-1 text-[11px] font-bold uppercase tracking-wider ${dark ? "bg-white/10" : "bg-ink/5"}`}>
          {(["email", "phone"] as const).map((c) => {
            const active = channel === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setChannel(c)}
                aria-pressed={active}
                className={`rounded-full px-3 py-1 transition ${
                  active
                    ? dark
                      ? "bg-white text-ink"
                      : "bg-ink text-paper"
                    : dark
                    ? "text-white/70 hover:text-white"
                    : "text-ink/70 hover:text-ink"
                }`}
              >
                {c === "email" ? t.tabEmail : t.tabPhone}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex w-full flex-col gap-2 sm:flex-row">
        {channel === "email" ? (
          <>
            <label htmlFor={`lc-email-${context}`} className="sr-only">
              {t.tabEmail}
            </label>
            <input
              id={`lc-email-${context}`}
              type="email"
              required
              inputMode="email"
              autoComplete="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputBase} flex-1`}
              aria-invalid={state === "err" ? "true" : "false"}
              aria-describedby={state === "err" ? `lc-err-${context}` : undefined}
            />
          </>
        ) : (
          <>
            <label htmlFor={`lc-phone-${context}`} className="sr-only">
              {t.tabPhone}
            </label>
            <input
              id={`lc-phone-${context}`}
              type="tel"
              required
              inputMode="tel"
              autoComplete="tel"
              placeholder={t.phonePlaceholder}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`${inputBase} flex-1`}
              aria-invalid={state === "err" ? "true" : "false"}
              aria-describedby={state === "err" ? `lc-err-${context}` : undefined}
            />
          </>
        )}
        <button
          type="submit"
          className="btn btn-orange whitespace-nowrap"
          disabled={pending}
        >
          {pending ? "…" : t.cta}
          {!pending && <ArrowRight className="h-4 w-4" aria-hidden />}
        </button>
      </div>

      {channel === "phone" && (
        <label className={`mt-3 flex items-start gap-2 text-[11px] ${dark ? "text-white/70" : "text-ink/65"}`}>
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5"
          />
          <span>{t.consentPhone}</span>
        </label>
      )}

      <p className={`mt-2 text-[11px] ${dark ? "text-white/55" : "text-ink/45"}`}>
        {channel === "email" ? t.consentEmail : t.consentPhone}
      </p>

      {state === "err" && (
        <p
          id={`lc-err-${context}`}
          className={`mt-2 text-xs ${dark ? "text-white/70" : "text-red-600"}`}
          role="alert"
        >
          {locale === "bn"
            ? "কিছু সমস্যা হয়েছে — আবার চেষ্টা করুন।"
            : "Something went wrong — try again."}
        </p>
      )}
    </form>
  );
}
