# Data Model: Vukan's Bike Mock-to-Strapi Migration & Editor-Friendly Schema

**Feature**: `009-bike-strapi-migration`
**Date**: 2026-09-06

Composition runtime entities (`BlockInstance`, `CompositionPolicy`, `slots`, `maxDepth`) are unchanged from
`006`/`007`/`008`'s data models and `knowledge/block-system.md`. This document defines the **Strapi schema
redesign** (per-component before/after), the shared box-style bag's new shape, and the exact content-migration
mappings the seed step must apply — every mapping here is total (covers 100% of current values; see
`research.md` R7–R13 for the grep evidence).

## Shared box-style bag (`shared/utils/box-style.ts` ↔ every primitive's Strapi schema)

| Field | Before | After | Migration |
|-------|--------|-------|-----------|
| `color`, `backgroundColor` | `string` | `enumeration`: `primary, secondary, accent, background, foreground, muted, border, text-primary` | Direct — every existing value is already one of these 8 tokens |
| `border` | `string` | `enumeration`: `none, hairline, invertedOutline` | `"1px solid var(--color-border)"` → `hairline`; `"2px solid var(--color-background)"` → `invertedOutline`; `"none"` → `none` |
| `borderTop` | `string` | **removed** — replaced by `dividerTop` (`boolean`, default `false`) | Any authored `borderTop` (always the one hairline value) → `dividerTop: true` |
| `width` | `string` | **removed** — replaced by `fullWidth` (`boolean`, default `false`) | Any authored `width` (always `"100%"`) → `fullWidth: true` |
| `minHeight` | `string` | **removed** (moves to `section.heroHeight`, see below) | Non-`section` nodes: none exist today. `section` nodes: see `heroHeight` row |
| `padding`, `margin`, `maxWidth`, `height`, `fontWeight` | `string` | **unchanged** | No migration — kept as-authored (R14) |
| `overflow` | `enumeration` (`visible/hidden/auto`) | **unchanged** | — |
| `textAlign` | `enumeration` (`left/center/right`) | **unchanged** | — |
| `fontSize` | `string` | **unchanged on the shared bag** — only `text` narrows it (see below); other primitives keep the generic string (near-zero real usage, not worth redesigning) | No migration outside `text` nodes |
| `lineHeight` | `string` (added in `008`, zero real uses) | **removed** | No migration — nothing to carry over |

**Not part of box-style, added directly on `section`:**

| Field | Type | Notes |
|-------|------|-------|
| `surface` | `enumeration`: `background, muted, accent, foreground` | Replaces both the old free-string `surface` and `section`'s own `backgroundColor` (the two never co-occurred — R7). Every other primitive keeps generic `backgroundColor`. |
| `heroHeight` | `enumeration`: `standard, tall` | Meaningful only when `backgroundImage` is set. `standard` → `clamp(480px, 72vh, 720px)`; `tall` → `clamp(520px, 82vh, 820px)`. Replaces `section`'s (formerly shared) `minHeight` entirely — zero non-hero uses existed. |

## `blocks.text`

| Field | Before | After | Migration |
|-------|--------|-------|-----------|
| `fontSize` | `string` (free CSS value) | `enumeration`: `cardTitle, sectionTitle, priceCompact, pageTitle, price, display, statement, custom` | See exact value table below — total, 7 cases, zero ambiguity |
| `customFontSize` | — (new) | `string`, optional | Only consulted when `fontSize = custom`; empty for all migrated content (no current value needs it) |
| `lineHeight` | `string` | **removed** | No current node sets it |
| `content`, `variant`, `bold`, plus unchanged box-style fields | unchanged | unchanged | — |

**`fontSize` value migration (total, all current uses map to exactly one of these):**

| Old raw value | New enum value | Count |
|---------------|-----------------|-------|
| `1.25rem` | `cardTitle` | 132 |
| `clamp(1.75rem, 3.2vw, 2.5rem)` | `sectionTitle` | 54 |
| `clamp(1.25rem, 2.2vw, 1.75rem)` | `priceCompact` | 27 |
| `clamp(2.25rem, 5vw, 3.25rem)` | `pageTitle` | 15 |
| `clamp(1.5rem, 2.5vw, 2rem)` | `price` | 15 |
| `clamp(2.5rem, 6vw, 4rem)` | `display` | 9 |
| `clamp(1.5rem, 2.8vw, 2rem)` | `statement` | 6 |

**Component behavior change**: when `fontSize` is any value other than unset, the `text` component applies
that step's fixed `{fontSize, line-height: 1.625}` pair via inline style, **regardless of `variant`** —
`variant`'s own Tailwind size/leading classes are bypassed for that instance (its color-class default and
`bold` handling are unaffected). This is the fix for `008`'s R3 finding, generalized: no combination of
`variant` + `fontSize` can produce a line-height mismatch anymore, because `fontSize` no longer shares a
line-height contract with `variant` at all.

## `blocks.grid`

| Field | Before | After (Strapi, vukans-bike) | After (frontend `Grid` component) | Migration |
|-------|--------|------------------------------|-------------------------------------|-----------|
| `columns` | `json`, default `2` (root cause of the startup crash) | **removed** — Strapi never offers this field again | **kept**, unchanged, as a fallback prop | vukans-bike content: migrated to the 3 flat fields below. `resort-example`'s one existing `columns: 3` grid (mock adapter, never touches Strapi): untouched, keeps working via this same fallback (R16) |
| `columnsMobile` | — | `enumeration` 1–4, default `1` (new) | new optional prop, preferred when present | From `columns.mobile` |
| `columnsTablet` | — | `enumeration` 1–4, optional (new) | new optional prop | From `columns.tablet` (omit if absent) |
| `columnsDesktop` | — | `enumeration` 1–4, optional (new) | new optional prop | From `columns.desktop` (omit if absent) |

