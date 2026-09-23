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

### `shared.image-item`
Image with alt text. Fields: `src` (string), `alt` (string?). **Unreferenced since `012-primitive-props-redesign`** — Gallery's `images` repeatable-component field was replaced by `children`/`slots.default` (plain `blocks.image` nodes); left registered on disk rather than deleted, since no live content still references it and deleting a component schema is a separate, higher-risk change than this doc sync.

### `shared.nav-item`
Top-level nav link. Fields: `label`, `href`, `isExternal` (bool, default false), `children` (repeatable `shared.nav-item-child`).

### `shared.nav-item-child`
Second-level nav link (no further nesting). Fields: `label`, `href`, `isExternal`.

### `shared.footer-copy`
Footer text labels. Fields: `tagline`, `linksHeading`, `contactHeading`, `contactPlaceholder`, `copyrightReserved`.

---

## Block components (`src/components/blocks/`)

Each component maps to one `BlockInstance.type`. After Strapi strips `__component` and `id` meta, the remaining fields become `BlockInstance.props` — no further mapping needed.

Page DZ (`page.schema.json` → `blocks.components`) lists **only** the L1 + Keep + shared `accordion`/`gallery` components below. Deleted from DZ and disk: shared opaques (`cta-banner`, `stats-bar`, `image-text`, `section-header`, `rich-text`, `image-gallery`), `heading` (use `text` + `fontSize`/`bold`), `service-faq` (use L1 + `accordion`), `partners-gallery` / `partner-item` (use L1 `grid` of flex), `service-pricing` / `service-package` (use L1 flex of `text` / `link`), bike proprietary marketing blocks (`hero`, `about-*`, `bike-school-*`, `guided-tour-experience`, `service-process`, `service-contact`), `contact` (+ `contact-address` / `contact-labels`) now expressed as L1 + `iframe`, `shared.cta-link` / `shared.stat-item` (as of `009-bike-strapi-migration`; zero references anywhere), and **`blocks.stack`** (as of `012-primitive-props-redesign` — every stack is now a `flex` with `direction: "column"`; `stack.json` deleted).

### Shared L1 (available to all tenants)


