"use client";

import { type ReactNode } from "react";

// Tiny reusable client component for destructive admin actions.
// Wraps a server-action form and intercepts submit with window.confirm().
// Cancels submission if the admin clicks Cancel — server action never fires.

type Props = {
  action: (fd: FormData) => void | Promise<void>;
  confirmMessage: string;
  className?: string;
  children: ReactNode;
  hiddenFields?: Record<string, string>;
};

export function ConfirmButton({
  action,
  confirmMessage,
  className = "",
  children,
  hiddenFields,
}: Props) {
  return (
    <form
      action={async (fd) => {
        if (!window.confirm(confirmMessage)) return;
        await action(fd);
      }}
    >
      {hiddenFields &&
        Object.entries(hiddenFields).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