Every current vukans-bike `columns` value is already the `{mobile, tablet?, desktop?}` object form (R9) —
migration is a direct field-splitting rename, not a value transform. The frontend component supports **both**
shapes simultaneously (new flat props take precedence when present); this is what makes the Strapi-side field
removal safe for `resort-example`, which never touches Strapi and keeps authoring the old way indefinitely.

## `blocks.section`

See the box-style table above for `surface` and `heroHeight`. All other fields (`padding` enum `sm/md/lg`,
`backgroundImage`, `backgroundFit`, `overlay`, `anchorId`, `justify`, `align`) are unchanged.

## `blocks.product-list`

| Field | Before | After |
|-------|--------|-------|
| `category` | `string` (no-op — never read by `load-products.ts`) | **removed** |
| `heading`, `subheading`, `outOfStockLabel`, `limit`, `layout`, `anchorId` | unchanged | unchanged |

No content migration needed — `product-list` is not referenced by any current page (R4, R15).

## Unchanged components

`stack`, `flex`, `image`, `iframe`, `icon`, `button`, `link`, `accordion`, `bike-detail` (+ its
`bike-detail-labels` sub-component), `gallery`, `shared.seo`, `shared.nav-item` (+ `nav-item-child`),
`shared.footer-copy`, `shared.image-item`, and the `page` / `navigation` / `product` content-types themselves
— no field-shape changes. (`button`/`link` already got their variant-naming fix in `008-bike-site-redesign`;
nothing further changes here.)

## Removed components

`shared.cta-link`, `shared.stat-item` — present on disk, zero references anywhere (R2).

## Content types: Draft & Publish

| Content type | `draftAndPublish` | Change needed |
|--------------|--------------------|---------------|
| `page` | `true` (confirmed already set) | None |
| `product` | `true` (confirmed already set) | None |
| `navigation` | off | None — stays publish-only, per existing `strapi-backend.md` guidance |

## Validation rules

Mechanically checkable — carried into `quickstart.md` as review gates.

| # | Rule | Source |
|---|------|--------|
| M1 | The database's `public` schema is empty immediately before Strapi's first post-reset boot | R1 |
| M2 | Strapi boots with zero schema-sync errors | R1, FR-001 |
| M3 | `shared.cta-link` and `shared.stat-item` no longer exist on disk or in any component's field list | R2, FR-006 |
| M4 | Every `color` / `backgroundColor` value in the re-seeded content is one of the 8 enum tokens (schema itself enforces this — a bad value fails to seed rather than seeding silently) | R7 |
| M5 | Every re-seeded `text.fontSize` value is one of the 8 enum values (7 named + `custom`); `customFontSize` is empty on every seeded node | R8 |
| M6 | Every re-seeded `grid` node has `columnsMobile` set and no longer has a `columns` field | R9 |
| M7 | Every re-seeded node that had `borderTop`/`width`/`minHeight` now has the matching `dividerTop` / `fullWidth` / `surface`+`heroHeight` instead | R10–R13 |
| M8 | `product-list.category` does not exist in the schema | R15 |
| M9 | All 27 pages × 3 locales + 3 navigation files + 1 product × 3 locales are present in Strapi and render identically to the pre-migration mock-data site | FR-003–FR-005 |
| M10 | `page` and `product` have `draftAndPublish: true`; a draft-only entry is not visible to an unauthenticated request | R16 |
| M11 | Public role has `find` granted on `page`, `navigation`, `product`; an unauthenticated request to each succeeds | R16 |
| M12 | A test publish in Strapi is reflected on the live site within the documented revalidation window, with no code deploy | FR-014, R17 |
| M15 | Every optional field on every primitive/component Zod schema is `.nullish()`, not `.optional()`; zero `compose-validate` warnings appear in the dev log across a full walkthrough of all 27 pages × 3 locales | R18 |
| M16 | `grid.columnsMobile`/`columnsTablet`/`columnsDesktop` are typed and validated as strings (`"1"`-`"4"`); `resort-example`'s legacy numeric `columns: 3` still resolves to the same Tailwind classes as before | R19, M13 |
| M13 | `resort-example`'s existing `columns: 3` grid (the one legacy bare-number usage anywhere in either tenant) still renders identically after the frontend `Grid` change | FR-012, R16 |
| M14 | `pnpm lint:resort`, `pnpm type-check`, `pnpm build:resort`, and `TENANT_ID=resort-example pnpm verify:build` all still pass unchanged | FR-012 |

## State: migration lifecycle

```text
current mock-data site (dataAdapter: mock, content-parity baseline)
  → Strapi schema redesign committed (components + content-types)
  → frontend coordinated update (Zod schemas, Grid/Text prop shapes, toBoxStyle mappings)
  → database reset (drop + recreate schema fresh)
  → Strapi boots clean (M2)
  → manual one-time admin setup (first account, Public find permissions, API token, webhook)
  → seed script updated for the new field shapes, run against the fresh database
  → vukans-bike config.ts: dataAdapter "mock" → "strapi"
  → full-site validation sweep (M1–M12) + visual parity walkthrough (all locales)
  → Spec Kit sync (content-model.md, api-contract.md, strapi-backend.md, catalog)
  → done (production hosting for the Strapi process itself: explicitly out of scope, per spec Assumptions)
```
