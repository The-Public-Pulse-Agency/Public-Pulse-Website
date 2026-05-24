"use client";

// Client-side BetterAuth hooks for the sign-in form. The full server-side
// auth instance lives in src/lib/auth.ts and is NOT imported here.

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL,
});
