# Data Model: Vukan's Bike Full Visual Redesign (Content-Only)

**Feature**: `008-bike-site-redesign`
**Date**: 2026-09-04

No runtime types change in this feature. Composition entities (`BlockInstance`, `CompositionPolicy`, `slots`,
`maxDepth`) are unchanged from [006 data-model](../006-bike-home-shared-compose/data-model.md) and Spec Kit
`knowledge/block-system.md`; the block inventory is unchanged from
[007 data-model](../007-bike-site-primitives/data-model.md). What this document defines is the **authored
data**: theme tokens, the design tokens expressed in page JSON, and the validation rules that make the result
checkable.

## Entities

### Theme (`src/tenants/vukans-bike/config.ts` → `theme`)

Consumed by `ThemeProvider`, which emits a fixed set of CSS variables. Every token below has exactly one role;
a token with no role is a defect (SC-007).

| Field | Target value | CSS variable | Role |
|-------|--------------|--------------|------|
| `colors.primary` | `#B4121B` | `--color-primary` | Buttons, icons, `link` (components hardcode this) |
| `colors.secondary` | `#4B5563` | `--color-secondary` | Supporting/meta text; one step darker than the un-themeable component gray on the same neutral ramp, so it stays AA-legible on tinted bands |
| `colors.accent` | `#EFE9DF` | `--color-accent` | Warm sand surface, ≤ 1 band per page |
| `colors.background` | `#FFFFFF` | `--color-background` | Page ground; also "inverse text" on dark bands |
| `colors.foreground` | `#1C1917` | `--color-foreground` | Display + primary text; also the inverse band surface |
| `colors.muted` | `#F5F5F4` | `--color-muted` | Alternating band surface |
| `colors.border` | `#E7E5E4` | `--color-border` | Hairlines, card edges |
| `colors.textPrimary` | `#8A1015` | `--color-text-primary` | Eyebrow labels, price emphasis |
| `fonts.heading` / `fonts.body` | `ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` | `--font-heading` / `--font-body` | Inert today (R1); corrected so the config stops referencing undefined variables |
| `borderRadius` | `0rem` | `--radius` | Sharp edges; also drives `image` and `product-list` rounding |

Not emitted by `ThemeProvider` and therefore **not** settable here: `--color-muted-foreground` (fixed
`#6B7280` from `globals.css`). See research R2.

### Text node contract (`blocks.text`)

Every authored `text` node is one of these roles. `color` is **required on every node** — the primitive's
default is the un-themeable gray.

| Role | `variant` | `fontSize` | `bold` | `color` |
|------|-----------|------------|--------|---------|
| Display (page hero) | `body` | `clamp(2.5rem, 6vw, 4rem)` | `true` | `background` on hero/inverse, else `foreground` |
| Section title | `body` | `clamp(1.75rem, 3.2vw, 2.5rem)` | `true` | `foreground` (or `background` on inverse) |
| Card / sub title | `body` | `1.25rem` | `true` | `foreground` |
| Lead (support line) | `lead` | *none* | — | `secondary` (or `background` on inverse) |
| Body copy | `body` | *none* | — | `foreground` for primary copy, `secondary` for supporting |
| Eyebrow | `label` | *none* | — | `textPrimary` |
| Caption / meta | `caption` | *none* | — | `secondary` |
| Price / figure | `body` | `clamp(1.5rem, 2.5vw, 2rem)` | `true` | `textPrimary` |

**Hard rule (R3)**: `fontSize` may only be set when `variant` is `body`. `lead`, `caption` and `label` carry
fixed line-heights and break when resized.

### Band contract (`blocks.section` roots)

