import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { desc, eq, or } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { messengerEvents } from "@/db/schema";
import { fetchUserProfile } from "@/lib/messenger-send";
import { getActivePageToken } from "@/lib/facebook-graph";
import { replyAction, markHandledAction } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ senderId: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/manage/sign-in");
  const { senderId } = await params;

  // Pull every event involving this PSID (inbound where sender = X, outbound
  // where recipient = X). Newest first for display.
  const events = await db
    .select()
    .from(messengerEvents)
    .where(or(eq(messengerEvents.senderId, senderId), eq(messengerEvents.recipientId, senderId))!)
    .orderBy(desc(messengerEvents.receivedAt))
    .limit(200);

  // Reverse so chat reads top-down chronologically.
  const ordered = [...events].reverse();

  const token = await getActivePageToken();
  const profile = token ? await fetchUserProfile(senderId) : null;
  const displayName =
    profile?.first_name || profile?.last_name
      ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
      : `User ${senderId.slice(0, 8)}…`;

  return (
    <div>
      <Link href="/manage/messenger" className="text-sm text-brand-orange hover:underline">
        &larr; All conversations
      </Link>

      <header className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {profile?.profile_pic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.profile_pic}
              alt=""
              className="h-12 w-12 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-navy text-base font-bold text-white">
              {displayName.slice(0, 1)}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-brand-navy">{displayName}</h1>
            <p className="text-[11px] font-mono text-slate-500">PSID {senderId}</p>
          </div>
        </div>
        <form action={async () => { "use server"; await markHandledAction(senderId); }}>
          <button
            type="submit"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-100"
          >
            Mark all read
          </button>
        </form>
      </header>

      {!token && (
        <p className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          No Page Access Token configured — you can view this conversation but{" "}
          <strong>cannot reply</strong>. <Link href="/manage/connect/facebook" className="underline">Connect a Page →</Link>
        </p>
      )}

      <section className="mt-6 flex h-[60vh] flex-col gap-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
        {ordered.length === 0 ? (
          <p className="text-center text-sm text-slate-500">No messages in this conversation yet.</p>
        ) : (
          ordered.map((e) => {
            const isOutbound = e.eventType === "outbound_message" || (e.recipientId === senderId && !e.senderId);
            return (
              <div
                key={e.id}
                className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-md rounded-2xl px-4 py-2.5 text-sm ${
                    isOutbound
                      ? "bg-brand-navy text-white"
                      : "border border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  {e.text || <em className="opacity-70">[{e.eventType}]</em>}
                  <div
                    className={`mt-1 text-[10px] ${
                      isOutbound ? "text-white/60" : "text-slate-400"
                    }`}
                  >
                    {new Date(e.receivedAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      <form
        action={replyAction}
        className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4"
      >
        <input type="hidden" name="senderId" value={senderId} />
        <label htmlFor="reply-text" className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Reply
        </label>
        <textarea
          id="reply-text"
          name="text"
          required
          rows={3}
          maxLength={2000}
          placeholder="Type your reply…"
          disabled={!token}
          className="form-input w-full resize-y"
        />
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Replies are sent via the Messenger Send API as RESPONSE messages. Must be within 24 hours of
            the user&rsquo;s last inbound message.
          </p>
          <button
            type="submit"
            disabled={!token}
            className="rounded-full bg-brand-orange px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send reply →
          </button>
        </div>
      </form>
    </div>
  );
}
