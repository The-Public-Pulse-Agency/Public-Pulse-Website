import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqPageSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { bookingUrl } from "@/lib/booking";
import { SITE } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Book a strategy call | Public Pulse",
  description:
    "Schedule a 30-minute strategy call with Public Pulse Agency. We'll review your goals, current setup, and outline what could move the needle in Bangladesh.",
  path: "/book",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Book a call", path: "/book" },
];

export default function BookPage() {
  const url = bookingUrl();
  // When BOOKING_URL isn't configured yet, redirect to /contact rather
  // than show a broken page. Visitors still get to a working entry point.
  if (!url) redirect("/contact");

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          faqPageSchema([
            {
              q: "How long is the strategy call?",
              a: "30 minutes. Long enough to map your goals to a workable plan; short enough that you can fit it in.",
            },
            {
              q: "What should I prepare?",
              a: "A rough goal (lead volume, brand reach, election timeline, whatever), current channels you run on, and any past performance numbers if you have them. We'll do the rest.",
            },
            {
              q: "Is it billed?",
              a: "The discovery call is free. We only quote scope + price after we understand the brief — written proposal within 24 hours.",
            },
          ]),
        ]}
      />

      <section className="bg-paper py-12 md:py-20">
        <Container>
          <Breadcrumbs crumbs={crumbs} />
          <div className="mt-6 max-w-3xl">
            <p className="text-eyebrow uppercase text-brand-orange">Book a call</p>
            <h1 className="mt-4 text-h1 font-extrabold tracking-tight text-ink">
              Pick a time that works.
            </h1>
            <p className="mt-5 text-lead text-ink/70">
              30-minute strategy call with a senior at the studio. We'll cover your
              goals, current setup, and what a working plan could look like — Dhaka
              time, English or {SITE.contact.phoneDisplay} fallback if you prefer phone.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-card border border-ink/10 bg-paper shadow-card">
            <iframe
              src={url}
              title="Schedule a call with Public Pulse"
              loading="lazy"
              className="h-[820px] w-full"
              style={{ border: 0 }}
            />
          </div>

          <p className="mt-6 text-meta text-ink/55">
            Can&apos;t see the calendar?{" "}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-orange underline hover:no-underline"
            >
              Open booking page in a new tab
            </a>
            .
          </p>
        </Container>
      </section>
    </>
  );
}