| Component | `type` in frontend | Key fields |
|-----------|--------------------|-----------|
| `blocks.section` | `section` | Layout band, `maxDepth: 7`: `width?` (enum `full`/`contained`), `minHeight?` (enum `standard`/`tall`, only meaningful with `backgroundImage`), `divider?` (enum `none`/`top`/`bottom`/`both`), `padding?` (sizing string, vertical-only), `backgroundImage?`, `backgroundFit?`, `backgroundPosition?` (enum `center`/`top`/`bottom`/`left`/`right`), `overlay?`, `anchorId?`, `surface?` (enum `background`/`muted`/`accent`/`foreground`), slim box styles, **`slots` (json)** `{ "default": [ nested nodes ] }` — same nest storage as flex/grid. `justify`/`align` content-alignment props were removed in `012` |
| `blocks.flex` | `flex` | `maxDepth: 5`. `direction?` (`row`/`column`, default `row`), `gap?` (sizing string, default `"16"`), `align?` (default `center`), `justify?` (default `start`), `wrap?` (default `false`), `backgroundImage?`, `overlay?` (0–1, tints the background image only), `anchorId?`, slim box styles, **`slots` (json)** |
| `blocks.grid` | `grid` | `maxDepth: 6`. `columnsMobile?`/`columnsTablet?`/`columnsDesktop?` (enum `"1"`–`"4"` each, three separate dropdowns in the admin) — the legacy `columns` number/object field was **removed entirely** in `012` (no fallback), `gap?` (sizing string), slim box styles, **`slots` (json)** |
| `blocks.text` | `text` | Leaf: `content`, `as?` (enum `p`/`span`/`h1`–`h6`, replaces the old `variant` step enum), `fontFamily?` (enum `body`/`heading`/`display`, redesign pass — per-node font choice, unset = inherit), `fontSize?`/`lineHeight?`/`letterSpacing?` (plain numbers, px), `bold?`, `uppercase?`, slim box styles (`color`, …) minus `fontSize`/`height`/`minWidth`/`minHeight`/`maxHeight` — titles use `as="h_"` + size + bold, not a separate heading type |
| `blocks.image` | `image` | Leaf: `src`, `alt?`, `fit?` (`cover`/`contain`/`fill`/`none`), `position?` (`center`/`top`/`bottom`/`left`/`right`), slim box styles |
| `blocks.iframe` | `iframe` | Leaf: `src`, `title`, `allowFullscreen?`, `aspect?` (`auto`/`16:9`/`4:3`/`1:1`/`21:9`), slim box styles |
| `blocks.icon` | `icon` | Leaf: `name` (full lucide kebab-case set, ~1,838 values, generated), `label?`, `size?` (plain number, px, default 24), slim box styles |
| `blocks.button` | `button` | Container (`012`), `maxDepth: 2`, slots `default` allow `["icon","text"]` max 2: `children`/`slots.default` replaces the old `label` string, `href`, `type?` (`button`/`submit`/`reset`), `disabled?`, `variant?` (`primary`/`secondary`/`outline`/`ghost`), `accessibleLabel?` (required when icon-only), `fontSize?`/`fontWeight?` (numbers), slim box styles |
| `blocks.link` | `link` | Container (`012`), `maxDepth: 2`, slots `default` allow `["icon","text"]` max 2: `children`/`slots.default` replaces the old `label` string, `href`, `target?` (`_self`/`_blank`), `showArrow?`, `variant?` (`primary`/`secondary`/`ghost`/`link`), `accessibleLabel?` (required when icon-only), `fontSize?`/`fontWeight?` (numbers), only `padding`/`backgroundColor`/`color`/`border`/`borderRadius` from box styles (no width/height/margin) |
| `blocks.accordion` | `accordion` | Shared L3 container (`012`, was a leaf), `maxDepth: 4`, slots `default` allow `LAYOUT_NEST_ALLOW`: `title`, `defaultOpen?`, `children`/`slots.default` replaces the old `content` string, panel styles only (`padding`, `margin`, `backgroundColor` enum, `border` enum, `borderRadius`) |
| `blocks.gallery` | `gallery` | Shared L3 container (`012`, promoted from a bike-only leaf), `maxDepth: 2`, slots `default` allow `["image"]` only: `heading?`, `subheading?`, `layout?` (`grid`/`masonry`), `columnsMobile?`/`columnsTablet?`/`columnsDesktop?` (`"1"`–`"4"`), `gap?`, `children`/`slots.default` replaces the old `images`/`defaultImageAlt`/`showLessLabel`/`showMorePrefix`/`showMoreSuffix`/`lightboxAltPrefix` fields |

**Box styles** (shared L1, redesigned in `009-bike-strapi-migration`, sizing convention refined and color/border reworked in `012-primitive-props-redesign` — every field editor-friendly: dropdown for closed sets, boolean for binary states, sizing string (bare number → px, `%`-suffixed → percentage, via `toCssSize`) for dimensional fields): `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight`, `padding`, `margin`, `backgroundColor` (theme token enum **or** a literal hex code — `colorValueSchema`, a Zod union), `color` (same union), `borderWidth` (number, px) / `borderStyle` (enum `solid`/`dashed`/`dotted`) / `borderColor` (same token-or-hex union), `borderRadius`, `overflow` (enum `visible`/`hidden`/`auto`), `fontSize`/`fontWeight` (generic strings — `text`/`button`/`link` each narrow these to plain numbers instead), `textAlign`. **Removed**: `fullWidth` (boolean — write `width: "100%"` directly instead) and `dividerTop` (boolean — no schema-level divider concept exists outside Section's own `divider` enum; a single top hairline rule can't be expressed by the `borderWidth`/`borderStyle`/`borderColor` triple, which always applies to all four sides, and a dedicated boolean prop for it was explicitly rejected) as of `012.1`; a single `border` enum (`none`/`hairline`/`invertedOutline`, three fixed width+style+color presets) as of the same pass, replaced by the `borderWidth`/`borderStyle`/`borderColor` triple above. Legacy content that used a raw `borderTop` CSS string is migrated by the seed script into a synthesized 1px-tall Flex child instead (see `strapi-backend.md`). Each primitive `.omit()`s or `.pick()`s only the subset it needs from this shared bag; not every primitive carries every field (e.g. `link` picks only `padding`/`backgroundColor`/`color`/`borderWidth`/`borderStyle`/`borderColor`).

