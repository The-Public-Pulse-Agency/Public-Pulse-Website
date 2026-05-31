"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { facebookConnections } from "@/db/schema";
import { debugToken, subscribePageWebhooks } from "@/lib/facebook-graph";

export async function selectPageAction(formData: FormData): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/manage/sign-in");

  const pageId = String(formData.get("pageId") ?? "");
  const pageName = String(formData.get("pageName") ?? "");
  const pageAccessToken = String(formData.get("pageAccessToken") ?? "");
  const userToken = String(formData.get("userToken") ?? "");

  if (!pageId || !pageName || !pageAccessToken) {
    redirect("/manage/connect/facebook?error=missing+page+fields");
  }

  // Verify the user token + grab the granted scopes (so we can detect
  // missing permissions in the UI later).
  let scopesGranted: string[] = [];
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.MESSENGER_APP_SECRET;
  if (appId && appSecret && !appSecret.startsWith("PENDING_")) {
    const appAccessToken = `${appId}|${appSecret}`;
    const debugResult = await debugToken(userToken, appAccessToken);
    if (debugResult.ok && Array.isArray(debugResult.data.data.scopes)) {
      scopesGranted = debugResult.data.data.scopes;
    }
  }

  // Subscribe the Page to the webhook fields we care about. Best-effort —
  // failure is recorded but doesn't block the connection (admin can retry
  // from /manage/connect/facebook).
  let webhookSubscribed = false;
  const subResult = await subscribePageWebhooks(pageId, pageAccessToken);
  if (subResult.ok) webhookSubscribed = true;
  else console.warn("[fb-connect] webhook subscribe failed:", subResult.error);

  // Upsert the connection row (active=true, replaces any previous for
  // this user×page).
  const existing = await db
    .select()
    .from(facebookConnections)
    .where(and(eq(facebookConnections.userId, session.user.id), eq(facebookConnections.pageId, pageId)))
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
      pageId,
      pageName,
      pageAccessToken,
      userAccessToken: userToken,
      scopesGranted,
      webhookSubscribed,
      active: true,
    });
  }

  // Soft-disable any OTHER active connections for this user (only one Page
  // active at a time — matches Meta App Review's single-Page narrative).
  await db
    .update(facebookConnections)
    .set({ active: false, revokedAt: new Date() })
    .where(
      and(
        eq(facebookConnections.userId, session.user.id),
        eq(facebookConnections.active, true)
      )
    );
  // Re-activate the one we just chose (the previous query disabled it too).
  await db
    .update(facebookConnections)
    .set({ active: true, revokedAt: null })
    .where(
      and(
        eq(facebookConnections.userId, session.user.id),
        eq(facebookConnections.pageId, pageId)
      )
    );

  const cookieJar = await cookies();
  cookieJar.delete("fb_oauth_pending");

  revalidatePath("/manage/connect/facebook");
  revalidatePath("/manage/messenger");
  revalidatePath("/manage/page-insights");
  redirect("/manage/connect/facebook?connected=1");
}
