# Research: Colocate Tenant Mock Data

**Feature**: `003-tenant-data-colocate`  
**Date**: 2026-08-10

## R1 — Subfolder name under tenant id

**Decision**: Use `src/tenants/{tenantId}/mock-data/` (not `mock/`, not keep `mock-data.ts`).

**Rationale**: Short, accurate for both mock-runtime and Strapi-seed/reference JSON; matches Spec Kit assumption; avoids the old “.ts folder” confusion.

**Alternatives considered**:

| Option | Why rejected |
|--------|----------------|
| `tenants/{id}/mock/` | Undersells seed/reference role for Strapi tenants |
| `src/data/{id}/` sibling of tenants | User chose colocation under tenant id |
| Keep files at tenant root | Pollutes package with many JSON dirs |

## R2 — Drop `tenant-mock-map.json`

**Decision**: Always resolve content dir as `tenants/{tenantId}/mock-data`. Move `resort` → `tenants/resort-example/mock-data`. Delete map file (or leave unused and remove all readers).

**Rationale**: Spec edge case — short folder names eliminated; one id everywhere.

**Alternatives considered**: Keep map for rare renames — YAGNI until a second short-name need appears.

## R3 — `@mock-data` alias behavior (critical for Strapi + isolation)

**Decision**:

- **Mock tenants** (`dataAdapter: "mock"`): `@mock-data` → `src/tenants/{id}/mock-data` (tsconfig + webpack).
- **Strapi tenants** (`dataAdapter: "strapi"`): `@mock-data` → existing `scripts/mock-data-stub` (unchanged). Seed/reference JSON may sit on disk under `tenants/{id}/mock-data` but must **not** be webpack-resolved as `@mock-data` for that build.

**Rationale**: Preserves today’s “Strapi build doesn’t bundle mock JSON” behavior (FR-008) while still colocating seed files. Isolation: other tenants’ `tenants/{other}/…` must not appear in JS output (`verify:build`).

**Alternatives considered**: Always alias to `tenants/{id}/mock-data` even for Strapi — risk of accidentally bundling seed JSON if something imports `@mock-data`; keep stub.

## R4 — Leakage pattern updates

**Decision**: Primary leak patterns remain `tenants/{otherId}` / `src/tenants/{otherId}` (covers `mock-data/` automatically). Remove obsolete `mock-data.ts/{folder}` patterns. After move, run **both**:

```bash
pnpm build:bike && TENANT_ID=vukans-bike pnpm verify:build
pnpm build:resort && TENANT_ID=resort-example pnpm verify:build
```

**Rationale**: User gate — no cross-tenant leakage in build files. Colocating data under `tenants/` makes the existing tenant-path scan sufficient and stronger (content leaks show up as `tenants/other/...`).

## R5 — Adapter validation (mock + Strapi)

**Decision**: Explicit post-move validation in quickstart:

1. **Mock**: `prepare-tenant` + `dev:resort` (or build) — `@mock-data` resolves; `MockAdapter` can load `navigation` / a page file without module-not-found (fixture may still have empty blocks due to legacy JSON shape — out of scope).
2. **Strapi**: `prepare-tenant` for bike shows stub; with Strapi up, `dev:bike` loads a known page from CMS (not from colocated JSON at runtime).

**Rationale**: User requirement — mock adapter and Strapi path both still work after the move.

## R6 — Seed script

**Decision**: `MOCK_ROOT` → `…/next-headless-cms-fe/src/tenants/vukans-bike/mock-data`.

**Rationale**: FR-006 / SC-006.

## R7 — Docs / sync map

**Decision**: Update all living references from `src/core/mock-data.ts/…` to `src/tenants/{id}/mock-data/…` in Spec Kit + FE docs; project-context sync row for mock data paths.

**Rationale**: FR-007 / constitution IV.
