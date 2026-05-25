// DigestEmail — bi-weekly bold, big, branded.
//
// Design choices that matter for inboxes:
//   • 640px container (bigger than the typical 600) — gives display type room
//   • Oversized headline (~38px) in geometric sans, bold
//   • Distinctive oversized issue-number motif in the header band (NOT a
//     generic centered card — looks like a publication)
//   • Featured post: large image + bold title + excerpt + bulletproof RED CTA
//   • "More from the studio" row list (3–5 posts)
//   • Dark-mode aware via color-scheme meta in BrandShell
//   • Hidden preheader controlled by BrandShell's <Preview>

import { Heading, Img, Link, Section, Text } from "@react-email/components";

import {
  BrandShell,
  BulletproofButton,
  C,
  FONT_DISPLAY,
  FONT_STACK,
  VGap,
} from "./_brand";
import type { DigestPostRef } from "@/db/schema";
import { SITE } from "@/lib/site";

export type DigestEmailProps = {
  issueNumber: number;
  preheader: string;
  subject: string;
  intro: string;
  posts: DigestPostRef[];
  email: string;
  unsubscribeUrl: string;
  managePreferencesUrl?: string;
  locale?: "en" | "bn";
};

export default function DigestEmail({
  issueNumber,
  preheader,
  subject,
  intro,
  posts,
  email,
  unsubscribeUrl,
  managePreferencesUrl,
  locale = "en",
}: DigestEmailProps) {
  const featured = posts[0];
  const rest = posts.slice(1, 6);

  const moreLabel = locale === "bn" ? "স্টুডিও থেকে আরও" : "More from the studio";
  const readLabel = locale === "bn" ? "পুরোটা পড়ুন" : "Read the full piece";
  const browseLabel = locale === "bn" ? "সব ইনসাইট দেখুন" : "Browse all insights";

  return (
    <BrandShell
      preheader={preheader}
      issueNumber={issueNumber}
      unsubscribeUrl={unsubscribeUrl}
      managePreferencesUrl={managePreferencesUrl}
    >
      {/* Oversized issue motif + red underline */}
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
        Issue · {new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </Text>
      <VGap h={10} />

      {/* THE BIG HEADLINE — bigger than your average newsletter on purpose. */}
      <Heading
        as="h1"
        style={{
          margin: 0,
          fontFamily: FONT_DISPLAY,
          fontWeight: 900,
          fontSize: "38px",
          lineHeight: 1.05,
          letterSpacing: "-0.025em",
          color: C.ink,
        }}
      >
        {subject}
      </Heading>
      {/* Red underline accent — the brand motif. */}
      <div
        style={{
          marginTop: "16px",
          height: "4px",
          width: "120px",
          backgroundColor: C.red,
          borderRadius: "2px",
        }}
      >
        &nbsp;
      </div>

      <VGap h={22} />
      <Text
        style={{
          margin: 0,
          fontFamily: FONT_STACK,
          fontSize: "17px",
          lineHeight: 1.6,
          color: "#374151",
        }}
      >
        {intro}
      </Text>

      <VGap h={32} />

      {/* ── Featured post ─────────────────────────────────────────── */}
      {featured && (
        <Section
          style={{
            border: `1px solid ${C.hair}`,
            borderRadius: "12px",
            overflow: "hidden",
            backgroundColor: C.paper,
          }}
        >
          {featured.heroUrl && (
            <Img
              src={featured.heroUrl}
              alt={featured.title}
              width="640"
              height="336"
              style={{
                display: "block",
                width: "100%",
                maxWidth: "640px",
                height: "auto",
                objectFit: "cover" as const,
              }}
            />
          )}
          <Section style={{ padding: "22px 22px 26px 22px" }}>
            <Text
              style={{
                margin: 0,
                fontFamily: FONT_STACK,
                fontSize: "11px",
                color: C.red,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 800,
              }}
            >
              Featured · {featured.category}
            </Text>
            <VGap h={10} />
            <Link
              href={featured.url}
              style={{
                color: C.ink,
                textDecoration: "none",
              }}
            >
              <Heading
                as="h2"
                style={{
                  margin: 0,
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 800,
                  fontSize: "26px",
                  lineHeight: 1.15,
                  letterSpacing: "-0.015em",
                  color: C.ink,
                }}
              >
                {featured.title}
              </Heading>
            </Link>
            <VGap h={12} />
            <Text
              style={{
                margin: 0,
                fontFamily: FONT_STACK,
                fontSize: "15px",
                lineHeight: 1.6,
                color: "#4B5563",
              }}
            >
              {featured.excerpt}
            </Text>
            <VGap h={18} />
            <BulletproofButton href={featured.url} label={readLabel} />
            <VGap h={6} />
            <Text
              style={{
                margin: 0,
                fontFamily: FONT_STACK,
                fontSize: "11px",
                color: "#9AA3B2",
                textAlign: "center" as const,
              }}
            >
              {featured.readingTime} min read
            </Text>
          </Section>
        </Section>
      )}

      {/* ── More from the studio ──────────────────────────────────── */}
      {rest.length > 0 && (
        <>
          <VGap h={36} />
          <Heading
            as="h3"
            style={{
              margin: 0,
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: "16px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: C.ink,
              paddingBottom: "10px",
              borderBottom: `2px solid ${C.ink}`,
            }}
          >
            {moreLabel}
          </Heading>
          <VGap h={12} />
          {rest.map((p, i) => (
            <Section
              key={p.slug}
              style={{
                paddingTop: i === 0 ? 0 : "16px",
                paddingBottom: "16px",
                borderBottom: i === rest.length - 1 ? "none" : `1px solid ${C.hair}`,
              }}
            >
              <table
                role="presentation"
                width="100%"
                cellPadding={0}
                cellSpacing={0}
                border={0}
              >
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>
                      <Text
                        style={{
                          margin: 0,
                          fontFamily: FONT_STACK,
                          fontSize: "10px",
                          color: C.red,
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          fontWeight: 800,
                        }}
                      >
                        {p.category}
                      </Text>
                      <VGap h={6} />
                      <Link
                        href={p.url}
                        style={{
                          color: C.ink,
                          textDecoration: "none",
                        }}
                      >
                        <Text
                          style={{
                            margin: 0,
                            fontFamily: FONT_DISPLAY,
                            fontWeight: 800,
                            fontSize: "17px",
                            lineHeight: 1.3,
                            letterSpacing: "-0.01em",
                            color: C.ink,
                          }}
                        >
                          {p.title}
                        </Text>
                      </Link>
                      <VGap h={4} />
                      <Text
                        style={{
                          margin: 0,
                          fontFamily: FONT_STACK,
                          fontSize: "13px",
                          lineHeight: 1.55,
                          color: "#6B7280",
                        }}
                      >
                        {p.excerpt}
                      </Text>
                      <VGap h={6} />
                      <Link
                        href={p.url}
                        style={{
                          fontFamily: FONT_STACK,
                          fontSize: "12px",
                          fontWeight: 800,
                          color: C.red,
                          textDecoration: "none",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        Read &rarr;
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>
          ))}
        </>
      )}

      <VGap h={32} />
      <Section style={{ textAlign: "center" as const }}>
        <Link
          href={`${SITE.url}/blog`}
          style={{
            display: "inline-block",
            fontFamily: FONT_STACK,
            fontSize: "13px",
            fontWeight: 800,
            color: C.ink,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textDecoration: "underline",
          }}
        >
          {browseLabel}
        </Link>
      </Section>

      <VGap h={20} />
      <Text
        style={{
          margin: 0,
          fontFamily: FONT_STACK,
          fontSize: "11px",
          color: "#9AA3B2",
          textAlign: "center" as const,
        }}
      >
        Sent to {email}.
      </Text>
    </BrandShell>
  );
}
