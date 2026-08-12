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
| `blocks` | **dynamiczone** | `BlockInstance[]` | See Block Components below |
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
Reusable CTA button pair. Fields: `label` (string), `href` (string).

### `shared.image-item`
Image with alt text. Fields: `src` (string), `alt` (string?).

### `shared.stat-item`
Social-proof stat. Fields: `value` (string), `label` (string).

### `shared.nav-item`
Top-level nav link. Fields: `label`, `href`, `isExternal` (bool, default false), `children` (repeatable `shared.nav-item-child`).

### `shared.nav-item-child`
Second-level nav link (no further nesting). Fields: `label`, `href`, `isExternal`.

### `shared.footer-copy`
Footer text labels. Fields: `tagline`, `linksHeading`, `contactHeading`, `contactPlaceholder`, `copyrightReserved`.

---

## Block components (`src/components/blocks/`)

Each component maps to one `BlockInstance.type`. After Strapi strips `__component` and `id` meta, the remaining fields become `BlockInstance.props` — no further mapping needed.

### Shared blocks (available to all tenants)

| Component | `type` in frontend | Key fields |
|-----------|--------------------|-----------|
| `blocks.hero` | `hero` | `headline`, `subheadline?`, `backgroundImage`, `backgroundFit` (cover/contain), `overlay` (decimal), `cta` (shared.cta-link), `secondaryCta?` (shared.cta-link) |
| `blocks.cta-banner` | `cta-banner` | `heading`, `subheading?`, `cta` (shared.cta-link), `background` (primary/muted/dark) |
| `blocks.stats-bar` | `stats-bar` | `stats` (repeatable shared.stat-item) |
| `blocks.image-text` | `image-text` | `heading`, `body` (text), `layout` (image-left/image-right), `image` (shared.image-item), `cta?` (shared.cta-link) |
| `blocks.section-header` | `section-header` | `heading`, `subheading?`, `centered` (bool) |
| `blocks.rich-text` | `rich-text` | `content` (richtext/Markdown) |
| `blocks.image-gallery` | `image-gallery` | `heading?`, `columns` (2-4), `lightbox` (bool), `images` (repeatable shared.image-item) |

### Vukan's Bike tenant blocks

| Component | `type` | Key fields |
|-----------|--------|-----------|
| `blocks.about-person` | `about-person` | `name`, `role`, `bio` (text), `image?`, `cta?` (shared.cta-link) |
| `blocks.about-story` | `about-story` | `kicker?`, `headline`, `quote?`, `body` (**text** — paragraphs split on `\n\n`), `image?`, `imagePosition` (left/right) |
| `blocks.about-values` | `about-values` | `eyebrowBadge`, `heading`, `subheading?`, `items` (repeatable `blocks.about-value-item`) |
| `blocks.about-value-item` | — (sub-component) | `icon` (string), `title`, `description` |
| `blocks.bike-school-intro` | `bike-school-intro` | `kicker?`, `heading`, `subheading?`, `dateRange`, `location`, `cta` (shared.cta-link), `secondaryCta?` |
| `blocks.bike-school-program` | `bike-school-program` | `heading`, `subheading?`, `items` (repeatable `blocks.bike-school-program-item`) |
| `blocks.bike-school-program-item` | — (sub-component) | `title`, `level`, `description`, `bullets` (**text** — split on `\n`), `ctaLabel?`, `ctaHref?` |
| `blocks.contact` | `contact` | `heading`, `subheading?`, `phone`, `email`, `directionsLink`, `mapEmbedUrl?`, `hoursNote?`, `address` (`blocks.contact-address`), `labels` (`blocks.contact-labels`) |
| `blocks.contact-address` | — (sub-component) | `street`, `postalCode`, `city`, `country?` |
| `blocks.contact-labels` | — (sub-component) | `addressHeading`, `directionsLinkText`, `phoneHeading`, `emailHeading`, `mapIframeTitle`, `mapFallbackTitle`, `mapFullscreenLink` |
| `blocks.gallery` | `gallery` | `heading`, `subheading?`, `images` (repeatable shared.image-item), `defaultImageAlt`, `showLessLabel`, `showMorePrefix`, `showMoreSuffix`, `lightboxAltPrefix` |
| `blocks.guided-tour-experience` | `guided-tour-experience` | `heading`, `subheading?`, `items` (repeatable `blocks.guided-tour-item`) |
| `blocks.guided-tour-item` | — (sub-component) | `icon` (route/coach/group/safety), `title`, `description` |
| `blocks.partners-gallery` | `partners-gallery` | `eyebrowBadge`, `defaultPartnerLinkLabel`, `heading`, `subheading?`, `partners` (repeatable `blocks.partner-item`) |
| `blocks.partner-item` | — (sub-component) | `name`, `icon` (image URL), `about`, `url?`, `linkLabel?` |
| `blocks.product-list` | `product-list` | `heading?`, `subheading?`, `outOfStockLabel`, `limit?`, `category?`, `layout` (grid/list), `anchorId?` — products loaded at runtime via `dataContract` |
| `blocks.service-contact` | `service-contact` | `heading`, `text?`, `phone`, `phoneHref?`, `email`, `emailHref?`, `ctaText?` |
| `blocks.service-faq` | `service-faq` | `heading`, `subheading?`, `items` (repeatable `blocks.faq-item`), `contactCtaText?`, `contactCtaLabel?`, `contactCtaHref?` |
| `blocks.faq-item` | — (sub-component) | `question`, `answer` (text) |
| `blocks.service-pricing` | `service-pricing` | `heading`, `subheading?`, `packages` (repeatable `blocks.service-package`), `note?`, `contactCta?`, `contactHref?` |
| `blocks.service-package` | — (sub-component) | `name`, `description`, `label?`, `price` (decimal), `priceDisplay?`, `priceNote?`, `features` (**text** — split on `\n`), `turnaround?` |
| `blocks.service-process` | `service-process` | `heading`, `subheading?`, `steps` (repeatable `blocks.process-step`) |
| `blocks.process-step` | — (sub-component) | `title`, `description?`, `icon?`, `duration?`, `details?` (**text** — split on `\n`) |
| `blocks.bike-detail` | `bike-detail` | `labels` (`blocks.bike-detail-labels`) — bike data loaded at runtime via `dataContract` |
| `blocks.bike-detail-labels` | — (sub-component) | 16 UI label strings (notFoundTitle, breadcrumbHome, outOfStock, …) |

---

## String arrays → `text` fields

Some frontend types historically used `string[]`. These are now **`text`** (textarea) fields in Strapi where:
- `about-story.body` → paragraphs separated by `\n\n`
- `bike-school-program-item.bullets` → one per line, split on `\n`
- `service-package.features` → one per line, split on `\n`
- `process-step.details` → one per line, split on `\n`

Frontend components split at render time — no adapter transformation needed.

---

## Dynamic zone → `BlockInstance` mapping

Strapi dynamic zone entries arrive as:
```json
{ "__component": "blocks.hero", "id": 1, "headline": "...", "cta": { "__component": "shared.cta-link", "id": 5, "label": "...", "href": "..." } }
```

`strapi-document.ts → toDynamicZoneBlock` maps this to:
```json
{ "id": "1", "type": "hero", "props": { "headline": "...", "cta": { "label": "...", "href": "..." } } }
```

If Strapi omits `id`, the fallback is `` `${type}-${index}` `` (index in the page `blocks` array), not a random value.

`__component` and `id` are stripped recursively from all nested component objects. No further normalisation. `BlockInstance` has no string `dataContract` field — data contracts are registered on the block definition only. Visibility supports `locales` / `dateRange` only (no device targeting).

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
