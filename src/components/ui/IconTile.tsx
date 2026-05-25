import type { LucideIcon } from "lucide-react";
import { getServiceIcon, getIndustryIcon } from "@/lib/icons";

// Consistent square icon tile used everywhere a service / industry / generic
// icon appears: rounded-card, sized 40/48/56, optional tinted bg + ring.
//
// Three pre-built helpers:
//   <ServiceIconTile  slug="paid-ads" />
//   <IndustryIconTile slug="real-estate" />
//   <IconTile icon={Sparkles} />

type Size = "sm" | "md" | "lg" | "xl";
type Tone =
  | "ink"          // black bg, white icon
  | "paper"        // white bg, black icon, ink border
  | "tinted"       // 10% orange bg, orange icon
  | "gradient";    // hero-style gradient bg, white icon

const SIZE_BOX = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-14 w-14",
  xl: "h-16 w-16",
} as const;

const SIZE_ICON = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-7 w-7",
} as const;

const TONE_CLASS: Record<Tone, string> = {
  ink: "bg-ink text-paper",
  paper: "bg-paper text-ink border border-ink",
  tinted: "bg-brand-orange/10 text-brand-orange",
  gradient: "text-paper",
};

const GRADIENT_BG =
  "radial-gradient(70% 80% at 80% 20%, #FFB07A 0%, transparent 60%), linear-gradient(135deg, #FF7A2E 0%, #E04E00 100%)";

type Props = {
  icon: LucideIcon;
  size?: Size;
  tone?: Tone;
  className?: string;
  /** Spin slowly on hover of the parent — adds life to a static page. */
  spinOnHover?: boolean;
  /** Pulse a subtle glow ring continuously (use sparingly — "active" cues). */
  glow?: boolean;
};

export function IconTile({
  icon: Icon,
  size = "md",
  tone = "tinted",
  className = "",
  spinOnHover = false,
  glow = false,
}: Props) {
  const style = tone === "gradient" ? { background: GRADIENT_BG } : undefined;
  return (
    <span
      className={`relative grid place-items-center rounded-card transition-transform duration-300 ${SIZE_BOX[size]} ${TONE_CLASS[tone]} ${className} ${
        spinOnHover ? "group-hover:rotate-12" : ""
      }`}
      style={style}
      aria-hidden
    >
      {glow && (
        <span className="pointer-events-none absolute inset-0 rounded-card ring-2 ring-brand-orange/50 animate-ping motion-reduce:hidden" />
      )}
      <Icon className={SIZE_ICON[size]} aria-hidden />
    </span>
  );
}

// ─── Service / Industry shortcuts ────────────────────────────────────────

export function ServiceIconTile(props: Omit<Props, "icon"> & { slug: string }) {
  const { slug, ...rest } = props;
  return <IconTile {...rest} icon={getServiceIcon(slug)} />;
}

export function IndustryIconTile(props: Omit<Props, "icon"> & { slug: string }) {
  const { slug, ...rest } = props;
  return <IconTile {...rest} icon={getIndustryIcon(slug)} />;
}
