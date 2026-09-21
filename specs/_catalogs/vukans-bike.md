# Tenant catalog: `vukans-bike`

**Maintenance**: Update `specs/_catalogs/vukans-bike.md` when this tenant's blocks, templates, pages, or integrations change. Sync map: `.specify/memory/project-context.md`.


# Vukan's Bike (`vukans-bike`)

> **Maintenance**: Keep this file in sync when blocks, templates, mock pages, navigation, or integrations change (`.specify/memory/project-context.md` (sync map)).

Bike shop in Apače: service, sales, bike school, guided tours. Locales: `sl` (default), `de`, `en`. **Product** tenant and the **reference pattern** for new plug-and-play tenants. (`resort-example` is only a build-isolation fixture — do not copy it.)

**Data adapter:** `dataAdapter: "strapi"` (live, since `009-bike-strapi-migration`) — the frontend reads every page, nav, and product from Strapi. Mock JSON under `mock-data/` is no longer read at runtime (`@mock-data` resolves to a stub for this tenant); it survives on disk as the seed script's input (`scripts/seed-vukans-bike-cms.js` reshapes it into the redesigned Strapi schema — see `strapi-backend.md` and `.specify/memory/knowledge/content-model.md`) and as the fallback if `dataAdapter` is ever flipped back to `"mock"` for local verification. As of `012-primitive-props-redesign`, the seed script also reshapes every page's primitive props onto the new field shapes (Stack→Flex, Grid `columns`→`columnsMobile/Tablet/Desktop`, Text `variant`→`as`/`fontSize` number, Button/Link `label`→`children`, Accordion `content`→`children`, Gallery `images[]`→`children`, Icon `size` step→number) — see the Pages bullet below and `content-model.md` for the full field mapping.

**Page authoring:** Editors compose the page body in the Strapi **page composition surface** (add/nest/reorder/fields for the whole `blocks` tree, including Flex inside Flex). Slug, `lang`, template, and SEO stay on the native Page form. Nested JSON is a collapsed technical fallback only. Navigation and products are unchanged.

## Render pipeline

