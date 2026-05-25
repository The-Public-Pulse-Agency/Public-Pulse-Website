import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { aboutPageSchema, breadcrumbSchema, personSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { GradientHero } from "@/components/seo/GradientHero";
import { getAuthors } from "@/lib/data/blog";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "About Public Pulse Agency | Digital Marketing Dhaka",
  description:
    "Public Pulse Agency is Bangladesh's 360° digital marketing and political PR studio, founded in Dhaka 2024. Nine integrated services for 50+ active clients across 10+ industries.",
  path: "/about",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Studio", path: "/about" },
];

// Hardcoded fallback used only when the authors table is empty (cold-start
// before /manage/team has rows). When the DB has rows the page reads from
// it via the cached getAuthors() data layer.
const FALLBACK_TEAM = [
  { slug: "founder", name: "[Founder Name]", role: "Founder & MD", bio: "Leads strategy across the studio. Background in political PR and brand-building for Bangladesh consumer brands.", image: null as string | null, sameAs: [] as string[], credentials: null as string | null },
];

const VALUES = [
  { title: "Senior in the room", body: "Every engagement is owned by a senior — not a junior account manager calling the senior on a Friday review." },
  { title: "Local by design", body: "Built in Dhaka, hires in Bangladesh, bills in BDT. Designed for our cultural and regulatory reality." },
  { title: "One accountable team", body: "Strategy, creative, paid media, PR and analytics in one office, on one brief, with one weekly report." },
  { title: "Honest reporting", body: "Monthly business review covers what worked, what didn't and what we're killing. No vanity dashboards." },
];

export default async function AboutPage() {
  const dbTeam = await getAuthors();
  const TEAM = dbTeam.length > 0
    ? dbTeam.map((a) => ({
        slug: a.slug,
        name: a.name,
        role: a.role,
        bio: a.bio,
        image: a.image,
        sameAs: (a.sameAs as string[] | null) ?? [],
        credentials: a.credentials,
      }))
    : FALLBACK_TEAM;
  return (
    <>
      <JsonLd data={[aboutPageSchema(), breadcrumbSchema(crumbs)]} />

      <GradientHero
        crumbs={crumbs}
        chip="Studio"
        title={
          <>
            A small studio <span className="text-brand-orange">built</span> for Bangladesh.
          </>
        }
        lead="Founded in Dhaka in 2024 to run the kind of integrated digital marketing and political PR that Bangladeshi brands were stitching together from three or four vendors."
        answer="Public Pulse Agency is a Dhaka-based 360° digital marketing and political PR studio, founded in 2024. We serve 50+ active clients across 10+ industries with an average engagement lift of 300%+ in the first 90 days, billed in BDT from our registered Dhaka entity."
      />

      <section className="border-y border-ink bg-paper-alt py-20 md:py-28">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-eyebrow uppercase text-brand-orange">Our story</p>
              <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
                Founded to fix the handoff problem.
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-5 text-ink/80">
              <p>
                Most Bangladeshi brands run digital marketing across three or four vendors — a social
                agency for content, a media-buying shop for paid, a freelancer for SEO, an events
                vendor for activations. The hand-offs are where every campaign loses velocity.
              </p>
              <p>
                We built Public Pulse to remove those hand-offs. Strategy, creative, paid media,
                analytics, and political PR sit in one office in Dhaka, on one shared campaign brief,
                with one client lead who owns the relationship and the report.
              </p>
              <p>
                Registered business entity in Bangladesh — BIN&nbsp;
                {SITE.contact.legal.bin}, Trade License&nbsp;{SITE.contact.legal.tradeLicense}.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-paper py-20 md:py-28">
        <Container>
          <div className="max-w-3xl">
            <p className="text-eyebrow uppercase text-brand-orange">How we work</p>
            <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
              Four principles. Hold us to them.
            </h2>
          </div>
          <ul className="mt-12 grid gap-5 md:grid-cols-2">
            {VALUES.map((v, i) => (
              <li key={v.title}>
                <ScrollReveal delayMs={i * 60}>
                  <div className="card h-full">
                    <h3 className="text-h3 font-bold text-ink">{v.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink/70">{v.body}</p>
                  </div>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-t border-ink bg-ink py-20 text-paper md:py-28">
        <Container>
          <JsonLd
            data={TEAM.map((p) =>
              personSchema({ name: p.name, jobTitle: p.role, image: p.image ?? undefined, sameAs: p.sameAs })
            )}
          />
          <div className="max-w-3xl">
            <p className="text-eyebrow uppercase text-brand-orange">Leadership</p>
            <h2 className="mt-4 text-display font-extrabold tracking-tight">
              Senior people in the room.
            </h2>
          </div>
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {TEAM.map((p) => (
              <li key={p.slug}>
                <article id={p.slug} className="h-full scroll-mt-24 rounded-card border border-white/15 bg-ink-soft p-6 transition hover:border-brand-orange">
                  <div
                    className="grid h-14 w-14 place-items-center rounded-full bg-brand-orange text-paper text-xl font-bold"
                    aria-hidden="true"
                  >
                    {p.name.replace(/[\[\]]/g, "").trim().charAt(0) || "•"}
                  </div>
                  <h3 className="mt-5 text-h3 font-bold">{p.name}</h3>
                  <p className="mt-1 text-meta uppercase tracking-wider text-brand-orange">{p.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{p.bio}</p>
                  {p.credentials && (
                    <p className="mt-3 text-[11px] uppercase tracking-wider text-white/55">
                      {p.credentials}
                    </p>
                  )}
                </article>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-t border-ink bg-paper py-24 md:py-28">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-mega font-extrabold leading-[0.95] tracking-tight text-ink">
              Curious whether we&rsquo;re <span className="text-brand-orange">the right fit</span>?
            </h2>
            <p className="mt-6 text-lead text-ink/70">
              We&rsquo;re not for everyone. The fastest way to find out is a 30-minute call.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/contact" className="btn btn-primary">
                Book the call
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
