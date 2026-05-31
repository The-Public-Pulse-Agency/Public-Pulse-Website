import Link from "next/link";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { selectPageAction } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type Pending = {
  userToken: string;
  pages: Array<{ id: string; name: string; access_token: string; tasks: string[] }>;
  expiresAt: number;
};

export default async function SelectPagePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/manage/sign-in");

  const cookieJar = await cookies();
  const raw = cookieJar.get("fb_oauth_pending")?.value;
  if (!raw) redirect("/manage/connect/facebook?error=session+expired");

  let pending: Pending | null = null;
  try {
    pending = JSON.parse(Buffer.from(raw!, "base64").toString("utf8"));
  } catch {
    redirect("/manage/connect/facebook?error=invalid+pending+payload");
  }
  if (!pending || pending.expiresAt < Date.now()) {
    cookieJar.delete("fb_oauth_pending");
    redirect("/manage/connect/facebook?error=pending+expired");
  }

  return (
    <div>
      <Link href="/manage/connect/facebook" className="text-sm text-brand-orange hover:underline">
        &larr; Back
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-brand-navy">Select Facebook Page</h1>
      <p className="mt-2 text-sm text-slate-500">
        Your account manages {pending.pages.length} Page{pending.pages.length === 1 ? "" : "s"}. Pick the
        one to connect.
      </p>

      {pending.pages.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">
          We couldn&rsquo;t find any Pages you have access to. Make sure your Facebook account is an Admin
          or Editor of the Public Pulse Agency Page, then retry.
        </p>
      ) : (
        <ul className="mt-8 grid gap-3">
          {pending.pages.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div>
                <h2 className="text-base font-bold text-brand-navy">{p.name}</h2>
                <p className="font-mono text-[11px] text-slate-500">{p.id}</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Tasks: {(p.tasks ?? []).join(", ") || "(none reported)"}
                </p>
              </div>
              {/* SECURITY: only pageId is submitted. The server action
                  re-reads pageName + access_token + userToken from the
                  fb_oauth_pending httpOnly cookie, then validates via
                  /debug_token. Never trust tokens from the client form. */}
              <form action={selectPageAction}>
                <input type="hidden" name="pageId" value={p.id} />
                <button
                  type="submit"
                  className="rounded-full bg-brand-orange px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  Connect this Page →
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
