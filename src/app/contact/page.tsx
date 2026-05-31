import Link from "next/link";
import type { Metadata } from "next";
import {
  MessageCircle,
  Phone,
  Mail,
  Clock,
  CalendarDays,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  MapPin,
} from "lucide-react";

import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, contactPageSchema, faqPageSchema } from "@/lib/schema";
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

const FAQS = [
  {
    q: "How fast do you reply?",
    a: "Under 24 hours, Saturday through Thursday. WhatsApp is usually under 2 hours during business hours (09:00-21:00 BD).",
  },
  {
    q: "What information do I need to send?",
    a: "What you're trying to grow, what you've already tried, and the realistic budget if you have one. If you don't have a budget yet, that's fine — we'll ballpark on the call.",
  },
  {
    q: "Is the first call really free?",
    a: "Yes — 30 minutes, no pitch deck, no obligation. We'll either be a fit or we won't, and if we're not we'll usually be able to point you somewhere that is.",
  },
  {
    q: "Do you work with clients outside Bangladesh?",
    a: "Most of our work is BD-focused but we run engagements for BD diaspora brands and a few BD-adjacent businesses (Cox's Bazar tourism for UK-based investors, RMG buyer-facing comms, etc.). Reach out — we'll be honest about fit.",
  },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd data={[contactPageSchema(), breadcrumbSchema(crumbs), faqPageSchema(FAQS)]} />

      {/* ═══ HERO — gradient panel with live availability ═══════════════ */}
      <section className="relative overflow-hidden bg-paper">
        <Container className="relative pt-10 pb-14 md:pt-14 md:pb-16">
          <Breadcrumbs crumbs={crumbs} />
          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <span className="chip chip-orange">Contact</span>
              <h1 className="mt-5 text-mega font-extrabold tracking-tight text-ink">
                Talk to a <span className="text-brand-orange">human</span> in under an hour.
              </h1>
              <p className="mt-5 max-w-2xl text-lead text-ink/70">
                No pitch deck, no qualifying questions, no SDR. Pick the channel that suits you and
                the sales team picks up.
              </p>
            </div>

            {/* Live status panel */}
            <div className="lg:col-span-5">
              <div
                className="rounded-panel p-6 text-paper"
                style={{
                  background: `radial-gradient(60% 80% at 80% 20%, #FF5C00 0%, transparent 60%), radial-gradient(80% 80% at 20% 80%, #2563EB 0%, transparent 60%), linear-gradient(135deg, #14B8A6 0%, #0A0A0A 100%)`,
                }}
              >
                <div className="flex items-center gap-2 text-meta uppercase tracking-wider text-paper/80">
                  <span
                    aria-hidden
                    className="inline-block h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30"
                  />
                  Sales team online
                </div>
                <p className="mt-3 text-h3 font-bold leading-tight">
                  Available 09:00 – 21:00 BD
                </p>
                <p className="mt-1 text-sm text-paper/80">
                  Average WhatsApp reply: <strong className="text-paper">under 2 hours</strong>
                  &nbsp;during business hours.
                </p>
                <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/15 pt-4">
                  <Stat n="<2h" k="WhatsApp" />
                  <Stat n="<24h" k="Email" />
                  <Stat n="6 days" k="Sat–Thu" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 max-w-3xl">
            <AnswerBlock>
              We reply to every email and WhatsApp message within 24 hours, Saturday through
              Thursday. Office hours are 09:00–21:00 Asia/Dhaka. Fastest channel is WhatsApp.
              Free 30-minute consultation; no pitch deck, no qualifying questions.
            </AnswerBlock>
          </div>
        </Container>
      </section>

      {/* ═══ PICK YOUR PATH — three gradient cards ══════════════════════ */}
      <section className="border-y border-ink bg-paper-alt py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-eyebrow uppercase text-brand-orange">Pick your path</p>
            <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
              Three ways in. All of them work.
            </h2>
          </div>
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            <li>
              <a
                href={SITE.contact.whatsapp}
                rel="noopener noreferrer"
                target="_blank"
                aria-label="Chat on WhatsApp now"
                className="group relative flex h-full flex-col overflow-hidden rounded-panel p-6 text-paper transition hover:-translate-y-1"
                style={{
                  background: `radial-gradient(70% 80% at 80% 20%, #34D399 0%, transparent 60%), linear-gradient(135deg, #10B981 0%, #064E3B 100%)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-card bg-paper/95 text-emerald-600">
                    <MessageCircle className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="chip chip-light">Fastest</span>
                </div>
                <h3 className="mt-6 text-h2 font-extrabold leading-tight">
                  WhatsApp <span className="text-paper/70">now</span>
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-paper/85">
                  Under 2h reply during business hours. Best for quick questions and to feel out
                  whether we&rsquo;re a fit.
                </p>
                <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-paper">
                  {SITE.contact.phoneDisplay}
                  <ArrowUpRight
                    className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </div>
              </a>
            </li>
            <li>
              <Link
                href="#brief"
                aria-label="Send a brief"
                className="group relative flex h-full flex-col overflow-hidden rounded-panel p-6 text-paper transition hover:-translate-y-1"
                style={{
                  background: `radial-gradient(70% 80% at 20% 20%, #FFB07A 0%, transparent 60%), linear-gradient(135deg, #FF7A2E 0%, #B23A00 100%)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-card bg-paper/95 text-brand-orange">
                    <Sparkles className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="chip chip-light">Best fit</span>
                </div>
                <h3 className="mt-6 text-h2 font-extrabold leading-tight">
                  Send a <span className="text-paper/80">brief</span>
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-paper/85">
                  Tell us what you&rsquo;re trying to grow, what you&rsquo;ve tried, and we&rsquo;ll
                  reply with a structured proposal.
                </p>
                <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-paper">
                  Jump to the form
                  <ArrowUpRight
                    className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </div>
              </Link>
            </li>
            <li>
              <a
                href={`tel:${SITE.contact.phone}`}
                aria-label={`Call ${SITE.contact.phoneDisplay}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-panel p-6 text-paper transition hover:-translate-y-1"
                style={{
                  background: `radial-gradient(70% 80% at 80% 80%, #93C5FD 0%, transparent 60%), linear-gradient(135deg, #2563EB 0%, #1E1B4B 100%)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-card bg-paper/95 text-blue-600">
                    <Phone className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="chip chip-light">Call us</span>
                </div>
                <h3 className="mt-6 text-h2 font-extrabold leading-tight">
                  Just <span className="text-paper/80">call</span>
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-paper/85">
                  Direct line to the sales team. Best for urgent or sensitive (election cycles,
                  crisis comms).
                </p>
                <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-paper">
                  {SITE.contact.phoneDisplay}
                  <ArrowUpRight
                    className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </div>
              </a>
            </li>
          </ul>

          {/* Email — secondary row */}
          <div className="mt-6">
            <a
              href={`mailto:${SITE.contact.email}`}
              className="group flex flex-col items-start justify-between gap-3 rounded-panel border border-ink/15 bg-paper p-5 transition hover:border-ink sm:flex-row sm:items-center"
              aria-label={`Email ${SITE.contact.email}`}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-card border border-ink bg-paper text-ink">
                  <Mail className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-meta uppercase tracking-wider text-ink/55">Email</p>
                  <p className="text-base font-bold text-ink break-all">
                    {SITE.contact.email}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                Compose
                <ArrowUpRight
                  className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </span>
            </a>
          </div>

          {/* Google Maps — directions */}
          <div className="mt-4">
            <a
              href={SITE.contact.mapsShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-start justify-between gap-3 rounded-panel border border-ink/15 bg-paper p-5 transition hover:border-ink sm:flex-row sm:items-center"
              aria-label="Get directions to Public Pulse Agency on Google Maps"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-card border border-ink bg-paper text-ink">
                  <MapPin className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-meta uppercase tracking-wider text-ink/55">Location</p>
                  <p className="text-base font-bold text-ink">
                    Dhaka, Bangladesh
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                Get directions
                <ArrowUpRight
                  className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </span>
            </a>
          </div>
        </Container>
      </section>

      {/* ═══ BRIEF FORM ═════════════════════════════════════════════════ */}
      <section id="brief" className="bg-paper py-20 md:py-28">
        <Container>
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-12">
            {/* Side rail */}
            <aside className="lg:col-span-4">
              <p className="text-eyebrow uppercase text-brand-orange">Brief</p>
              <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
                Send your brief.
              </h2>
              <p className="mt-4 text-ink/70">
                Lands in our inbox the moment you hit send. Read by a human, replied to by the same
                human.
              </p>
              <ul className="mt-8 space-y-4 text-sm">
                <Promise icon={Clock} text="Reply within 24 hours, Sat–Thu" />
                <Promise icon={ShieldCheck} text="No marketing emails ever; we use it only to reply" />
                <Promise icon={CalendarDays} text="If a fit, we'll book a 30-min call within 2 working days" />
              </ul>
            </aside>

            {/* Form */}
            <div className="lg:col-span-8">
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>

      {/* ═══ FAQ ════════════════════════════════════════════════════════ */}
      <section className="border-t border-ink bg-paper-alt py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-eyebrow uppercase text-brand-orange">FAQ</p>
            <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
              Before you write.
            </h2>
            <dl className="mt-10 space-y-4">
              {FAQS.map((f) => (
                <div key={f.q} className="rounded-card border border-ink/15 bg-paper p-6">
                  <dt className="font-semibold text-ink">{f.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-ink/70">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>
    </>
  );
}

function Stat({ n, k }: { n: string; k: string }) {
  return (
    <div>
      <div className="text-xl font-extrabold leading-none text-paper">{n}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-paper/65">{k}</div>
    </div>
  );
}

function Promise({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  text: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink text-paper">
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>
      <span className="text-ink/80">{text}</span>
    </li>
  );
}
