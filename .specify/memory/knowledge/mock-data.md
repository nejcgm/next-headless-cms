# Mock Page Data

**Maintenance**: Update this Spec Kit knowledge doc in the same change set when related code changes. Sync map: `.specify/memory/project-context.md`.

Mock page JSON is loaded by `MockAdapter`, then passed through `strapi-document.ts` (`toPageData` / `toNavigationData`) — the same transform path as `StrapiAdapter`.

## Canonical page JSON shape (Strapi dynamic zone)

**Required for pages that must render blocks.** Used by `vukans-bike` mock/seed JSON.

```json
{
  "slug": "/about",
  "lang": "en",
  "template": "default",
  "seo": {
    "title": "Page Title",
    "description": "Meta description",
    "ogImage": "https://..."
  },
  "blocks": [
    {
      "__component": "blocks.hero",
      "id": 1,
      "headline": "...",
      "cta": { "__component": "shared.cta-link", "id": 2, "label": "...", "href": "..." }
    }
  ]
}
```

Rules for this shape:

- `lang` preferred (not `locale`) — Strapi i18n reserves `locale` as a query key. `toPageData` still accepts `locale` as a fallback when reading page language.
- Blocks use `__component` + numeric `id` (Strapi dynamic zone) — fields are **flat** on the block object (no `props` wrapper).
- Nested components also carry `__component` + `id`.
- `toDynamicZoneBlock` strips `__component`/`id` and produces `BlockInstance { id, type, props }` for the renderer. Items **without** `__component` are dropped (empty contribution to `blocks[]`).

## Current tenant reality

| Tenant folder | Path | Page block shape today |
|---------------|------|------------------------|
| `vukans-bike` | `src/core/mock-data.ts/vukans-bike/` | Canonical (`__component` + `lang`) — works with `toPageData` |
| `resort` (`resort-example`) | `src/core/mock-data.ts/resort/` | **Legacy**: `{ id, type, props }` blocks + top-level `locale`. `toPageData` drops those blocks, so MockAdapter returns pages with **empty `blocks[]`** until migrated to the canonical shape |

Do not add new pages in the legacy `{ type, props }` format. Migrate `resort` pages to the canonical shape when touching them.

## Block IDs

Numeric integers, unique within the page. Prefer sequential numbering (1, 2, 3, …).

## Templates

| Value | Meaning |
|-------|---------|
| `default` | Header + footer (standard pages) |
| `detail` | Header + footer + two-column main (resort) |
| `bare` | No header/footer |

Must match a file in `src/tenants/{tenant}/templates/{name}.tsx`.

## Dynamic route pages

For slugs with params (e.g. `/rooms/:roomId`), set `slugPattern` and use `:` segments:

```json
{
  "slug": "/rooms/:roomId",
  "slugPattern": "/rooms/:roomId",
  "template": "default",
  "blocks": []
}
```

`MockAdapter` scans all `pages/*.json` and matches `slugPattern` (or `slug` if it contains `:`) via regex — no separate `patternFiles` list.

## File naming

- Home: `home.json` (slug `/`)
- Static: `{segment}.json` or nested `rooms--all.json` for `/rooms/all`
- Localized override: `{locale}--{path}.json` (e.g. `de--about.json`) — tried before fallback `about.json`
- Pattern pages: descriptive name (e.g. `room-detail.json`)

## Block `__component`

Must be `"blocks.{type}"` matching a Strapi component and a key in `registerTenantBlocks()` or `registerSharedBlocks()`.

## Collections

Collection files live at `src/core/mock-data.ts/{folder}/collections/{name}.json`. They are loaded by `MockAdapter.getCollection`.

`getEntry` matches `item.slug === id || item.id === id`. Prefer a `slug` for entries looked up by URL segment (e.g. products). List-only collections (e.g. resort `reviews.json`) may use `id` only — that is fine when consumers only call `getCollection`.

Example (`collections/products.json`):

```json
[
  { "slug": "merida", "name": "Merida Road Ride", "price": 350 }
]
```

Locale-specific overrides: `{locale}--{name}.json` (e.g. `en--products.json`).

## After editing mock pages

Update this knowledge doc and the tenant catalog (`specs/_catalogs/{id}.md`) when behavior changes (see `.specify/memory/project-context.md`).

Mock folder vs tenant id: see `scripts/tenant-mock-map.json` (e.g. `resort-example` → `src/core/mock-data.ts/resort/`).
