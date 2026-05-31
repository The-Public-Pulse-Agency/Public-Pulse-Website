// Kick off Facebook OAuth — redirects the admin to Meta's permission dialog.
//
// Requires admin session (BetterAuth). Generates a CSRF-style `state` value
// and stores it in a short-lived cookie that the callback verifies.

import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { randomBytes } from "node:crypto";

import { auth } from "@/lib/auth";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCOPES = [
  "pages_show_list",
  "pages_manage_metadata",
  "pages_messaging",
  "pages_messaging_subscriptions",
  "pages_read_engagement",
  "business_management",
];

export async function GET(): Promise<Response> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.redirect(`${SITE.url}/manage/sign-in`);
  }

  const appId = process.env.FACEBOOK_APP_ID;
  if (!appId) {
    return NextResponse.json(
      { ok: false, error: "FACEBOOK_APP_ID not configured" },
      { status: 500 }
    );
  }

  const state = randomBytes(24).toString("base64url");
  const cookieJar = await cookies();
  cookieJar.set("fb_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 600, // 10 min — enough time for the OAuth dance
    path: "/",
  });

  const redirectUri = `${SITE.url}/api/facebook/oauth/callback`;
  const url = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", SCOPES.join(","));
  url.searchParams.set("state", state);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("auth_type", "rerequest"); // re-prompt for any declined scopes

  return NextResponse.redirect(url.toString());
}
