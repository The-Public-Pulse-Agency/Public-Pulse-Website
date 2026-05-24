import Link from "next/link";
import { SITE } from "@/lib/site";
import { SISTER_BRANDS, PULSE_GROUP } from "@/lib/group";
import { SERVICES } from "@/lib/services";

export function Footer() {
  return (
    <footer className="mt-24 bg-brand-navy text-white">
      <div className="max-w-container mx-auto grid grid-cols-1 gap-10 px-6 py-14 md:grid-cols-5">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-baseline gap-1.5" aria-label="Public Pulse Agency home">
            <span className="text-[20px] font-extrabold tracking-tight text-white">Public</span>
            <span className="text-[20px] font-extrabold tracking-tight text-brand-teal-soft">Pulse</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-white/70">{SITE.description}</p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs">
            <a
              href={`tel:${SITE.contact.phone}`}
              className="inline-flex items-center rounded-full border border-white/15 px-3 py-1.5 text-white/85 hover:border-white/40"
            >
              {SITE.contact.phoneDisplay}
            </a>
            <a
              href={`mailto:${SITE.contact.email}`}
              className="inline-flex items-center rounded-full border border-white/15 px-3 py-1.5 text-white/85 hover:border-white/40"
            >
              {SITE.contact.email}
            </a>
          </div>
          <div className="mt-5 flex gap-4 text-xs text-white/65">
            <a href={SITE.social.facebook} rel="noopener noreferrer" target="_blank" className="hover:text-white">
              Facebook
            </a>
            <a href={SITE.social.instagram} rel="noopener noreferrer" target="_blank" className="hover:text-white">
              Instagram
            </a>
            <a href={SITE.contact.whatsapp} rel="noopener noreferrer" target="_blank" className="hover:text-white">
              WhatsApp
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">Platform</h3>
          <ul className="mt-3 space-y-2 text-sm">
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
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">Company</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/about" className="text-white/80 hover:text-white">
                About
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-white/80 hover:text-white">
                Insights
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-white/80 hover:text-white">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/group" className="text-white/80 hover:text-white">
                Pulse Group
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">Sister concerns</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {SISTER_BRANDS.map((b) => (
              <li key={b.slug}>
                <a
                  href={b.url}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-white/80 hover:text-white"
                >
                  {b.name}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-white/55">
            Part of{" "}
            <Link href="/group" className="underline decoration-white/30 hover:decoration-white">
              {PULSE_GROUP.name}
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-container mx-auto flex flex-col gap-2 px-6 py-6 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <div>
            © {new Date().getFullYear()} {SITE.name}. Dhaka, Bangladesh. All rights reserved.
          </div>
          <div>
            BIN: {SITE.contact.legal.bin} · Trade License: {SITE.contact.legal.tradeLicense}
          </div>
        </div>
      </div>
    </footer>
  );
}
