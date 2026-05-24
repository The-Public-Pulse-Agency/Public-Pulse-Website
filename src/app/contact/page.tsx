import type { Metadata } from "next";
import { MessageCircle, Phone, Mail } from "lucide-react";
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

      <section className="bg-paper">
        <Container className="pt-10 pb-14 md:pt-14 md:pb-20">
          <Breadcrumbs crumbs={crumbs} />
          <div className="mt-8 max-w-5xl">
            <span className="chip chip-orange">Contact</span>
            <h1 className="mt-6 text-mega font-extrabold tracking-tight text-ink">
              Let&rsquo;s <span className="text-brand-orange">talk</span>. No pitch deck.
            </h1>
            <p className="mt-6 max-w-2xl text-lead text-ink/70">
              Free 30-minute consultation. Tell us what you&rsquo;re trying to grow and what
              you&rsquo;ve already tried — we&rsquo;ll tell you whether we&rsquo;re the right fit.
            </p>
          </div>
          <div className="mt-12 max-w-3xl">
            <AnswerBlock>
              We reply to every email and WhatsApp message within 24 hours, Saturday through
              Thursday. Office hours are 09:00–21:00 (Asia/Dhaka). Fastest channel is WhatsApp.
            </AnswerBlock>
          </div>
        </Container>
      </section>

      <section className="border-y border-ink bg-paper-alt py-16 md:py-20">
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
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-orange text-paper">
                  <MessageCircle className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-5 text-meta uppercase tracking-wider text-ink/55">WhatsApp</p>
                <p className="mt-1 text-h3 font-bold text-ink">{SITE.contact.phoneDisplay}</p>
                <p className="mt-2 text-sm text-ink/55">Fastest channel — usually &lt; 2h reply</p>
              </a>
            </li>
            <li>
              <a
                href={`tel:${SITE.contact.phone}`}
                aria-label={`Call ${SITE.contact.phoneDisplay}`}
                className="card group flex h-full flex-col"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink text-paper">
                  <Phone className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-5 text-meta uppercase tracking-wider text-ink/55">Call</p>
                <p className="mt-1 text-h3 font-bold text-ink">{SITE.contact.phoneDisplay}</p>
                <p className="mt-2 text-sm text-ink/55">Sat–Thu, 09:00–21:00 Asia/Dhaka</p>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${SITE.contact.email}`}
                aria-label={`Email ${SITE.contact.email}`}
                className="card group flex h-full flex-col"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink bg-paper text-ink">
                  <Mail className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-5 text-meta uppercase tracking-wider text-ink/55">Email</p>
                <p className="mt-1 text-base font-bold text-ink break-all">{SITE.contact.email}</p>
                <p className="mt-2 text-sm text-ink/55">Reply within 24h</p>
              </a>
            </li>
          </ul>
        </Container>
      </section>

      <section className="bg-paper py-20 md:py-28">
        <Container>
          <div className="mx-auto max-w-2xl">
            <div>
              <p className="text-eyebrow uppercase text-brand-orange">Brief</p>
              <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
                Or write to us in your words.
              </h2>
              <p className="mt-4 text-ink/70">
                Submissions land in our inbox within seconds and we reply within 24 hours.
              </p>
            </div>
            <div className="mt-10 rounded-panel border border-ink bg-paper p-6 md:p-8">
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
