// Shared shell for the three legal pages (privacy / terms / data-deletion).
// Renders the avoora-style hero + a typographically clean prose body.
// Keeps the layout consistent and accessible.

import type { ReactNode } from "react";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { SITE } from "@/lib/site";

type Props = {
  /** "Privacy Policy" / "Terms of Service" / "User Data Deletion". */
  title: string;
  /** "/privacy" / "/terms" / "/data-deletion". */
  path: string;
  /** Eyebrow above the H1 — e.g. "Legal". */
  eyebrow: string;
  /** One-line intro under the H1. */
  intro: string;
  /** ISO date — "Last updated". */
  effectiveDate: string;
  children: ReactNode;
};

export function LegalPage({ title, path, eyebrow, intro, effectiveDate, children }: Props) {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: title, path },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          webPageSchema({
            path,
            name: title,
            description: intro,
          }),
        ]}
      />

      <section className="border-b border-ink bg-paper">
        <Container className="pt-2">
          <Breadcrumbs crumbs={crumbs} />
        </Container>
        <Container>
          <div className="grid items-end gap-10 py-10 md:grid-cols-12 md:py-16">
            <div className="md:col-span-8">
              <span className="chip chip-orange">{eyebrow}</span>
              <h1 className="mt-5 text-[clamp(2.2rem,3.2vw+1rem,4rem)] font-extrabold leading-[1.04] tracking-tight text-ink">
                {title}
              </h1>
              <p className="mt-5 text-lead text-ink/70">{intro}</p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <p className="text-eyebrow text-ink/55">Last updated</p>
              <p className="mt-2 text-base font-semibold text-ink">{effectiveDate}</p>
              <p className="mt-3 text-meta text-ink/55">
                Questions?{" "}
                <Link
                  href={`mailto:${SITE.contact.email}`}
                  className="underline hover:text-brand-orange"
                >
                  {SITE.contact.email}
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-ink bg-paper-alt py-16 md:py-24">
        <Container>
          <article className="prose-legal mx-auto max-w-3xl">{children}</article>
        </Container>
      </section>

      <section className="border-b border-ink bg-paper py-12">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-meta text-ink/55">
              {SITE.name} · Dhaka, Bangladesh · BIN {SITE.contact.legal.bin} · Trade Licence{" "}
              {SITE.contact.legal.tradeLicense}
            </p>
            <p className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-meta">
              <Link href="/privacy" className="text-ink/70 hover:text-brand-orange">
                Privacy
              </Link>
              <Link href="/terms" className="text-ink/70 hover:text-brand-orange">
                Terms
              </Link>
              <Link href="/data-deletion" className="text-ink/70 hover:text-brand-orange">
                Data deletion
              </Link>
              <Link href="/contact" className="text-ink/70 hover:text-brand-orange">
                Contact
              </Link>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
