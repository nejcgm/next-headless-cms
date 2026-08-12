# Block System

**Maintenance**: Update this Spec Kit knowledge doc in the same change set when related code changes. Sync map: `.specify/memory/project-context.md`.


# Block System Rules

**Maintenance**: Update `.specify/memory/knowledge/` (this file) when block registration, templates, data contracts, or chrome behavior changes (`.specify/memory/project-context.md` (sync map)).

## Creating a New Block

Every tenant block lives in `src/tenants/{tenant}/blocks/{block-name}/` with:
- `{block-name}.tsx` — Component (default export or named export)
- `types.ts` — Props interface (optional if props stay colocated)
- `schema.ts` — Zod prop schema (**required** for registered content blocks)

Register it in `src/tenants/{tenant}/blocks/index.ts` and wire `schema:` on the registration.

Shared blocks use the same folder shape under `src/shared/components/blocks/{block-name}/` (`{block-name}.tsx` + `schema.ts`) and register in `shared/components/blocks/index.ts`.

After registering or changing a block, update `.specify/memory/knowledge/block-system.md` and the tenant catalog (`specs/_catalogs/{id}.md`) (see `.specify/memory/project-context.md` (sync map)).

## Schema validation (required, dev-only)

Every registered content block MUST declare a `schema` (Zod) in its registration. Header/footer chrome are not content blocks and are out of scope.

The renderer validates the **merged props** (`block.props` + `dataContract` output + allowlisted search params) against the schema in **development only** and logs a `logger.warn` with the failing paths on mismatch. It never blocks rendering and is a **no-op in production** (zero cost). Use it to catch CMS/mock data drift early.

```typescript
hero: { component: Hero, schema: heroSchema },
```

Author schemas with plain `z.object({...})` — unknown keys (e.g. injected `blockId`, allowlisted request params, `dataContract` payloads) are stripped, so they won't cause false failures. Validate **authored CMS props** only; omit injected entities/collections (see `room-list` / `product-list`). Reference: `blocks/hero/schema.ts` (tenant) or `shared/components/blocks/cta-banner/schema.ts` (shared).

## Shared vs tenant block

| Put it in | When |
|-----------|------|
| `src/shared/components/blocks/` | Same UI on **any** tenant; no tenant branding logic; register in `shared/components/blocks/index.ts` |
| `src/tenants/{tenant}/blocks/` | Tenant-specific layout, copy patterns, or data wiring; register in tenant `blocks/index.ts` |

Examples today:

- **Shared**: `cta-banner`, `stats-bar`, `image-text`, `section-header`, `image-gallery`, `rich-text`
- **Tenant**: `room-list`, `bike-detail`, `service-pricing`, tenant `hero` variants

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