**Composition nesting**: Page DZ roots stay flat. **All** layouts and containers (`section`, `flex`, `grid`, `accordion`, `gallery`, `link`, `button`) nest via opaque **`slots` JSON** `{ "default": [ { "__component": "blocks.text", "id": 1, ... }, ... ] }`. Authors edit that tree in the Strapi admin **page composition surface** (`src/admin/page-composition/`), not as nested JSON and not via a native nested dynamic zone. New **root** bands omit `id` until Strapi assigns the DZ row; nested composition `id`s stay inside `slots` only. A leftover Section `children` dynamic-zone experiment was reverted; run `npm run convert:section-children` on existing DBs, then writes convert any remaining `children` arrays in document middleware. `compose-validate.ts` reads **`slots` only**.

Frontend `toPageData(raw, locale, tenantId)` → `toValidatedBlockInstance` (`compose-validate.ts`) maps `slots` into `BlockInstance.slots.default` before registry-policy validation. Shared layout policies (`section`/`flex`/`grid`/`accordion`) allow L1 + shared `accordion`; `gallery` and `link`/`button` have their own narrow allowlists (`["image"]` and `["icon","text"]` respectively); bike Keep leaves are added via `registerTenantLayoutNestAllow`.

### Vukan's Bike Keep leaves

| Component | `type` | Key fields |
|-----------|--------|-----------|
| `blocks.product-list` | `product-list` | `heading?`, `subheading?`, `outOfStockLabel`, `limit?`, `layout` (grid/list), `anchorId?` — products loaded at runtime via `dataContract` (`category` field removed in `009` — confirmed unreferenced by `load-products.ts`) |
| `blocks.bike-detail` | `bike-detail` | `labels` (`blocks.bike-detail-labels`) — bike data loaded at runtime via `dataContract` |
| `blocks.bike-detail-labels` | — (sub-component) | 16 UI label strings (notFoundTitle, breadcrumbHome, outOfStock, …) |

`gallery` moved out of this section in `012-primitive-props-redesign` — it's a shared L3 container now (see table above), available to every tenant, not a bike-only Keep type.

Header/footer chrome are tenant templates, not DZ components.

---

## String arrays → `text` fields

Some frontend types historically used `string[]`. These are now **`text`** (textarea) fields in Strapi where:
- `service-package.features` → one per line, split on `\n`

Frontend components split at render time — no adapter transformation needed.

---

## Dynamic zone → `BlockInstance` mapping

Strapi dynamic zone entries arrive as (all layouts use `slots` JSON):
```json
{ "__component": "blocks.section", "id": 1, "padding": "lg", "surface": "background", "slots": { "default": [ { "__component": "blocks.text", "id": 2, "content": "...", "fontSize": "display", "bold": true, "color": "foreground" } ] } }
```

`compose-validate.ts → toValidatedBlockInstance` maps that shape to:
```json
{ "id": "1", "type": "section", "props": { "padding": "lg" }, "slots": { "default": [ { "id": "2", "type": "text", "props": { "content": "..." } } ] } }
```
`slots` is consumed into `BlockInstance.slots`. A leftover `children` key is stripped from `props` and is **not** treated as a nest.

If Strapi omits `id`, the fallback is `` `${type}-${index}` `` (index in the page `blocks` array, or in the parent's slot array for nested children), not a random value.

`__component` and `id` are stripped recursively from nested **non-DZ** component objects; `slots` is excluded from `props` at every level (consumed into `BlockInstance.slots`). A leftover `children` key is also excluded from `props`. Visibility supports `locales` / `dateRange` only (no device targeting).

**Critical constraint — `null` on unset fields**: Strapi's REST API always serializes every schema-defined attribute on a root-level dynamic-zone component, using explicit `null` for any field the editor left unset (unlike mock JSON, which omits the key entirely). Nested content inside a `slots` field does **not** get this treatment, since `slots` is typed `json` (an opaque blob, not schema-enforced). Every optional Zod field on a primitive/component schema must therefore be `.nullish()`, not `.optional()` — `.optional()` only accepts `undefined` and silently rejects Strapi's `null`, dropping the whole node in `compose-validate`. (Discovered in `009-bike-strapi-migration` — see `research.md` R18.)

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
