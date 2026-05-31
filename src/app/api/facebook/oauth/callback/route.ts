// Facebook OAuth callback. Exchanges the auth code for a user access token,
// upgrades it to long-lived, then redirects the admin to a page-selection
// screen (we don't auto-pick a page — admin must explicitly choose).

import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

import { auth } from "@/lib/auth";
import { SITE } from "@/lib/site";
import { exchangeCodeForUserToken, fetchUserPages } from "@/lib/facebook-graph";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.redirect(`${SITE.url}/manage/sign-in`);
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  if (error) {
    return NextResponse.redirect(
      `${SITE.url}/manage/connect/facebook?error=${encodeURIComponent(errorDescription || error)}`
    );
  }
  if (!code || !state) {
    return NextResponse.redirect(
      `${SITE.url}/manage/connect/facebook?error=${encodeURIComponent("missing code or state")}`
    );
  }

  const cookieJar = await cookies();
  const expectedState = cookieJar.get("fb_oauth_state")?.value;
  if (!expectedState || expectedState !== state) {
    return NextResponse.redirect(
      `${SITE.url}/manage/connect/facebook?error=${encodeURIComponent("invalid state (csrf)")}`
    );
  }
  cookieJar.delete("fb_oauth_state");

  const appId = process.env.FACEBOOK_APP_ID;
  // We reuse MESSENGER_APP_SECRET — it's the same Facebook App Secret used
  // for HMAC-verifying inbound webhooks. One secret, one app.
  const appSecret = process.env.MESSENGER_APP_SECRET;
  if (!appId || !appSecret) {
    return NextResponse.redirect(
      `${SITE.url}/manage/connect/facebook?error=${encodeURIComponent("FACEBOOK_APP_ID / MESSENGER_APP_SECRET not configured")}`
    );
  }
  if (appSecret.startsWith("PENDING_")) {
    return NextResponse.redirect(
      `${SITE.url}/manage/connect/facebook?error=${encodeURIComponent("MESSENGER_APP_SECRET is still the placeholder — set the real value via sst secret set")}`
    );
  }

  const redirectUri = `${SITE.url}/api/facebook/oauth/callback`;
  const tokenResult = await exchangeCodeForUserToken(code, redirectUri, appId, appSecret);
  if (!tokenResult.ok) {
    return NextResponse.redirect(
      `${SITE.url}/manage/connect/facebook?error=${encodeURIComponent(`token exchange failed: ${tokenResult.error}`)}`
    );
  }

  // Pull the admin's Pages and stash on a short-lived cookie. The
  // select-page UI reads it + the admin picks which Page to connect.
  const pagesResult = await fetchUserPages(tokenResult.userToken);
  if (!pagesResult.ok) {
    return NextResponse.redirect(
      `${SITE.url}/manage/connect/facebook?error=${encodeURIComponent(`could not list pages: ${pagesResult.error}`)}`
    );
  }

  // Stash the user token + pages list in a short-lived cookie so the
  // select-page form can finalize without re-entering OAuth. Cookie value
  // is signed cookies aren't built-in here — we use a non-extractable
  // pattern: store under httpOnly + secure cookie, only used by the
  // /manage/connect/facebook/select-page POST handler below.
  const pendingPayload = {
    userToken: tokenResult.userToken,
    pages: pagesResult.data.data.map((p) => ({
      id: p.id,
      name: p.name,
      access_token: p.access_token,
      tasks: p.tasks ?? [],
    })),
    expiresAt: Date.now() + 10 * 60 * 1000,
  };
  cookieJar.set("fb_oauth_pending", Buffer.from(JSON.stringify(pendingPayload)).toString("base64"), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 600,
    path: "/",
  });

  return NextResponse.redirect(`${SITE.url}/manage/connect/facebook/select-page`);
}
