# Tenant catalog: `vukans-bike`

**Maintenance**: Update `specs/_catalogs/vukans-bike.md` when this tenant's blocks, templates, pages, or integrations change. Sync map: `.specify/memory/project-context.md`.


# Vukan's Bike (`vukans-bike`)

> **Maintenance**: Keep this file in sync when blocks, templates, mock pages, navigation, or integrations change (`.specify/memory/project-context.md` (sync map)).

Bike shop in Apače: service, sales, bike school, guided tours. Locales: `sl` (default), `de`, `en`. **Product** tenant and the **reference pattern** for new plug-and-play tenants. (`resort-example` is only a build-isolation fixture — do not copy it.)

**Data adapter:** config currently `dataAdapter: "mock"` for redesign / feature verification. Production intent remains **Strapi**; mock JSON under `mock-data/` is the authored SoT while verifying L1/L2 + Keep pages (sl/en/de).

## Render pipeline

```
MockAdapter.getPage (verify) / StrapiAdapter.getPage (production intent)
  → page.tsx
  → resolveTemplate(page.template) → tenant template (header/footer)
  → BlockRenderer → block registry (tenant Keep + shared L1)
  → dataContract (if registered) → adapter.getCollection / getEntry
```

- **Config**: `src/tenants/vukans-bike/config.ts` — theme, domains, contact, `dataAdapter`.
  Theme is a **light editorial palette** (`specs/008-bike-site-redesign`): `primary #B4121B` (brand red),
  `secondary #4B5563` (one step darker than the un-themeable `--color-muted-foreground` `#6B7280`, on the same
  neutral ramp — same family, but AA-legible on the tinted bands), `accent #EFE9DF` (sand surface), `background #FFFFFF`, `foreground #1C1917`
  (text **and** the inverse band surface), `muted #F5F5F4`, `border #E7E5E4`, `textPrimary #8A1015`
  (eyebrows, prices); `borderRadius: "0rem"`. Every token has exactly one role — a token with no role is a
  defect. `logoUrl` is intentionally **absent** so the header renders its wordmark; the previous value was a
  photograph. `fonts.*` are an honest system stack but remain **inert** — nothing applies `font-body`, so the
  site renders in the browser default sans until that is wired (see the feature's shared recommendations).
- **Registration**: `src/tenants/vukans-bike/blocks/index.ts` — Keep L3 + data contracts.
- **Pages**: `src/tenants/vukans-bike/mock-data/pages/*.json` — canonical Strapi DZ shape (`__component`, numeric `id`, flat fields, `lang`). All pages authored as L1/L2 + Keep; localized `en--` / `de--` mirrors.
- **Seed collections**: `src/tenants/vukans-bike/mock-data/collections/products.json` — currently **1** product (`merida`) with `slug`, `specs`, `images`, etc. (plus `en--` / `de--` locale files). Home and `/shop` restate this bike's name, price and headline specs as authored copy, so both must be updated together with this file.
- **Navigation**: `mock-data/navigation.json`, `en--navigation.json`, `de--navigation.json` — **7** header items (Servis, Vodene ture, Kolesarska šola, Trgovina, O nas, Partnerji, Kontakt; the logo is Home) and **8** footer items (adds Domov, in the original Servis/Trgovina/Vodene ture/Kolesarska šola/O nas/Partnerji/Kontakt order — footer order intentionally does not mirror the header's). Identical ids, order and count across locales. Page files must not carry their own `navigation` key.

## Templates (`src/tenants/vukans-bike/templates/`)

| Template | Chrome | Use |
|----------|--------|-----|
| `default` | Header + footer | All current pages |
| `bare` | None | Campaign / embed pages (`"template": "bare"`) |

`page.tsx` loads nav via `loadPageWithNavigation` / `getNavigationCached` and merges it onto `page.navigation`. Templates render `@tenant/blocks/header/header` + `@tenant/blocks/footer/footer` (footer re-exports `@shared/components/layout/footer`) from that prop — they do not fetch nav themselves.

## Layout chrome (not blocks)

| Piece | Path | Role |
|-------|------|------|
| Header | `blocks/header/header.tsx` | Client: logo, nav, locale switcher, mobile menu |
| Footer | `blocks/footer/footer.tsx` | Re-export of shared footer; swap here for custom design |

Domain `layout.tsx` only applies theme + analytics — no header/footer.

## Tenant Keep L3

Every registered content block has a Zod `schema` in `blocks/{name}/schema.ts` wired at registration (`blocks/index.ts`). Schemas validate authored CMS props in development only; `dataContract`-injected fields (e.g. `products`, `bike`) are omitted from the schema. Keep nodes use leaf policy (`maxDepth: 1`, empty slots) and may nest under layout primitives via `registerTenantLayoutNestAllow` in this tenant’s `blocks/index.ts` (shared policies stay L1-only).

| Block type | Component | Data | Used on / purpose |
|------------|-----------|------|-------------------|
| `bike-detail` | `blocks/bike-detail/bike-detail.tsx` | `labels` props + **dataContract** → `load-bike.ts` → `getEntry("products", bikeSlug)` | `/bikes/{slug}` |
| `gallery` | `blocks/gallery/gallery.tsx` | Props (`images[]`) | `/bike-school`, `/guided-tours` — 5 images each (the component tiles 5 perfectly and stays under its hardcoded 10-item reveal) |
| `product-list` | `blocks/product-list/product-list.tsx` | **dataContract** → `load-products.ts` → `getCollection("products")` | **Registered but currently unreferenced** — see below |

**`product-list` is intentionally unused** (`specs/008-bike-site-redesign`, research R6). With a single-product
catalog it renders one card stranded in a hardcoded 4-column grid and prints a category eyebrow that the site
cannot let visitors browse. Home and `/shop` present that bike as an L1-authored flagship band instead. The
block stays registered for the Strapi phase; before it is used again it needs the fixes listed in that
feature's `contracts/shared-recommendations.md` (count-aware grid, optional category badge, drop its
self-imposed `<section>` chrome, `next/link` instead of `<a href>`, remove the no-op `category` prop).

**Deleted proprietary blocks** (no longer registered): `service-pricing`, `partners-gallery`, `service-faq`, `contact`, `hero`, `about-person`, `about-story`, `about-values`, `bike-school-intro`, `bike-school-program`, `guided-tour-experience`, `service-process`, `service-contact`. Service pricing is L1 stacks of `text`/`link`; brands partners are L1 `grid` of stacks; FAQ is L1 + shared **`accordion`**.

## Shared L1 / shared L3 (registered globally)

Defined in `src/shared/components/primitives/...` and `src/shared/components/ui/accordion/` — bike is SoT for these types:

| Block type | Notes |
|------------|--------|
| `section`, `stack`, `flex`, `grid`, `text`, `image`, `iframe`, `icon`, `button`, `link` | Level 1 composition primitives (`text` carries titles via `fontSize` + `bold`) |
| `accordion` | Shared L3 — one expandable panel (`title` + `content`); compose several in a `stack` for FAQ lists |

**Deleted shared opaques**: `cta-banner`, `stats-bar`, `image-text`, `section-header`, `rich-text`, `image-gallery`.

Visual composition editor is out of scope; trees are authored in mock/seed/Strapi JSON (`slots`).

## Page → blocks (reference)

Root DZ order; nested L1 trees summarized. Localized `en--` / `de--` mirrors match.

Band surfaces follow `specs/008-bike-site-redesign/contracts/page-blueprints.md`: adjacent bands never share
a surface, and the site budget is photo heroes on Home / Service / Bike school / Guided tours, inverse
(`surface: "foreground"`) closings on Home and Bike school, and sand (`accent`) closings on Shop and Guided
tours — so no two pages end the same way.

| Page slug | Bands (order → surface) |
|-----------|-------------------------|
| `/` (home) | photo hero → positioning (`background`) → service 3-up (`muted`) → **flagship bike** (`background`) → school & tours (`accent`) → closing (`foreground`) |
| `/service` | photo hero → 9-tier price list (`background`, `#cenik`) → 4-step process (`muted`) → FAQ **`accordion`** ×5 (`background`) → quiet closing (`muted`, `#kontakt`) |
| `/shop` | header (`background`) → **flagship bike** with 6 spec rows (`muted`) → online-build cross-link (`background`) → closing (`accent`) |
| `/about` | header (`muted`) → story grid (`background`) → owner grid (`muted`) → 4-up "how we work" (`background`), no closing CTA band |
| `/contact` | header (`muted`) → `grid` (icon/link contact rows + `iframe` map) (`background`) |
| `/brands` | header (`muted`) → `grid` of **8** partner cards — 7 partners + a "Sodelujmo" CTA tile (`background`), no closing band |
| `/bike-school` | photo hero → intro (`background`) → program 2-up (`muted`, `#program`) → **`gallery`** → closing with external + first-party actions (`foreground`) |
| `/guided-tours` | photo hero → "what you get" 4-up (`background`) → **`gallery`** (`muted`) → process 4-up (`background`, `#potek`) → closing (`accent`) |
| `/bikes/{slug}` | **`bike-detail`** only (labels; bike data comes from the `products` collection) |

## Data contracts

| Block | Loader file | Adapter call | Notes |
|-------|-------------|--------------|-------|
| `product-list` | `blocks/product-list/load-products.ts` | `getCollection(tenant, "products", { locale, limit? })` | Returns `{ products[], locale }`. Catches 404 → empty array. |
| `bike-detail` | `blocks/bike-detail/load-bike.ts` | `getEntry(tenant, "products", bikeSlug)` | `bikeSlug` = last segment of `ctx.slug` (e.g. `/bikes/merida` → `"merida"`). Returns `{ bike? }`. Catches errors → `{}`. |

Keep adapter calls inside the loader files — never inline them in `blocks/index.ts`.

## Products collection in Strapi

- **1** bike (`merida`) × 3 locales seeded via `headless-cms-backend/scripts/seed-vukans-bike-cms.js` (`KEEP_PRODUCT_SLUGS = ["merida"]`).
- Public `find` permission must be granted in Strapi admin (Settings → Users & Permissions → Roles → Public → Product → find).
- `getCollection` filters by `filters[lang][$eq]` (not `locale` — Strapi i18n reserves that param).
- `getEntry` uses `filters[slug][$eq]` + `pagination[pageSize]=1` — slug is the application-level unique identifier.

## Services / integrations

- No external hotel/booking integration on this tenant.
- Reviews feature flag on; no `testimonials` block registered.

## Strapi notes

- Page DZ components: shared L1 + Keep L3 listed above only.
- Page and navigation fields use `lang` (not `locale`) — Strapi i18n plugin reserves `locale` as a query param.
- Page `template` field → `resolveTemplate` (same strings: `default`, `bare`).
- Navigation → collection type in Strapi; maps to `NavigationData` (`header`, `footer`, `footerCopy`).
- Dynamic bike URLs: slug pattern `/bikes/:slug` in adapter, one `bike-detail` block per page; bike data fetched from `products` collection via `dataContract`.
