// Idempotent admin bootstrap. Runs on first /manage hit (or first sign-in
// attempt) and creates the single admin user from ADMIN_EMAIL + ADMIN_PASSWORD
// if it doesn't exist yet.
//
// Why a bootstrap and not a seed script: we want the secrets read at runtime
// from SSM (not baked into a build artifact), and we want the user creation
// to happen lazily on the deployed Lambda — not on a developer laptop with
// migration access.
//
// IMPORTANT — password algorithm: BetterAuth uses **scrypt** (via node:crypto,
// see @better-auth/utils/password), NOT bcrypt. The plaintext ADMIN_PASSWORD
// is hashed here through BetterAuth's own `hashPassword()` so the format
// matches the verifier the sign-in flow uses. Never substitute another hasher.

import "server-only";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { db } from "@/db/client";
import { account, user } from "@/db/schema";

let bootstrapped = false;

export async function ensureAdminUser(): Promise<void> {
  if (bootstrapped) return;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    // No admin configured — /manage will reject every sign-in but the app
    // doesn't crash. Useful for dev environments without auth.
    bootstrapped = true;
    return;
  }

  const existing = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  if (existing.length > 0) {
    bootstrapped = true;
    return;
  }

  const passwordHash = await hashPassword(password);

  const userId = randomUUID();
  await db.insert(user).values({
    id: userId,
    name: "Admin",
    email,
    emailVerified: true,
  });
  await db.insert(account).values({
    id: randomUUID(),
    accountId: email,
    providerId: "credential",
    userId,
    password: passwordHash, // scrypt via better-auth/crypto — matches signin verifier
  });

  bootstrapped = true;
}
