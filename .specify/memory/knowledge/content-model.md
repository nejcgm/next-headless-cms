# Content Model

**Maintenance**: Update this Spec Kit knowledge doc in the same change set when related code changes. Sync map: `.specify/memory/project-context.md`.


# Content Model

Prefer typed Strapi components and dynamic zones for page composition. Some fields are intentionally `json` where a free-form structure is simpler than components — today: `product.images`, `product.tags`, `product.specs`, and `shared.seo.jsonLd`.
Field names match frontend TypeScript interfaces directly to minimise adapter normalisation.

---

## Collection types

### `page` (`src/api/page/content-types/page/schema.json`)

| Field | Strapi type | Frontend type | Notes |
|-------|-------------|---------------|-------|
| `tenant` | `string` | `string` | e.g. `"vukans-bike"` |
| `lang` | `string` | `string` | `"sl"` / `"en"` / `"de"`. **`locale` is reserved by Strapi i18n plugin — use `lang` everywhere.** |
| `slug` | `string` | `string` | URL path, e.g. `"/service"` |
| `slugPattern` | `string` | `string?` | e.g. `"/bikes/:slug"` for dynamic pages |
| `template` | `enumeration` (default/detail/bare) | `string` | Resolves to a tenant template component |
| `blocks` | **dynamiczone** | `BlockInstance[]` | L1 primitives + bike Keep L3 only (see below) |
| `seo` | component `shared.seo` | `PageSeo` | Required on every page |

### `navigation` (`src/api/navigation/content-types/navigation/schema.json`)

| Field | Strapi type | Frontend type | Notes |
|-------|-------------|---------------|-------|
| `tenant` | `string` | `string` | |
| `lang` | `string` | `string` | Same caveat as `page.lang` |
| `header` | repeatable component `shared.nav-item` | `NavItem[]` | Top nav links |
| `footer` | repeatable component `shared.nav-item` | `NavItem[]` | Footer links |
| `footerCopy` | component `shared.footer-copy` | `FooterCopy?` | Footer label strings |

### `product` (`src/api/product/content-types/product/schema.json`)

One entry per SKU per tenant + locale. Used by `product-list` (collection query) and `bike-detail` (single-entry lookup by slug via `dataContract`).

| Field | Strapi type | Notes |
|-------|-------------|-------|
| `tenant` | `string` | |
| `lang` | `string` | |
| `slug` | `string` | Application-level identifier — used by `getEntry` to look up a single product |
| `name` | `string` | |
| `description` | `text` | Long description |
| `shortDescription` | `string` | One-liner shown in cards |
| `price` | `decimal` | |
| `compareAtPrice` | `decimal?` | Strike-through "was" price |
| `image` | `string` | Primary image URL |
| `images` | `json` | `string[]` of additional image URLs |
| `category` | `string` | e.g. `"Gorska kolesa"` |
| `inStock` | `boolean` | default `true` |
| `tags` | `json` | `string[]` |
| `specs` | `json` | `Record<string, string>` — key/value spec table |

---

## Shared components (`src/components/shared/`)

### `shared.seo`
Maps directly to frontend `PageSeo`: `title`, `description`, `ogImage`, `canonical`, `noIndex`, `jsonLd`.

### `shared.cta-link`
Reusable CTA button pair. Fields: `label` (string), `href` (string). (Legacy helper; L1 `button` is preferred for page CTAs.)

### `shared.image-item`
Image with alt text. Fields: `src` (string), `alt` (string?). Used by Keep `gallery`.

### `shared.stat-item`
Social-proof stat. Fields: `value` (string), `label` (string). (Legacy helper; stats are authored as L1 `stack` of `text` nodes.)

### `shared.nav-item`
Top-level nav link. Fields: `label`, `href`, `isExternal` (bool, default false), `children` (repeatable `shared.nav-item-child`).

### `shared.nav-item-child`
Second-level nav link (no further nesting). Fields: `label`, `href`, `isExternal`.

