# Tenant catalog: `vukans-bike`

**Maintenance**: Update `specs/_catalogs/vukans-bike.md` when this tenant's blocks, templates, pages, or integrations change. Sync map: `.specify/memory/project-context.md`.


# Vukan's Bike (`vukans-bike`)

> **Maintenance**: Keep this file in sync when blocks, templates, mock pages, navigation, or integrations change (`.specify/memory/project-context.md` (sync map)).

Bike shop in Apače: service, sales, bike school, guided tours. Locales: `sl` (default), `de`, `en`. **`dataAdapter: "strapi"`** — live content from Strapi; mock JSON is seed/reference only.

## Render pipeline

```
StrapiAdapter.getPage → page.tsx
  → resolveTemplate(page.template) → tenant template (header/footer)
  → BlockRenderer → block registry (tenant + shared)
  → dataContract (if registered) → StrapiAdapter.getCollection / getEntry
```

- **Config**: `src/tenants/vukans-bike/config.ts` — theme, domains, contact, `dataAdapter`.
- **Registration**: `src/tenants/vukans-bike/blocks/index.ts` — all tenant block types + data contracts.
- **Mock pages** (fallback): `src/core/mock-data.ts/vukans-bike/pages/*.json` — mirrors Strapi API response shape (has `__component`, numeric `id`, flat fields, `lang`).
- **Mock collections**: `src/core/mock-data.ts/vukans-bike/collections/products.json` — currently **1** product (`merida`) with `slug`, `specs`, `images`, etc. (plus `en--` / `de--` locale files).
- **Navigation**: `navigation.json`, `en--navigation.json`, `de--navigation.json`

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

## Tenant blocks

| Block type | Component | Data | Used on / purpose |
|------------|-----------|------|-------------------|
| `hero` | `blocks/hero/hero.tsx` | Props only | Top of most pages — headline, subheadline, CTAs, optional image |
| `contact` | `blocks/contact/contact.tsx` | Props + `labels` | `/contact` — hours, map, phone, email |
| `about-story` | `blocks/about-story/about-story.tsx` | Props | `/about` — narrative copy |
| `about-person` | `blocks/about-person/about-person.tsx` | Props | `/about` — owner bio + photo |
| `about-values` | `blocks/about-values/about-values.tsx` | Props | `/about` — value cards grid |
| `bike-detail` | `blocks/bike-detail/bike-detail.tsx` | `labels` props from CMS + **dataContract** → `load-bike.ts` → `getEntry("products", bikeSlug)` | `/bikes/{slug}` pages — single product layout, breadcrumbs; bike slug extracted from page URL last segment |
| `bike-school-intro` | `blocks/bike-school-intro/` | Props | `/bike-school` — intro section |
| `bike-school-program` | `blocks/bike-school-program/` | Props | `/bike-school` — program tiers / schedule |
| `gallery` | `blocks/gallery/gallery.tsx` | Props (`images[]`) | Bike school, guided tours — photo grid |
| `guided-tour-experience` | `blocks/guided-tour-experience/` | Props | `/guided-tours` — tour types, highlights |
| `partners-gallery` | `blocks/partners-gallery/` | Props | `/brands` — brand logos + links |
| `product-list` | `blocks/product-list/product-list.tsx` | **dataContract** → `load-products.ts` → `getCollection("products")` | Home (featured), `/shop` — bike cards; `limit` optional |
| `service-pricing` | `blocks/service-pricing/` | Props (`tiers[]`) | `/service` — price tables |
| `service-process` | `blocks/service-process/` | Props (`steps[]`) | `/service`, `/guided-tours` — how-it-works steps |
| `service-faq` | `blocks/service-faq/` | Props (`items[]`) | `/service` — FAQ accordion |
| `service-contact` | `blocks/service-contact/` | Props | `/service` — CTA to book service |

## Shared blocks (registered globally)

Used in vukans-bike mock pages — defined in `src/shared/components/blocks/`:

| Block type | Typical use on this tenant |
|------------|----------------------------|
| `stats-bar` | Home — social proof numbers |
| `image-text` | Home — service promo section |
| `cta-banner` | Home, about, shop, brands, bike-school, guided-tours — bottom CTA strip |
| `section-header` | (unused in current mock pages) |
| `rich-text` | (unused) |
| `image-gallery` | (unused) |

## Page → blocks (reference)

| Page slug | Blocks (order) |
|-----------|----------------|
| `/` (home) | hero → stats-bar → image-text → product-list → cta-banner |
| `/service` | hero → service-pricing → service-process → service-faq → service-contact |
| `/shop` | hero → product-list → cta-banner |
| `/about` | hero → about-story → about-person → about-values → cta-banner |
| `/contact` | hero → contact |
| `/brands` | hero → partners-gallery → cta-banner |
| `/bike-school` | hero → bike-school-intro → bike-school-program → gallery → cta-banner |
| `/guided-tours` | hero → guided-tour-experience → gallery → service-process → cta-banner |
| `/bikes/{slug}` | bike-detail only |

Localized copies: `en--*.json`, `de--*.json` mirror slugs with locale prefix in URL.

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

- Page and navigation fields use `lang` (not `locale`) — Strapi i18n plugin reserves `locale` as a query param.
- Page `template` field → `resolveTemplate` (same strings: `default`, `bare`).
- Navigation → collection type in Strapi; maps to `NavigationData` (`header`, `footer`, `footerCopy`).
- Dynamic bike URLs: slug pattern `/bikes/:slug` in adapter, one `bike-detail` block per page; bike data fetched from `products` collection via `dataContract`.
