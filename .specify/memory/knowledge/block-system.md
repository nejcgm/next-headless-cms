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

**When adding a new L1 primitive** (constitution Principle V): touch only that primitive’s files, registration/`composition-allow`, Strapi component + page DZ, mocks that need it, and Spec Kit sync. Do **not** edit sibling primitives (e.g. do not change `button` while adding `link`, or global `iframe`/`text` styling for one page). Prefer authored box-style / variant props on the page tree for local look.

Header/footer chrome under `blocks/header` and `blocks/footer` also keep a `types.ts` (header defines props; footer may re-export shared `FooterProps`).

After registering or changing a block, update `.specify/memory/knowledge/block-system.md` and the tenant catalog (`specs/_catalogs/{id}.md`) (see `.specify/memory/project-context.md` (sync map)).

## Schema + composition policy (registry SoT)

Every registered content block MUST declare a `schema` (Zod) in its registration. Nesting-capable types also declare **`policy`**: `{ level, maxDepth, slots: { [name]: { allow: string[] } } }`. Leaves use `maxDepth: 1` and empty `slots`. The registry (`component` + `schema` + `policy`) is the single source of truth.

**Adapter-primary tree validation** (`compose-validate.ts` via `toPageData(..., tenantId)`): known type → Zod authored props → known slot names → allowlisted children → per-node `maxDepth` (subtree height; parent limits do not accumulate onto children). Soft-fail: drop illegal nodes + `logger.warn` in development. CMS `slots` JSON is untrusted until this pipeline passes.

**Layout nest allowlists** (`shared/components/composition-allow.ts`): shared policies allow **L1 only**. Tenants that need L3 compounds under layout bands call `registerTenantLayoutNestAllow(tenantId, types)` from the tenant `blocks/index.ts`; `resolveBlockPolicy` merges those extras at validation time so `shared/` never names proprietary types.

**Renderer**: recursive render of `BlockInstance.slots` (default slot → `children`). Does **not** re-run composition allowlist/depth checks. Still runs optional **dev-only** Zod on **merged** props (authored + dataContract) for drift.

```typescript
"section": { component: Section, schema: sectionSchema, policy: sectionPolicy },
```

Author schemas with plain `z.object({...})` — unknown keys (e.g. injected `blockId`, allowlisted request params, `dataContract` payloads) are stripped, so they won't cause false failures. Validate **authored CMS props** only; omit injected entities/collections (see `room-list` / `product-list`). Reference: `shared/components/primitives/layout/section/schema.ts` (shared primitive) or a Keep L3 tenant schema.

## Shared vs tenant block

| Put it in | When |
|-----------|------|
| `src/shared/components/primitives/` | Shared L1 primitives (layout / content / actions); register in `shared/components/index.ts` |
| `src/tenants/{tenant}/blocks/` | Tenant-specific layout, copy patterns, or data wiring; register in tenant `blocks/index.ts` |

**Levels**

1. **Primitives (L1)** — shared only: `section`, `stack`, `flex`, `grid`, `heading`, `text`, `image`, `iframe`, `icon`, `button`, `link`
2. **Compositions (L2)** — authored/saved subtrees of L1 (same renderer; no separate types)
3. **Compounds (L3)** — encapsulated domain nodes (bike Keep: `product-list`, `bike-detail`, `gallery`, `partners-gallery`, `service-pricing`, `service-faq`); composable in the tree, not CMS-decomposed

**Deleted shared opaques** (no longer registered): `cta-banner`, `stats-bar`, `image-text`, `section-header`, `rich-text`, `image-gallery`. Prefer L1/L2 for marketing layouts. **Bike is SoT for shared L1 types.**

**Box styles (L1)** — shared bag via `boxStyleSchema` / `toBoxStyle`: `width`, `height`, `minHeight`, `maxWidth`, `padding`, `margin`, `backgroundColor`, `color`, `border`, `borderTop`, `borderRadius`, `overflow`, `fontSize`, `fontWeight`, `textAlign`. Prefer **px**; theme tokens or `#hex` via `resolveColor`. `border` is CSS shorthand; `borderTop` for hairline rules. Box typography fields are intentional **CMS overrides**; prefer `heading`/`text` variants for defaults. Layout alignment is **not** in the box bag — use component props.

**`section`** — structural band. `justify` / `align` are **content alignment** (`start`\|`center`\|`end`) and turn the section into a column flex container when set. Also: enum `padding`, `surface` / `backgroundColor`, optional hero `backgroundImage` / `overlay` / `anchorId`.

**`heading`** — semantic leaf: `content`, `level` (1–6 → `h1`…`h6`), `variant` (`display`\|`title`\|`section`) for visual size (independent of level).

**`text`** — body leaf: `content`, `variant` (`body`\|`lead`\|`caption`\|`label`). Stats = `stack` of two `text` nodes with box overrides as needed.

**`grid`** — `columns` is either a number (legacy responsive defaults) or `{ mobile, tablet?, desktop? }` (1–4). Prefer the object form.

Page **dynamic zone stays flat at the root**. Nesting is stored in a **`slots` JSON** field on layout primitives (see content-model / composition-tree contract). Visual drag-and-drop editor is **out of scope** — author via mock/seed/Strapi JSON.

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
- Do **not** add `app/[domain]/[[...slug]]/loading.tsx` — it unmounts templates and flashes chrome. Use `NavigationProgressBar` in tenant headers for in-app loading feedback.
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
