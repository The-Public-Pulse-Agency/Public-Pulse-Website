// Tiny admin notification email when a visitor opts into WhatsApp via the
// site-wide LeadCapture. Not branded — single-purpose internal notification.

import { Heading, Section, Text } from "@react-email/components";

import { BrandShell, C, FONT_STACK, VGap } from "./_brand";

export type AdminWhatsAppNotifyProps = {
  phone: string;
  source: string | null;
  page: string | null;
  locale: string;
  note: string | null;
};

export default function AdminWhatsAppNotify({
  phone,
  source,
  page,
  locale,
  note,
}: AdminWhatsAppNotifyProps) {
  return (
    <BrandShell preheader={`WhatsApp opt-in from ${phone}`}>
      <Heading
        as="h1"
        style={{
          margin: 0,
          fontFamily: FONT_STACK,
          fontSize: "24px",
          color: C.ink,
        }}
      >
        New WhatsApp opt-in
      </Heading>
      <VGap h={16} />
      <Section
        style={{
          backgroundColor: C.paperAlt,
          padding: "20px 22px",
          borderLeft: `4px solid ${C.red}`,
        }}
      >
        <Text style={{ margin: 0, fontFamily: FONT_STACK, fontSize: "16px", color: C.ink }}>
          <strong>Phone:</strong> {phone}
        </Text>
        <Text style={{ margin: "6px 0 0 0", fontFamily: FONT_STACK, fontSize: "13px", color: "#374151" }}>
          Source: <strong>{source ?? "—"}</strong> · Page: {page ?? "—"} · Locale: {locale}
        </Text>
        {note && (
          <Text style={{ margin: "10px 0 0 0", fontFamily: FONT_STACK, fontSize: "13px", color: "#374151" }}>
            Note: {note}
          </Text>
        )}
      </Section>
      <VGap h={20} />
      <Text style={{ margin: 0, fontFamily: FONT_STACK, fontSize: "13px", color: "#374151" }}>
        Reply within 2 hours, Sat–Thu, 09:00–21:00 BD.
      </Text>
    </BrandShell>
  );
}
