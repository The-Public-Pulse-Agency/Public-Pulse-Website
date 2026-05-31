import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { getConnectionForUser } from "@/lib/facebook-graph";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const SCOPES = [
  "pages_show_list",
  "pages_manage_metadata",
  "pages_messaging",
  "pages_messaging_subscriptions",
  "pages_read_engagement",
  "business_management",
];

export default async function ConnectFacebookPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/manage/sign-in");

  const conn = await getConnectionForUser(session.user.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Connect Facebook Page</h1>
      <p className="mt-2 text-sm text-slate-500">
        Link your Public Pulse Agency Facebook Page so the admin can reply to inbound Messenger
        conversations + view Page engagement insights.
      </p>

      {conn ? (
        <section className="mt-8 rounded-2xl border border-emerald-300 bg-emerald-50 p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Currently connected</p>
          <h2 className="mt-2 text-xl font-bold text-emerald-900">{conn.pageName}</h2>
          <dl className="mt-4 grid gap-2 text-sm text-emerald-900 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] uppercase tracking-wider opacity-70">Page ID</dt>
              <dd className="font-mono text-xs">{conn.pageId}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider opacity-70">Connected</dt>
              <dd className="text-xs">{new Date(conn.connectedAt).toLocaleString("en-GB")}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[11px] uppercase tracking-wider opacity-70">Webhook subscription</dt>
              <dd className="text-xs">{conn.webhookSubscribed ? "Active ✓" : "Not subscribed"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[11px] uppercase tracking-wider opacity-70">Granted scopes</dt>
              <dd className="mt-1 flex flex-wrap gap-1">
                {(conn.scopesGranted ?? []).map((s) => (
                  <span key={s} className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-mono">
                    {s}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {/* Plain <a> — NOT next/link. The Link component prefetches as
                an RSC fetch which gets blocked by CORS when the route
                returns a 307 to facebook.com. We need a hard browser
                navigation here, not a client-side router transition. */}
            <a
              href="/api/facebook/oauth/start"
              className="rounded-full border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
            >
              Re-connect / change Page
            </a>
            <Link
              href="/manage/messenger"
              className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Open inbox →
            </Link>
          </div>
        </section>
      ) : (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-700">
            Clicking Connect opens Facebook&rsquo;s permission dialog. You&rsquo;ll be asked to grant:
          </p>
          <ul className="mt-3 grid gap-1.5">
            {SCOPES.map((s) => (
              <li key={s} className="flex items-center gap-2 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
                <code className="font-mono">{s}</code>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-500">
            After granting, you&rsquo;ll select which Page to connect (your account must be an Admin or
            Editor of that Page). The long-lived Page Access Token is stored encrypted in our database.
          </p>
          {/* Plain <a> — see note above. Hard browser navigation required
              because the /api/facebook/oauth/start route 307s to facebook.com. */}
          <a
            href="/api/facebook/oauth/start"
            className="mt-6 inline-flex items-center rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Connect Facebook Page →
          </a>
        </section>
      )}

      <p className="mt-6 text-[11px] text-slate-500">
        OAuth callback URL: <code className="rounded bg-slate-100 px-1">/api/facebook/oauth/callback</code>
        {" "}· Configure in Meta Dashboard → Facebook Login → Valid OAuth Redirect URIs.
      </p>
    </div>
  );
}
