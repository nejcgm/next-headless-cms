# Research: Vukan's Bike Full Visual Redesign (Content-Only)

**Feature**: `008-bike-site-redesign`
**Date**: 2026-09-04

Phase 0 findings. Every decision below was verified against the current code, not assumed — the
constraints in R1–R4 are the reason this plan prescribes specific authoring rules instead of
"make it look nicer".

## R1 — The typeface is not changeable in scope; hierarchy must come from size/weight/case/color

**Finding**: `config.ts` sets `fonts.heading: "var(--font-montserrat)"` / `fonts.body: "var(--font-inter)"`.
Those custom properties are **never defined** — there is no `next/font` loader anywhere in `src/app/`.
`ThemeProvider` copies them into `--font-heading` / `--font-body`, which makes those declarations
invalid-at-computed-value. Separately, **nothing applies the font utilities**: `src/app/layout.tsx` puts only
`antialiased` on `<body>`, and no primitive uses `font-body`. The whole site renders in Tailwind preflight's
default sans stack, and `boxStyleSchema` has no `fontFamily` field.

**Decision**: Do not attempt a typeface change. Build hierarchy from **size, weight, letter-case
(`label` variant), color, and measure** within one typeface. Correct the dead font tokens in `config.ts`
to an honest system stack so the config stops referencing variables that do not exist.

**Rationale**: Loading a real typeface requires editing `src/app/layout.tsx` or `globals.css` — app code,
out of bounds per FR-001. A rigorously executed single-typeface system reads more professional than a
weak pairing anyway.

**Alternatives considered**: Add `next/font` + `font-body` on `<body>` — correct fix, but out of scope;
logged as **Recommendation 1** (highest-value follow-up). Set `fonts.*` to a webfont name without a loader —
rejected, the font would not load and the config would still be lying.

## R2 — `--color-muted-foreground` is not themeable, so it anchors the palette

**Finding**: `ThemeProvider` emits a **fixed list** of 11 variables and `--color-muted-foreground` is not
among them; adding extra keys to `theme.colors` in `config.ts` does nothing. It therefore always resolves to
`#6B7280` from `globals.css`. The `text` primitive hardcodes `text-[var(--color-muted-foreground)]` on
**all four variants**, and the same variable colors the footer, accordion content, header locale switcher,
`bike-detail`, `product-list` and `gallery`.

**Decision**: (a) Set the theme's `secondary` token to **`#4B5563`** — the next step down the same neutral
ramp as the fixed `#6B7280`, so authored and component text read as one family while authored copy stays
comfortably AA-legible (`#6B7280` measures only ~3.8:1 on the sand band and ~4.5:1 on white). (b) Require an
explicit `color` on **every authored `text` node** — the default gray is never relied on for primary copy.

**Rationale**: The one text color we cannot change should be a deliberate part of the palette rather than an
accident. Today every headline and paragraph on the site inherits this gray, which is the main reason the
current design reads flat.

**Alternatives considered**: Emit the variable from `ThemeProvider` — a two-line shared fix, out of scope;
logged as **Recommendation 3**. Override with a parent `color` — does not work: the child `<p>`'s own class
beats an inherited value.

## R3 — Overriding `fontSize` breaks line-height on every variant except `body`

**Finding**: `boxStyle.fontSize` is passed through to inline `style`, but there is **no `lineHeight` field**.
Tailwind's size classes bundle a fixed line-height: `lead` = `text-xl md:text-2xl` (28px/32px),
`caption` = `text-sm` (20px), `label` = `text-xs` (16px). Overriding `fontSize` on those leaves the old
line-height and multi-line text collides. The **`body` variant is the exception** — it carries
`leading-relaxed`, an unitless `1.625` that scales with any font size.

**Decision**: Any `text` node that sets `fontSize` **MUST** use `variant: "body"`. Use `lead`, `caption` and
`label` only at their native sizes, never with a `fontSize` override. Because display type inherits a loose
`1.625` leading, **keep display headlines short (≤ ~28 characters)** so they hold one line on desktop and at
most two on mobile, and treat the generous leading as part of the editorial system.

**Rationale**: This single rule prevents the most visible failure mode (overlapping or awkwardly-spaced
headlines) and forces crisp headline copy, which US1 asks for anyway.

**Alternatives considered**: Split headlines into one `text` node per line inside a `stack` — worse, each
node still carries its own 1.625 leading. Add `lineHeight` / `letterSpacing` to `boxStyleSchema` — the real
fix; logged as **Recommendation 2**.

## R4 — `clamp()` passes straight through, so the redesign can be genuinely fluid

**Finding**: `toBoxStyle` assigns `fontSize`, `padding`, `margin`, `maxWidth`, `minHeight`, `height`, `width`
as **raw strings** to inline style, with no sanitising. `resolveColor` passes `#hex`/`rgb`/`hsl` through and
maps any bare token name to `var(--color-<name>)` (so `"text-primary"` → `var(--color-text-primary)`).