| Property | Rule |
|----------|------|
| Size | Compact `padding: "sm"` · Standard `padding: "lg"` · Statement `padding: "lg"` + inner `stack` `padding: "clamp(16px, 4vw, 40px) 0"` |
| Surface | `background` (default) · `muted` · `accent` · `foreground` (inverse) |
| Alternation | No two adjacent root bands share a surface |
| Inverse bands | ≤ 1 per page; all descendant text uses `color: "background"` |
| Accent bands | ≤ 1 per page |
| Photographic hero | ≤ 1 per page; `backgroundImage` + `overlay` (0.45–0.6) + `align`/`justify`; hero forces `text-white` utility classes, but those lose to any explicit inline `color` — set every hero text node's `color` to `"background"` and the content stack's `align` to `"center"` (non-full-width children like a button row don't center on their own) |
| Separation | Surface change or `borderTop: "1px solid var(--color-border)"`; never shadows |
| Measure | Text-bearing `stack`/`flex` sets `maxWidth: "68ch"`; full 1152px reserved for grids and imagery |

### Page (`src/tenants/vukans-bike/mock-data/pages/*.json`)

| Field | Rule |
|-------|------|
| `slug`, `lang`, `template` | Unchanged (`template: "default"` on all nine pages) |
| `seo.title` / `description` | Rewritten per page; `ogImage` must point at a real tenant photo |
| `blocks[]` | Ordered root bands; nesting via `slots` only |
| `id` | Integer, **unique within the file**, renumbered sequentially |
| `navigation` | **Must not exist** on a page file (dead data — R9) |

Locale mirrors (`en--*`, `de--*`) share the identical tree, ids, box styles and image URLs; only strings and
`seo` differ.

### Navigation (`mock-data/navigation.json` + `en--` / `de--`)

| Field | Target |
|-------|--------|
| `header[]` | 7 items: Servis, Vodene ture, Kolesarska šola, Trgovina, O nas, Partnerji, Kontakt (logo serves as Home) |
| `footer[]` | 8 items: Domov + the seven above |
| `footerCopy` | `tagline`, `linksHeading`, `contactHeading`, `contactPlaceholder`, `copyrightReserved` — rewritten to the redesigned voice |

Identical `id`s, order and item count across all three locales; labels localized.

### Product catalog (`mock-data/collections/products.json` + `en--` / `de--`)

Unchanged shape, unchanged count: **exactly one** entry (`merida`). Consumed only by `bike-detail` on
`/bikes/merida` via `load-bike.ts`. The Home and Shop flagship bands restate this bike's name, price and
headline specs as authored copy (R6) and **must stay consistent with this file**.

### Recommendations register (`contracts/shared-recommendations.md`)

A deliverable, not a code change (FR-013): shared/app changes that would materially improve the result,
each with the concrete change and the ceiling it removes. The owner decides separately.

## Validation rules

Mechanically checkable — these become review gates in [quickstart.md](./quickstart.md).

| # | Rule | Source |
|---|------|--------|
| V1 | Every `blocks.text` node sets `color` | R2, FR-005 |
| V2 | No node sets `fontSize` unless `variant` is `body` | R3 |
| V3 | No page file contains a `navigation` key | R9, FR-009, FR-011 |
| V4 | Block `id`s are unique within each page file | R9, FR-009 |
| V5 | No page references `blocks.product-list` this cycle | R6, FR-006, FR-007 |
| V6 | `bikes--merida.json` contains no inline `bike` object | R9, FR-015 |
| V7 | No visible category label, filter or "browse all bikes" control anywhere | FR-007, SC-006 |
| V8 | Every grid's item count avoids a lone final item at `mobile`/`tablet`/`desktop` | R7, FR-006, SC-004 |
| V9 | All eight theme color tokens appear in authored JSON or are component-forced | R5, SC-007 |
| V10 | `sl`, `en` and `de` files for a page have identical structure and ids | R11, FR-010, SC-005 |
| V11 | No two pages share a closing band with the same layout **and** near-identical copy | FR-003, SC-003 |
| V12 | No placeholder / "coming soon" / apology copy remains | FR-003, SC-002 |
| V13 | CTA verbs match real capability (no "book" wording — `features.booking` is false) | FR-008 |
| V14 | Pages whose CTAs point off-site also offer a first-party action | FR-012 |

## State: authoring lifecycle

```text
current pages (dark theme, gray copy, dead fields)
  → theme swap in config.ts (palette, radius, fonts, logoUrl)
  → sl pages re-authored band by band against the contracts
  → en / de mirrored (strings only)
  → navigation + footerCopy rewritten (3 files)
  → validation sweep V1–V14
  → Spec Kit sync (knowledge/mock-data.md + catalog)
  → done (product-list / Strapi catalog: follow-on)
```
