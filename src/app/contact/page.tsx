import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, contactPageSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
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
      {/* ───────── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-navy text-white">
        <div className="bg-grain absolute inset-0" aria-hidden="true" />
        <Container className="relative py-20 md:py-28">
          <div className="text-white/80">
            <Breadcrumbs crumbs={crumbs} />
          </div>

          <JsonLd
            data={[contactPageSchema(), breadcrumbSchema(crumbs)]}
          />

          <div className="mt-10 grid items-start gap-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-eyebrow uppercase text-white/60">Get in touch</p>
              <h1 className="mt-6 font-serif text-display font-medium text-white">
                Let&rsquo;s talk.
                <br />
                <span className="italic text-brand-red">No pitch deck</span>.
              </h1>
              <p className="mt-8 max-w-xl text-lead text-white/80">
                Free 30-minute consultation. Tell us what you&rsquo;re trying to grow, what
                you&rsquo;ve already tried, and what&rsquo;s in the way. We&rsquo;ll tell you
                whether we&rsquo;re the right fit — and if we&rsquo;re not, who is.
              </p>
            </div>

            <div className="lg:col-span-5 lg:pt-12">
              <div className="answer-block-dark" data-speakable="">
                <p className="text-eyebrow uppercase text-brand-red">Response time</p>
                <p className="mt-3 text-[17px] leading-relaxed text-white/92">
                  We reply to every email and WhatsApp message within 24 hours, Sunday through
                  Thursday. Office hours are 09:00–21:00 (Asia/Dhaka), Saturday to Thursday.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ───────── DIRECT CHANNELS ──────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-20">
        <Container>
          <ScrollReveal>
            <ul className="grid gap-4 md:grid-cols-3">
              <li>
                <a
                  href={SITE.contact.whatsapp}
                  rel="noopener noreferrer"
                  target="_blank"
                  aria-label="Chat on WhatsApp"
                  className="card-hover block h-full rounded-2xl border border-slate-200 p-6"
                  style={{ borderLeftColor: "#25D366", borderLeftWidth: 4 }}
                >
                  <div className="text-2xl" aria-hidden="true">💬</div>
                  <p className="mt-3 text-eyebrow uppercase text-slate-500">WhatsApp</p>
                  <p className="mt-2 font-serif text-2xl font-medium text-brand-navy">
                    {SITE.contact.phoneDisplay}
                  </p>
                  <p className="mt-1 text-meta text-slate-500">Fastest channel — usually &lt;2h reply</p>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${SITE.contact.phone}`}
                  aria-label={`Call ${SITE.contact.phoneDisplay}`}
                  className="card-hover block h-full rounded-2xl border border-slate-200 p-6"
                  style={{ borderLeftColor: "#D32F2F", borderLeftWidth: 4 }}
                >
                  <div className="text-2xl" aria-hidden="true">📞</div>
                  <p className="mt-3 text-eyebrow uppercase text-slate-500">Call us</p>
                  <p className="mt-2 font-serif text-2xl font-medium text-brand-navy">
                    {SITE.contact.phoneDisplay}
                  </p>
                  <p className="mt-1 text-meta text-slate-500">Sun–Thu, 09:00–21:00 Asia/Dhaka</p>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.contact.email}`}
                  aria-label={`Email ${SITE.contact.email}`}
                  className="card-hover block h-full rounded-2xl border border-slate-200 p-6"
                  style={{ borderLeftColor: "#0F1B3D", borderLeftWidth: 4 }}
                >
                  <div className="text-2xl" aria-hidden="true">✉️</div>
                  <p className="mt-3 text-eyebrow uppercase text-slate-500">Email</p>
                  <p className="mt-2 font-serif text-xl font-medium text-brand-navy break-all">
                    {SITE.contact.email}
                  </p>
                  <p className="mt-1 text-meta text-slate-500">Reply within 24h</p>
                </a>
              </li>
            </ul>
          </ScrollReveal>
        </Container>
      </section>

      {/* ───────── FORM PLACEHOLDER (replaced in TASK 3) ────────────────── */}
      <section className="bg-surface-alt py-20 md:py-24">
        <Container>
          <ScrollReveal>
            <div className="mx-auto max-w-2xl">
              <p className="text-eyebrow uppercase text-brand-red">Send a brief</p>
              <h2 className="mt-4 font-serif text-h2 font-medium text-brand-navy">
                Or write to us
                <br />
                <span className="italic">in your own words</span>.
              </h2>
              <p className="mt-6 text-lead text-slate-700">
                A short form is ideal if you want a structured reply with a proposed scope and
                budget range. Submissions land in our inbox within seconds and we reply within
                24 hours.
              </p>
              <div className="mt-10">
                <ContactForm />
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </>
  );
}