### `shared.footer-copy`
Footer text labels. Fields: `tagline`, `linksHeading`, `contactHeading`, `contactPlaceholder`, `copyrightReserved`.

---

## Block components (`src/components/blocks/`)

Each component maps to one `BlockInstance.type`. After Strapi strips `__component` and `id` meta, the remaining fields become `BlockInstance.props` — no further mapping needed.

Page DZ (`page.schema.json` → `blocks.components`) lists **only** the L1 + Keep + shared `accordion` components below. Deleted from DZ and disk: shared opaques (`cta-banner`, `stats-bar`, `image-text`, `section-header`, `rich-text`, `image-gallery`), `heading` (use `text` + `fontSize`/`bold`), `service-faq` (use L1 + `accordion`), bike proprietary marketing blocks (`hero`, `about-*`, `bike-school-*`, `guided-tour-experience`, `service-process`, `service-contact`), and `contact` (+ `contact-address` / `contact-labels`) now expressed as L1 + `iframe`.

### Shared L1 (available to all tenants)


| Component | `type` in frontend | Key fields |
|-----------|--------------------|-----------|
| `blocks.section` | `section` | Layout band: enum `padding?`, `backgroundImage?`, `backgroundFit?`, `overlay?`, `anchorId?`, `surface?` / `backgroundColor?`, content `justify?` / `align?` (`start`\|`center`\|`end`), slim box styles, **`slots` (json)** |
| `blocks.stack` | `stack` | `gap?`, `align?`, slim box styles, **`slots` (json)** |
| `blocks.flex` | `flex` | `direction?`, `gap?`, `align?`, `justify?`, `wrap?`, slim box styles, **`slots` (json)** |
| `blocks.grid` | `grid` | `columns?` (number **or** `{ mobile, tablet?, desktop? }` 1–4), `gap?`, slim box styles, **`slots` (json)** |
| `blocks.text` | `text` | Leaf: `content`, `variant` (`body`/`lead`/`caption`/`label`), `bold?`, slim box styles (`fontSize`, `color`, …) — titles use size + bold, not a separate heading type |
| `blocks.image` | `image` | Leaf: `src`, `alt?`, `fit?`, slim box styles |
| `blocks.iframe` | `iframe` | Leaf: `src`, `title`, `allowFullscreen?`, `aspect?` (`video`/`map`/`square`), slim box styles |
| `blocks.icon` | `icon` | Leaf: `name` (`map-pin`/`phone`/`mail`), `label?`, `size?` (`sm`/`md`/`lg`), slim box styles |
| `blocks.button` | `button` | Leaf: `label`, `href`, `variant?` (`primary`/`secondary`), slim box styles |
| `blocks.link` | `link` | Leaf: `label`, `href`, `variant?` (`accent`/`muted`), `showArrow?`, slim box styles |
| `blocks.accordion` | `accordion` | Shared L3 leaf: `title`, `content`, `defaultOpen?`, panel styles only (`padding`, `margin`, `backgroundColor`, `border`, `borderRadius`) |

**Box styles** (shared L1): `width`, `height`, `minHeight`, `maxWidth`, `padding` (not on `section`), `margin`, `backgroundColor`, `color`, `border`, `borderTop`, `borderRadius`, `overflow`, `fontSize`, `fontWeight`, `textAlign`.

**Composition nesting**: Page DZ roots stay flat. Nesting uses `slots` JSON shaped like `{ "default": [ { "__component": "blocks.text", "id": 1, ... }, ... ] }`. Frontend `toPageData(raw, locale, tenantId)` recursively validates via registry policies into `BlockInstance.slots`. Shared layout policies allow L1 + shared `accordion`; bike Keep L3 is added via `registerTenantLayoutNestAllow`.

### Vukan's Bike Keep L3

