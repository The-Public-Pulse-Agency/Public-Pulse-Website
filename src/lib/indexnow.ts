// IndexNow ping helper. Called from /manage publish actions so search
// engines (Bing, Yandex, Seznam, etc.) re-crawl freshly published or
// updated URLs without waiting for crawl-budget cycles.
//
// Key file lives at /<INDEXNOW_KEY>.txt and contains the key as text.
// Both filename and content MUST match.
//
// Best-effort: failures are logged but never block the publish path.

import { SITE } from "./site";

export const INDEXNOW_KEY = "c8e3a47b9d2f4e6a8b1c5d7e9f0a2b4c";
export const INDEXNOW_KEY_LOCATION = `${SITE.url}/${INDEXNOW_KEY}.txt`;

/** Submit one or more freshly published / updated URLs to IndexNow. */
export async function pingIndexNow(
  urlList: string[],
  opts: { host?: string } = {}
): Promise<{ ok: boolean; status?: number; error?: string }> {
  if (urlList.length === 0) return { ok: true };

  const host = opts.host ?? new URL(SITE.url).host;
  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: urlList.filter((u) => u.startsWith("http")),
  };

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.warn("[indexnow] non-2xx response", { status: res.status, urls: urlList });
      return { ok: false, status: res.status };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    console.warn("[indexnow] request failed", err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
