import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import {
  aboutPageSchema,
  breadcrumbSchema,
  personSchema,
} from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "About Public Pulse Agency | Digital Marketing Dhaka",
  description:
    "Public Pulse Agency is Bangladesh's 360° digital marketing and political PR agency, founded in Dhaka 2024. Nine integrated services for 50+ active clients across 10+ industries.",
  path: "/about",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
];

// TODO(user): replace with the actual leadership team — real names, real
// roles, ideally a one-paragraph bio per person and a 400×400 head-and-shoulders
// photo. Each person here emits Person JSON-LD for E-E-A-T.
const TEAM = [
  {
    name: "[Founder Name]",
    role: "Founder & Managing Director",
    bio: "Leads strategy across the agency. Background in political PR and brand-building for Bangladesh consumer brands.",
    image: undefined as string | undefined,
    sameAs: [] as string[],
  },
  {
    name: "[Head of Strategy]",
    role: "Head of Strategy",
    bio: "Sets the playbook for political PR engagements and major brand launches. Constituency-level campaign experience across multiple election cycles.",
    image: undefined as string | undefined,
    sameAs: [] as string[],
  },
  {
    name: "[Creative Director]",
    role: "Creative Director",
    bio: "Owns the bar for production work — brand films, photography, motion. Bangla and English creative across hospitality, political and consumer.",
    image: undefined as string | undefined,
    sameAs: [] as string[],
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ───────── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-navy text-white">
        <div className="bg-grain absolute inset-0" aria-hidden="true" />
        <Container className="relative py-20 md:py-32">
          <div className="text-white/80">
            <Breadcrumbs crumbs={crumbs} />
          </div>

          <JsonLd
            data={[
              aboutPageSchema(),
              breadcrumbSchema(crumbs),
            ]}
          />

          <div className="mt-10 grid items-start gap-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-eyebrow uppercase text-white/60">About the agency</p>
              <h1 className="mt-6 font-serif text-display font-medium text-white">
                A small team
                <br />
                <span className="italic text-brand-red">built for Bangladesh</span>.
              </h1>
              <p className="mt-8 max-w-xl text-lead text-white/80">
                Public Pulse Agency was founded in Dhaka in 2024 to run the kind of integrated
                digital marketing and political PR that Bangladeshi brands and candidates were
                stitching together from three or four vendors. We do it under one roof, on one
                weekly report, with one accountable team.
              </p>
            </div>

            <div className="lg:col-span-5 lg:pt-12">
              <div className="answer-block-dark" data-speakable="">
                <p className="text-eyebrow uppercase text-brand-red">In one sentence</p>
                <p className="mt-3 text-[17px] leading-relaxed text-white/92">
                  Public Pulse Agency is a Dhaka-based, fifteen-person 360° digital marketing and
                  political PR agency, founded in 2024. We serve 50+ active clients across 10+
                  industries with an average engagement growth of 300%+ in the first 90 days.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ───────── STORY ────────────────────────────────────────────────── */}
      <section className="bg-white py-24 md:py-32">
        <Container>
          <ScrollReveal>
            <div className="grid items-start gap-12 md:grid-cols-12">
              <div className="md:col-span-5">
                <p className="text-eyebrow uppercase text-brand-red">Our story</p>
                <h2 className="mt-4 font-serif text-h2 font-medium text-brand-navy">
                  Founded to fix
                  <br />
                  <span className="italic">the handoff problem</span>.
                </h2>
              </div>
              <div className="md:col-span-7 space-y-6 text-lead text-slate-700">
                <p>
                  Most Bangladeshi brands run digital marketing across three or four vendors — a
                  social agency for content, a media-buying shop for paid, a freelancer for SEO, an
                  events vendor for activations. The handoffs are where every campaign loses
                  velocity.
                </p>
                <p>
                  We built Public Pulse to remove those handoffs. Strategy, creative, paid media,
                  analytics, and political PR sit in one office in Dhaka, on one shared campaign
                  brief, with one client lead who owns the relationship and the report.
                </p>
                <p>
                  We are a registered business entity in Bangladesh — BIN&nbsp;
                  {SITE.contact.legal.bin}, Trade License&nbsp;{SITE.contact.legal.tradeLicense}.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* ───────── TEAM (Person schema for E-E-A-T) ─────────────────────── */}
      <section className="bg-surface-alt py-24 md:py-32">
        <Container>
          <JsonLd data={TEAM.map((p) => personSchema({ name: p.name, jobTitle: p.role, image: p.image, sameAs: p.sameAs }))} />

          <ScrollReveal>
            <div className="grid items-end gap-8 md:grid-cols-12">
              <div className="md:col-span-7">
                <p className="text-eyebrow uppercase text-brand-red">The team</p>
                <h2 className="mt-4 font-serif text-h2 font-medium text-brand-navy">
                  Senior people
                  <br />
                  <span className="italic">in the room</span>.
                </h2>
              </div>
              <p className="md:col-span-5 text-lead text-slate-700">
                Every engagement is led by a senior on our team — not a junior account manager
                with the senior on a Friday review call. Decisions get made faster, and the brief
                rarely needs a second telling.
              </p>
            </div>
          </ScrollReveal>

          <ul className="mt-16 grid gap-6 md:grid-cols-3">
            {TEAM.map((p, i) => (
              <li key={p.name}>
                <ScrollReveal delayMs={i * 60}>
                  <article className="card-hover h-full rounded-2xl border border-slate-200 bg-white p-8">
                    <div
                      className="h-20 w-20 rounded-full bg-brand-navy text-white grid place-items-center font-serif text-3xl"
                      aria-hidden="true"
                    >
                      {p.name.replace(/[\[\]]/g, "").trim().charAt(0) || "•"}
                    </div>
                    <h3 className="mt-6 font-serif text-2xl font-medium text-brand-navy">{p.name}</h3>
                    <p className="mt-1 text-meta uppercase text-brand-red">{p.role}</p>
                    <p className="mt-4 text-slate-700">{p.bio}</p>
                  </article>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ───────── CLOSING CTA ──────────────────────────────────────────── */}
      <section className="bg-brand-navy py-24 text-white md:py-32">
        <Container>
          <ScrollReveal>
            <div className="grid items-center gap-12 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <h2 className="font-serif text-h1 font-medium">
                  Curious whether we&rsquo;re
                  <br />
                  <span className="italic">the right fit</span>?
                </h2>
                <p className="mt-6 max-w-2xl text-lead text-white/75">
                  We&rsquo;re not for everyone. The fastest way to find out is a 30-minute call.
                </p>
              </div>
              <div className="lg:col-span-4 flex flex-wrap gap-3 lg:justify-end">
                <Link
                  href="/contact"
                  className="cta-primary inline-flex items-center justify-center rounded-full bg-brand-red px-7 py-4 font-semibold text-white"
                >
                  Book the call →
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </>
  );
}
