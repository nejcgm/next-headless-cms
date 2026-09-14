# Contract: Frontend Changes

**Feature**: `009-bike-strapi-migration`

Exact frontend files this migration touches, and what changes in each. `shared/` files affect both tenants —
each one is annotated with its confirmed cross-tenant impact (see `research.md` R16). Everything here mirrors
`contracts/schema-changes.md` field-for-field; nothing here introduces a shape the backend contract doesn't
also produce.

## `src/shared/utils/box-style.ts` (shared — cross-tenant impact: none, verified R16)

- `boxStyleSchema`: `color`, `backgroundColor` → `z.enum([...8 tokens])`. `border` → `z.enum(["none","hairline","invertedOutline"])`. Remove `borderTop`, `width`, `minHeight`, `lineHeight`. Add `dividerTop: z.boolean().optional()`, `fullWidth: z.boolean().optional()`.
- `toBoxStyle()`: add internal maps —
  `BORDER_CSS = { none: "none", hairline: "1px solid var(--color-border)", invertedOutline: "2px solid var(--color-background)" }`;
  apply `dividerTop → style.borderTop = "1px solid var(--color-border)"`; apply `fullWidth → style.width = "100%"`.
  `color`/`backgroundColor` still go through the existing `resolveColor()` unchanged — it already accepts any
  bare token name correctly, so no change needed there.

## `src/shared/utils/color.ts`

No change — `resolveColor()` already handles all 8 tokens correctly; the enum only tightens the type at the
schema boundary, not the resolution function.

## `src/shared/components/primitives/layout/section/{section.tsx,types.ts,schema.ts}` (shared — cross-tenant impact: none, resort-example never uses `blocks.section`, R16)

- Add `surface: "background"|"muted"|"accent"|"foreground"` (replaces the free-string `surface` and removes
  `backgroundColor` from this component's own prop set — every other primitive keeps generic
  `backgroundColor`).
- Add `heroHeight?: "standard"|"tall"`, consulted only in the `backgroundImage` (hero) branch; maps to the
  same two `clamp()` strings already in use. Remove `minHeight` from this component's props (moves fully into
  `heroHeight`).
- Non-hero branch: `backgroundColor: surface ?? "background"` (was `surface ?? "default"` — `"background"`
  and the old `"default"` fallback already resolve to the identical CSS var, this just names it directly now
  that `surface` is a closed enum with no `"default"` member).

## `src/shared/components/primitives/layout/grid/{grid.tsx,types.ts,schema.ts}` (shared — cross-tenant impact: **the one real exception**, R16)

- Add `columnsMobile?: "1"|"2"|"3"|"4"`, `columnsTablet?`, `columnsDesktop?` (same type) as new, additional
  optional props — typed as **strings**, not numbers: Strapi `enumeration` fields always serialize as
  strings, unlike the legacy `columns` field which carries real numbers. Kept as a distinct
  `GridColumnCount` type rather than coerced at the schema boundary, so the Strapi-sourced shape stays
  self-evident in the type.
- **Keep** the existing `columns` prop (number | `{mobile,tablet?,desktop?}`) and `resolveColumns()` exactly
  as they are today — this is what keeps `resort-example`'s one `columns: 3` grid working, untouched.
- Component logic: if any of `columnsMobile`/`columnsTablet`/`columnsDesktop` is present, `Number()`-convert
  each and build the resolved `{mobile,tablet,desktop}` from those flat props directly (bypassing
  `resolveColumns()`); otherwise fall back to today's `resolveColumns(columns)` path unchanged.

## `src/shared/components/primitives/content/text/{text.tsx,types.ts,schema.ts}` (shared — cross-tenant impact: none, resort-example never uses `blocks.text`, R16)

- `fontSize?: "cardTitle"|"sectionTitle"|"priceCompact"|"pageTitle"|"price"|"display"|"statement"|"custom"`
  (was `string`, inherited from box-style — `text` now **narrows** the shared field via
  `boxStyleSchema.extend({ fontSize: z.enum([...]) })`, same override pattern already used for other
  per-component narrowings in this codebase).
- Add `customFontSize?: string` — read only when `fontSize === "custom"`.
- Internal step map (component-local, not exported): each of the 7 named steps → its exact CSS size (table in
  `data-model.md`) **plus** a fixed `line-height: 1.625`, applied via inline style whenever `fontSize` is set
  to anything other than `undefined` — bypassing the variant's own Tailwind size/leading class for that
  instance. `variant` continues to govern the *default* (unset-`fontSize`) case exactly as today, plus its
  existing color-class default and interaction with `bold`.
- `lineHeight` prop removed (was never populated; superseded by the per-step mapping above).

## `src/shared/components/ui/accordion/{accordion.tsx,types.ts,schema.ts}` (shared — cross-tenant impact: none, resort-example never uses `blocks.accordion`, R16)

- `backgroundColor` → `z.enum([...8 tokens])`, `border` → `z.enum(["none","hairline","invertedOutline"])`,
  matching the shared box-style change. `padding`, `margin`, `borderRadius` unchanged (accordion never had
  `borderTop`/`width`/`minHeight`/`lineHeight` to remove).

## `src/tenants/vukans-bike/blocks/product-list/{types.ts,schema.ts}` (tenant-specific — vukans-bike only)

- Remove `category` from `ProductListProps` and `productListSchema` (dead field, R15). No component-logic
  change (it was already unread).

## `src/tenants/vukans-bike/config.ts` (tenant-specific)

- `dataAdapter: "mock"` → `dataAdapter: "strapi"`.
- No other change — theme, contact, domains, locales, features all stay exactly as they are (FR-011).

## `headless-cms-backend/scripts/seed-vukans-bike-cms.js`

- `buildPagePayload` / component-building helpers: apply the R7–R13 field-shape transforms while reading the
  existing mock JSON (color/backgroundColor pass through unchanged since they're already valid token names;
  `surface`/`backgroundColor` collapse on `section` nodes; `fontSize` string → named-step lookup;
  `columns.{mobile,tablet,desktop}` → three flat fields; `borderTop`/`width`/`minHeight` → `dividerTop` /
  `fullWidth` / `heroHeight`; drop any stray `product-list.category`).
- The mock JSON files themselves are **not rewritten** — they stay as the historical/authoring reference in
  their current (pre-migration) shape; the seed script is the single place the shape transform lives, since
  it is the only consumer that needs the new shape (the frontend now reads from Strapi, not these files, for
  this tenant).
- Everything else about the script (upsert-by-`tenant+lang+slug`, publish-on-write, stale-entry cleanup)
  stays as-is (R4).

## Spec Kit docs to update in the same change set (constitution Principle IV / VI)

- `.specify/memory/knowledge/content-model.md` — every table in "Block components" and "Collection types"
  that this feature changes.
- `.specify/memory/knowledge/api-contract.md` — the "Response shape — page" example currently shows an
  outdated `fontSize: "56px"` literal; update to a current example.
- `.specify/memory/knowledge/strapi-backend.md` — note `draftAndPublish` now enabled on `page`/`product`.
- `.specify/memory/knowledge/block-system.md` — the box-style field list.
- `specs/_catalogs/vukans-bike.md` — `dataAdapter` flips from `"mock"` to `"strapi"`; update the "Data
  adapter" note that currently says "mock for redesign / feature verification."
