# Data Model: Primitive Props Redesign

**Feature**: `012-primitive-props-redesign`

This is the field-level source of truth for the redesign — the detail spec.md deliberately keeps at prose altitude. Every table below applies identically to the Strapi component schema (`headless-cms-backend/src/components/blocks/*.json`) and the frontend Zod schema (`next-headless-cms-fe/.../schema.ts`) for that primitive; "Type" names the frontend Zod shape, and the Strapi field type is the obvious analog (`string`→`string`, `enum`→`enumeration`, `boolean`→`boolean`, `json`→`json`).

## Shared box-style bag (`box-style.ts`)

| Field | Type | Status |
|-------|------|--------|
| `width`, `height`, `maxWidth` | sizing string (R1) | unchanged shape, now interpreted via `toCssSize` |
| `minWidth`, `minHeight`, `maxHeight` | sizing string (R1) | **new** |
| `padding`, `margin` | string | unchanged |
| `backgroundColor`, `color` | color token enum | unchanged |
| `border` | border style enum | unchanged |
| `borderRadius` | string | unchanged |
| `overflow` | `visible \| hidden \| auto` | unchanged — note this is narrower than the reviewed Flex shape, which also listed `scroll`; `scroll` was never added anywhere in this codebase (doc previously claimed otherwise) |
| `fullWidth` | boolean | kept only on primitives whose table below still lists it |
| `dividerTop` | boolean | unchanged, section-family only (see Section table) |
| `fontSize`, `fontWeight`, `textAlign` | string / enum | unchanged, used by primitives that need them |

Every primitive continues to `.omit()` the fields it doesn't use and `.extend()` its own, exactly as today — this bag is not primitive-specific.

## Flex

