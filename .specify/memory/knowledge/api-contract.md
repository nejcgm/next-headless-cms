# API Contract

**Maintenance**: Update this Spec Kit knowledge doc in the same change set when related code changes. Sync map: `.specify/memory/project-context.md`.


# API Contract

The `StrapiAdapter` talks to Strapi 5 REST API. All queries filter by `tenant` and `lang`. **Never use `locale` as a filter key** — Strapi i18n reserves it and returns `"Invalid key locale"`.

---

## Endpoints

| Use | Endpoint | Adapter method |
|-----|----------|----------------|
| Fetch one page by slug | `GET /api/pages` | `getPage` |
| Fetch all pages (sitemap) | `GET /api/pages` (paginated) | `listSitemapEntries` |
| Fetch navigation | `GET /api/navigations` | `getNavigation` |
| Fetch product collection | `GET /api/products` | `getCollection` |
| Fetch one product by slug | `GET /api/products` (filtered) | `getEntry` |

---

## Page query

```
GET /api/pages
  ?filters[tenant][$eq]=vukans-bike
  &filters[lang][$eq]=sl
  &filters[slug][$eq]=/service
  &populate[seo]=true
  &populate[blocks][populate]=*
  &pagination[pageSize]=1
  &status=published
```

`populate[blocks][populate]=*` returns the full dynamic zone with all component fields. Components nested inside blocks (e.g. `hero.cta`, `bike-detail.labels`) are embedded automatically by Strapi — no additional populate needed.

---

## Navigation query

```
GET /api/navigations
  ?filters[tenant][$eq]=vukans-bike
  &filters[lang][$eq]=sl
  &populate[header][populate]=*
  &populate[footer][populate]=*
  &populate[footerCopy]=true
  &pagination[pageSize]=1
  &status=published
```

`populate[header][populate]=*` ensures `nav-item.children` (repeatable `shared.nav-item-child`) are populated.

---

## Product collection query (`getCollection`)

```
GET /api/products
  ?filters[tenant][$eq]=vukans-bike
  &filters[lang][$eq]=sl
  &pagination[limit]=6
  &status=published
```

Used by the `product-list` block's `dataContract` (`load-products.ts`).

## Product single-entry query (`getEntry`)

`getEntry(tenant, "products", slug, { locale })` resolves to:

```
GET /api/products
  ?filters[tenant][$eq]=vukans-bike
  &filters[lang][$eq]=sl
  &filters[slug][$eq]=merida
  &status=published
  &pagination[pageSize]=1
```

Always pass `locale` for localized collections. Used by `bike-detail` → `load-bike.ts`.

---

## Response shape — page

```jsonc
{
  "data": [{
    "id": 1,
    "documentId": "abc123",
    "tenant": "vukans-bike",
    "lang": "sl",
    "slug": "/service",
    "template": "default",
    "seo": { "title": "...", "description": "...", "noIndex": false },
    "blocks": [
      {
        "__component": "blocks.hero",
        "id": 10,
        "headline": "Servis koles",
        "backgroundImage": "/img/service-hero.jpg",
        "overlay": 0.4,
        "cta": { "__component": "shared.cta-link", "id": 11, "label": "Naroči servis", "href": "/contact" }
      },
      {
        "__component": "blocks.service-pricing",
        "id": 12,
        "heading": "Cenik",
        "packages": [
          {
            "__component": "blocks.service-package",
            "id": 13,
            "name": "Osnovni servis",
            "price": 39,
            "features": "Pregled in nastavitev\nMazanje verige\nKontrola tlaka"
          }
        ]
      }
    ]
  }]
}
```

---

## Response shape — navigation

```jsonc
{
  "data": [{
    "id": 1,
    "tenant": "vukans-bike",
    "lang": "sl",
    "header": [
      { "__component": "shared.nav-item", "id": 1, "label": "Domov", "href": "/", "isExternal": false, "children": [] },
      { "__component": "shared.nav-item", "id": 2, "label": "Servis", "href": "/service", "isExternal": false, "children": [] }
    ],
    "footer": [ ... ],
    "footerCopy": {
      "__component": "shared.footer-copy",
      "id": 10,
      "tagline": "Vaš partner za kolesa.",
      "linksHeading": "Strani",
      "contactHeading": "Kontakt",
      "contactPlaceholder": "Pišite nam",
      "copyrightReserved": "Vse pravice pridržane"
    }
  }]
}
```

