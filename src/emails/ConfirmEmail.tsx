// ConfirmEmail — sent after /api/newsletter receives an opt-in.
// Single, oversized CTA. No unsubscribe link (the row isn't an active
// subscriber yet; until they confirm, they aren't on the list).

import { Heading, Section, Text } from "@react-email/components";

import { BrandShell, BulletproofButton, C, FONT_DISPLAY, FONT_STACK, VGap } from "./_brand";
import { SITE } from "@/lib/site";

export type ConfirmEmailProps = {
  email: string;
  confirmUrl: string;
  locale?: "en" | "bn";
};

const COPY = {
  en: {
    preheader: "One click to start your Public Pulse subscription.",
    eyebrow: "Confirm subscription",
    headline: "Confirm to start receiving the Pulse Digest.",
    intro:
      "You asked to subscribe at publicpulse.com.bd — confirm below and you’ll start receiving our bi-weekly digest of playbooks for the Bangladesh market: paid, social, PR, SEO. No vanity metrics.",
    cta: "Confirm subscription",
    afterCta:
      "If you didn’t request this, you can safely ignore — no email will be sent until you confirm.",
  },
  bn: {
    preheader: "এক ক্লিকে আপনার পাবলিক পালস সাবস্ক্রিপশন শুরু করুন।",
    eyebrow: "সাবস্ক্রিপশন নিশ্চিত করুন",
    headline: "পালস ডাইজেস্ট পেতে নিশ্চিত করুন।",
    intro:
      "আপনি publicpulse.com.bd থেকে সাবস্ক্রাইব করেছেন — নিচে কনফার্ম করলেই বাংলাদেশ বাজারের জন্য আমাদের দ্বি-সাপ্তাহিক প্লেবুক পেতে শুরু করবেন: পেইড, সোশ্যাল, পিআর, এসইও। কোনো ভ্যানিটি মেট্রিক নয়।",
    cta: "সাবস্ক্রিপশন নিশ্চিত করুন",
    afterCta:
      "যদি আপনি এই অনুরোধ না করে থাকেন, এটি উপেক্ষা করতে পারেন — যতক্ষণ না আপনি কনফার্ম করছেন, কোনো ইমেল পাঠানো হবে না।",
  },
} as const;

export default function ConfirmEmail({
  email,
  confirmUrl,
  locale = "en",
}: ConfirmEmailProps) {
  const t = COPY[locale];
  return (
    <BrandShell preheader={t.preheader}>
      <Text
        style={{
          margin: 0,
          fontFamily: FONT_STACK,
          fontSize: "11px",
          color: C.red,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        {t.eyebrow}
      </Text>
      <VGap h={14} />
      <Heading
        as="h1"
        style={{
          margin: 0,
          fontFamily: FONT_DISPLAY,
          fontWeight: 900,
          fontSize: "32px",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          color: C.ink,
        }}
      >
        {t.headline}
      </Heading>
      <VGap h={20} />
      <Text
        style={{
          margin: 0,
          fontFamily: FONT_STACK,
          fontSize: "16px",
          lineHeight: 1.65,
          color: "#374151",
        }}
      >
        {t.intro}
      </Text>
      <VGap h={28} />

      <Section style={{ textAlign: "center" as const }}>
        <BulletproofButton href={confirmUrl} label={t.cta} />
      </Section>
      <VGap h={20} />
      <Text
        style={{
          margin: 0,
          fontFamily: FONT_STACK,
          fontSize: "13px",
          lineHeight: 1.6,
          color: "#6B7280",
          textAlign: "center" as const,
        }}
      >
        {t.afterCta}
      </Text>
      <VGap h={28} />
      <Text
        style={{
          margin: 0,
          fontFamily: FONT_STACK,
          fontSize: "11px",
          color: "#9AA3B2",
          textAlign: "center" as const,
        }}
      >
        Sent to {email} · {SITE.url}
      </Text>
    </BrandShell>
  );
}
