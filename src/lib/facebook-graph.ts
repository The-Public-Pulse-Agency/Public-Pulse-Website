// Facebook Graph API client + token resolution.
//
// Token source priority (per call):
//   1. The active facebook_connections row (DB-stored, set by /manage/connect/facebook)
//   2. process.env.MESSENGER_PAGE_ACCESS_TOKEN (SST secret fallback)
//
// All calls go through fetch — no Meta SDK dependency. Timeouts enforced
// per call so a slow Graph API doesn't tie up a Lambda. Errors logged but
// not thrown (caller decides how to handle).

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { facebookConnections } from "@/db/schema";

export const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export type ActivePageToken = {
  pageId: string;
  pageName: string;
  accessToken: string;
  /** "db" when sourced from facebook_connections; "env" when from SST secret. */
  source: "db" | "env";
};

/** Pull the active page access token.
 *
 *  SECURITY: `userId` is REQUIRED for DB lookups — we will only ever
 *  return a Page Access Token that was OAuth-granted by the requesting
 *  admin themselves. Passing `null` skips the DB lookup entirely and
 *  only considers the env fallback — used for system contexts (e.g.
 *  cron jobs, the webhook receiver) where no user session exists.
 *
 *  Why this matters: even though the app is operationally single-tenant
 *  today (one admin), a second admin in the future could otherwise have
 *  their server-side calls silently use someone else's Page token. */
export async function getActivePageToken(
  userId: string | null
): Promise<ActivePageToken | null> {
  if (userId) {
    try {
      const [row] = await db
        .select()
        .from(facebookConnections)
        .where(
          and(
            eq(facebookConnections.active, true),
            eq(facebookConnections.userId, userId)
          )
        )
        .orderBy(desc(facebookConnections.connectedAt))
        .limit(1);
      if (row?.pageAccessToken) {
        return {
          pageId: row.pageId,
          pageName: row.pageName,
          accessToken: row.pageAccessToken,
          source: "db",
        };
      }
    } catch (e) {
      console.warn("[graph] DB token lookup failed", e instanceof Error ? e.message : e);
    }
  }
  // Env fallback — only present when no real OAuth connection exists.
  // Migration path from the SST-secret approach; kept for the single
  // operational page until the user completes /manage/connect/facebook.
  const envToken = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
  if (envToken && envToken.length > 50 && !envToken.startsWith("PENDING_")) {
    return {
      pageId: process.env.FACEBOOK_PAGE_ID || "832733213259113",
      pageName: "Public Pulse Agency",
      accessToken: envToken,
      source: "env",
    };
  }
  return null;
}

/** Get the connection row for a specific BetterAuth user (UI display). */
export async function getConnectionForUser(userId: string) {
  const [row] = await db
    .select()
    .from(facebookConnections)
    .where(and(eq(facebookConnections.userId, userId), eq(facebookConnections.active, true)))
    .orderBy(desc(facebookConnections.connectedAt))
    .limit(1);
  return row ?? null;
}

// ─── Generic Graph fetch ────────────────────────────────────────────────

type GraphResponse<T> = T & { error?: { message?: string; code?: number; type?: string } };

