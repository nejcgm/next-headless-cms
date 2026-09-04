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
      "__component": "blocks.section",
      "id": 1,
      "padding": "lg",
      "slots": {
        "default": [
          { "__component": "blocks.text", "id": 2, "content": "...", "fontSize": "56px", "bold": true, "color": "foreground" },
          { "__component": "blocks.text", "id": 3, "content": "...", "variant": "lead" },
          { "__component": "blocks.button", "id": 4, "label": "...", "href": "/contact" }
        ]
      }
    }
  ]
}
```

Rules for this shape:

- `lang` preferred (not `locale`) — Strapi i18n reserves `locale` as a query key. `toPageData` still accepts `locale` as a fallback when reading page language.
- Blocks use `__component` + numeric `id` (Strapi dynamic zone) — fields are **flat** on the block object (no `props` wrapper).
- Nested components also carry `__component` + `id`.
- **Composition trees**: layout roots may include a `slots` object; each slot value is an array of nested `__component` nodes (same convention). Example:

```json
{
  "__component": "blocks.stack",
  "id": 10,
  "gap": "md",
  "slots": {
    "default": [
      { "__component": "blocks.text", "id": 11, "variant": "body", "content": "Hello" }
    ]
  }
}
```

- `toPageData(raw, locale, tenantId)` validates and maps DZ (+ nested `slots`) to `BlockInstance[]` with optional `slots`. Items **without** `__component` or failing composition validation are dropped.
- Bike pages (sl/en/de) are authored as **L1/L2 + Keep L3** only — no deleted shared opaques or bike proprietary marketing blocks.

## Current tenant reality

| Tenant | Path | Purpose / shape |
|--------|------|-----------------|
| `vukans-bike` | `src/tenants/vukans-bike/mock-data/` | **Product** seed/reference — canonical (`__component` + `lang`). Config currently `dataAdapter: "mock"` for redesign verification; production intent remains Strapi. |
| `resort-example` | `src/tenants/resort-example/mock-data/` | **Playground / isolation fixture.** Canonical `__component` + `lang`. Shared opaques (`cta-banner`, `stats-bar`, `section-header`) dropped from mocks; resort proprietary blocks remain. Bike is SoT for shared L1 types. |

**New product tenants** (mock or Strapi seed JSON): always use the canonical shape above. Scaffold stubs from `create:tenant` write under `src/tenants/{id}/mock-data/`.

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

- Home: `home.json` (slug `/`) — L1 composition trees with box-style props; `en--home.json` / `de--home.json` mirror layout
- Static: `{segment}.json` or nested `rooms--all.json` for `/rooms/all`
- Localized override: `{locale}--{path}.json` (e.g. `de--about.json`) — tried before fallback `about.json`
- Pattern pages: descriptive name (e.g. `bikes--merida.json`, `room-detail.json`)

## Block `__component`

Must be `"blocks.{type}"` matching a Strapi component and a key in `registerTenantBlocks()` or `registerSharedBlocks()`.

## Collections

- Collection files live at `src/tenants/{tenantId}/mock-data/collections/{name}.json`. They are loaded by `MockAdapter.getCollection` via Node `fs` (not webpack `@mock-data` dynamic imports — those break under Next RSC).

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

`@mock-data` resolves to `src/tenants/{tenantId}/mock-data` for mock-adapter tenants, or `scripts/mock-data-stub` for Strapi tenants (seed JSON may still live under `mock-data/` on disk).
