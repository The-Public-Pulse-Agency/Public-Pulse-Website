# Brand

Source: extracted from the live site's computed styles + rendered DOM (see AUDIT.md, "Brand identity" section), then evolved during STEP 3 with the design system below.

## Design philosophy

- **Editorial, not SaaS-templated.** Asymmetric layouts, generous whitespace, serif headlines paired with sans body. Looks like a confident publication, not a Notion landing page.
- **Navy is the dominant.** Most pages have at least one full-bleed navy section. White surfaces alternate with navy to give pages weight and rhythm.
- **Red is the single accent.** Used sparingly — primary CTAs, eyebrow flourishes, brand-name highlights. Never for decoration.
- **Restraint with color.** The 9 category accents only appear on service cards and blog category chips. They never decorate sections, never form gradients.

## Wordmark

Two-line stacked logotype:

```text
PUBLIC          (DM Sans 800, uppercase, brand red)
pulse.agency    (DM Sans 500, lowercase, deep navy)
```

No icon mark. Header keeps both lines stacked; favicon uses a `P` glyph in brand red.

## Color tokens

| Token | Hex | Tailwind alias | Use |
|---|---|---|---|
| `brand.red` | `#D32F2F` | `brand-red` | primary CTAs, link accent, theme-color, eyebrow flourishes |
| `brand.navy` | `#0F1B3D` | `brand-navy` | headings, dark sections (the dominant) |
| `brand.navy-soft` | `#1A2A52` | `brand-navy-soft` | hover state on dark sections, subtle inner shadows |
| `text.body` | `#1E293B` | `slate-800` | default body |
| `text.muted` | `#64748B` | `slate-500` | metadata |
| `text.on-dark` | `rgba(255,255,255,0.86)` | `text-white/86` | body copy on navy |
| `text.on-dark-muted` | `rgba(255,255,255,0.6)` | `text-white/60` | metadata on navy |
| `surface.base` | `#FFFFFF` | `white` | page background |
| `surface.alt` | `#F5F7FA` | `surface-alt` | alternating section background |
| `surface.cream` | `#FAF8F5` | `surface-cream` | warm alternative for editorial sections |
| `border.hair` | `#E2E8F0` | `slate-200` | dividers |
| `whatsapp` | `#25D366` | `whatsapp` | floating chat button |
| 9 `category.*` accents | as before | `cat-red` etc. | service cards + blog category chips only |

## Typography

Two families:

- **Fraunces** (variable serif) for **all H1/H2 display headings**. Optical-size axis tuned for display. Loaded via `next/font/google`, variable `--font-fraunces`.
- **DM Sans** (sans) for body, UI, eyebrows, H3+. Loaded via `next/font/google`, variable `--font-dm-sans`. Weights 400/500/600/700/800.

  *// TODO(user): swap Fraunces for Space Grotesk if you'd prefer a geometric-sans display face — change [src/app/layout.tsx](../src/app/layout.tsx) and the `font-serif` mapping in [tailwind.config.ts](../tailwind.config.ts).*

### Type scale (Tailwind tokens, mobile → desktop responsive)

| Token | Element | Family | Size | Line height | Tracking |
|---|---|---|---|---|---|
| `text-display` | Hero H1 | Fraunces | 56 → 96 px | 1.02 | -0.025em |
| `text-h1` | Page H1 | Fraunces | 44 → 64 px | 1.08 | -0.02em |
| `text-h2` | Section H2 | Fraunces | 32 → 48 px | 1.1 | -0.015em |
| `text-h3` | Card / sub | DM Sans 700 | 20 → 24 px | 1.25 | -0.01em |
| `text-eyebrow` | Eyebrow | DM Sans 600 | 12 px uppercase | 1.2 | 0.18em |
| `text-lead` | Intro | DM Sans 400 | 18 → 22 px | 1.55 | normal |
| `text-body` | Default body | DM Sans 400 | 17 px | 1.65 | normal |
| `text-meta` | Meta | DM Sans 500 | 13 px | 1.4 | 0.01em |
| `text-display-number` | Stat numerals | Fraunces 600 | 48 → 80 px | 1 | -0.02em |

### Italics

Fraunces italics are *expressive* (calligraphic) and reserved for accent words inside Fraunces headlines (e.g. *"premium"*). Never italicize whole paragraphs.

## Spacing rhythm — 8 pt

All vertical spacing snaps to multiples of 8 px. Tailwind units (4 px each) — use 2, 4, 6, 8, 12, 16, 20, 24, 32 only:

| Tailwind | Pixels | Use |
|---|---|---|
| `2` | 8 | tight inline gap |
| `4` | 16 | inside compact card |
| `6` | 24 | inside default card |
| `8` | 32 | small section gap |
| `12` | 48 | medium section gap |
| `16` | 64 | between paragraph groups |
| `20` | 80 | section padding-y mobile |
| `24` | 96 | section gap mobile |
| `32` | 128 | section padding-y desktop |

## Layout primitives

- **Container**: `<Container>` component, max-width 1200 px, horizontal padding 24 → 32 px
- **Sections**: padding-y `20 → 32` (80 → 128 px). Alternate **white** → **brand-navy** → **surface-alt** → **brand-navy** for editorial pacing
- **Cards**: 16 px radius (`rounded-2xl`), 24 px padding, hairline border, lift on hover (-translate-y-1 + shadow-lg)
- **Buttons**:
  - Primary: red bg, white text, 14 y / 24 x padding, rounded-full, subtle scale on hover (`hover:scale-[1.02]`)
  - Secondary: transparent, navy text, navy 1 px border, same shape
  - Ghost on dark: white text + white/20 border, hover fills with white/10
- **Header**: 72 px tall, white bg, sticky, soft bottom border
- **Footer**: navy bg, white text, 4-column grid

## Motion language

One coherent set of rules:

1. **Scroll-reveal** for below-the-fold content blocks. Translation: opacity 0 → 1 and translateY 16 → 0 over 700 ms with `cubic-bezier(.16, 1, .3, 1)`. Triggered by IntersectionObserver inside `<ScrollReveal>` ([src/components/ui/ScrollReveal.tsx](../src/components/ui/ScrollReveal.tsx)).
2. **Hover** on cards: `transform: translateY(-2px)` + border accent + soft shadow. Transition 200 ms ease-out.
3. **Hover on primary CTA**: `transform: scale(1.02)`, no shadow change. 150 ms ease-out.
4. **No long animations.** Nothing above 700 ms. Nothing decorative — every motion has a job.
5. **`prefers-reduced-motion: reduce` is honored.** Reveal animations skip, hover transforms set to none, transitions zeroed out — defined globally in [globals.css](../src/styles/globals.css).

## Imagery

- All blog hero images: 1200 × 630 (matches OG dimensions for re-use)
- Use `next/image` everywhere; never raw `<img>` for content imagery (favicons are an exception)
- `fetchpriority="high"` on the LCP image of each page; everything else `loading="lazy"`
- CLS budget: 0. Always include `width` and `height` props.

## Don't

- Don't use slate-400 (`#94A3B8`) for any text — fails WCAG AA contrast on white
- Don't introduce a third font family
- Don't use brand red on a navy background (low contrast) — use white instead
- Don't gradient the brand red — keep it solid
- Don't add motion just because — every animation justifies its CPU cost
- Don't decorate sections with the category colors — they belong to services and blog only
