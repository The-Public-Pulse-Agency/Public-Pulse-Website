import Link from "next/link";
import { ArrowUpRight, MessageCircleMore } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SERVICES } from "@/lib/services";
import { getServiceIcon } from "@/lib/icons";

// Avoora-style hero: massive wordmark, sales-team card top-right (filled
// gradient), gradient panel with avatar pile, sub-headline, and 5 numbered
// service tiles along the bottom.

const SALES_CARD = {
  label: "Sales team",
  availability: "Available 09:00–21:00 BD",
};

const TEAM_AVATARS = [
  { initial: "M", color: "bg-brand-orange" },
  { initial: "S", color: "bg-blue-500" },
  { initial: "A", color: "bg-teal-500" },
  { initial: "R", color: "bg-pink-500" },
];

export function HeroPanel() {
  const tiles = SERVICES.slice(0, 5);

  return (
    <section className="relative bg-paper">
      <Container className="relative pt-6 pb-10 md:pt-10 md:pb-14">
        {/* ── Top row: wordmark + founder card ─────────────────────────── */}
        <div className="flex items-start gap-6">
          <h1 className="flex-1 text-mega font-extrabold leading-[0.92] tracking-[-0.04em] text-ink">
            Public<span className="text-ink/30">_</span>Pulse
            <span className="text-ink/30">®</span>
          </h1>
          {/* Sales team card — filled gradient, desktop only */}
          <Link
            href="/contact"
            aria-label={`${SALES_CARD.label} — ${SALES_CARD.availability}`}
            className="group relative hidden md:flex items-center gap-3 overflow-hidden rounded-panel p-2.5 pr-3 transition hover:shadow-card-hover"
            style={{
              background: `radial-gradient(80% 100% at 100% 0%, #2563EB 0%, transparent 60%), radial-gradient(70% 100% at 0% 100%, #FF5C00 0%, transparent 60%), radial-gradient(60% 80% at 60% 60%, #0F766E 0%, transparent 55%), linear-gradient(135deg, #FF7A2E 0%, #14B8A6 50%, #2563EB 100%)`,
            }}
          >
            <div
              className="relative grid h-12 w-12 place-items-center rounded-card bg-paper/95 text-ink"
              aria-hidden
            >
              {/* Pulsing ring — telegraphs "live sales team" */}
              <span className="pointer-events-none absolute inset-0 rounded-card ring-2 ring-emerald-400/70 animate-ping motion-reduce:hidden" />
              <span className="pointer-events-none absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-paper" />
              <MessageCircleMore className="h-5 w-5" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-sm font-bold text-paper">{SALES_CARD.label}</div>
              <div className="text-[11px] font-medium text-paper/80">
                <span
                  aria-hidden
                  className="mr-1 inline-block h-1.5 w-1.5 -translate-y-[1px] rounded-full bg-emerald-400 align-middle ring-2 ring-emerald-400/30"
                />
                {SALES_CARD.availability}
              </div>
              <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-paper">
                Let&rsquo;s talk
                <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-brand-orange">
                  <ArrowUpRight className="h-2.5 w-2.5" aria-hidden />
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* ── Gradient panel ───────────────────────────────────────────── */}
        <div
          className="relative mt-8 overflow-hidden rounded-[20px] p-6 md:mt-10 md:p-10 lg:min-h-[560px]"
          style={{
            background: `radial-gradient(60% 50% at 75% 25%, #2563EB 0%, transparent 60%), radial-gradient(45% 55% at 20% 70%, #FF5C00 0%, transparent 60%), radial-gradient(50% 60% at 85% 85%, #0F766E 0%, transparent 55%), radial-gradient(40% 60% at 40% 30%, #14B8A6 0%, transparent 60%), linear-gradient(135deg, #FF7A2E 0%, #14B8A6 50%, #2563EB 100%)`,
            backgroundSize: "200% 200%",
            animation: "gradient-drift 22s ease infinite",
          }}
        >
          {/* Slowly drifting decorative blob — adds life without distracting */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-paper/10 blur-3xl animate-float motion-reduce:animate-none"
          />
          <div className="relative flex h-full min-h-[440px] flex-col justify-between">
            {/* Avatar pile */}
            <div className="flex -space-x-3">
              {TEAM_AVATARS.map((a, i) => (
                <div
                  key={i}
                  className={`grid h-10 w-10 place-items-center rounded-full border-2 border-paper text-sm font-bold text-paper ${a.color}`}
                  aria-hidden
                >
                  {a.initial}
                </div>
              ))}
            </div>

            {/* Sub-headline */}
            <div className="mt-12 md:mt-20">
              <h2 className="max-w-[12ch] text-display font-extrabold leading-[1.05] tracking-tight text-paper md:max-w-none md:text-mega md:leading-[0.95]">
                We build brands with <span className="text-paper/70">influence.</span>
              </h2>
              <p className="mt-5 max-w-xl text-sm text-paper/85 md:text-base">
                A 360° digital marketing + political PR studio out of Dhaka — political campaigns,
                hospitality launches, consumer brand builds, all under one accountable team.
              </p>
            </div>

            {/* Numbered service tiles */}
            <ul className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {tiles.map((s, i) => {
                const Icon = getServiceIcon(s.slug);
                return (
                  <li key={s.slug}>
                    <Link
                      href={`/services/${s.slug}`}
                      className="group flex h-full items-center gap-3 rounded-card bg-paper/85 p-2.5 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-paper hover:shadow-card-hover"
                    >
                      <span
                        className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-[8px] text-paper transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                        style={{ background: tileGradient(i) }}
                        aria-hidden
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-semibold text-ink/55">
                          ({String(i + 1).padStart(2, "0")})
                        </div>
                        <div className="truncate text-xs font-bold leading-tight text-ink md:text-sm">
                          {s.shortName}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

// Decorative gradient swatches for the 5 service tile thumbnails.
function tileGradient(i: number): string {
  const stops = [
    "linear-gradient(135deg,#FF7A2E,#FF5C00)",
    "linear-gradient(135deg,#60A5FA,#2563EB)",
    "linear-gradient(135deg,#FBCFE8,#F472B6)",
    "linear-gradient(135deg,#5EEAD4,#0D9488)",
    "linear-gradient(135deg,#FCD34D,#F59E0B)",
  ];
  return stops[i % stops.length];
}
