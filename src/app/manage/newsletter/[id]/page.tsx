import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { newsletterIssues } from "@/db/schema";
import { sendIssueAction, testSendAction, updateIssueAction } from "../actions";
import { ConfirmButton } from "../../_components/ConfirmButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function IssuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/manage/sign-in");
  const { id } = await params;

  const [issue] = await db
    .select()
    .from(newsletterIssues)
    .where(eq(newsletterIssues.id, id))
    .limit(1);
  if (!issue) notFound();

  const isDraft = issue.status === "draft";

  return (
    <div>
      <Link href="/manage/newsletter" className="text-sm text-brand-orange hover:underline">
        &larr; All issues
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-brand-navy">
        Issue № {String(issue.issueNumber).padStart(2, "0")}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Status: <span className="font-semibold">{issue.status}</span> · Created by {issue.createdBy}
        {issue.sentAt && ` · Sent ${new Date(issue.sentAt).toLocaleString("en-GB")}`}
        {issue.status === "sent" && ` · ${issue.sentCount} sent / ${issue.failedCount} failed`}
      </p>

      <form
        action={async (fd) => {
          "use server";
          await updateIssueAction(id, fd);
        }}
        className="mt-8 grid gap-5 rounded-2xl border border-slate-200 bg-white p-6"
      >
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Subject</label>
          <input
            name="subject"
            defaultValue={issue.subject}
            disabled={!isDraft}
            className="form-input mt-1 w-full"
            maxLength={180}
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Pre-header (hidden snippet)</label>
          <input
            name="preheader"
            defaultValue={issue.preheader}
            disabled={!isDraft}
            className="form-input mt-1 w-full"
            maxLength={160}
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Intro paragraph</label>
          <textarea
            name="intro"
            defaultValue={issue.intro}
            disabled={!isDraft}
            rows={4}
            className="form-input mt-1 w-full"
            maxLength={2000}
          />
        </div>
        {isDraft && (
          <button type="submit" className="ml-auto inline-flex items-center rounded-full bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white">
            Save draft
          </button>
        )}
      </form>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Posts in this issue ({issue.posts.length})</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {issue.posts.map((p, i) => (
            <li key={p.slug} className={`rounded-xl border border-slate-200 bg-slate-50 p-4 ${i === 0 ? "border-brand-orange ring-1 ring-brand-orange" : ""}`}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-brand-orange">
                {i === 0 ? "Featured · " : ""}
                {p.category}
              </div>
              <Link href={p.url} className="mt-1 block font-semibold text-brand-navy hover:underline">
                {p.title}
              </Link>
              <div className="mt-1 text-xs text-slate-600">{p.excerpt}</div>
              <div className="mt-1 text-[10px] text-slate-500">{p.readingTime} min</div>
            </li>
          ))}
        </ul>
      </section>

      {isDraft && (
        <section className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-2">
          <form
            action={async (fd) => {
              "use server";
              await testSendAction(id, fd);
            }}
            className="flex flex-col gap-2"
          >
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Test send</label>
            <div className="flex gap-2">
              <input type="email" name="to" required placeholder="you@example.com" className="form-input flex-1" />
              <button type="submit" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-100">
                Send test
              </button>
            </div>
          </form>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-emerald-700">Send to all confirmed subscribers</label>
            <ConfirmButton
              action={async () => {
                "use server";
                await sendIssueAction(id);
              }}
              confirmMessage={`Send this issue LIVE to ALL confirmed subscribers right now? This cannot be undone — the emails leave Resend immediately.`}
              className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Send live now
            </ConfirmButton>
          </div>
        </section>
      )}
    </div>
  );
}
