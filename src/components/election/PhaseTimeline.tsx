"use client";

import { useState } from "react";
import { Users, Megaphone, Calendar, AlertTriangle, ShieldCheck, Clock } from "lucide-react";

// Interactive 5-phase timeline for /election. Tabs across the top, body
// fades in below. Keyboard-navigable (←/→), accessible roles.
//
// Icons are passed as string keys (not component refs) because this is a
// client component receiving props from a server component — React can't
// serialize component references across that boundary.

const ICONS = {
  users: Users,
  megaphone: Megaphone,
  calendar: Calendar,
  warning: AlertTriangle,
  shield: ShieldCheck,
  clock: Clock,
} as const;
export type PhaseIcon = keyof typeof ICONS;

export type Phase = {
  icon: PhaseIcon;
  weeks: string;
  title: string;
  body: string;
};

export function PhaseTimeline({ phases }: { phases: Phase[] }) {
  const [active, setActive] = useState(0);

  function onKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActive((a) => Math.min(phases.length - 1, a + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    }
  }

  return (
    <div>
      {/* Tabs / phase chips */}
      <div
        role="tablist"
        aria-label="Election readiness phases"
        onKeyDown={onKey}
        className="grid grid-cols-2 gap-2 md:grid-cols-5"
      >
        {phases.map((p, i) => {
          const isActive = i === active;
          const Icon = ICONS[p.icon];
          return (
            <button
              key={p.title}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`phase-${i}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(i)}
              className={`group flex flex-col items-start gap-2 rounded-card border p-4 text-left transition ${
                isActive
                  ? "border-brand-orange bg-brand-orange/5 shadow-card"
                  : "border-ink/10 bg-paper hover:border-ink/40"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  aria-hidden
                  className={`grid h-9 w-9 place-items-center rounded-full transition ${
                    isActive ? "bg-brand-orange text-paper" : "bg-ink/5 text-ink"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-meta font-mono uppercase tracking-wider text-ink/45">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div>
                <p className="text-meta uppercase tracking-wider text-ink/55">{p.weeks}</p>
                <p className="mt-1 text-sm font-bold text-ink">{p.title}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active phase body */}
      <div
        id={`phase-${active}`}
        role="tabpanel"
        aria-labelledby={`phase-tab-${active}`}
        className="mt-6 rounded-card border border-ink/10 bg-paper p-6 md:p-8"
        key={active /* re-render to retrigger fade */}
      >
        <p className="text-eyebrow uppercase text-brand-orange">{phases[active].weeks}</p>
        <h3 className="mt-3 text-h2 tracking-tight text-ink">{phases[active].title}</h3>
        <p className="mt-4 text-lead text-ink/70">{phases[active].body}</p>

        {/* Phase index ruler */}
        <div className="mt-8 flex items-center gap-3">
          {phases.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Phase ${i + 1}`}
              className={`h-1 flex-1 rounded-full transition ${
                i === active ? "bg-brand-orange" : i < active ? "bg-brand-orange/40" : "bg-ink/10"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
