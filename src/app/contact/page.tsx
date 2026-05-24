import type { Metadata } from "next";
import { MessageCircle, Phone, Mail, Clock } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, contactPageSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/contact/ContactForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Contact Public Pulse Agency | Free Consultation, Dhaka",
  description:
    "Get a free 30-minute consultation. WhatsApp +880 1717-714676, email info@publicpulse.com.bd, or send us a brief through the form. We reply within 24 hours.",
  path: "/contact",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Contact", path: "/contact" },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd data={[contactPageSchema(), breadcrumbSchema(crumbs)]} />

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(50%_45%_at_50%_0%,rgba(13,148,136,0.07),transparent_60%)]"
        />
        <Container className="relative pt-10 pb-14 md:pt-14 md:pb-20">
          <Breadcrumbs crumbs={crumbs} />
          <div className="mx-auto mt-6 max-w-3xl text-center">
            <p className="text-eyebrow uppercase text-brand-teal">Get in touch</p>
            <h1 className="mt-3 text-display font-extrabold tracking-tight text-brand-navy">
              Let&rsquo;s talk. No pitch deck.
            </h1>
            <p className="mt-5 text-lead text-slate-600">
              Free 30-minute consultation. Tell us what you&rsquo;re trying to grow, what
              you&rsquo;ve already tried, and what&rsquo;s in the way. We&rsquo;ll tell you whether
              we&rsquo;re the right fit — and if we&rsquo;re not, who is.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl">
            <AnswerBlock>
              We reply to every email and WhatsApp message within 24 hours, Saturday through
              Thursday. Office hours are 09:00–21:00 (Asia/Dhaka). Fastest channel is WhatsApp.
            </AnswerBlock>
          </div>
        </Container>
      </section>

      {/* ─── DIRECT CHANNELS ──────────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-20">
        <Container>
          <ul className="grid gap-4 md:grid-cols-3">
            <li>
              <a
                href={SITE.contact.whatsapp}
                rel="noopener noreferrer"
                target="_blank"
                aria-label="Chat on WhatsApp"
                className="card group flex h-full flex-col"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-card bg-emerald-100 text-emerald-700">
                  <MessageCircle className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-4 text-meta uppercase tracking-wider text-slate-500">WhatsApp</p>
                <p className="mt-1 text-h3 font-semibold text-brand-navy">
                  {SITE.contact.phoneDisplay}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Fastest channel — usually &lt; 2h reply
                </p>
              </a>
            </li>
            <li>
              <a
                href={`tel:${SITE.contact.phone}`}
                aria-label={`Call ${SITE.contact.phoneDisplay}`}
                className="card group flex h-full flex-col"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-card bg-brand-teal/10 text-brand-teal">
                  <Phone className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-4 text-meta uppercase tracking-wider text-slate-500">Call</p>
                <p className="mt-1 text-h3 font-semibold text-brand-navy">
                  {SITE.contact.phoneDisplay}
                </p>
                <p className="mt-2 text-sm text-slate-500">Sat–Thu, 09:00–21:00 Asia/Dhaka</p>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${SITE.contact.email}`}
                aria-label={`Email ${SITE.contact.email}`}
                className="card group flex h-full flex-col"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-card bg-slate-100 text-slate-700">
                  <Mail className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-4 text-meta uppercase tracking-wider text-slate-500">Email</p>
                <p className="mt-1 text-base font-semibold text-brand-navy break-all">
                  {SITE.contact.email}
                </p>
                <p className="mt-2 text-sm text-slate-500">Reply within 24h</p>
              </a>
            </li>
          </ul>
        </Container>
      </section>

      {/* ─── FORM ─────────────────────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-surface-alt py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <p className="text-eyebrow uppercase text-brand-teal">Send a brief</p>
              <h2 className="mt-3 text-h2 font-bold tracking-tight text-brand-navy">
                Or write to us in your own words.
              </h2>
              <p className="mt-4 text-slate-600">
                Submissions land in our inbox within seconds and we reply within 24 hours.
              </p>
            </div>
            <div className="mt-10 rounded-panel border border-slate-200 bg-white p-6 md:p-8">
              <ContactForm />
            </div>
            <p className="mt-6 flex items-center justify-center gap-2 text-meta text-slate-500">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              Average reply time during business hours: under 4 hours.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
