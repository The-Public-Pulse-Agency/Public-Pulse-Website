// BetterAuth — single-admin email+password setup.
//
// Why this is minimal:
//   • There's exactly one admin (the agency owner). No signup flow, no role
//     hierarchy, no SSO. BetterAuth + email/password is overkill until we
//     have a real team, but matches TenderPulse parity.
//   • The admin user is bootstrapped from ADMIN_EMAIL + ADMIN_PASSWORD_HASH
//     (bcrypt) read from SSM at cold start. We never store plaintext.
//   • Sessions live in Postgres (BetterAuth's session table — see schema.ts).

import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/client";

const baseURL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-only-insecure-secret",
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    // Disable signup — the only admin is provisioned via the bootstrap script.
    // Public signup must NEVER be enabled on /manage.
    disableSignUp: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh once per day on activity
    cookieCache: { enabled: true, maxAge: 5 * 60 }, // 5min server-side cache to skip a DB hit on each request
  },
});

export type Session = typeof auth.$Infer.Session;
