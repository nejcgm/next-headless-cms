# Quickstart: Validate Tenant Data Colocation

**Feature**: `003-tenant-data-colocate`  
**Purpose**: Prove files moved, tooling updated, **no cross-tenant build leakage**, and **both mock and Strapi adapters still work**.

## Prerequisites

- Repo root: `headless-cms/`
- FE deps: `cd next-headless-cms-fe && pnpm install`
- For Strapi smoke: backend running (`cd headless-cms-backend && npm run develop`) + env as today

## Phase A — Layout

```bash
test -d next-headless-cms-fe/src/tenants/vukans-bike/mock-data
test -d next-headless-cms-fe/src/tenants/resort-example/mock-data
test ! -e next-headless-cms-fe/src/core/mock-data.ts
test ! -f next-headless-cms-fe/scripts/tenant-mock-map.json || ! rg -q . next-headless-cms-fe/scripts/tenant-mock-map.json
```

**Expected**: New trees exist; old core mock-data tree gone; short-folder map gone or unused.

## Phase B — Tooling paths

```bash
cd next-headless-cms-fe
TENANT_ID=resort-example node -e "const u=require('./scripts/tenant-build-utils.cjs'); console.log(u.getMockDataTsconfigPaths('resort-example')); console.log(u.getMockDataWebpackAlias('resort-example'));"
TENANT_ID=vukans-bike node -e "const u=require('./scripts/tenant-build-utils.cjs'); console.log(u.getMockDataTsconfigPaths('vukans-bike')); console.log(u.getMockDataWebpackAlias('vukans-bike'));"
pnpm check:tenant --all   # or project’s equivalent for all tenants
```

**Expected**: Resort paths include `tenants/resort-example/mock-data`. Bike tsconfig `@mock-data` → stub; webpack alias `null`. Check-tenant passes.

## Phase C — Cross-tenant leakage (mandatory)

```bash
cd next-headless-cms-fe
pnpm build:bike
TENANT_ID=vukans-bike pnpm verify:build
pnpm build:resort
TENANT_ID=resort-example pnpm verify:build
```

**Expected**: Both verify commands **PASS**.  
Spot-check: bike `.next-vukans-bike` must not contain `tenants/resort-example` or `mock-data.ts/resort`; resort build must not contain `tenants/vukans-bike` or `mock-data.ts/vukans-bike`.

## Phase D — Mock adapter still works (mandatory)

```bash
cd next-headless-cms-fe
pnpm dev:resort
# Hit a known route (e.g. home) — must not 500 on missing @mock-data modules
# Optional: log/network shows MockAdapter loading navigation/pages from colocated data
```

**Expected**: App boots; mock JSON resolves from `tenants/resort-example/mock-data`. (Empty blocks from legacy JSON shape are out of scope — no module resolution failures.)

## Phase E — Strapi adapter still works (mandatory)

```bash
cd next-headless-cms-fe
pnpm prepare-tenant  # via dev:bike script
pnpm dev:bike
# With Strapi up: open home / a known page — content from CMS, not from data/ JSON at runtime
```

**Expected**: Bike uses Strapi; prepare-tenant logs stub for `@mock-data`. Colocated `mock-data/` unused at runtime.

## Phase F — Seed path (when token available)

```bash
cd headless-cms-backend
# Confirm MOCK_ROOT in seed-vukans-bike-cms.js points at tenants/vukans-bike/mock-data
rg -n "tenants/vukans-bike/mock-data" scripts/seed-vukans-bike-cms.js
# Optional: STRAPI_API_TOKEN=… npm run seed:vukans-bike
```

## Phase G — Docs

```bash
rg -n "core/mock-data\.ts" .specify/memory specs/_catalogs next-headless-cms-fe/docs README.md || true
```

**Expected**: No required living-doc hits (historical `specs/001-*` / `003` research may mention old path).

## Related

- [contracts/tenant-data-paths.md](./contracts/tenant-data-paths.md)
- [research.md](./research.md)
- [data-model.md](./data-model.md)
