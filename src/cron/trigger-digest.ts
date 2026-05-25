// Tiny Lambda that EventBridge fires bi-weekly. Calls the Next route
// /api/cron/digest with the CRON_SECRET — keeps actual digest logic inside
// the Next runtime where Drizzle + react-email + Resend already live.
//
// CRON_SECRET is delivered via SST `link: [CRON_SECRET]` and exposed at
// runtime as SST_RESOURCE_CRON_SECRET (the env-binding format SST uses for
// linked secrets). The fallback to process.env.CRON_SECRET supports local
// `tsx scripts/trigger-digest.ts` invocations.

export async function handler(): Promise<{ ok: boolean; status?: number; body?: string }> {
  const url = process.env.DIGEST_URL;
  if (!url) {
    console.error("[trigger-digest] DIGEST_URL not set");
    return { ok: false };
  }
  const secret =
    process.env.SST_RESOURCE_CRON_SECRET ?? process.env.CRON_SECRET ?? "";
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
      },
    });
    const body = await res.text();
    console.log("[trigger-digest]", res.status, body.slice(0, 500));
    return { ok: res.ok, status: res.status, body: body.slice(0, 500) };
  } catch (err) {
    console.error("[trigger-digest] error", err);
    return { ok: false };
  }
}
