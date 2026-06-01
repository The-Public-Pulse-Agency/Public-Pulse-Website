"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Search, ArrowUpRight } from "lucide-react";

// Primary nav. /election is a priority landing page (seasonal political-PR
// flagship) so it sits in the top bar between Work and Insights. Search
// is also priority — promoted from icon-only to a labeled button in the
// right cluster (see below). Press remains secondary (mobile drawer + footer).
const NAV = [
  { href: "/services", label: "Services" },
  { href: "/case-studies", label: "Work" },
  { href: "/election", label: "Election" },
  { href: "/blog", label: "Insights" },
  { href: "/about", label: "Studio" },
  { href: "/contact", label: "Contact" },
];

// Secondary nav — only Press now; Election + Search were promoted to
// the primary bar / right cluster. Press still surfaces in the mobile
// drawer + footer for journalist discoverability.
const SECONDARY = [
  { href: "/press", label: "Press & media" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Drawer a11y: when open, move focus to first link, trap Tab inside,
  // and ESC closes the drawer + returns focus to the hamburger.
  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    const focusables = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])'
    );
    focusables[0]?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  function closeDrawer() {
    setOpen(false);
    // Return focus to the hamburger so keyboard users don't lose their place.
    triggerRef.current?.focus();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="max-w-container mx-auto flex h-16 items-center justify-between gap-4 px-5 md:h-[72px] md:px-8">
        {/* ─── Logo ──────────────────────────────────────────────────── */}
        <Link
          href="/"
          className="flex flex-shrink-0 items-center gap-2"
          aria-label="Public Pulse Agency home"
        >
          <span
            aria-hidden
            className="inline-block h-5 w-5 rounded-full"
            style={{
              background:
                "conic-gradient(from 180deg at 50% 50%, #FF5C00 0deg, #FF5C00 270deg, transparent 270deg)",
            }}
          />
          <span className="text-[18px] font-extrabold tracking-tight text-ink">
            Public<span className="text-brand-orange">Pulse</span>
          </span>
        </Link>

        {/* ─── Primary nav (desktop) ──────────────────────────────── */}
        <nav aria-label="Primary" className="hidden md:flex md:flex-1 md:justify-center">
          <ul className="flex items-center gap-6 text-[14px] font-medium text-ink/75 lg:gap-8">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className="transition hover:text-ink focus-visible:text-ink"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ─── Right cluster: search + CTA + hamburger ─────────────── */}
        <div className="flex flex-shrink-0 items-center gap-2 md:gap-3">
          <Link
            href="/search"
            className="hidden items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-[13px] font-medium text-ink/75 transition hover:border-ink hover:text-ink md:inline-flex"
          >
            <Search className="h-[15px] w-[15px]" aria-hidden />
            Search
          </Link>
          <Link
            href="/book"
            className="btn btn-orange hidden text-[13px] uppercase tracking-wide sm:inline-flex"
          >
            Book a call
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
          <button
            ref={triggerRef}
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open ? "true" : "false"}
            aria-controls="mobile-nav-drawer"
            onClick={() => setOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-card border border-ink text-ink md:hidden"
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      {/* ─── Mobile drawer ─────────────────────────────────────────── */}
      {open && (
        <div
          ref={drawerRef}
          id="mobile-nav-drawer"
          role="region"
          aria-label="Mobile navigation"
          className="border-t border-ink/10 bg-paper md:hidden"
        >
          <div className="px-5 py-6">
            {/* Priority block — Election + Search pinned to top with
                brand-orange accent so they're the first thing thumbed. */}
            <ul className="space-y-2">
              <li>
                <Link
                  href="/election"
                  onClick={closeDrawer}
                  className="flex items-center justify-between rounded-card border-2 border-brand-orange bg-brand-orange/5 px-4 py-3 text-lg font-bold text-ink"
                >
                  <span className="flex items-center gap-2">
                    Election readiness
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-brand-orange" aria-hidden />
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  onClick={closeDrawer}
                  className="flex items-center justify-between rounded-card border border-ink/15 px-4 py-3 text-base font-semibold text-ink"
                >
                  <span className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-ink/55" aria-hidden />
                    Search the site
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-ink/30" aria-hidden />
                </Link>
              </li>
            </ul>

            {/* Divider */}
            <hr className="my-5 border-ink/10" aria-hidden />

            {/* Primary nav */}
            <ul className="space-y-1 text-lg font-bold text-ink">
              {NAV.filter((n) => n.href !== "/election").map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="flex items-center justify-between py-2.5 transition hover:text-brand-orange"
                    onClick={closeDrawer}
                  >
                    <span>{n.label}</span>
                    <ArrowUpRight className="h-4 w-4 text-ink/30" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>

            {/* Divider */}
            <hr className="my-5 border-ink/10" aria-hidden />

            {/* Secondary nav */}
            <p className="text-eyebrow uppercase tracking-wider text-ink/45">More</p>
            <ul className="mt-3 space-y-1 text-base font-medium text-ink/85">
              {SECONDARY.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="flex items-center justify-between py-2 transition hover:text-brand-orange"
                    onClick={closeDrawer}
                  >
                    <span>{s.label}</span>
                    <ArrowUpRight className="h-4 w-4 text-ink/30" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>

            {/* Primary CTA + WhatsApp fallback */}
            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                href="/book"
                onClick={closeDrawer}
                className="btn btn-orange w-full justify-center"
              >
                Book a call
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href="https://wa.me/message/TBIM4KYTCFPEI1"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeDrawer}
                className="btn btn-secondary w-full justify-center"
              >
                Message on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