| Field | Type | Status |
|-------|------|--------|
| `direction` | `row \| column` | unchanged |
| `justify` | `start \| center \| end \| between \| around \| evenly` | **extended** (was missing `around`/`evenly`) |
| `align` | `start \| center \| end \| stretch \| baseline` | **extended** (was missing `baseline`) |
| `wrap` | boolean | unchanged |
| `gap` | sizing string (R1) | **changed** — was `sm \| md \| lg` enum, now free px/% like other sizing fields (matches the user's reviewed shape; still defaults sanely when unset) |
| box-style bag (sizing, spacing, appearance) | — | as above |

## Section

| Field | Type | Status |
|-------|------|--------|
| `backgroundImage` | string (URL) | unchanged |
| `backgroundFit` | `cover \| contain` | unchanged |
| `backgroundPosition` | `center \| top \| bottom \| left \| right` | **new** |
| `overlay` | number 0–1 | unchanged |
| `anchorId` | string | unchanged |
| `width` | `full \| contained` | **changed** — replaces the old `fullWidth` boolean with a more descriptive enum (R1 Assumption) |
| `minHeight` | `standard \| tall` | **renamed** from `heroHeight` (same values, only meaningful with `backgroundImage`, unchanged) |
| `padding` | `sm \| md \| lg` | unchanged |
| `surface` | `background \| muted \| accent \| foreground` | unchanged |
| `divider` | `none \| top \| bottom \| both` | **changed** — replaces the boolean `dividerTop` with a 4-way enum |
| `overflow` | `visible \| hidden` | unchanged (narrower than the shared bag's `visible \| hidden \| auto`, matching the reviewed shape) |
| `color`, `border` | enum | unchanged |
| `children` (via `slots`) | see Nesting | unchanged mechanism — still `slots` JSON, per `010`/`011` |

`justify`/`align` (content alignment, only meaningful when Section acts as a column flex container) are **removed** — Section's own content alignment is superseded by nesting a Flex inside it, now that Flex is the one true layout primitive.

## Text

| Field | Type | Status |
|-------|------|--------|
| `content` | string | unchanged |
| `as` | `p \| span \| h1 \| h2 \| h3 \| h4 \| h5 \| h6` | **new** — replaces the closed `variant` (`body/lead/caption/label`) with the semantic element choice the reviewed shape asks for |
| `fontSize` | sizing-like number (px) | **changed** — was a named-step enum (`cardTitle`/`display`/etc.); becomes a plain px number per the reviewed shape. `customFontSize` is removed (no longer needed once `fontSize` is a raw number) |
| `lineHeight` | number | **new** |
| `bold` | boolean | unchanged |
| `uppercase` | boolean | **new** |
| `letterSpacing` | number | **new** |
| `textAlign` | `left \| center \| right` | **new** (Text didn't have this before) |
| `color` | enum | unchanged |
| `width`, `maxWidth` | sizing string | unchanged shape, now via `toCssSize` |
| `padding`, `margin`, `backgroundColor`, `border`, `borderRadius` | — | unchanged |

**Migration note**: the old named `fontSize` steps (`cardTitle`, `sectionTitle`, `priceCompact`, `pageTitle`, `price`, `display`, `statement`) map to fixed px values today (defined in the seed script's `FONT_SIZE_VALUE_MAP` — e.g. `display` → `clamp(2.5rem, 6vw, 4rem)` originally, already flattened once). The migration script/seed reshaping resolves each named step to the concrete px number closest to its current rendered size, so visual output is unchanged (spec FR-016/SC-004).

## Link

| Field | Type | Status |
|-------|------|--------|
| `href` | string | unchanged |
| `target` | `_self \| _blank` | **new** — replaces the derived "is this an external URL" auto-detection with an explicit editor choice (still defaults sensibly for existing content during migration — external URLs migrate to `_blank`, internal to `_self`, preserving current behavior) |
| `showArrow` | boolean | unchanged |
| `variant` | `primary \| secondary \| ghost \| link` | **extended** (was `primary \| muted`; `muted` maps to `secondary` on migration) |
| `fontSize`, `fontWeight` | number | **changed** — were free strings (`fontSize`/`fontWeight` already existed as loose strings); now numbers |
| `textAlign` | `left \| center \| right` | unchanged |
| `color`, `backgroundColor`, `border`, `borderRadius` | — | unchanged shapes |
| `padding` | string | unchanged |
| `label` | — | **removed** — see Nesting (children: Icon and/or Text) |
| `accessibleLabel` | string, optional | **new** (R6) — required by validation only when children resolve to Icon-only |

`height`/`maxWidth`/`fullWidth`/`overflow` (present on today's schema) are **removed** — not in the reviewed shape and not meaningfully used by a leaf-turned-light-container; Link's sizing need is covered by the shared `width`/`padding`.

## Button

| Field | Type | Status |
|-------|------|--------|
| `href` | string | unchanged |
| `type` | `button \| submit \| reset` | **new** |
| `disabled` | boolean | **new** |
| `variant` | `primary \| secondary \| outline \| ghost` | **extended** (was `primary \| secondary \| outline`; adds `ghost`) |
| `fullWidth` | boolean | unchanged |
| `width`, `height` | sizing string | unchanged shape |
| `padding`, `margin` | string | unchanged |
| `fontSize`, `fontWeight` | number | **new** (Button didn't expose these before) |
| `textAlign` | `left \| center \| right` | **new** |
| `backgroundColor`, `color`, `border`, `borderRadius` | — | unchanged shapes |
| `overflow` | `visible \| hidden` | unchanged |
| `label`, `icon`, `iconPosition` | — | **removed** — see Nesting (children: Icon and/or Text; order = position) |
| `accessibleLabel` | string, optional | **new** (R6), same rule as Link |

## Image

| Field | Type | Status |
|-------|------|--------|
| `src` | string (URL) | unchanged |
| `alt` | string, optional | unchanged |
| `fit` | `cover \| contain \| fill \| none` | **extended** (was `cover \| contain`) |
| `position` | `center \| top \| bottom \| left \| right` | **new** |
| `width`, `height`, `maxWidth` | sizing string | unchanged shape (`height` is new — Image didn't have it before) |
| `fullWidth` | boolean | **new** (kept per reviewed shape, alongside general `width`) |
| `padding`, `margin` | string | unchanged/new (`margin` is new) |
| `border`, `borderRadius`, `overflow` | — | unchanged shapes |

## Iframe

| Field | Type | Status |
|-------|------|--------|
| `src`, `title` | string | unchanged |
| `allowFullscreen` | boolean | unchanged |
| `aspect` | `auto \| 16:9 \| 4:3 \| 1:1 \| 21:9` | **extended** (was `video \| map \| square`, i.e. `16:9 \| ? \| 1:1` under different names) — `video`→`16:9`, `square`→`1:1`, `map` had no fixed ratio (rendered via explicit height) → `auto` |
| `fullWidth` | boolean | **new** |
| `width`, `height`, `maxWidth` | sizing string | unchanged shape |
| `padding`, `margin` | string | unchanged/new |
| `backgroundColor`, `border`, `borderRadius`, `overflow` | — | unchanged shapes |

## Grid

| Field | Type | Status |
|-------|------|--------|
| `columnsMobile` (required), `columnsTablet`, `columnsDesktop` | `1-4` enum | unchanged |
| `gap` | sizing string (R1) | **changed** — was `sm \| md \| lg` enum, now free px/% |
| `fullWidth`, `height`, `maxWidth` | — | unchanged shapes |
| `padding`, `margin`, `backgroundColor`, `border`, `borderRadius`, `overflow` | — | unchanged shapes |
| legacy `columns` (number or `{mobile,tablet,desktop}`) | — | **removed** — was already `resort-example`-only per `content-model.md`; migrated to `columnsMobile`/`columnsTablet`/`columnsDesktop` as part of this feature's `resort-example` mechanical migration |

## Icon

| Field | Type | Status |
|-------|------|--------|
| `name` | kebab-case enum, full lucide set (~1,847 values, generated) | **extended** (was a 3-value enum) |
| `label` | string, optional (accessible label) | unchanged |
| `size` | number (px) | **changed** — was `sm \| md \| lg` enum, now a raw px number per the reviewed shape |
| `color` | enum | unchanged |

## Accordion (leaf → container)

| Field | Type | Status |
|-------|------|--------|
| `title` | string | unchanged |
| `defaultOpen` | boolean | unchanged (renamed from `defaultOpen`? — no, already named this) |
| `padding`, `margin`, `backgroundColor`, `border`, `borderRadius` | — | unchanged shapes (already present, uniquely defined rather than via the shared bag — left as-is, low value in unifying this one primitive's already-small style set) |
| `content` | string | **removed** — see Nesting (children, `LAYOUT_NEST_ALLOW`) |

## Gallery (tenant leaf → shared container)

| Field | Type | Status |
|-------|------|--------|
| `heading` | string, optional | **changed** — was required; optional per reviewed shape |
| `subheading` | string, optional | unchanged |
| `layout` | `grid \| masonry` | **new** |
| `columnsMobile`, `columnsTablet`, `columnsDesktop` | `1-4` enum | **new** |
| `gap` | sizing string (R1) | **new** |
| `defaultImageAlt`, `showLessLabel`, `showMorePrefix`, `showMoreSuffix`, `lightboxAltPrefix`, `images` | — | **removed** — see Nesting (children, Image only) |

## Nesting (container policy)

| Primitive | `maxDepth` | `slots.default.allow` |
|-----------|------------|------------------------|
| Section | 6 (unchanged) | `LAYOUT_NEST_ALLOW` minus `stack` |
| Flex | 4 (unchanged) | `LAYOUT_NEST_ALLOW` minus `stack` |
| Grid | 5 (unchanged) | `GRID_NEST_ALLOW` minus `stack` |
| Accordion | 4 (**new**, was leaf) | `LAYOUT_NEST_ALLOW` minus `stack` |
| Gallery | 2 (**new**, was leaf) | `["image"]` only |
| Link, Button | 2 (**new**, was leaf) | `["icon", "text"]` only, `maxItems: 2` |
| Text, Image, Icon | 1 (unchanged) | none (leaves) |
| Stack | — | **removed entirely** |

`LAYOUT_NEST_ALLOW` / `GRID_NEST_ALLOW` (`composition-allow.ts`) both drop `"stack"`; `STACK_NEST_ALLOW` is deleted outright. Tenant Keep extras (`registerTenantLayoutNestAllow` — `product-list`, `bike-detail`, `gallery`) drop the `gallery` entry specifically, since Gallery is no longer a tenant Keep type needing that mechanism — it's shared now, with its own narrow policy above.

## Migration field-mapping (for the seed-script reshape and the one-time Strapi migration script)

| Old node | New node(s) |
|----------|-------------|
| `{ __component: "blocks.stack", gap, align, fullWidth, ..., slots }` | `{ __component: "blocks.flex", direction: "column", gap, align, fullWidth: <same, if kept>, ..., slots: <recursively migrated> }` |
| `{ __component: "blocks.button", label, href, variant, ... }` | `{ __component: "blocks.button", href, variant: <mapped>, ..., slots: { default: [{ __component: "blocks.text", content: label }] } }` |
| `{ __component: "blocks.link", label, href, variant, showArrow, ... }` | same shape as Button, plus `showArrow` stays flat |
| `{ __component: "blocks.accordion", title, content, ... }` | `{ __component: "blocks.accordion", title, ..., slots: { default: [{ __component: "blocks.text", content }] } }` |
| `{ __component: "blocks.gallery", heading, images: [{src, alt}], ... }` | `{ __component: "blocks.gallery", heading, layout: "grid", columnsMobile: "2", ..., slots: { default: images.map(img => ({ __component: "blocks.image", src: img.src, alt: img.alt })) } }` |
| `{ __component: "blocks.text", fontSize: "display", ... }` | `{ __component: "blocks.text", fontSize: <px number matching the old named step>, ... }` |

Every mapping is deterministic and total against the current Vukan's Bike content corpus (same standard `009`'s field-shape maps already set: an unmapped value throws rather than silently seeding a wrong shape).
