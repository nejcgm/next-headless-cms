# Validation: 003-tenant-data-colocate

**Date**: 2026-08-10  
**Quickstart**: [quickstart.md](./quickstart.md)

| Phase | Result | Notes |
|-------|--------|-------|
| A Layout | PASS | `tenants/{vukans-bike,resort-example}/mock-data/` present; `src/core/mock-data.ts` and `tenant-mock-map.json` gone |
| B Tooling | PASS | Resort `@mock-data` → `src/tenants/resort-example/mock-data`; bike → stub / webpack `null`; `pnpm check:tenant` PASS |
| C Leakage | PASS | `build:bike` + `verify:build` PASS; `build:resort` + `verify:build` PASS |
| D Mock | PASS | `next start` resort: home `200` via MockAdapter (`tenants/resort-example/mock-data`) |
| E Strapi | PASS | prepare-tenant logs stub; clean `build:bike` + `next start` home `200` with CMS content (Host `bikes.localhost`) |
| F Seed | PASS | `MOCK_ROOT` → `…/src/tenants/vukans-bike/mock-data` (seed not re-run) |
| G Docs | PASS | No `core/mock-data.ts` / `tenant-mock-map` in Spec Kit living docs, catalogs, FE docs, or FE scripts |

Also: `pnpm type-check` PASS; `MockAdapter` still uses `@mock-data` only.