**Decision**: Use `clamp()` for all display/section type and for statement-band padding, e.g.
`"clamp(2.5rem, 6vw, 4rem)"`. This is the only way to get responsive sizing from JSON, since box styles have
no breakpoint variants.

**Rationale**: Fixed px sizes authored for desktop are what make a JSON-authored site look broken on mobile.
`clamp()` removes that failure mode entirely without touching code.

**Alternatives considered**: Fixed px sizes chosen to be safe at both ends — compresses the desktop design to
mobile's ceiling. Responsive props on primitives — a shared change, out of scope.

## R5 — Palette direction: light editorial, brand red retained

**Decision**: Move from the current near-black/red theme to a **light editorial palette that keeps red as the
brand color**. Eight tokens, each with exactly one job:

| Token | Value | Role |
|-------|-------|------|
| `primary` | `#B4121B` | Brand red — buttons, icons, links (components force this anyway) |
| `secondary` | `#4B5563` | Supporting/meta text — one step darker than the un-themeable component gray, on the same ramp (R2) |
| `accent` | `#EFE9DF` | Warm sand — third surface, at most one band per page |
| `background` | `#FFFFFF` | Page ground |
| `foreground` | `#1C1917` | Display + primary text; also the inverse ("dark") band surface |
| `muted` | `#F5F5F4` | Alternating band surface |
| `border` | `#E7E5E4` | Hairlines, card edges |
| `textPrimary` | `#8A1015` | Eyebrow labels and price emphasis |
| `borderRadius` | `0rem` | Sharp edges — editorial/technical, and consistent since `image` and `product-list` both use `var(--radius)` |

**Rationale**: Three converging reasons. (1) The un-themeable `#6B7280` reads as a deliberate neutral on a
light ground and as muddy low-contrast text on near-black. (2) The available photography is real phone
photography of a workshop and trails — it reads as craft on white with generous space, and as flat and noisy
on black. (3) Dark + red + gray is the single most common auto-generated theme; moving away from it is the
most direct answer to "must not look vibecoded". Brand recognition is preserved through the red.

**Contrast**: `foreground` on `background` ≈ 17:1; `primary` on `background` ≈ 7.4:1; `textPrimary` ≈ 9.5:1;
`secondary` ≈ 7:1. Primary paragraphs still use `foreground`; `secondary` carries supporting and meta text.

**Alternatives considered**: **Refined dark** (warm the near-black, deepen the red, add a real neutral ramp) —
viable and closer to today's identity, but it inherits the low-contrast gray, flatters the photography less,
and stays in the generic-dark-theme lane. This decision is a **single-file revert** (`config.ts`) if the owner
prefers dark, so it is cheap to reverse after seeing it.

## R6 — `product-list` goes unused this cycle; the flagship bike is authored from primitives

**Finding**: `product-list` renders its **own** `<section className="py-16 px-4 bg-[var(--color-background)]">`,
so it cannot be framed by a parent band (it overrides any surface). Its grid is hardcoded
`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` — with one product that is a quarter-width card stranded on a
desktop row (violates FR-006). It also renders `product.category` as a primary-red eyebrow on every card,
which FR-007 forbids while the catalog holds one product, and that badge is **not prop-controlled**.
Its declared `category` prop is a **no-op** (never read by `load-products.ts`), and it navigates with a raw
`<a href>` instead of `next/link`.

**Decision**: Do **not** reference `product-list` on any page this cycle. Author the flagship bike moment on
Home and Shop from L1 primitives (`grid` of `image` + a `stack` of eyebrow / title / spec lines / price /
`button` → `/bikes/merida`). Leave the block registered and untouched for when the catalog grows under Strapi.

**Rationale**: This satisfies FR-006 and FR-007 **by construction with zero component edits**, and one bike
deserves a full-width editorial feature that a four-column card grid cannot express. The dead `category` prop
and the `<a href>` are real defects but are not visible to a visitor while the block is unreferenced, so
touching them would be a drive-by edit under Principle V.

**Alternatives considered**: Fix `product-list` (count-aware grid, optional badge, drop its self-imposed
section chrome) — that is a component redesign, not a defect fix, and the owner explicitly reserved component
work. `layout: "list"` — still a vertical card with a giant square image. Both are logged as
**Recommendation 5** for the Strapi phase.

**Consequence to accept**: the flagship bike's name/price live in page JSON as authored copy while
`/bikes/merida` stays data-driven from `collections/products.json`. Both must be kept consistent; when Strapi
lands, the flagship band is swapped back to a catalog block.

## R7 — Grid item counts: convert the orphan row into an intentional card

**Finding**: `/brands` has 7 partner cards at `{mobile:1, tablet:2, desktop:3}` → 3+3+1 on desktop and
2+2+2+1 on tablet. With 7 items **no** column count avoids a lone last item at both breakpoints, and one card
("Apače mlinarji") is missing the link the other six have.

**Decision**: Add an **eighth card — "become a partner / work with us"** linking to `/contact`. Eight items
give 4+4 on desktop and 2×4 on tablet, every card carries a link (consistent content), and the page gains a
first-party action per FR-012.

