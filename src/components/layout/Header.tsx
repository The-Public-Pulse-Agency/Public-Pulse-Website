import Link from "next/link";

const NAV = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Insights" },
  { href: "/group", label: "Pulse Group" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="max-w-container mx-auto flex h-[68px] items-center justify-between px-6">
        <Link href="/" className="flex items-baseline gap-1.5" aria-label="Public Pulse Agency home">
          <span className="text-[17px] font-extrabold tracking-tight text-brand-navy">Public</span>
          <span className="text-[17px] font-extrabold tracking-tight text-brand-teal">Pulse</span>
        </Link>
        <nav aria-label="Primary">
          <ul className="hidden md:flex items-center gap-7 text-[14px] font-medium text-slate-600">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="transition hover:text-brand-navy">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="hidden sm:inline-flex text-[14px] font-medium text-slate-700 hover:text-brand-navy"
          >
            Sign in
          </Link>
          <Link href="/contact" className="btn btn-primary text-[14px]">
            Book a free audit
          </Link>
        </div>
      </div>
    </header>
  );
}
