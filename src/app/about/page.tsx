import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Building2, Users, ShieldCheck, Sparkles } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { aboutPageSchema, breadcrumbSchema, personSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Container } from "@/components/ui/Container";
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

const VALUES = [
  {
    icon: Users,
    title: "Senior in the room",
    body: "Every engagement is owned by a senior on our team — not a junior account manager calling the senior on a Friday review.",
  },
  {
    icon: Building2,
    title: "Local by design",
    body: "Built in Dhaka, hires in Bangladesh, bills in BDT. Designed for our cultural and regulatory reality — not ported from elsewhere.",
  },
  {
    icon: ShieldCheck,
    title: "One accountable team",
    body: "Strategy, creative, paid media, PR and analytics in one office, on one brief, with one weekly report. No more agency hand-offs.",
  },
  {
    icon: Sparkles,
    title: "Honest reporting",
    body: "Monthly business review covers what worked, what didn't and what we're killing. No vanity metrics on the dashboard.",
  },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={[aboutPageSchema(), breadcrumbSchema(crumbs)]} />

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(50%_45%_at_50%_0%,rgba(13,148,136,0.07),transparent_60%)]"
        />
        <Container className="relative pt-10 pb-14 md:pt-14 md:pb-20">
          <Breadcrumbs crumbs={crumbs} />
          <div className="mx-auto mt-6 max-w-3xl text-center">
            <p className="text-eyebrow uppercase text-brand-teal">About the agency</p>
            <h1 className="mt-3 text-display font-extrabold tracking-tight text-brand-navy">
              A small team built for Bangladesh.
            </h1>
            <p className="mt-5 text-lead text-slate-600">
              Founded in Dhaka in 2024 to run the kind of integrated digital marketing and political
              PR that Bangladeshi brands and candidates were stitching together from three or four
              vendors.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl">
            <AnswerBlock>
              Public Pulse Agency is a Dhaka-based 360° digital marketing and political PR agency,
              founded in 2024. We serve 50+ active clients across 10+ industries with an average
              engagement lift of 300%+ in the first 90 days. Part of {SITE.name.replace("Agency", "")}
              Group.
            </AnswerBlock>
          </div>
        </Container>
      </section>

      {/* ─── STORY ────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 md:py-24">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-eyebrow uppercase text-brand-teal">Our story</p>
              <h2 className="mt-3 text-h2 font-bold tracking-tight text-brand-navy">
                Founded to fix the handoff problem.
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-5 text-slate-700">
              <p>
                Most Bangladeshi brands run digital marketing across three or four vendors — a
                social agency for content, a media-buying shop for paid, a freelancer for SEO, an
                events vendor for activations. The hand-offs are where every campaign loses
                velocity.
              </p>
              <p>
                We built Public Pulse to remove those hand-offs. Strategy, creative, paid media,
                analytics, and political PR sit in one office in Dhaka, on one shared campaign
                brief, with one client lead who owns the relationship and the report.
              </p>
              <p>
                Registered business entity in Bangladesh — BIN&nbsp;
                {SITE.contact.legal.bin}, Trade License&nbsp;{SITE.contact.legal.tradeLicense}.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── VALUES ──────────────────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-surface-alt py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-eyebrow uppercase text-brand-teal">How we work</p>
            <h2 className="mt-3 text-h2 font-bold tracking-tight text-brand-navy">
              Four principles you can hold us to.
            </h2>
          </div>
          <ul className="mt-12 grid gap-5 sm:grid-cols-2">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <li key={v.title} className="card">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-card bg-brand-teal/10 text-brand-teal">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-h3 font-semibold text-brand-navy">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{v.body}</p>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* ─── TEAM (Person schema) ────────────────────────────────────── */}
      <section className="bg-white py-20 md:py-24">
        <Container>
          <JsonLd
            data={TEAM.map((p) =>
              personSchema({ name: p.name, jobTitle: p.role, image: p.image, sameAs: p.sameAs })
            )}
          />
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-eyebrow uppercase text-brand-teal">Leadership</p>
            <h2 className="mt-3 text-h2 font-bold tracking-tight text-brand-navy">
              Senior people in the room.
            </h2>
          </div>
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {TEAM.map((p) => (
              <li key={p.name}>
                <article className="card h-full">
                  <div
                    className="grid h-14 w-14 place-items-center rounded-full bg-brand-navy text-white text-xl font-bold"
                    aria-hidden="true"
                  >
                    {p.name.replace(/[\[\]]/g, "").trim().charAt(0) || "•"}
                  </div>
                  <h3 className="mt-5 text-h3 font-semibold text-brand-navy">{p.name}</h3>
                  <p className="mt-1 text-meta uppercase tracking-wider text-brand-teal">{p.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{p.bio}</p>
                </article>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ─── CLOSING CTA ─────────────────────────────────────────────── */}
      <section className="bg-brand-navy py-20 text-white md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-h1 font-bold tracking-tight">
              Curious whether we&rsquo;re the right fit?
            </h2>
            <p className="mt-4 text-lead text-white/75">
              We&rsquo;re not for everyone. The fastest way to find out is a 30-minute call.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/contact" className="btn btn-primary">
                Book the call
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
