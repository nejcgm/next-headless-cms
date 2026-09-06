# Contract: Shared / App Recommendations (owner decides)

**Feature**: `008-bike-site-redesign`

FR-013 deliverable. Each item is a ceiling this JSON-only redesign runs into. **None of these are implemented
by this feature** — they touch `shared/` or `src/app/`, which is outside the agreed scope. They are written up
so the owner can approve any of them separately. Ordered by how much they raise the design ceiling.

| # | Change | Where | Unlocks | Size |
|---|--------|-------|---------|------|
| 1 | Load a real typeface and apply it | `src/app/layout.tsx` (`next/font`) + `body` gets `font-body` | The whole site currently renders in the browser's default sans; `theme.fonts` is inert. This is the single largest remaining lever on perceived quality. | Small |
| 2 | Add `lineHeight`, `letterSpacing`, `textTransform`, `fontFamily` to box styles | `shared/utils/box-style.ts` | Tight display leading. Today a resized headline keeps a loose 1.625, so display copy must stay short (research R3). | Small |
| 3 | Emit `--color-muted-foreground` from the theme | `src/core/theme/provider.tsx` + `ThemeTokens` | Component-internal text (footer, accordion, `bike-detail`, header locale switcher) is stuck at `#6B7280` and cannot follow a tenant palette. | Small |
| 4 | Give `text` a tone prop, or default it to `foreground` | `shared/…/content/text` | Every variant currently defaults to the muted gray, so each authored node must repeat `color`. | Small |
| 5 | `product-list` overhaul | `tenants/vukans-bike/blocks/product-list` | Count-aware grid, optional category badge, drop the self-imposed `<section>` + `--color-background` lock, `next/link` instead of `<a href>`, remove the no-op `category` prop. Needed before the block is used again under Strapi (research R6). | Medium |
| 6 | `gallery` configurability | `tenants/vukans-bike/blocks/gallery` | `initialVisibleCount`, a layout mode, and removal of its self-imposed `<section>` + `bg-[var(--color-background)]` wrapper. Today the tile pattern (`idx % 7`, `idx % 5`) and 10-item reveal are hardcoded, and the block always paints a white full-width band that a parent surface cannot override — so the pages either side of a gallery have to be planned around it. | Medium |
| 7 | `section` band padding | `shared/…/layout/section` | An `xl` step or a raw padding string; today the enum tops out at 80px and taller editorial bands need an inner wrapper. | Small |
| 8 | Footer social links | `shared/components/layout/footer` | `FooterProps` has no field for socials, so they cannot be added from data. | Small |
| 9 | Naming / wiring fixes | `shared/…/actions/{button,link}` | `link`'s `accent` variant renders `--color-primary`, and `button`'s `secondary` variant never uses the `secondary` token. Both are misleading to content authors. | Small |
| 10 | Extend `icon` | `shared/…/content/icon` | Only `map-pin`, `phone`, `mail` exist; any icon-bearing pattern beyond contact rows is impossible. | Small |

**Assets, not code**: a real logo asset would let `logoUrl` return to the header (research R8 currently
retires a photograph used as a logo), and additional photography from the owner's Cloudinary collection would
reduce reliance on the ~24 images already referenced (FR-017).
