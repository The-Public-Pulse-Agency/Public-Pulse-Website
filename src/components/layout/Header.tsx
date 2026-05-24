import Link from "next/link";

const NAV = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "Studio" },
  { href: "/blog", label: "Insights" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/85 backdrop-blur">
      <div className="max-w-container mx-auto flex h-16 items-center justify-between px-5 md:h-[72px] md:px-8">
        <Link href="/" className="flex items-baseline gap-1" aria-label="Public Pulse Agency home">
          <span className="text-[20px] font-extrabold tracking-tight text-ink">Public</span>
          <span className="text-[20px] font-extrabold tracking-tight text-brand-orange">Pulse</span>
          <span className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-orange" />
        </Link>
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-8 text-[14px] font-medium text-ink/80">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="transition hover:text-ink">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link href="/contact" className="btn btn-primary text-[13px] uppercase tracking-wide">
          Let&rsquo;s talk
        </Link>
      </div>
    </header>
  );
}
