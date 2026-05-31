"use server";

// SECURITY:
//  • We DO NOT trust pageAccessToken or userToken posted from the client
//    form. A logged-in admin could otherwise craft a request that
//    persists ANY token (e.g. stolen from another admin's OAuth flow or
//    fabricated from a sandbox app) into our facebook_connections table,
//    effectively binding our system to a Page they don't own
//    (confused-deputy + token-substitution).
//
//  • The ONLY thing we accept from the form is `pageId` (a public ID
//    that's safe to pass through user input).
//
//  • We re-read the OAuth `fb_oauth_pending` cookie inside this action,
//    verify the submitted pageId is one we offered, then use the
//    access_token Meta itself returned for that pageId in /me/accounts.
//    That token is server-generated, never round-tripped through the
//    client.
//
//  • We additionally call /debug_token to confirm the resolved Page
//    Access Token (a) belongs to OUR App and (b) is of type=PAGE before
//    persisting. Rejects the request if either check fails.

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, and, ne } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { facebookConnections } from "@/db/schema";
import { debugToken, subscribePageWebhooks } from "@/lib/facebook-graph";

type PendingPage = {
  id: string;
  name: string;
  access_token: string;
  tasks: string[];
};

type PendingPayload = {
  userToken: string;
  pages: PendingPage[];
  expiresAt: number;
};

function fail(reason: string): never {
  redirect(`/manage/connect/facebook?error=${encodeURIComponent(reason)}`);
}

export async function selectPageAction(formData: FormData): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/manage/sign-in");

  // ── 1. Read submitted pageId ONLY. Ignore any token fields in the form. ──
  const submittedPageId = String(formData.get("pageId") ?? "").trim();
  if (!submittedPageId || !/^\d+$/.test(submittedPageId)) {
    fail("missing or malformed pageId");
  }

  // ── 2. Reload the OAuth pending payload from the httpOnly cookie. ──
  const cookieJar = await cookies();
  const raw = cookieJar.get("fb_oauth_pending")?.value;
  if (!raw) fail("oauth session expired — please re-connect");

  let pending: PendingPayload;
  try {
    pending = JSON.parse(Buffer.from(raw!, "base64").toString("utf8")) as PendingPayload;
  } catch {
    fail("oauth payload corrupted — please re-connect");
  }
  if (!pending || pending.expiresAt < Date.now()) {
    cookieJar.delete("fb_oauth_pending");
    fail("oauth payload expired — please re-connect");
  }

  // ── 3. Verify the submitted pageId is one we offered this admin. ──
  const matched = pending.pages.find((p) => p.id === submittedPageId);
  if (!matched) {
    fail("submitted pageId is not in the offered set — please re-connect");
  }

  // ── 4. Use the server-recorded token, NOT anything from the form. ──
  const pageAccessToken = matched.access_token;
  const pageName = matched.name;
  const userToken = pending.userToken;

  // ── 5. Validate the resolved Page Access Token belongs to OUR App
  //       and is genuinely a PAGE token (not a USER or APP token). ──
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.MESSENGER_APP_SECRET;
  if (!appId || !appSecret) {
    fail("FACEBOOK_APP_ID / MESSENGER_APP_SECRET not configured");
  }
  if (appSecret!.startsWith("PENDING_")) {
    fail("MESSENGER_APP_SECRET is still the placeholder — set the real value via sst secret set");
  }
  const appAccessToken = `${appId}|${appSecret}`;

  const pageDebug = await debugToken(pageAccessToken, appAccessToken);
  if (!pageDebug.ok) {
    fail(`could not validate page token: ${pageDebug.error}`);
  }
  if (pageDebug.data.data.app_id !== appId) {
    fail("page token does not belong to this app");
  }
  if (pageDebug.data.data.type !== "PAGE") {
    fail(`expected PAGE token, got ${pageDebug.data.data.type}`);
  }

  // Pull the granted scopes off the USER token (debug the user token
  // separately — page tokens carry no scope list).
  let scopesGranted: string[] = [];
  const userDebug = await debugToken(userToken, appAccessToken);
  if (userDebug.ok) {
    scopesGranted = userDebug.data.data.scopes ?? [];
    if (userDebug.data.data.app_id !== appId) {
      fail("user token does not belong to this app");
    }
  }

  // ── 6. Subscribe the Page to the webhook fields we care about.
  //       Best-effort — failure is recorded, admin can retry. ──
  let webhookSubscribed = false;
  const subResult = await subscribePageWebhooks(submittedPageId, pageAccessToken);
  if (subResult.ok) webhookSubscribed = true;
  else console.warn("[fb-connect] webhook subscribe failed:", subResult.error);

  // ── 7. Persist. Upsert keyed on (userId, pageId).  ──
  const existing = await db
    .select()
    .from(facebookConnections)
    .where(
      and(
        eq(facebookConnections.userId, session.user.id),
        eq(facebookConnections.pageId, submittedPageId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(facebookConnections)
      .set({
        pageName,
        pageAccessToken,
        userAccessToken: userToken,
        scopesGranted,
        webhookSubscribed,
        active: true,
        revokedAt: null,
        connectedAt: new Date(),
      })
      .where(eq(facebookConnections.id, existing[0].id));
  } else {
    await db.insert(facebookConnections).values({
      userId: session.user.id,
      pageId: submittedPageId,
      pageName,
      pageAccessToken,
      userAccessToken: userToken,
      scopesGranted,
      webhookSubscribed,
      active: true,
    });
  }

  // ── 8. Soft-disable any OTHER active connections this admin had.
  //       Single Page active per admin at a time. ──
  await db
    .update(facebookConnections)
    .set({ active: false, revokedAt: new Date() })
    .where(
      and(
        eq(facebookConnections.userId, session.user.id),
        eq(facebookConnections.active, true),
        ne(facebookConnections.pageId, submittedPageId)
      )
    );

  cookieJar.delete("fb_oauth_pending");

  revalidatePath("/manage/connect/facebook");
  revalidatePath("/manage/messenger");
  revalidatePath("/manage/page-insights");
  redirect("/manage/connect/facebook?connected=1");
}
