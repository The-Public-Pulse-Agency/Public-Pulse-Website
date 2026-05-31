// Outbound Messenger Send API.
// Always reply within Meta's 24-hour standard messaging window unless you
// pass a valid messaging_tag (post-purchase, account update, agent handoff).

import { graphPost, getActivePageToken } from "@/lib/facebook-graph";

export type MessageTag =
  | "POST_PURCHASE_UPDATE"
  | "ACCOUNT_UPDATE"
  | "CONFIRMED_EVENT_UPDATE"
  | "HUMAN_AGENT";

export type SendMessageInput = {
  recipientPsid: string;
  text: string;
  /** Required when sending outside the 24h window. */
  tag?: MessageTag;
  /** "RESPONSE" (default, in 24h window) | "UPDATE" (tagged) | "MESSAGE_TAG". */
  messagingType?: "RESPONSE" | "UPDATE" | "MESSAGE_TAG";
};

export type SendResult =
  | { ok: true; recipientId: string; messageId: string }
  | { ok: false; error: string };

export async function sendMessage(input: SendMessageInput): Promise<SendResult> {
  const token = await getActivePageToken();
  if (!token) {
    return { ok: false, error: "No active page access token (connect a Facebook Page in /manage/connect/facebook or set MESSENGER_PAGE_ACCESS_TOKEN)" };
  }

  const messagingType = input.messagingType ?? (input.tag ? "MESSAGE_TAG" : "RESPONSE");
  const body: Record<string, unknown> = {
    recipient: { id: input.recipientPsid },
    messaging_type: messagingType,
    message: { text: input.text.slice(0, 2000) }, // Meta limit
  };
  if (input.tag) body.tag = input.tag;

  const r = await graphPost<{ recipient_id: string; message_id: string }>(
    `/${token.pageId}/messages`,
    token.accessToken,
    body
  );
  if (!r.ok) return { ok: false, error: r.error };
  return { ok: true, recipientId: r.data.recipient_id, messageId: r.data.message_id };
}

/** Mark a sender's conversation as "seen" (typing indicator off / read receipt). */
export async function markSenderAction(
  recipientPsid: string,
  action: "mark_seen" | "typing_on" | "typing_off"
): Promise<SendResult> {
  const token = await getActivePageToken();
  if (!token) return { ok: false, error: "no page access token" };
  const r = await graphPost<{ recipient_id: string }>(`/${token.pageId}/messages`, token.accessToken, {
    recipient: { id: recipientPsid },
    sender_action: action,
  });
  if (!r.ok) return { ok: false, error: r.error };
  return { ok: true, recipientId: r.data.recipient_id, messageId: "" };
}

/** Fetch a user's basic profile (first/last name, profile pic). */
export async function fetchUserProfile(psid: string) {
  const token = await getActivePageToken();
  if (!token) return null;
  const { graphGet } = await import("@/lib/facebook-graph");
  const result = await graphGet<{
    first_name?: string;
    last_name?: string;
    profile_pic?: string;
    id: string;
  }>(`/${psid}`, token.accessToken, { fields: "first_name,last_name,profile_pic" });
  return result.ok ? result.data : null;
}