```
StrapiAdapter.getPage (live)
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
  (eyebrows, prices), `mutedForeground #4B5563` (matches `secondary` exactly — see below); `borderRadius: "0rem"`.
  Every token has exactly one role — a token with no role is a defect. `logoUrl` is intentionally **absent**
  so the header renders its wordmark; `faviconUrl` is set to the shop photograph (`1000004333_bged3h.jpg`)
  instead. These used to be the same field — `src/app/[domain]/layout.tsx` built the site's favicon from
  `logoUrl`, so removing it for the header also silently dropped the browser-tab icon everywhere. `faviconUrl`
  (`core/types/tenant.ts`) was added to `TenantConfig` specifically to let the two vary independently;
  `[domain]/layout.tsx` now reads `faviconUrl ?? logoUrl` (research R8, code change explicitly requested by
  the tenant owner — outside this feature's normal tenant-block-only scope).
  `fonts.heading` / `fonts.body` reference `var(--font-montserrat)` / `var(--font-inter)` and are now **real**:
  `src/app/layout.tsx` loads both via `next/font/google` with matching `variable` names and applies `font-body`
  to `<body>` (also an owner-requested code change, outside tenant-block scope). The design redesign pass
  added a third: `fonts.display: "var(--font-oswald)"` (Oswald, loaded the same way in `layout.tsx`), selectable
  per-node via `text.fontFamily`. The seed script auto-assigns it (author-explicit `fontFamily` still wins):
  every page's one "big page title" line (a `blocks.text` with no prior `as` at all — no page had a real `<h1>`
  anywhere pre-redesign — matched by its distinctive `bold: true` + `fontSize` clamp signature, checked unique
  per page) gets promoted to `as: "h1"` with `fontFamily: "display"`; any `bold` + `color: "text-primary"` text
  (this corpus's established "standalone emphasis figure" pattern — prices, step numbers) gets `display` too.
  Real `h1`/`h2`/`h3` (via `as`) get `fontFamily: "heading"` by default — previously dead code, since nothing
  upstream of a composed `text` node ever applied `font-heading` (only tenant-hardcoded chrome like `header`/
  `footer`/`bike-detail`/`product-list` did), so every heading rendered in the body font regardless of `as`.
  `mutedForeground` is a
  `ThemeTokens` field added in the same change set — `--color-muted-foreground` (used by `text`'s unstyled
  default, the footer, `accordion`, header locale switcher, `bike-detail`, `gallery`) was previously hardcoded
  in `globals.css` and un-themeable; it's now wired through `ThemeProvider` like every other token, set equal
  to `secondary` here so there is exactly one gray across authored and component-internal text, not two
  similar ones.
- **Design redesign pass fixes** (seed script, `mock-data.md`/`block-system.md` for the full mechanism):
  every `blocks.button`/`blocks.link` label rendered in muted gray regardless of variant (the `012`
  `label`→synthesized-`text`-child migration never set a `color` on that child, and `text`'s unstyled
  default is muted gray) — the seed script now sets one per variant, matching each variant's own Tailwind
  text color exactly (e.g. white on a filled primary button, brand-red on an outline/ghost button or a
  primary link). Separately, every `borderTop`-derived divider line (~130 nodes) was actually invisible
  (0-width flex item, missing an explicit `width`) and a `justify: "between"` label/value row would corrupt
  into 3 competing row items instead of "rule, then row" — both fixed at the seed-script level (see
  `block-system.md`'s box-style-bag note).
- **Registration**: `src/tenants/vukans-bike/blocks/index.ts` — Keep L3 + data contracts.
- **Pages**: `src/tenants/vukans-bike/mock-data/pages/*.json` — seed input only, still written in the **pre-`012` mock shape** (`variant` on text, `label` on button/link, `content` on accordion, `images[]` on gallery, `sm`/`md`/`lg` gap and icon size, `stack` for column layouts, etc.); `scripts/seed-vukans-bike-cms.js` reshapes every field into the current redesigned schema on the way into Strapi (`section.surface`/`width`/`minHeight`/`divider`, `grid.columnsMobile/Tablet/Desktop`, `text.as`/`fontSize` number, `stack`→`flex` with `direction: "column"`, button/link `label`→synthesized `text` child, accordion `content`→synthesized `text` child, gallery `images[]`→synthesized `image` children, icon `size` step→number — see `content-model.md`). Deliberately **not** rewriting the mock JSON itself to the new shapes: the seed script is the one place that translates authoring-era content into the current schema, so mock-data stays a stable historical input rather than something to keep re-migrating by hand. All pages authored as L1/L2 + Keep; localized `en--` / `de--` mirrors. 27 pages × 3 locales are live in Strapi.
- **Seed collections**: `src/tenants/vukans-bike/mock-data/collections/products.json` — currently **1** product (`merida`) with `slug`, `specs`, `images`, etc. (plus `en--` / `de--` locale files), seeded into Strapi as 3 locale entries. Home and `/shop` restate this bike's name, price and headline specs as authored copy, so both must be updated together with this file.
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
| `product-list` | `blocks/product-list/product-list.tsx` | **dataContract** → `load-products.ts` → `getCollection("products")` | **Registered but currently unreferenced** — see below |

`gallery` moved out of this tenant's Keep set in `012-primitive-props-redesign` — it's now a **shared** L3 container (`src/shared/components/ui/gallery/`), see the table below. `/bike-school` and `/guided-tours` still use it (5 `image` children each via `slots.default`, tiled in a uniform grid/masonry — the old click-to-lightbox and irregular masonry-span behavior was dropped along with the promotion, see `content-model.md`).

**`product-list` is intentionally unused** (`specs/008-bike-site-redesign`, research R6). With a single-product
catalog it renders one card stranded in a hardcoded 4-column grid and prints a category eyebrow that the site
cannot let visitors browse. Home and `/shop` present that bike as an L1-authored flagship band instead. The
block stays registered now that the tenant is live on Strapi; before it is used again it needs the fixes listed
in that feature's `contracts/shared-recommendations.md` (count-aware grid, optional category badge, drop its
self-imposed `<section>` chrome, `next/link` instead of `<a href>`). Its no-op `category` prop was removed
entirely in `009-bike-strapi-migration`.

**Deleted proprietary blocks** (no longer registered): `service-pricing`, `partners-gallery`, `service-faq`, `contact`, `hero`, `about-person`, `about-story`, `about-values`, `bike-school-intro`, `bike-school-program`, `guided-tour-experience`, `service-process`, `service-contact`. Service pricing is L1 flex (column direction) of `text`/`link`; brands partners are L1 `grid` of flex; FAQ is L1 + shared **`accordion`**.

## Shared L1 / shared L3 (registered globally)

Defined in `src/shared/components/primitives/...` and `src/shared/components/ui/{accordion,gallery}/` — bike is SoT for these types:

| Block type | Notes |
|------------|--------|
| `section`, `flex`, `grid`, `text`, `image`, `iframe`, `icon`, `button`, `link` | Level 1 composition primitives (`text` carries titles via `as`/`fontSize`/`bold`). **`stack` was retired in `012-primitive-props-redesign`** — every former stack is a `flex` with `direction: "column"` |
| `accordion` | Shared L3 container — one expandable panel (`title` + `children`/`slots.default`, nests `LAYOUT_NEST_ALLOW`); compose several in a column `flex` for FAQ lists |
| `gallery` | Shared L3 container (promoted from bike Keep in `012`) — image grid/masonry (`children`/`slots.default`, nests `["image"]` only) |

`button` and `link` also became containers in `012` (nest `["icon","text"]`, `maxItems: 2`) — see `.specify/memory/knowledge/block-system.md`.

**Deleted shared opaques**: `cta-banner`, `stats-bar`, `image-text`, `section-header`, `rich-text`, `image-gallery`.

A canvas-style visual composition editor is out of scope. Every layout/container primitive (`section`, `flex`, `grid`, `accordion`, `gallery`, `link`, `button`) nests via opaque **`slots` JSON**, edited through the Strapi admin **page composition surface** (`src/admin/page-composition/`) rather than raw JSON — a native nested-dynamiczone experiment on `section` was tried and reverted (`011-page-builder-polish`). See `content-model.md`.

## Page → blocks (reference)

Root DZ order; nested L1 trees summarized. Localized `en--` / `de--` mirrors match. As of `012.2`, every root band's mock JSON also carries an `adminName` (Strapi-only, see `block-system.md`) matching its band description below (e.g. `/service`'s bands are named `Hero`/`Price list`/`Process`/`FAQ`/`Closing CTA`) — the composition tree row label reads that name directly instead of deriving one from nested content, so this table is the source of truth for band naming when adding or renaming one.

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

