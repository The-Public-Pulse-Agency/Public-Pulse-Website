// WelcomeEmail — sent after a subscriber successfully confirms.
// Sets expectations + previews the cadence. Single CTA back to the site.
// Includes unsubscribe link + List-Unsubscribe headers via the send wrapper.

import { Heading, Link, Section, Text } from "@react-email/components";

import { BrandShell, BulletproofButton, C, FONT_DISPLAY, FONT_STACK, VGap } from "./_brand";
import { SITE } from "@/lib/site";

export type WelcomeEmailProps = {
  email: string;
  unsubscribeUrl: string;
  locale?: "en" | "bn";
  siteUrl?: string;
};

const COPY = {
  en: {
    preheader: "You're in. The next Pulse Digest lands in your inbox soon.",
    eyebrow: "You're on the list",
    headline: "Welcome — the playbooks are on their way.",
    intro:
      "You're subscribed. Every two weeks we send a single, no-fluff email: what's actually moving the needle for brands and candidates in Bangladesh right now — paid, social, PR, SEO, AEO. Nothing else.",
    cta: "Read the latest insights",
    promiseLine: "What you'll get",
    bullets: [
      "Bi-weekly. Never spam.",
      "Real playbooks from real Bangladesh campaigns.",
      "Channel experiments — what worked, what didn't, the numbers.",
      "Bonus: occasional one-pagers + free audits.",
    ],
    direct: "Reply to this email any time — it lands in our team inbox.",
  },
  bn: {
    preheader: "আপনি লিস্টে আছেন। পরবর্তী পালস ডাইজেস্ট শীঘ্রই আসছে।",
    eyebrow: "আপনি তালিকায় আছেন",
    headline: "স্বাগতম — প্লেবুকগুলো আসছে।",
    intro:
      "আপনি সাবস্ক্রাইব করেছেন। প্রতি দুই সপ্তাহে আমরা একটি ফোকাসড ইমেল পাঠাবো: এখন বাংলাদেশের ব্র্যান্ড ও ক্যান্ডিডেটদের জন্য কী আসলেই কাজ করছে — পেইড, সোশ্যাল, পিআর, এসইও, এইওই।",
    cta: "সর্বশেষ লেখা পড়ুন",
    promiseLine: "আপনি যা পাবেন",
    bullets: [
      "দ্বি-সাপ্তাহিক। স্প্যাম নয়।",
      "বাংলাদেশের বাস্তব ক্যাম্পেইন থেকে প্লেবুক।",
      "চ্যানেল এক্সপেরিমেন্ট — কী কাজ করেছে, কী হয়নি, এবং সংখ্যা।",
      "বোনাস: অনুরোধে এক-পেজার + ফ্রি অডিট।",
    ],
    direct: "আপনি যে কোনও সময় এই ইমেলে রিপ্লাই দিতে পারেন।",
  },
} as const;

export default function WelcomeEmail({
  email,
  unsubscribeUrl,
  locale = "en",
}: WelcomeEmailProps) {
  const t = COPY[locale];
  return (
    <BrandShell preheader={t.preheader} unsubscribeUrl={unsubscribeUrl}>
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
          fontSize: "34px",
          lineHeight: 1.08,
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
        <BulletproofButton href={`${SITE.url}/blog`} label={t.cta} />
      </Section>
      <VGap h={36} />
      {/* Promises panel */}
      <Section
        style={{
          backgroundColor: C.paperAlt,
          padding: "20px 22px",
          borderLeft: `4px solid ${C.red}`,
        }}
      >
        <Text
          style={{
            margin: 0,
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: "14px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: C.ink,
          }}
        >
          {t.promiseLine}
        </Text>
        <VGap h={10} />
        {t.bullets.map((b, i) => (
          <Text
            key={i}
            style={{
              margin: "0 0 6px 0",
              fontFamily: FONT_STACK,
              fontSize: "14px",
              lineHeight: 1.6,
              color: "#374151",
            }}
          >
            <span style={{ color: C.red, fontWeight: 900, marginRight: 8 }}>{`>`}</span>
            {b}
          </Text>
        ))}
      </Section>
      <VGap h={24} />
      <Text
        style={{
          margin: 0,
          fontFamily: FONT_STACK,
          fontSize: "14px",
          lineHeight: 1.6,
          color: "#374151",
        }}
      >
        {t.direct} —{" "}
        <Link href={`mailto:${SITE.contact.email}`} style={{ color: C.red, fontWeight: 700 }}>
          {SITE.contact.email}
        </Link>
      </Text>
      <VGap h={20} />
      <Text
        style={{
          margin: 0,
          fontFamily: FONT_STACK,
          fontSize: "11px",
          color: "#9AA3B2",
        }}
      >
        Sent to {email}.
      </Text>
    </BrandShell>
  );
}