export async function graphGet<T = unknown>(
  path: string,
  accessToken: string,
  params: Record<string, string | number | undefined> = {},
  timeoutMs = 5000
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const url = new URL(`${GRAPH_BASE}${path.startsWith("/") ? path : `/${path}`}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  url.searchParams.set("access_token", accessToken);
  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(timeoutMs) });
    const json = (await res.json().catch(() => ({}))) as GraphResponse<T>;
    if (!res.ok || json.error) {
      const msg = json.error?.message ?? `HTTP ${res.status}`;
      return { ok: false, error: msg };
    }
    return { ok: true, data: json as T };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "fetch error" };
  }
}

export async function graphPost<T = unknown>(
  path: string,
  accessToken: string,
  body: Record<string, unknown>,
  timeoutMs = 5000
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const url = new URL(`${GRAPH_BASE}${path.startsWith("/") ? path : `/${path}`}`);
  url.searchParams.set("access_token", accessToken);
  try {
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const json = (await res.json().catch(() => ({}))) as GraphResponse<T>;
    if (!res.ok || json.error) {
      return { ok: false, error: json.error?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true, data: json as T };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "fetch error" };
  }
}

// ─── Convenience: page profile, posts, insights ─────────────────────────

export type PagePost = {
  id: string;
  message?: string;
  created_time: string;
  permalink_url?: string;
  full_picture?: string;
  reactions?: { summary: { total_count: number } };
  comments?: { summary: { total_count: number } };
  shares?: { count: number };
};

export async function fetchRecentPagePosts(
  pageId: string,
  accessToken: string,
  limit = 10
) {
  return graphGet<{ data: PagePost[] }>(
    `/${pageId}/posts`,
    accessToken,
    {
      fields:
        "id,message,created_time,permalink_url,full_picture,reactions.summary(true),comments.summary(true),shares",
      limit,
    }
  );
}

export type PageInsightsValue = { end_time: string; value: number };
export type PageInsightMetric = {
  name: string;
  period: string;
  title: string;
  description: string;
  values: PageInsightsValue[];
};

export async function fetchPageInsights(
  pageId: string,
  accessToken: string,
  metrics: string[] = ["page_impressions", "page_post_engagements", "page_views_total"],
  period: "day" | "week" | "days_28" = "day"
) {
  return graphGet<{ data: PageInsightMetric[] }>(
    `/${pageId}/insights`,
    accessToken,
    {
      metric: metrics.join(","),
      period,
    }
  );
}

// ─── User-token OAuth helpers (for /api/facebook/oauth) ────────────────

/** Exchange a short-lived user OAuth code for a long-lived user access token. */
export async function exchangeCodeForUserToken(
  code: string,
  redirectUri: string,
  appId: string,
  appSecret: string
): Promise<{ ok: true; userToken: string; expiresIn?: number } | { ok: false; error: string }> {
  const r = await graphGet<{ access_token: string; expires_in?: number }>(
    "/oauth/access_token",
    "", // no auth — pass app creds as params
    {
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    }
  );
  if (!r.ok) return r;
  if (!r.data.access_token) return { ok: false, error: "missing access_token in response" };
  // Upgrade to long-lived
  const lived = await graphGet<{ access_token: string; expires_in?: number }>(
    "/oauth/access_token",
    "",
    {
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: r.data.access_token,
    }
  );
  if (!lived.ok) return { ok: true, userToken: r.data.access_token };
  return { ok: true, userToken: lived.data.access_token, expiresIn: lived.data.expires_in };
}

/** List the Pages this user manages (one item per Page with its own access_token). */
export async function fetchUserPages(userToken: string) {
  return graphGet<{
    data: Array<{
      id: string;
      name: string;
      access_token: string;
      category?: string;
      tasks?: string[];
    }>;
  }>("/me/accounts", userToken, { fields: "id,name,access_token,category,tasks", limit: 100 });
}

/** Subscribe the Page to the webhook fields we need. */
export async function subscribePageWebhooks(
  pageId: string,
  pageAccessToken: string,
  fields: string[] = [
    "messages",
    "messaging_postbacks",
    "messaging_optins",
    "message_deliveries",
    "message_reads",
  ]
) {
  return graphPost<{ success: boolean }>(
    `/${pageId}/subscribed_apps`,
    pageAccessToken,
    { subscribed_fields: fields.join(",") }
  );
}

/** Inspect token (debug) — returns scopes, user_id, expires_at. */
export async function debugToken(token: string, appAccessToken: string) {
  return graphGet<{
    data: {
      app_id: string;
      type: string;
      user_id?: string;
      scopes?: string[];
      expires_at?: number;
    };
  }>("/debug_token", appAccessToken, { input_token: token });
}
