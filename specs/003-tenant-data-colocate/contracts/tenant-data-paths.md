# Contract: Tenant Data Paths

**Feature**: `003-tenant-data-colocate`  
**Audience**: FE tooling, seed scripts, agents  
**Package**: `next-headless-cms-fe` (+ backend seed)

## Canonical on-disk path

```text
next-headless-cms-fe/src/tenants/{tenantId}/mock-data/
```

Examples:

- `src/tenants/vukans-bike/mock-data/`
- `src/tenants/resort-example/mock-data/`

## Removed

```text
next-headless-cms-fe/src/core/mock-data.ts/**
scripts/tenant-mock-map.json   # short-folder mapping (e.g. resort-example → resort)
```

## Build aliases

| Tenant mode | `@mock-data` |
|-------------|--------------|
| mock | `./src/tenants/{tenantId}/mock-data` |
| strapi | `./scripts/mock-data-stub` |

Implemented in `scripts/tenant-build-utils.cjs` (`getMockDataTsconfigPaths`, `getMockDataWebpackAlias`).

`MockAdapter` continues to import only `@mock-data/...` — no hard-coded tenant paths in adapter source.

## Tooling expectations

| Tool | Expectation |
|------|-------------|
| `create:tenant` | Creates `src/tenants/{id}/mock-data/` stubs (pages/home, navigation, sitemap) when mock (and seed stubs policy as today) |
| `check-tenant-setup` | Requires files under `src/tenants/{id}/mock-data/` when applicable |
| `seed-vukans-bike-cms.js` | `MOCK_ROOT` = `…/src/tenants/vukans-bike/mock-data` |
| `verify:build` | Fails if other tenants’ `tenants/{otherId}` path markers appear in build JS |

## Isolation contract (mandatory)

After implement:

1. `pnpm build:bike && TENANT_ID=vukans-bike pnpm verify:build` → PASS  
2. `pnpm build:resort && TENANT_ID=resort-example pnpm verify:build` → PASS  

Bike build must not contain `tenants/resort-example` (or old `mock-data.ts/resort`).  
Resort build must not contain `tenants/vukans-bike` (or old `mock-data.ts/vukans-bike`).

## Adapter contract (mandatory)

| Adapter | Tenant | Post-move expectation |
|---------|--------|------------------------|
| Mock | `resort-example` | `@mock-data` resolves to that tenant’s `mock-data/`; navigation/page JSON loads without missing-module errors |
| Strapi | `vukans-bike` | `@mock-data` remains stub; pages load from Strapi when CMS is up; colocated `mock-data/` is seed/reference only |

Do not change `CmsAdapter` method shapes for this feature.
