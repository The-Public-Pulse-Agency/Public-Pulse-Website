"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { messengerEvents } from "@/db/schema";
import { sendMessage, markSenderAction } from "@/lib/messenger-send";

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/manage/sign-in");
  return session;
}

const replySchema = z.object({
  senderId: z.string().min(1).max(64),
  text: z.string().min(1).max(2000),
});

export async function replyAction(formData: FormData): Promise<void> {
  await requireSession();
  const parsed = replySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join("; "));
  }
  const { senderId, text } = parsed.data;

  // Send via Graph API
  const sent = await sendMessage({
    recipientPsid: senderId,
    text,
    messagingType: "RESPONSE",
  });
  if (!sent.ok) {
    throw new Error(`Send failed: ${sent.error}`);
  }

  // Record the outbound reply so the inbox UI shows both sides of the convo.
  await db.insert(messengerEvents).values({
    eventType: "outbound_message",
    pageId: null,
    senderId: null, // outbound has no sender from FB's perspective
    recipientId: senderId,
    messageId: sent.messageId,
    text,
    raw: { sent_via: "manage/messenger", message_id: sent.messageId },
    handled: true,
    fbTimestamp: new Date(),
  });

  // Mark the original sender's conversation as handled (touch all unread inbound).
  await db
    .update(messengerEvents)
    .set({ handled: true })
    .where(and(eq(messengerEvents.senderId, senderId), eq(messengerEvents.handled, false)));

  revalidatePath("/manage/messenger");
  revalidatePath(`/manage/messenger/${senderId}`);
}

export async function markHandledAction(senderId: string): Promise<void> {
  await requireSession();
  await db
    .update(messengerEvents)
    .set({ handled: true })
    .where(and(eq(messengerEvents.senderId, senderId), eq(messengerEvents.handled, false)));
  revalidatePath("/manage/messenger");
}

export async function setTypingAction(senderId: string, on: boolean): Promise<void> {
  await requireSession();
  await markSenderAction(senderId, on ? "typing_on" : "typing_off");
}
