"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "Studio" },
  { href: "/blog", label: "Insights" },
  { href: "/contact", label: "Contact" },
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
      <div className="max-w-container mx-auto flex h-16 items-center justify-between px-5 md:h-[72px] md:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="Public Pulse Agency home">
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

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-7 text-[14px] font-medium text-ink/80">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="transition hover:text-ink">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="hidden sm:inline-flex btn btn-primary text-[13px] uppercase tracking-wide"
          >
            Let&rsquo;s talk
          </Link>
          <button
            ref={triggerRef}
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav-drawer"
            onClick={() => setOpen((o) => !o)}
            className="md:hidden grid h-10 w-10 place-items-center rounded-card border border-ink text-ink"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          ref={drawerRef}
          id="mobile-nav-drawer"
          role="region"
          aria-label="Mobile navigation"
          className="md:hidden border-t border-ink/10 bg-paper"
        >
          <ul className="px-5 py-4 space-y-3 text-base font-semibold text-ink">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className="block py-2"
                  onClick={closeDrawer}
                >
                  {n.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/contact"
                onClick={closeDrawer}
                className="btn btn-primary w-full justify-center"
              >
                Let&rsquo;s talk
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