| Component | `type` | Key fields |
|-----------|--------|-----------|
| `blocks.gallery` | `gallery` | `heading`, `subheading?`, `images` (repeatable shared.image-item), `defaultImageAlt`, `showLessLabel`, `showMorePrefix`, `showMoreSuffix`, `lightboxAltPrefix` |
| `blocks.partners-gallery` | `partners-gallery` | `eyebrowBadge`, `defaultPartnerLinkLabel`, `heading`, `subheading?`, `partners` (repeatable `blocks.partner-item`) |
| `blocks.partner-item` | — (sub-component) | `name`, `icon` (image URL), `about`, `url?`, `linkLabel?` |
| `blocks.product-list` | `product-list` | `heading?`, `subheading?`, `outOfStockLabel`, `limit?`, `category?`, `layout` (grid/list), `anchorId?` — products loaded at runtime via `dataContract` |
| `blocks.service-pricing` | `service-pricing` | `heading`, `subheading?`, `packages` (repeatable `blocks.service-package`), `note?`, `contactCta?`, `contactHref?` |
| `blocks.service-package` | — (sub-component) | `name`, `description`, `label?`, `price` (decimal), `priceDisplay?`, `priceNote?`, `features` (**text** — split on `\n`), `turnaround?` |
| `blocks.bike-detail` | `bike-detail` | `labels` (`blocks.bike-detail-labels`) — bike data loaded at runtime via `dataContract` |
| `blocks.bike-detail-labels` | — (sub-component) | 16 UI label strings (notFoundTitle, breadcrumbHome, outOfStock, …) |

Header/footer chrome are tenant templates, not DZ components.

---

## String arrays → `text` fields

Some frontend types historically used `string[]`. These are now **`text`** (textarea) fields in Strapi where:
- `service-package.features` → one per line, split on `\n`

Frontend components split at render time — no adapter transformation needed.

---

## Dynamic zone → `BlockInstance` mapping

Strapi dynamic zone entries arrive as:
```json
{ "__component": "blocks.section", "id": 1, "padding": "lg", "slots": { "default": [ { "__component": "blocks.text", "id": 2, "content": "...", "fontSize": "56px", "bold": true, "color": "foreground" } ] } }
```

`strapi-document.ts → toDynamicZoneBlock` maps this to:
```json
{ "id": "1", "type": "section", "props": { "padding": "lg" }, "slots": { "default": [ { "id": "2", "type": "heading", "props": { "content": "...", "level": 1 } } ] } }
```

If Strapi omits `id`, the fallback is `` `${type}-${index}` `` (index in the page `blocks` array), not a random value.

`__component` and `id` are stripped recursively from nested **non-DZ** component objects. Arrays whose items have `__component` (nested dynamic zones, if introduced later) are mapped to `BlockInstance[]` (`{ id, type, props }`). Visibility supports `locales` / `dateRange` only (no device targeting).

---

## `lang` vs `locale` — critical constraint

Strapi 5's i18n plugin reserves `locale` as a query parameter even when the content type does **not** use i18n. Querying `?filters[locale][$eq]=sl` raises `"Invalid key locale"`. The solution is to name the field `lang` everywhere (schema, seed, frontend queries). Never name a free-text locale field `locale`.

---

## Adding a new block

1. Create `src/components/blocks/<block-name>.json` (and sub-component JSONs if needed).
2. Add the component name to the `blocks` dynamic zone in `page/schema.json`.
3. Run `npm run types:generate` to regenerate TypeScript types.
4. Add the block to the frontend block registry.
5. Update `.specify/memory/knowledge/content-model.md` and `.specify/memory/knowledge/api-contract.md`.

## Adding a new collection (for `getCollection` / `getEntry`)

1. Create `src/api/{name}/content-types/{name}/schema.json` with `tenant` + `lang` + `slug` fields.
2. Create `controllers/`, `services/`, `routes/` using `factories.createCore*`.
3. Grant Public role `find` (and optionally `findOne`) in Strapi admin.
4. Extend the seed script to populate entries.
5. If a block needs entries at render time, add a `dataContract` in `src/tenants/{tenant}/blocks/{block}/load-{thing}.ts` and register it in `blocks/index.ts`.
