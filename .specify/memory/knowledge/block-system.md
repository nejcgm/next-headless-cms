# Block System

**Maintenance**: Update this Spec Kit knowledge doc in the same change set when related code changes. Sync map: `.specify/memory/project-context.md`.


# Block System Rules

**Maintenance**: Update `.specify/memory/knowledge/` (this file) when block registration, templates, data contracts, or chrome behavior changes (`.specify/memory/project-context.md` (sync map)).

## Creating a New Block

Every tenant block lives in `src/tenants/{tenant}/blocks/{block-name}/` with:
- `{block-name}.tsx` — Component (default export or named export)
- `types.ts` — All block-specific types (**required**): props, labels, nested entities — import into the component; do not colocate or split into `labels.ts`
- `schema.ts` — Zod prop schema (**required** for registered content blocks)

Register it in `src/tenants/{tenant}/blocks/index.ts` and wire `schema:` on the registration.

**Registry keys — always quote.** In `registerSharedBlocks` / `registerTenantBlocks`, every block type key MUST be a quoted string (`"product-list"`, `"grid"`, `"bike-detail"`), even when the name is a valid JS identifier. Do not mix bare keys (`grid:`) with quoted ones (`"product-list":`).

```typescript
"product-list": { component: ProductList, schema: productListSchema, policy: keepLeafPolicy },
"section": { component: Section, schema: sectionSchema, policy: sectionPolicy },
```

Shared L1 primitives live under `src/shared/components/primitives/{layout|content|actions}/{name}/` (`{name}.tsx` + `types.ts` + `schema.ts`) and register in `shared/components/index.ts`. Nesting primitives also export a **`policy`** (`CompositionPolicy`) and pass it on registration.

**When adding a new L1 primitive** (constitution Principle V): touch only that primitive’s files, registration/`composition-allow`, Strapi component + page DZ, mocks that need it, and Spec Kit sync. Do **not** edit sibling primitives (e.g. do not change `button` while adding `link`, or global `iframe`/`text` styling for one page). Prefer authored box-style / variant props on the page tree for local look. Every component and private helper props type MUST live in that module’s `types.ts` — then run `pnpm check:types-style` (see `knowledge/typescript.md`).

Header/footer chrome under `blocks/header` and `blocks/footer` also keep a `types.ts` (header defines props; footer may re-export shared `FooterProps`).

After registering or changing a block, update `.specify/memory/knowledge/block-system.md` and the tenant catalog (`specs/_catalogs/{id}.md`) (see `.specify/memory/project-context.md` (sync map)).

## Schema + composition policy (registry SoT)

Every registered content block MUST declare a `schema` (Zod) in its registration. Nesting-capable types also declare **`policy`**: `{ level, maxDepth, slots: { [name]: { allow: string[] } } }`. Leaves use `maxDepth: 1` and empty `slots`. The registry (`component` + `schema` + `policy`) is the single source of truth.

**Adapter-primary tree validation** (`compose-validate.ts` via `toPageData(..., tenantId)`): known type → Zod authored props → known slot names → allowlisted children → per-node `maxDepth` (subtree height; parent limits do not accumulate onto children). Soft-fail: drop illegal nodes + `logger.warn` in development. CMS `slots` JSON is untrusted until this pipeline passes.

**Layout nest allowlists** (`shared/components/composition-allow.ts`): `LAYOUT_NEST_ALLOW` (section/flex/accordion's slot) and `GRID_NEST_ALLOW` (grid's slot) both allow **L1 + shared L3 `accordion`**; `GALLERY_NEST_ALLOW` (`["image"]`) and `LINK_BUTTON_NEST_ALLOW` (`["icon","text"]`) are separate, narrower constants for those two container types. Tenants that need proprietary Keep compounds under layout bands call `registerTenantLayoutNestAllow(tenantId, types)` from the tenant `blocks/index.ts`; `resolveBlockPolicy` merges those extras at validation time so `shared/` never names proprietary types. The Strapi admin side mirrors these constants by hand in `page-composition/nest-rules.ts` (Strapi cannot import the Next app) — update both when changing an allowlist.

**Renderer**: recursive render of `BlockInstance.slots` (default slot → `children`). Does **not** re-run composition allowlist/depth checks. Still runs optional **dev-only** Zod on **merged** props (authored + dataContract) for drift.

```typescript
"section": { component: Section, schema: sectionSchema, policy: sectionPolicy },
```

