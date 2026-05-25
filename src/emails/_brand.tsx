// Shared brand shell + tokens for every transactional / newsletter email.
// react-email components render to inline-styled HTML that holds up across
// Gmail / Apple Mail / Outlook (Windows + 365 + Mac) + dark mode.
//
// Container is 640px (bigger than the typical 600) to give the bold display
// type room to breathe. Mobile collapses to 100% via the Container component's
// internal CSS.

import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { CSSProperties, ReactNode } from "react";

import { SITE } from "@/lib/site";
import { PULSE_BRANDS } from "@/lib/group";

// ─── Brand tokens (mirror src/styles/globals.css + tailwind.config.ts) ──
export const C = {
  navy: "#0F1B3D",
  navySoft: "#1A2A52",
  red: "#D32F2F",
  ink: "#0A0A0A",
  paper: "#FFFFFF",
  paperAlt: "#F7F6F2",
  cream: "#FAF8F5",
  mute: "#64748B",
  muteOnDark: "rgba(255,255,255,0.62)",
  textOnDark: "rgba(255,255,255,0.92)",
  hair: "#E2E8F0",
} as const;

// Web-safe bold display stack — DM Sans / Inter aren't installed in mail clients,
// so we cascade to system geometric sans first, then Helvetica/Arial.
export const FONT_STACK = "'Inter','Helvetica Neue',Helvetica,Arial,sans-serif";
export const FONT_DISPLAY = "'Inter','Helvetica Neue',Helvetica,Arial,sans-serif";

// ─── Reusable styles ───────────────────────────────────────────────────
const main: CSSProperties = {
  backgroundColor: C.paperAlt,
  fontFamily: FONT_STACK,
  margin: 0,
  padding: 0,
  WebkitFontSmoothing: "antialiased",
};

const container: CSSProperties = {
  width: "100%",
  maxWidth: "640px",
  margin: "0 auto",
  backgroundColor: C.paper,
};

const headerBand: CSSProperties = {
  backgroundColor: C.navy,
  padding: "28px 32px 26px 32px",
};

const redRule: CSSProperties = {
  height: "3px",
  width: "64px",
  backgroundColor: C.red,
  border: "none",
  margin: 0,
};

// ─── Bulletproof button (works on Outlook via VML wrap) ───────────────
// react-email's <Button> ships an inline-bulletproof button under the hood
// when used with the right props, but for the strongest Outlook support we
// hand-roll a wrapper. Keep it simple — a single CTA is best practice anyway.
export function BulletproofButton({
  href,
  label,
  color = C.red,
}: {
  href: string;
  label: string;
  color?: string;
}) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{ margin: "0 auto" }}
    >
      <tbody>
        <tr>
          <td
            style={{
              borderRadius: "9999px",
              backgroundColor: color,
            }}
          >
            <Link
              href={href}
              style={{
                display: "inline-block",
                padding: "16px 32px",
                fontFamily: FONT_DISPLAY,
                fontSize: "16px",
                fontWeight: 800,
                letterSpacing: "0.02em",
                color: C.paper,
                textDecoration: "none",
                borderRadius: "9999px",
                textTransform: "uppercase",
              }}
            >
              {label}
            </Link>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// ─── Bold Pulse wordmark for the email header ─────────────────────────
export function Wordmark() {
  return (
    <Text
      style={{
        margin: 0,
        fontFamily: FONT_DISPLAY,
        fontWeight: 900,
        fontSize: "20px",
        letterSpacing: "-0.01em",
        color: C.paper,
      }}
    >
      <span style={{ color: C.paper }}>PUBLIC</span>{" "}
      <span style={{ color: C.red }}>PULSE</span>
    </Text>
  );
}