---

## `strapi-document.ts` transform

| Input (Strapi) | Output (frontend) |
|----------------|-------------------|
| `__component: "blocks.hero"` → strips to `type: "hero"` | `BlockInstance.type` |
| Numeric/string `id` → `String(id)`; if missing → `` `${type}-${index}` `` (stable zone order) | `BlockInstance.id` |
| All other fields → `props` | `BlockInstance.props` |
| `__component` + `id` stripped recursively from nested components | Nested `props` match frontend interface |
| `header[]` (nav-item components) → `NavItem[]` via `toNavItem` | `NavigationData.header` |
| `footerCopy` (footer-copy component) → `FooterCopy` | `NavigationData.footerCopy` |

---

## Permissions (Strapi admin)

For each content type that the frontend reads, grant **Public role** `find` (list) permission in **Settings → Users & Permissions → Roles → Public**:
- `api::page.page` → find
- `api::navigation.navigation` → find
- `api::product.product` → find

---

## Frontend data layer (modules)

The `StrapiAdapter` is a thin orchestrator. Responsibilities are split so adding a collection/block touches one file:

| File | Responsibility |
|------|----------------|
| `strapi/types.ts` | `StrapiQuery`, list response/meta, fetch options (`StrapiFetchAllArgs`, etc.), `PatternCandidate`, `StrapiCollection` |
| `strapi/strapi-config.ts` | `strapiConfig` (base url/token), `STRAPI_COLLECTIONS`, `POPULATE` specs, `REVALIDATE` TTLs, `PAGINATION` bounds |
| `strapi/strapi-client.ts` | Native `fetch` + `qs` query serialization, `StrapiError`, `strapiFetch` / `strapiFetchAll({ … })` |
| `strapi/strapi-query.ts` | Query-object builders (`tenantScope`, `normalizeLogicalSlug`) — **never hand-build bracket strings** |
| `strapi/strapi-document.ts` | Raw response → domain types; pattern matching (`findPatternMatch`) |
| `src/core/data/types.ts` | `CmsAdapter` and related data-layer contracts |
| `src/core/data/adapters/types.ts` | Adapter helper options (`FindOneArgs`, `MatchPatternPageArgs`, `LogFailureArgs`, …) |
| `src/core/data/cache-tags.ts` | Single source of truth for cache tags; builders take options objects (`page`, `entry`, `pageGroup`, `collection`, …) shared with revalidation routes |

Queries are plain objects serialized with `qs.stringify(query, { encodeValuesOnly: true })`. The HTTP layer uses Next.js `fetch` (`next: { revalidate, tags }`), **not** axios — axios/`apiClient` is reserved for tenant integrations (e.g. resort LiteAPI).

Dynamic routes use a **two-step pattern lookup**: scan cheap candidates (`fields: ["slug","slugPattern"]`) → fully populate only the matched page.

---

## Caching / revalidation

Tags are built via `cacheTags` (`src/core/data/cache-tags.ts`). Each read attaches a **specific** (locale-scoped) tag and a broader **group** tag; webhooks revalidate the group tag to clear all locales.

| Query | `revalidate` | Specific tag | Group tag (revalidate target) |
|-------|-------------|--------------|-------------------------------|
| Single page | 60 s | `strapi:page:{tenant}:{slug}:{locale}` | `strapi:page:{tenant}:{slug}` + `strapi:pages:{tenant}` |
| Navigation | 300 s | `strapi:nav:{tenant}:{locale}` | `strapi:nav:{tenant}` |
| Collection | 60 s | — | `strapi:collection:{tenant}:{collection}` |
| Single entry | 60 s | `strapi:entry:{tenant}:{collection}:{locale}:{id}` | `strapi:collection:{tenant}:{collection}` |

**Draft preview:** when Next.js draft mode is enabled (`/api/preview`), all reads use `status=draft` and `cache: no-store` (no ISR cache).

**Fetch timeout:** 15 s per Strapi request (`FETCH_TIMEOUT_MS`).

**Page webhooks** revalidate `strapi:pages:{tenant}` (all pages) plus the changed slug group; optional `previousSlug` / `oldSlug` on the webhook payload clears the old slug too.