Author schemas with plain `z.object({...})` — unknown keys (e.g. injected `blockId`, allowlisted request params, `dataContract` payloads) never fail validation (Zod's default non-strict mode). **This is validation-only, not sanitization**: `compose-validate.ts`'s `toValidatedBlockInstance` calls `schema.safeParse(props)` purely to decide pass/fail and log a dev warning — it then uses the original `stripProps(rest)` object as `BlockInstance.props`, **not** Zod's parsed/cleaned result, so any extra authored key that isn't explicitly excluded in `stripProps` (only `__component`/`slots`/`children`/`adminName` are) flows straight through into the rendered component's props and gets serialized into the page's RSC payload — harmless for genuinely-unused CMS-authored keys, but a real leak for anything meant to stay admin-only (this bit `adminName`, see below, until `stripProps` explicitly excluded it too). Validate **authored CMS props** only; omit injected entities/collections (see `room-list` / `product-list`). Reference: `shared/components/primitives/layout/section/schema.ts` (shared primitive) or a Keep L3 tenant schema.

**`adminName`** (`012.2`): every registered block component (Strapi JSON schema only — deliberately **not** added to any frontend Zod schema or TS prop type) has an optional `adminName: string` field, purely for the Strapi page-composition tree's own row labels — it has no effect on rendering. `block-summary.ts`'s `summaryFor` checks it first, before any of the existing per-type derivation (Text's `content`, Icon's own `name`, Accordion's `title`, or recursing into a container's children to find the first identifiable descendant) — set, it wins outright; unset, `summaryFor` behaves exactly as before. Named `adminName`, not `name`, because `icon.json` already has a real `name` field (which icon to render) that a generic admin-label field would collide with — every other primitive could have used the shorter `name`, but a single consistent field name across all types (rather than special-casing icon) keeps `summaryFor`/`field-catalog.ts` generic. `compose-validate.ts`'s `stripProps` explicitly excludes it so it never reaches `BlockInstance.props` (see the leak note above) — any future admin-only field needs the same explicit exclusion, since exclusion is a denylist, not inferred from "not in the Zod schema".

## Shared vs tenant block

| Put it in | When |
|-----------|------|
| `src/shared/components/primitives/` | Shared L1 primitives (layout / content / actions); register in `shared/components/index.ts` |
| `src/shared/components/ui/{name}/` | Shared **CMS-authored** interactive/recursive widgets (`accordion`, `gallery`) — `{name}.tsx` + `types.ts` + `schema.ts`; register in `shared/components/index.ts` and Strapi. **Tenant-agnostic chrome**: structure + theme tokens only; page/tenant trees supply composition and box-style overrides. |
| `src/shared/components/static/{name}/` | Shared **non-CMS** widgets used by other components (e.g. `image-lightbox`) — `{name}.tsx` + `types.ts`; **not** registered, **not** in the page DZ. Callers pass props in code. |
| `src/shared/components/navigation/{name}/` | Shared navigation chrome helpers (e.g. `navigation-progress-bar`) — one folder per component |
| `src/tenants/{tenant}/blocks/` | Tenant-specific layout, copy patterns, or data wiring; register in tenant `blocks/index.ts` |

**Levels**

1. **Primitives (L1)** — shared only: `section`, `flex`, `grid`, `text`, `image`, `iframe`, `icon`, `button`, `link`. **`stack` is retired** (`012-primitive-props-redesign`) — every former `stack` is a `flex` with `direction: "column"`; direction alone now covers what a separate stack primitive used to.
2. **Compositions (L2)** — authored/saved subtrees of L1 (same renderer; no separate types)
3. **Compounds (L3)** — recursive containers with their own domain props: shared `accordion` (one expandable panel, nests `LAYOUT_NEST_ALLOW`) and shared `gallery` (image grid/masonry, nests `["image"]` only — promoted from a bike-only leaf to a shared container in `012`); bike Keep leaves: `product-list`, `bike-detail`

**Deleted shared opaques** (no longer registered): `cta-banner`, `stats-bar`, `image-text`, `section-header`, `rich-text`, `image-gallery`. Prefer L1/L2 for marketing layouts. **Bike is SoT for shared L1 types.**

**Container primitives** (`012-primitive-props-redesign`): `link` and `button` are no longer flat leaves with a `label` string — they nest `children` (`slots.default`, allow-listed to `icon`/`text` only, `maxItems: 2`) so a CTA can be icon-only, text-only, or icon+text. Because of this, any tree ending in a `link`/`button` measures one level deeper than before; `flex`/`grid`/`section` `maxDepth` were bumped accordingly (see `maxDepth` table below). When a `link`/`button` has an `icon` child and no `text` child, `accessibleLabel` becomes required — enforced as a soft dev-warning in `compose-validate.ts` (frontend) and a hard validation failure in `page-composition/validate.ts` (Strapi write path).

**Sizing convention** (`012-primitive-props-redesign`, `toCssSize` in `shared/utils/box-style.ts`): every sizing field (`width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight`, and primitive-specific sizes like `icon.size`) accepts a bare number string (→ `px`) or a `%`-suffixed string (→ percentage); anything else is ignored with a dev-only `logger.warn`. `icon.size` and `text.fontSize`/`lineHeight`/`letterSpacing` are plain numbers (px), not sizing strings, since they never take a percentage.

**Box styles (L1)** — shared bag via `boxStyleSchema` / `toBoxStyle`, every field either a dropdown (closed value set), a boolean, or a sizing string per the convention above: `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight`, `padding`, `margin`, `backgroundColor` (theme token enum **or** a literal hex code, e.g. `#RRGGBB` — `colorValueSchema` union), `color` (same union, via `resolveColor`), `borderWidth` (number, px) / `borderStyle` (enum `solid`/`dashed`/`dotted`) / `borderColor` (same token-or-hex union as `color`) — a normal CSS-shaped border triple, replacing a retired `border` enum (`none`/`hairline`/`invertedOutline`) that baked width+style+color into three fixed presets, `borderRadius`, `overflow` (enum `visible`/`hidden`/`auto`), `fontSize`/`fontWeight` (generic strings outside `text`/`button`/`link`, which each narrow these to numbers — see below), `textAlign`. **`fullWidth` and `dividerTop` were removed** (`012.1`) — `fullWidth` is superseded by writing `width: "100%"` directly (a legitimate sizing-convention value now, not a special case); there is no schema-level divider concept at all outside Section's own `divider` enum, and deliberately no generic replacement — a single top hairline rule can't be expressed by the new `borderWidth`/`borderStyle`/`borderColor` triple (CSS `border` always applies to all four sides), and a dedicated boolean prop for it was explicitly rejected. Pre-migration content that used a raw `borderTop` CSS string for this (~130 Flex/Stack nodes in the Vukan's Bike corpus) is migrated by the seed script into an actual synthesized 1px-tall Flex child (`height: "1"`, `backgroundColor: "border"`) prepended to that node's own children, with the "gap after the line" moved from the node's own top padding onto that child's bottom margin — see `strapi-backend.md`. Every primitive that extends this bag `.omit()`s or `.pick()`s only the fields that make sense for it (e.g. `link` picks just `padding`/`backgroundColor`/`color`/`borderWidth`/`borderStyle`/`borderColor` — no width/height/margin, per its reviewed shape) — the shared bag is a superset, not a mandate that every primitive expose every field. Titles/display copy use `text` with `fontSize` + `bold` (there is no separate `heading` primitive). Layout alignment is **not** in the box bag — use component props (`flex`/`grid` `align`/`justify`).

**Color fields admin control**: any field named `color`/`backgroundColor`/`borderColor` gets a hybrid `SingleSelect` (the 8 theme tokens, plus a "Custom hex…" option) + conditional hex `TextInput` in the composition admin (`ColorFieldControl` in `FieldInspector.tsx`), dispatched by field **name**, not Strapi field type (these are now plain `string` attributes in the component JSON, not `enumeration` — Strapi enums can't mix a closed set with arbitrary values).

Every optional field on `boxStyleSchema` (and on every primitive/component schema built from it) is `.nullish()`, not `.optional()` — Strapi's REST API serializes every schema-defined attribute on a root-level dynamic-zone component with explicit `null` when unset, which `.optional()` silently rejects (dropping the whole node in `compose-validate`). See `content-model.md`'s "Critical constraint" note.

**`section`** — structural band, `maxDepth: 7`. `width` (enum `full`/`contained`, replaces the old `fullWidth` boolean), `minHeight` (enum `standard`/`tall`, consulted only when `backgroundImage` is set — replaces the old shared `minHeight`/`heroHeight` box field), `divider` (enum `none`/`top`/`bottom`/`both` — Section's own divider; no other primitive has a divider concept at all, see the box-style bag note above), `padding` (sizing string, px/%, applied as `paddingBlock` i.e. vertical-only — reverted from a `sm`/`md`/`lg` dropdown in `012.1`; horizontal padding stays a fixed `px-4`), `backgroundImage` / `backgroundFit` (`cover`/`contain`) / `backgroundPosition` (`center`/`top`/`bottom`/`left`/`right`, new) / `overlay` / `anchorId`, `surface` (enum `background`/`muted`/`accent`/`foreground`). `justify`/`align` content-alignment props were **removed** — use a nested `flex` for that instead of overloading `section`.

**`flex`** — `maxDepth: 5`. `direction` (`row`/`column` — the sole replacement for the retired `stack`), `gap` (sizing string), `align` (`start`/`center`/`end`/`stretch`/`baseline`), `justify` (`start`/`center`/`end`/`between`/`around`/`evenly`), `wrap`.

**`grid`** — `maxDepth: 6`. Three flat dropdowns only: `columnsMobile` / `columnsTablet` / `columnsDesktop` (enum `"1"`–`"4"` each, strings even though the value is conceptually numeric — Strapi enumerations always serialize as strings), `gap` (sizing string). The legacy `columns` (number or `{ mobile, tablet?, desktop? }`) field was **removed from the type entirely** in `012` — it no longer exists anywhere, including in `resort-example`'s mock data (migrated to the flat dropdowns).

**`text`** — leaf (`maxDepth: 1`). `content`, `as` (enum `p`/`span`/`h1`–`h6`, replaces the old `variant` step enum — renders via `createElement(as, …)`), `fontSize` / `lineHeight` / `letterSpacing` as plain **numbers** (px; replaces the old named-step `fontSize` enum + implicit `lineHeight: 1.625`), `bold`, `uppercase` (new), plus the rest of box styles minus `fontSize`/`height`/`minWidth`/`minHeight`/`maxHeight` (omitted — text sizes itself via `as` + explicit numbers). Former heading roles are plain `text` with `as="h_"` + `fontSize`/`bold`. Stats = a column `flex` of two `text` nodes (was `stack`).

**`button` / `link`** — leaves became containers in `012` (see "Container primitives" above), `maxDepth: 2`, `slots.default.allow: ["icon","text"]`, `maxItems: 2`. Both keep `href` (button's sketch dropped it, but every existing Button is a navigational CTA — kept as a deliberate, documented divergence from the reviewed shape) and gained `accessibleLabel`, `fontSize`/`fontWeight` as numbers, and a wider `variant` set: **`button`** — `primary` (filled brand color) \| `secondary` (filled `--color-secondary`) \| `outline` (brand-color border, transparent fill) \| `ghost` (new, transparent/no border). **`link`** — `primary` (brand color text) \| `secondary` (new) \| `ghost` (new) \| `link` (new, underline style — was previously named `muted`). `button` also gained `type` (`button`/`submit`/`reset`) and `disabled`; `link` gained `target` (`_self`/`_blank`) and kept `showArrow`.

**`image`** — `fit` widened to `cover`/`contain`/`fill`/`none`; `position` (new: `center`/`top`/`bottom`/`left`/`right`, maps to Tailwind `object-*`).

**`iframe`** — `aspect` changed from `video`/`map`/`square` to `auto`/`16:9`/`4:3`/`1:1`/`21:9` (old `map` ≈ new `4:3` visually).

**`icon`** — `name` widened from a 3-value enum (`map-pin`/`phone`/`mail`) to the full generated **lucide** kebab-case name set (~1,838 values, `shared/components/primitives/content/icon/icon-names.ts`, regenerated via `scripts/generate-icon-map.mjs` — see below); `size` changed from `sm`/`md`/`lg` to a plain px **number** (default 24). The admin field editor auto-switches any enum field with more than 20 options (currently only `icon.name`) from a `SingleSelect` to a searchable `Combobox` (`SearchableEnumControl` in `FieldInspector.tsx`) — no per-field wiring needed for future large enums.

**Icon library codegen** (`next-headless-cms-fe/scripts/generate-icon-map.mjs`): cross-references `lucide-react`'s `icons` export (canonical PascalCase) against its `dynamicIconImports` map (authoritative kebab-case names) to generate `icon-map.ts` (`Record<kebabName, LucideIcon>`, static imports — **not** `DynamicIcon`/lazy-loading, which lucide's own docs warn against for statically-known names) and `icon-names.ts` (the `as const` tuple both `IconName` and the Zod enum are built from). Re-run this script (not by hand) whenever `lucide-react` is upgraded.

**Accordion / Gallery as containers** (`012-primitive-props-redesign`): both were leaves with a data-shaped prop (`content` string / `images[]` array) and are now recursive containers — `accordion.content` was replaced by `children` (nests `LAYOUT_NEST_ALLOW`, `maxDepth: 4`); `gallery.images`/`defaultImageAlt`/`showLessLabel`/`showMorePrefix`/`showMoreSuffix`/`lightboxAltPrefix` were replaced by `children` (nests `["image"]` only, `maxDepth: 2`) plus `layout` (`grid`/`masonry`), `columnsMobile`/`Tablet`/`Desktop`, `gap`. Gallery also moved from a `vukans-bike`-only tenant block (`tenants/vukans-bike/blocks/gallery/`) to a shared `ui` component (`shared/components/ui/gallery/`) registered in `shared/components/index.ts` — any tenant can use it now. The old show-more/show-less paging and the irregular masonry span pattern are gone (now a uniform grid or CSS-column masonry) — those don't make sense once children are an opaque, arbitrary-length composed tree rather than a fixed array Gallery itself paginates.

**Gallery lightbox** (`012.1`): click-to-lightbox was rebound rather than left dropped. Since `children` is pre-rendered `ReactNode` (opaque to Gallery), the renderer (`core/blocks/renderer.tsx`) now also passes a `slotNodes: Record<string, BlockInstance[]>` prop alongside the existing rendered `slotContents`/`children` — the raw, un-rendered composition data for each slot (this is the one non-additive-in-spirit-but-additive-in-practice renderer change in this feature: every component already receives it, but only Gallery reads it; nothing else changes). Gallery uses `slotNodes.default` to build the flat image-URL list `ImageLightbox` needs, and a single delegated click handler on the grid container (DOM-position lookup, not per-child wrappers, since `children` can't be cloned/split) maps a click back to that array's index. Reuses the existing, untouched `shared/components/static/image-lightbox/` component.

**`maxDepth` (subtree height) after `012`**: `section` 7, `grid` 6, `flex` 5, `accordion` 4, `gallery` 2, `link`/`button` 2, `text`/`image`/`iframe`/`icon` 1 (leaves).

Page **dynamic zone stays flat at the root**. All layouts nest via **`slots` JSON**. CMS authors use the Strapi **page composition surface** (add/nest/reorder/fields on the Page edit view, plus a collapsed technical JSON fallback). A native nested dynamic zone on Section was an experiment and was reverted. A pixel-perfect freeform canvas remains **out of scope**.

Do not copy a shared block into a tenant folder unless the design or behavior truly diverges. Extend props or wrap the shared component instead.

Header/footer are **not** blocks — they live under `blocks/header`, `blocks/footer` and are rendered by **templates**.

## Data Contracts

Data contracts in `blocks/index.ts` must be SHORT (1-3 lines). Complex logic goes in `src/tenants/{tenant}/services/{name}.service.ts`.

```typescript
// GOOD — delegate to service; request query via ctx.searchParams
"room-detail": {
  component: RoomDetail,
  dataContract: (_props, ctx) =>
    fetchRoomDetailData(ctx.slug, ctx.searchParams),
},

// BAD — too much logic inline
"room-detail": {
  component: RoomDetail,
  dataContract: async (props, ctx) => {
    const hotel = await getHotel();
    const room = hotel.rooms.find(...);
    const availability = await checkAvailability(...);
    // 30 more lines...
  },
},
```

## Data Contract Context

The `ctx` object contains `{ tenant, locale, slug, searchParams }`.

- Use `ctx.slug` for dynamic routes (e.g. extracting a roomId from `/rooms/123`).
- Use `ctx.searchParams` for request/query input (filters, dates). **Do not** expect the page to merge all URL query into every block’s CMS `props`.

### How blocks get URL / request params

| Channel | When to use |
|---------|-------------|
| `ctx.searchParams` in `dataContract` | Server loaders needing query (preferred) |
| `acceptSearchParams: string[]` on registration | Component needs selected keys on props; renderer merges **only** those keys |
| Client `useSearchParams()` | Interactive client UI managing its own URL state |

Never reintroduce a page-level “spread all query into all block props” merge.

## React Keys

- For lists from API data that may have duplicates (amenities, facilities, tags): use `key={\`${item}-${index}\`}`
- For lists with guaranteed-unique identifiers (room.id, review.id, rate.rateId): `key={item.id}` is acceptable
- NEVER use bare `key={index}` — always include a descriptive prefix or item value

## Footer block

Each tenant has a footer block at `src/tenants/{tenant}/blocks/footer/footer.tsx`.
Today it re-exports the shared base. Replace the export with a custom component only when
the tenant needs a visually distinct footer — there is no need to touch the shared component.

```typescript
// Default (re-export shared base)
export { Footer } from "@shared/components/layout/footer";

// Custom (tenant-specific)
export function Footer(props: FooterProps) { ... }
```

## Templates own chrome (header + footer)

Templates in `src/tenants/{tenant}/templates/` are **async server components** that receive
`TemplateProps` (`page`, `tenant`, `children`) and decide which chrome to render.

| Template     | Chrome          | When to use                                 |
|--------------|-----------------|---------------------------------------------|
| `default`    | header + footer | Standard content pages (home, service, etc.) |
| `detail`     | header + footer | Content-heavy detail views with sidebar (resort) |
| `bare`       | none            | Campaign pages, embeds, standalone landings |

Rules:
- Navigation is loaded in `page.tsx` via `loadPageWithNavigation` → `getNavigationCached` (request-deduped). Templates receive it as `page.navigation` — do **not** call `getAdapter().getNavigation` (or `getNavigationCached`) from templates.
- ALWAYS pass the full nav data through `localizeNavItems` before passing to Header / Footer.
- For a page with NO header and NO footer, set `"template": "bare"` in the page data — never add a boolean flag.
- Never put header/footer in `layout.tsx` — the domain layout only wraps `ThemeProvider` + `TenantAnalytics`.
- Do **not** add `app/[domain]/[[...slug]]/loading.tsx` — it unmounts templates and flashes chrome. Use `NavigationProgressBar` from `@shared/components/navigation/navigation-progress-bar/navigation-progress-bar` in tenant headers for in-app loading feedback.
- After adding or changing a template, update the tenant catalog.

## Links and navigation

- Use `Link` from `next/link` for internal routes in blocks (breadcrumbs, CTAs, “back home”).
- Do not use `<a href="/...">` for in-app navigation — ESLint `@next/next/no-html-link-for-pages` fails CI.
- `<a>` is fine for `mailto:`, `tel:`, and external URLs only.

## Styling

Use Tailwind with CSS custom properties for brand colors: `bg-[var(--color-primary)]`, `text-[var(--color-foreground)]`. Neutral and semantic colors are acceptable as hardcoded Tailwind classes:

- **Neutral**: `bg-white`, `text-white`, `bg-black` — universal, not tenant-specific
- **Semantic/state**: `text-red-600`, `bg-red-50` (error), `text-green-600` (success), `bg-amber-50` (warning)
- **Overlays**: `text-white/90`, `bg-white/10` — transparency on dark backgrounds

Brand-specific colors (primary, secondary, accent, foreground, muted, border) must ALWAYS use CSS variables.

**Theme tokens (`ThemeTokens`, `src/core/types/tenant.ts`)**: `colors.{primary, secondary, accent, background, foreground, muted, border, textPrimary, mutedForeground}`, `fonts.{heading, body}`, `borderRadius`. `ThemeProvider` (`src/core/theme/provider.tsx`) emits each as a `--color-*` / `--font-*` / `--radius` CSS variable on its wrapper div — this is a **fixed, hand-maintained list**; a new named token must be added to both `ThemeTokens` and the provider or it is silently inert (this is exactly what happened to `mutedForeground` before it was added — the `text` primitive's non-`color`-overridden state, plus the footer/accordion/header locale switcher, all read `--color-muted-foreground`, which was hardcoded in `globals.css` and unthemeable per tenant until this field existed). `fonts.heading` / `fonts.body` are plain CSS `font-family` values — set them to `var(--font-<name>)` only if `src/app/layout.tsx` actually loads that font via `next/font` with a matching `variable` name; otherwise the reference is dead and text falls through to the browser default.