**Rationale**: Converts a layout defect into a conversion opportunity without inventing a fake partner or
dropping a real one.

**Alternatives considered**: Drop a partner to reach six — discards a real local relationship. Wrapped logo
strip — loses the per-partner links, since `image` is not linkable and `link` is text-only.

## R8 — Site chrome: header logo and favicon were one field; now two

**Finding**: `config.ts` originally set `logoUrl` to `1000004333_bged3h.jpg` — a **photograph**, also used as a
hero background and an OG image elsewhere. The header renders it at `h-10` with `object-contain`, a poor fit
for a photo. `logoUrl` was **also** the *only* source of the site's favicon: `src/app/[domain]/layout.tsx`'s
`generateMetadata` built `icons` from that same field (or returned `{}` — no favicon metadata at all, on any
page — if it was unset); no page-level `generateMetadata` sets `icons` independently. One asset was forced to
serve two jobs with conflicting shapes (a wide header lockup vs. a square tab icon).

**Decision**: Add a dedicated `faviconUrl` field to `TenantConfig` (`src/core/types/tenant.ts`), and have
`[domain]/layout.tsx` read `tenantConfig.faviconUrl ?? tenantConfig.logoUrl` (fallback preserves current
behavior for any tenant, e.g. `resort-example`, that only ever set `logoUrl`). Vukan's Bike now sets
**`faviconUrl`** to the photograph and leaves `logoUrl` **unset** — the header shows its text wordmark, and
every page still gets a working favicon, independently.

**Rationale**: This was reached by way of two reversals worth recording, because the same tradeoff will
recur if a real logo/favicon mark ever needs picking apart again. (1) Removing `logoUrl` outright (to fix the
header) silently killed the favicon site-wide — only noticed because one already-open browser tab kept
showing a stale cached icon, which read as "some pages have it, some don't" until a fresh load of every page
confirmed none did. (2) Restoring `logoUrl` fixed the favicon but brought back the squashed-photo header. The
actual fix was to stop sharing the field: a small, explicitly-authorized code change (`core/types/tenant.ts` +
`[domain]/layout.tsx` — outside this feature's tenant-block-only scope, done only because the owner asked for
it directly) that lets each concern point at its own asset.

**Unrelated in the same area**: the header nav item count (originally trimmed 8 → 6 in this research) was
separately restored to 7 in a later round (Partnerji back in the header) — tracked in the tenant catalog, not
part of this decision.

## R9 — Per-page navigation and duplicate ids are dead data and must go

**Finding**: `loadPageWithNavigation` always fetches `navigation.json` / `{locale}--navigation.json` and
spreads it over the page, so the `navigation` blocks embedded in `home.json`, `service.json` and `brands.json`
are **never read** (home's copy is stale — it is missing Shop and Bike school entirely). `service.json` also
reuses block ids 298–330 and 401–404 across different subtrees, and `bikes--merida.json` carries a full inline
`bike` object that `bikeDetailSchema` strips.

**Decision**: Delete all three dead-data classes as the pages are rewritten (FR-009). Navigation edits happen
only in `navigation.json` / `en--navigation.json` / `de--navigation.json` (FR-011). Block ids are renumbered
sequentially and uniquely per file.

**Rationale**: Content authors will otherwise keep editing fields that cannot affect the page, and the Strapi
migration would carry the confusion forward.

## R10 — Band system: how bands are separated without a shadow or spacing scale

**Finding**: `section` accepts only `padding: sm|md|lg` (32/48/80px) — its own prop shadows the box-style
string, so arbitrary band padding is not available on `section` itself. Layout gaps top out at
`lg` = 32px. There is no `boxShadow` field. Non-hero sections are `max-w-6xl` (1152px); heroes are
`max-w-4xl`, `min-h-[70vh]`, and force white text over a black underlay.

**Decision**: Three band sizes — **Compact** (`padding: "sm"`), **Standard** (`padding: "lg"`), and
**Statement** (`padding: "lg"` plus an inner `stack` with `padding: "clamp(16px, 4vw, 40px) 0"`). Bands are
separated by **surface alternation and hairlines** (`borderTop: "1px solid var(--color-border)"`), never by
shadows. Text stacks set `maxWidth: "68ch"` so paragraphs never run the full 1152px. At most **one**
photographic hero and at most **one** inverse (`surface: "foreground"`) band per page.

**Rationale**: Surface + hairline + measure is the whole separation vocabulary available; naming it up front
is what keeps nine pages looking like one site.

## R11 — Locale parity is a structural mirror, not a re-design

**Decision**: Author each page in `sl` first, then mirror the **exact tree** into `en--*` and `de--*`,
changing only strings (and `seo`). Block ids, structure, box styles and image URLs stay identical.

**Rationale**: FR-010 / SC-005. Mirroring also makes review cheap: a structural diff between locale files
should show only string changes. German copy runs longer — because type is fluid (R4) and measures are set in
`ch`, longer strings reflow rather than break.
