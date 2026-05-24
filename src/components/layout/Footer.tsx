import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/site";
import { SERVICES } from "@/lib/services";

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      {/* ─── Mega CTA strip ──────────────────────────────────────────── */}
      <div className="border-b border-white/10">
        <div className="max-w-container mx-auto flex flex-col gap-8 px-5 py-16 md:flex-row md:items-end md:justify-between md:px-8 md:py-24">
          <h2 className="text-mega font-extrabold tracking-tight">
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
      <div className="max-w-container mx-auto grid grid-cols-2 gap-10 px-5 py-14 md:grid-cols-4 md:px-8">
        <div className="col-span-2 md:col-span-2">
          <Link href="/" className="flex items-baseline gap-1" aria-label="Public Pulse Agency home">
            <span className="text-[22px] font-extrabold tracking-tight text-paper">Public</span>
            <span className="text-[22px] font-extrabold tracking-tight text-brand-orange">Pulse</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">{SITE.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`tel:${SITE.contact.phone}`}
              className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-wider text-white/85 hover:border-white/50"
            >
              {SITE.contact.phoneDisplay}
            </a>
            <a
              href={`mailto:${SITE.contact.email}`}
              className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-wider text-white/85 hover:border-white/50"
            >
              {SITE.contact.email}
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
            <li><Link href="/blog" className="text-white/80 hover:text-white">Insights</Link></li>
            <li><Link href="/contact" className="text-white/80 hover:text-white">Contact</Link></li>
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

      <div className="border-t border-white/10">
        <div className="max-w-container mx-auto flex flex-col gap-2 px-5 py-6 text-xs text-white/55 md:flex-row md:items-center md:justify-between md:px-8">
          <div>© {new Date().getFullYear()} {SITE.name}. Dhaka, Bangladesh.</div>
          <div>BIN: {SITE.contact.legal.bin} · Trade License: {SITE.contact.legal.tradeLicense}</div>
        </div>
      </div>
    </footer>
  );
}