// ─── Standard shell (header band + content slot + footer) ─────────────
export function BrandShell({
  preheader,
  issueNumber,
  children,
  unsubscribeUrl,
  managePreferencesUrl,
}: {
  preheader: string;
  /** Optional — when present, the header band shows "ISSUE NN" oversized. */
  issueNumber?: number;
  children: ReactNode;
  /** When present, footer renders the small muted unsub line + RFC 8058
   *  List-Unsubscribe header in the send wrapper still gives the bold
   *  client-native unsubscribe option. */
  unsubscribeUrl?: string;
  managePreferencesUrl?: string;
}) {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
      </Head>
      <Preview>{preheader}</Preview>
      <Body style={main}>
        {/* Outer padded section — keeps content off the dark mail-client chrome */}
        <Section style={{ padding: "24px 0" }}>
          <Container style={container}>
            {/* ── Header band ───────────────────────────────────────── */}
            <Section style={headerBand}>
              <table
                role="presentation"
                width="100%"
                cellPadding={0}
                cellSpacing={0}
                border={0}
              >
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: "middle" }}>
                      <Wordmark />
                      <Text
                        style={{
                          margin: "4px 0 0 0",
                          fontFamily: FONT_STACK,
                          fontSize: "11px",
                          color: C.muteOnDark,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                        }}
                      >
                        Bangladesh · since 2024
                      </Text>
                    </td>
                    {typeof issueNumber === "number" && (
                      <td
                        style={{
                          verticalAlign: "middle",
                          textAlign: "right",
                        }}
                      >
                        <Text
                          style={{
                            margin: 0,
                            fontFamily: FONT_DISPLAY,
                            fontWeight: 900,
                            fontSize: "44px",
                            lineHeight: 1,
                            color: C.paper,
                            letterSpacing: "-0.04em",
                            textTransform: "uppercase",
                          }}
                        >
                          № {String(issueNumber).padStart(2, "0")}
                        </Text>
                        <Text
                          style={{
                            margin: "2px 0 0 0",
                            fontFamily: FONT_STACK,
                            fontSize: "10px",
                            color: C.red,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            textAlign: "right",
                            fontWeight: 700,
                          }}
                        >
                          The Pulse Digest
                        </Text>
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
              <hr style={{ ...redRule, marginTop: "20px" }} />
            </Section>

            {/* ── Content slot ───────────────────────────────────────── */}
            <Section style={{ padding: "36px 32px 24px 32px" }}>{children}</Section>

            {/* ── Footer (navy) ──────────────────────────────────────── */}
            <BrandFooter
              unsubscribeUrl={unsubscribeUrl}
              managePreferencesUrl={managePreferencesUrl}
            />
          </Container>
        </Section>
      </Body>
    </Html>
  );
}

// ─── Footer (navy, sister concerns, address, small muted unsubscribe) ─
export function BrandFooter({
  unsubscribeUrl,
  managePreferencesUrl,
}: {
  unsubscribeUrl?: string;
  managePreferencesUrl?: string;
} = {}) {
  const sisters = PULSE_BRANDS.filter((b) => !b.self);

  return (
    <Section
      style={{
        backgroundColor: C.navy,
        padding: "32px 32px 28px 32px",
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
            <td>
              <Text
                style={{
                  margin: 0,
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 800,
                  color: C.paper,
                  fontSize: "14px",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {SITE.name}
              </Text>
              <Text
                style={{
                  margin: "6px 0 0 0",
                  fontFamily: FONT_STACK,
                  fontSize: "12px",
                  color: C.muteOnDark,
                  lineHeight: 1.55,
                }}
              >
                A member of Pulse Group.<br />
                {sisters.map((b) => b.name).join(" · ")}
              </Text>
            </td>
          </tr>
          <tr>
            <td style={{ paddingTop: "20px" }}>
              <Text
                style={{
                  margin: 0,
                  fontFamily: FONT_STACK,
                  fontSize: "11px",
                  color: C.muteOnDark,
                  lineHeight: 1.6,
                }}
              >
                Public Pulse Agency · Dhaka, Bangladesh<br />
                BIN {SITE.contact.legal.bin} · Trade Licence {SITE.contact.legal.tradeLicense}<br />
                {SITE.contact.phoneDisplay} ·{" "}
                <Link href={`mailto:${SITE.contact.email}`} style={{ color: C.muteOnDark, textDecoration: "underline" }}>
                  {SITE.contact.email}
                </Link>
              </Text>
            </td>
          </tr>
          {(unsubscribeUrl || managePreferencesUrl) && (
            <tr>
              <td style={{ paddingTop: "18px" }}>
                <Text
                  style={{
                    margin: 0,
                    fontFamily: FONT_STACK,
                    fontSize: "11px",
                    color: C.muteOnDark,
                    lineHeight: 1.6,
                  }}
                >
                  {unsubscribeUrl && (
                    <>
                      <Link
                        href={unsubscribeUrl}
                        style={{ color: C.muteOnDark, textDecoration: "underline" }}
                      >
                        Unsubscribe
                      </Link>
                    </>
                  )}
                  {unsubscribeUrl && managePreferencesUrl && " · "}
                  {managePreferencesUrl && (
                    <Link
                      href={managePreferencesUrl}
                      style={{ color: C.muteOnDark, textDecoration: "underline" }}
                    >
                      Manage preferences
                    </Link>
                  )}
                  {" · "}You&rsquo;re receiving this because you opted in at{" "}
                  <Link href={SITE.url} style={{ color: C.muteOnDark, textDecoration: "underline" }}>
                    publicpulse.com.bd
                  </Link>
                  .
                </Text>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Section>
  );
}

// Helper — produces 1px gap for visual rhythm.
export function VGap({ h = 24 }: { h?: number }) {
  return <div style={{ height: `${h}px`, lineHeight: `${h}px`, fontSize: "1px" }}>&nbsp;</div>;
}

// Suppress unused import warning when the Img import is conditionally used.
void Img;
