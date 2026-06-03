import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/site";
import { SERVICES } from "@/lib/services";
import { CaptureForm } from "@/components/lead-capture";

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      {/* ─── Mega CTA strip ──────────────────────────────────────────── */}
      <div className="border-b border-white/10">
        <div className="max-w-container mx-auto flex flex-col gap-8 px-5 py-16 md:flex-row md:items-end md:justify-between md:px-8 md:py-24">
          <h2 className="text-mega tracking-tight">
            Let&rsquo;s make <span className="text-brand-orange">noise</span>.
          </h2>
          <Link
            href="/contact"
            className="btn btn-orange text-[14px] uppercase tracking-wide"
          >
            Start a project
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>

      {/* ─── Columns ─────────────────────────────────────────────────── */}
      <div className="max-w-container mx-auto grid grid-cols-2 gap-10 px-5 py-14 md:grid-cols-6 md:px-8">
        <div className="col-span-2 md:col-span-2">
          <Link href="/" className="flex items-baseline gap-1" aria-label="Public Pulse Agency home">
            <span className="text-[22px] font-extrabold tracking-tight text-paper">Public</span>
            <span className="text-[22px] font-extrabold tracking-tight text-brand-orange">Pulse</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">{SITE.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`tel:${SITE.contact.phone}`}
              className="inline-flex min-h-[44px] items-center rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-wider text-white/85 hover:border-white/50"
            >
              {SITE.contact.phoneDisplay}
            </a>
            <a
              href={`mailto:${SITE.contact.email}`}
              className="inline-flex min-h-[44px] items-center rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-wider text-white/85 hover:border-white/50"
            >
              {SITE.contact.email}
            </a>
            <a
              href={SITE.contact.mapsShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-wider text-white/85 hover:border-white/50"
            >
              Find us on Maps →
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">Services</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {SERVICES.slice(0, 5).map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="text-white/80 hover:text-white">
                  {s.shortName}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/services" className="text-white/80 hover:text-white">
                All services →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">Studio</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/about" className="text-white/80 hover:text-white">About</Link></li>
            <li><Link href="/case-studies" className="text-white/80 hover:text-white">Work</Link></li>
            <li><Link href="/blog" className="text-white/80 hover:text-white">Insights</Link></li>
            <li><Link href="/press" className="text-white/80 hover:text-white">Press</Link></li>
            <li><Link href="/contact" className="text-white/80 hover:text-white">Contact</Link></li>
            <li><Link href="/book" className="text-white/80 hover:text-white">Book a call</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">Resources</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/election" className="text-white/80 hover:text-white">Election readiness</Link></li>
            <li><Link href="/guides" className="text-white/80 hover:text-white">Guides</Link></li>
            <li><Link href="/glossary" className="text-white/80 hover:text-white">Glossary</Link></li>
            <li><Link href="/compare" className="text-white/80 hover:text-white">Compare</Link></li>
            <li><Link href="/locations" className="text-white/80 hover:text-white">Locations</Link></li>
            <li><Link href="/industries" className="text-white/80 hover:text-white">Industries</Link></li>
            <li><Link href="/search" className="text-white/80 hover:text-white">Search</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">Social</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a href={SITE.social.facebook} rel="noopener noreferrer" target="_blank" className="text-white/80 hover:text-white">
                Facebook
              </a>
            </li>
            <li>
              <a href={SITE.social.instagram} rel="noopener noreferrer" target="_blank" className="text-white/80 hover:text-white">
                Instagram
              </a>
            </li>
            <li>
              <a href={SITE.contact.whatsapp} rel="noopener noreferrer" target="_blank" className="text-white/80 hover:text-white">
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* ─── Newsletter strip ───────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="max-w-container mx-auto flex flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-orange">
              The Pulse Digest
            </p>
            <p className="mt-2 max-w-sm text-sm text-white/85">
              Bi-weekly playbooks from Bangladesh campaigns. Paid, social, PR. The real numbers.
            </p>
          </div>
          <div className="w-full md:max-w-md">
            <CaptureForm context="footer" variant="dark" hideChannelTabs />
          </div>
        </div>
      </div>

      {/* ─── Legal row ────────────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="max-w-container mx-auto flex flex-col gap-3 px-5 py-5 text-xs text-white/55 md:flex-row md:items-center md:justify-between md:px-8">
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="text-white/70 hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-white/70 hover:text-white">
              Terms of Service
            </Link>
            <Link href="/data-deletion" className="text-white/70 hover:text-white">
              Data Deletion
            </Link>
          </nav>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-container mx-auto flex flex-col gap-2 px-5 py-6 text-xs text-white/55 md:flex-row md:items-center md:justify-between md:px-8">
          <div>© {new Date().getFullYear()} {SITE.name}. Dhaka, Bangladesh.</div>
          <div>BIN: {SITE.contact.legal.bin} · Trade License: {SITE.contact.legal.tradeLicense}</div>
        </div>
      </div>

      {/* ─── Mega footer wordmark (avoora-faithful) ───────────────────────
          Edge-to-edge typographic sign-off — the way avoora closes with
          "AVOORA®". "PublicPulse" is twice as long as "AVOORA" so the
          per-character size is tuned smaller to fit the container width
          on desktop without clipping. Tracking-tight, weight 500. */}
      <div
        aria-hidden
        className="select-none overflow-hidden border-t border-white/10 px-4 pt-8 pb-2 md:pt-12 md:pb-4 md:px-8"
      >
        <div className="max-w-container mx-auto">
          <div className="whitespace-nowrap font-medium leading-[0.88] tracking-[-0.06em] text-paper [font-size:clamp(2.5rem,11vw,9.5rem)]">
            Public<span className="text-brand-orange">Pulse</span>
            <sup className="align-top text-[0.3em] tracking-normal text-paper/55">®</sup>
          </div>
        </div>
      </div>
    </footer>
  );
}
