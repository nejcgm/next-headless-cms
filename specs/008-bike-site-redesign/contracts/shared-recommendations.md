# Contract: Shared / App Recommendations (owner decides)

**Feature**: `008-bike-site-redesign`

FR-013 deliverable. Each item is a ceiling this JSON-only redesign ran into. **None were implemented as part
of the original redesign scope** — they touch `shared/`, `src/core/`, or `src/app/`. Several have since been
**explicitly requested and implemented** by the tenant owner in follow-up rounds (marked ✅ below); the rest
remain proposals pending an explicit go-ahead. Ordered by how much they raise the design ceiling.

| # | Change | Where | Unlocks | Size | Status |
|---|--------|-------|---------|------|--------|
| 1 | Load a real typeface and apply it | `src/app/layout.tsx` (`next/font`) + `body` gets `font-body` | The whole site rendered in the browser's default sans; `theme.fonts` was inert. | Small | ✅ Done — Montserrat + Inter via `next/font/google`, `--font-montserrat`/`--font-inter` on `<html>`, `font-body` on `<body>` |
| 2 | Add `lineHeight` to box styles | `shared/utils/box-style.ts` | Tight display leading without breaking `lead`/`caption`/`label` line-height when `fontSize` is overridden (research R3). | Small | ✅ Done — `lineHeight` on `boxStyleSchema` + `toBoxStyle`; mirrored in Strapi `blocks.text`/`blocks.link` schemas + generated types |
| 3 | Emit `--color-muted-foreground` from the theme | `src/core/theme/provider.tsx` + `ThemeTokens` | Component-internal text (footer, accordion, `bike-detail`, header locale switcher) was stuck at `#6B7280`, unthemeable. | Small | ✅ Done — `mutedForeground` added to `ThemeTokens.colors` (required; also backfilled on `resort-example`) and emitted by `ThemeProvider`; vukans-bike sets it equal to `secondary` |
| 4 | Give `text` a tone prop, or default it to `foreground` | `shared/…/content/text` | Every variant currently defaults to the muted gray, so each authored node must repeat `color`. | Small | Proposed |
| 5 | `product-list` overhaul | `tenants/vukans-bike/blocks/product-list` | Count-aware grid, optional category badge, drop the self-imposed `<section>` + `--color-background` lock, `next/link` instead of `<a href>`, remove the no-op `category` prop. Needed before the block is used again under Strapi (research R6). | Medium | Proposed |
| 6 | `gallery` configurability | `tenants/vukans-bike/blocks/gallery` | `initialVisibleCount`, a layout mode, and removal of its self-imposed `<section>` + `bg-[var(--color-background)]` wrapper. Today the tile pattern (`idx % 7`, `idx % 5`) and 10-item reveal are hardcoded, and the block always paints a white full-width band that a parent surface cannot override — so the pages either side of a gallery have to be planned around it. | Medium | Proposed |
| 7 | `section` band padding | `shared/…/layout/section` | An `xl` step or a raw padding string; today the enum tops out at 80px and taller editorial bands need an inner wrapper. | Small | Proposed |
| 8 | Footer social links | `shared/components/layout/footer` | `FooterProps` has no field for socials, so they cannot be added from data. | Small | Proposed |
| 9 | Naming / wiring fixes | `shared/…/actions/{button,link}` | `link`'s `accent` variant rendered `--color-primary`, and `button`'s `secondary` variant never used the `secondary` token. | Small | ✅ Done — `link`'s `accent` renamed to `primary`; `button`'s old outline-style `secondary` renamed to `outline`, and a genuine `secondary` variant added (solid `--color-secondary` fill). 12 authored `blocks.button` nodes migrated `secondary` → `outline`; zero `blocks.link` nodes needed migration (none set `variant` explicitly). Strapi component schemas + generated types kept in sync |
| 10 | Extend `icon` | `shared/…/content/icon` | Only `map-pin`, `phone`, `mail` exist; any icon-bearing pattern beyond contact rows is impossible. | Small | Proposed |
| 11 | Decouple the favicon from the header logo | `src/app/[domain]/layout.tsx` | `generateMetadata` set `icons` from the *same* `tenantConfig.logoUrl` the header used for its `<img>` — no other code path set a favicon. | Small | ✅ Done — `faviconUrl` added to `TenantConfig`; `[domain]/layout.tsx` reads `faviconUrl ?? logoUrl` (research R8) |

**Still assets, not code**: additional photography from the owner's Cloudinary collection would reduce
reliance on the ~24 images already referenced (FR-017) — unaffected by the fixes above.
