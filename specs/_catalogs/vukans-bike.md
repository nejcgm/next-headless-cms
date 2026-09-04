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
- **Registration**: `src/tenants/vukans-bike/blocks/index.ts` — Keep L3 + data contracts.
- **Pages**: `src/tenants/vukans-bike/mock-data/pages/*.json` — canonical Strapi DZ shape (`__component`, numeric `id`, flat fields, `lang`). All pages authored as L1/L2 + Keep; localized `en--` / `de--` mirrors.
- **Seed collections**: `src/tenants/vukans-bike/mock-data/collections/products.json` — currently **1** product (`merida`) with `slug`, `specs`, `images`, etc. (plus `en--` / `de--` locale files).
- **Navigation**: `mock-data/navigation.json`, `en--navigation.json`, `de--navigation.json`

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
| `gallery` | `blocks/gallery/gallery.tsx` | Props (`images[]`) | `/bike-school`, `/guided-tours` |
| `partners-gallery` | `blocks/partners-gallery/` | Props | `/brands` |
| `product-list` | `blocks/product-list/product-list.tsx` | **dataContract** → `load-products.ts` → `getCollection("products")` | Home, `/shop` |
| `service-pricing` | `blocks/service-pricing/` | Props (`packages[]`) | `/service` |

**Deleted proprietary blocks** (no longer registered): `service-faq`, `contact`, `hero`, `about-person`, `about-story`, `about-values`, `bike-school-intro`, `bike-school-program`, `guided-tour-experience`, `service-process`, `service-contact`. FAQ is L1 framing + shared **`accordion`**.

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

| Page slug | Blocks (order) |
|-----------|----------------|
| `/` (home) | L1 section bands (brand hero, editorial, service, framed catalog, school/tours, contact CTA) → **`product-list`** where featured |
| `/service` | `section` (hero L1) → `section` + **`service-pricing`** → `section` (process grid L1) → `section` + **`accordion`** + CTA L1 → `section` (contact CTA L1) |
| `/shop` | `section` (hero L1) → `section` (intro L1) → **`product-list`** → `section` (CTA L1) |
| `/about` | `section` (hero L1) → `section` (story grid L1) → `section` (person grid L1) → `section` (values grid L1) → `section` (CTA L1) |
| `/contact` | `section` (hero L1) → `section` + `grid` (icon+link contact rows + `iframe` map) |
| `/brands` | `section` (hero L1) → **`partners-gallery`** → `section` (CTA L1) |
| `/bike-school` | `section` (hero L1) → `section` (intro L1) → `section` (program grid L1) → **`gallery`** → `section` (CTA L1) |
| `/guided-tours` | `section` (hero L1) → `section` (experience grid L1) → **`gallery`** → `section` (process grid L1) → `section` (CTA L1) |
| `/bikes/{slug}` | **`bike-detail`** only |

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
