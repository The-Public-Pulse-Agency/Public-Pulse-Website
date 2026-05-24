// Shared between the React Hook Form on /contact and the server action.
// One Zod schema = one source of truth = client validation and server
// validation never drift.

import { z } from "zod";
import { SERVICES } from "@/lib/services";

const SERVICE_SLUGS = SERVICES.map((s) => s.slug) as [string, ...string[]];

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Please enter your name")
    .max(120, "Name is too long"),
  email: z
    .string()
    .email("Enter a valid email address")
    .max(200),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal("")),
  serviceInterest: z
    .enum([...SERVICE_SLUGS, "not-sure"] as [string, ...string[]])
    .optional(),
  message: z
    .string()
    .min(20, "Tell us a little more — at least 20 characters")
    .max(4000, "Please keep it under 4,000 characters"),
  // Honeypot. Real users never see/fill this; bots fill every field they see.
  // If non-empty on submit, the server silently 200s without writing anything.
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Partial<Record<keyof ContactInput, string>> };
