"use client";

import { useEffect, useRef, useState } from "react";

// Auto-save uncontrolled form values to localStorage on every input change.
// Prompts the admin to restore a draft if a saved snapshot is newer than
// the server-rendered defaults.
//
// Cleared automatically once the form is submitted (caller invokes clear()
// after a successful server action).

export type AutosaveStatus =
  | { state: "idle" }
  | { state: "saving" }
  | { state: "saved"; at: number }
  | { state: "restored"; at: number };

export function useFormAutosave(
  formRef: React.RefObject<HTMLFormElement | null>,
  storageKey: string,
  serverDefaultsSignature: string
) {
  const [status, setStatus] = useState<AutosaveStatus>({ state: "idle" });
  const saveTimer = useRef<number | undefined>(undefined);
  const restored = useRef(false);

  // On mount: check for a saved draft. If the saved-default-signature
  // differs from the server-default (i.e. the row hasn't been updated
  // server-side since we drafted), offer to restore.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    if (restored.current) return;
    restored.current = true;

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const snap = JSON.parse(raw) as { sig: string; at: number; values: Record<string, string> };
      if (snap.sig !== serverDefaultsSignature) return; // server has moved on; drop draft

      const ageMin = (Date.now() - snap.at) / 60000;
      const confirm = window.confirm(
        `Restore your unsaved draft from ${ageMin < 1 ? "<1 min" : `${Math.round(ageMin)} min`} ago?`
      );
      if (!confirm) {
        window.localStorage.removeItem(storageKey);
        return;
      }
      for (const [name, value] of Object.entries(snap.values)) {
        const el = form.elements.namedItem(name);
        // namedItem returns Element | RadioNodeList. Only restore singular
        // elements (skip radio groups; admin forms don't use them).
        if (el && !(el instanceof RadioNodeList) && "value" in el) {
          (el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value = value;
        }
      }
      setStatus({ state: "restored", at: snap.at });
    } catch {
      /* corrupt snapshot — ignore */
    }
  }, [formRef, storageKey, serverDefaultsSignature]);

  // Snapshot on every input event, debounced 800ms.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    function snapshot() {
      const fd = new FormData(form!);
      const values: Record<string, string> = {};
      for (const [k, v] of fd.entries()) {
        if (typeof v === "string") values[k] = v;
      }
      try {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({ sig: serverDefaultsSignature, at: Date.now(), values })
        );
        setStatus({ state: "saved", at: Date.now() });
      } catch {
        /* quota exceeded — ignore */
      }
    }
    function onInput() {
      setStatus({ state: "saving" });
      window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(snapshot, 800);
    }
    form.addEventListener("input", onInput);
    return () => {
      form.removeEventListener("input", onInput);
      window.clearTimeout(saveTimer.current);
    };
  }, [formRef, storageKey, serverDefaultsSignature]);

  function clear() {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    setStatus({ state: "idle" });
  }

  return { status, clear };
}

export function AutosaveBadge({ status }: { status: AutosaveStatus }) {
  if (status.state === "idle") return null;
  let label = "";
  let color = "text-ink/55";
  if (status.state === "saving") {
    label = "Saving…";
    color = "text-ink/55";
  } else if (status.state === "saved") {
    label = "Draft saved locally";
    color = "text-emerald-600";
  } else if (status.state === "restored") {
    label = "Draft restored";
    color = "text-brand-orange";
  }
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${color}`}>
      <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
