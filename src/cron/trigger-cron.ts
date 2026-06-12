// Generic cron-trigger Lambda. EventBridge fires; this Lambda makes an
// authenticated HTTP call into the Next runtime where Drizzle + email + etc.
// live. One Lambda function handler per cron; URL is set per-cron via env.
//
// Used by: auto-publish, lead-maintenance, welcome-drip crons. The original
// /api/cron/digest cron still uses trigger-digest.ts (kept for backcompat).

function bearerSecret(): string {
  return process.env.SST_RESOURCE_CRON_SECRET ?? process.env.CRON_SECRET ?? "";
}

async function fire(envVar: string, label: string) {
  const url = process.env[envVar];
  if (!url) {
    console.error(`[cron] ${envVar} not set`);
    return { ok: false };
  }
  const secret = bearerSecret();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { ...(secret ? { Authorization: `Bearer ${secret}` } : {}) },
    });
    const body = await res.text();
    console.log(`[cron:${label}]`, res.status, body.slice(0, 500));
    return { ok: res.ok, status: res.status, body: body.slice(0, 500) };
  } catch (err) {
    console.error(`[cron:${label}] error`, err);
    return { ok: false };
  }
}

export const autoPublish = () => fire("AUTO_PUBLISH_URL", "auto-publish");
export const leadMaintenance = () => fire("LEAD_MAINTENANCE_URL", "lead-maintenance");
export const welcomeDrip = () => fire("WELCOME_DRIP_URL", "welcome-drip");
