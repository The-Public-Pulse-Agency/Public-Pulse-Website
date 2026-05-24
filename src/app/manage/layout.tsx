import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ensureAdminUser } from "@/lib/admin-bootstrap";

// /manage is fully dynamic and never cached. Set noindex headers + cache-
// control via Next's metadata + the route segment config.

export const metadata: Metadata = {
  title: "Manage — Public Pulse Agency",
  robots: { index: false, follow: false, nocache: true },
  other: {
    "x-robots-tag": "noindex, nofollow, noarchive, nosnippet",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Lazy bootstrap the single admin user from SSM creds.
  await ensureAdminUser();

  const session = await auth.api.getSession({ headers: await headers() });

  // /manage/sign-in is the only public sub-route — handled below via
  // pathname check (since layouts wrap their children).
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-pathname") ?? requestHeaders.get("x-invoke-path") ?? "";
  const isSignIn = pathname.endsWith("/manage/sign-in") || pathname.endsWith("/manage/sign-in/");

  if (!session && !isSignIn) {
    redirect("/manage/sign-in");
  }
  if (session && isSignIn) {
    redirect("/manage/leads");
  }

  return (
    <div className="min-h-screen bg-surface-alt">
      {session && (
        <header className="border-b border-slate-200 bg-white">
          <div className="max-w-container mx-auto flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-6">
              <span className="font-serif text-lg font-medium text-brand-navy">
                Manage
              </span>
              <nav aria-label="Admin">
                <ul className="flex items-center gap-5 text-sm font-medium text-slate-700">
                  <li><Link href="/manage/leads" className="hover:text-brand-red">Leads</Link></li>
                  <li><Link href="/manage/case-studies" className="hover:text-brand-red">Case studies</Link></li>
                </ul>
              </nav>
            </div>
            <form action="/api/auth/sign-out" method="post">
              <button type="submit" className="text-sm font-medium text-slate-600 hover:text-brand-red">
                Sign out
              </button>
            </form>
          </div>
        </header>
      )}
      <div className="max-w-container mx-auto px-6 py-12">{children}</div>
    </div>
  );
}
