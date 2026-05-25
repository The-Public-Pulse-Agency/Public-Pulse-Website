// Professional icon registry — single source of truth so emoji glyphs
// (which render differently per OS) never leak into the UI.
//
// Every service slug, glossary area, industry vertical and step type maps
// to a lucide-react icon. The components import via getServiceIcon(slug)
// so swapping an icon globally is one edit here.

import type { LucideIcon } from "lucide-react";
import {
  Landmark,
  Smartphone,
  Clapperboard,
  Megaphone,
  Building2,
  Palette,
  Globe,
  LineChart,
  UserCheck,
  // industries
  Home,
  ShoppingBag,
  UtensilsCrossed,
  Stethoscope,
  GraduationCap,
  HeartHandshake,
  Scale,
  Shirt,
  BedDouble,
  Banknote,
  // process / generic
  Compass,
  Workflow,
  Sparkles,
  Target,
  Rocket,
  Zap,
  Lightbulb,
  TrendingUp,
  // glossary areas
  Search,
  Wand2,
  BarChart3,
  Tags,
} from "lucide-react";

// ─── Services ────────────────────────────────────────────────────────────

const SERVICE_ICONS: Record<string, LucideIcon> = {
  "political-pr": Landmark,
  "social-media": Smartphone,
  "content-production": Clapperboard,
  "paid-ads": Megaphone,
  "hospitality": Building2,
  "brand-building": Palette,
  "seo-website": Globe,
  "analytics-reporting": LineChart,
  "influencer-marketing": UserCheck,
};

export function getServiceIcon(slug: string): LucideIcon {
  return SERVICE_ICONS[slug] ?? Sparkles;
}

// ─── Industries ──────────────────────────────────────────────────────────

const INDUSTRY_ICONS: Record<string, LucideIcon> = {
  "real-estate": Home,
  "e-commerce": ShoppingBag,
  "restaurants-food": UtensilsCrossed,
  "healthcare": Stethoscope,
  "education": GraduationCap,
  "ngo-development": HeartHandshake,
  "government": Scale,
  "rmg-garments": Shirt,
  "hospitality": BedDouble,
  "fintech": Banknote,
};

export function getIndustryIcon(slug: string): LucideIcon {
  return INDUSTRY_ICONS[slug] ?? Building2;
}

// ─── Glossary areas ──────────────────────────────────────────────────────

const AREA_ICONS: Record<string, LucideIcon> = {
  "Digital Marketing": Sparkles,
  "Political PR": Landmark,
  "Paid Media": Megaphone,
  "SEO": Search,
  "Branding": Wand2,
  "Analytics": BarChart3,
};

export function getAreaIcon(area: string): LucideIcon {
  return AREA_ICONS[area] ?? Tags;
}

// ─── Process / 4-step homepage section ───────────────────────────────────

export const PROCESS_ICONS = {
  Listen: Compass,
  Plan: Workflow,
  Make: Rocket,
  Sharpen: Target,
} as const satisfies Record<string, LucideIcon>;

// ─── Generic semantic ────────────────────────────────────────────────────

export const SEMANTIC_ICONS = {
  speed: Zap,
  insight: Lightbulb,
  growth: TrendingUp,
} as const satisfies Record<string, LucideIcon>;