- Page DZ components: shared L1 + Keep L3 listed above only. `shared.cta-link` / `shared.stat-item` were deleted in `009-bike-strapi-migration` (zero references anywhere).
- Page and navigation fields use `lang` (not `locale`) — Strapi i18n plugin reserves `locale` as a query param.
- Page `template` field → `resolveTemplate` (same strings: `default`, `bare`).
- Navigation → collection type in Strapi; maps to `NavigationData` (`header`, `footer`, `footerCopy`).
- Dynamic bike URLs: slug pattern `/bikes/:slug` in adapter, one `bike-detail` block per page; bike data fetched from `products` collection via `dataContract`.
- `page` / `product` have `draftAndPublish: true`; a webhook (`entry.publish`/`entry.unpublish`/`entry.update`) revalidates the frontend on publish with no redeploy. Schema field shapes (colors, borders, `section.surface`/`width`/`minHeight`/`divider`, `grid.columnsMobile/Tablet/Desktop`) were redesigned for a no-code editor experience in `009-bike-strapi-migration`; every L1 primitive's props were redesigned again in `012-primitive-props-redesign` (unified px/percent sizing, Stack retired into Flex, Accordion/Gallery promoted to recursive containers, Button/Link promoted to icon/text containers, full lucide icon library) — full before/after tables in `.specify/memory/knowledge/content-model.md`, `specs/009-bike-strapi-migration/data-model.md`, and `specs/012-primitive-props-redesign/data-model.md`.
