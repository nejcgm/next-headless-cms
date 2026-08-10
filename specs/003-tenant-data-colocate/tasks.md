# Tasks: Colocate Tenant Mock Data

**Input**: Design documents from `/specs/003-tenant-data-colocate/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md  
**Tests**: Not requested as automated unit tests — validate via [quickstart.md](./quickstart.md) (mandatory leakage + mock/Strapi gates)

**Organization**: Setup → Foundational → US1 → US2 → US3 → Polish  

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Parallelizable (different files, no incomplete blockers)
- **[Story]**: [US1]…[US3] on user-story phase tasks only

## Path Conventions

- Frontend: `next-headless-cms-fe/`
- Backend seed: `headless-cms-backend/scripts/`
- Spec Kit: `.specify/memory/`, `specs/_catalogs/`
- Feature: `specs/003-tenant-data-colocate/`
- Canonical content path: `src/tenants/{tenantId}/mock-data/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm contract and prepare destination dirs  

- [X] T001 Confirm `.specify/feature.json` → `specs/003-tenant-data-colocate` and skim `contracts/tenant-data-paths.md`
- [X] T002 Create empty destination dirs `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/` and `next-headless-cms-fe/src/tenants/resort-example/mock-data/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Alias/resolution helpers know the new path before/while files move  

**⚠️ CRITICAL**: Tooling must resolve `tenants/{id}/mock-data` before deleting the old tree  

- [X] T003 Update `getMockDataTsconfigPaths` / `getMockDataWebpackAlias` in `next-headless-cms-fe/scripts/tenant-build-utils.cjs` to use `src/tenants/{tenantId}/mock-data` for mock tenants and keep `scripts/mock-data-stub` for Strapi tenants
- [X] T004 Remove short-folder map usage from `next-headless-cms-fe/scripts/tenant-build-utils.cjs` and `next-headless-cms-fe/scripts/tenant-registry.js` (`getMockDataFolder` → always `tenantId`; stop requiring `tenant-mock-map.json`)
- [X] T005 Update leak patterns in `next-headless-cms-fe/scripts/tenant-registry.js` `getLeakPatternsForTenant` — drop `mock-data.ts/…`; rely on `tenants/{otherId}` (covers `mock-data/`)
- [X] T006 Update log text in `next-headless-cms-fe/scripts/verify-build.js` if it still mentions `mock-data.ts/*`

**Checkpoint**: Utils point at new paths; old map no longer required  

---

## Phase 3: User Story 1 — Find content with the tenant (P1) 🎯 MVP

**Goal**: Each tenant’s JSON lives under `tenants/{tenantId}/mock-data/`; core mock-data tree gone  

**Independent Test**: Open `src/tenants/vukans-bike/mock-data` and `src/tenants/resort-example/mock-data`; `src/core/mock-data.ts` does not exist  

### Implementation

- [X] T007 [US1] Move `next-headless-cms-fe/src/core/mock-data.ts/vukans-bike/**` → `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/**` (preserve pages/collections/nav/sitemap)
- [X] T008 [P] [US1] Move `next-headless-cms-fe/src/core/mock-data.ts/resort/**` → `next-headless-cms-fe/src/tenants/resort-example/mock-data/**`
- [X] T009 [US1] Delete empty `next-headless-cms-fe/src/core/mock-data.ts/` tree
- [X] T010 [US1] Delete `next-headless-cms-fe/scripts/tenant-mock-map.json` (and any leftover readers/writers such as `setMockDataFolder` only used for the map)

**Checkpoint**: SC-001 / FR-001 / FR-002  

---

## Phase 4: User Story 2 — Tooling, isolation, adapters (P1)

**Goal**: Scaffold, checks, seed, **verify:build both tenants**, mock + Strapi still work  

**Independent Test**: Quickstart Phases B–E — check-tenant; build+verify bike & resort; resort mock boots; bike Strapi path uses stub  

### Implementation

- [X] T011 [US2] Update `next-headless-cms-fe/scripts/create-tenant.js` to write stubs under `src/tenants/{id}/mock-data/` and remove `--mock-folder` / map wiring from the happy path
- [X] T012 [US2] Update `next-headless-cms-fe/scripts/check-tenant-setup.js` required paths to `src/tenants/{id}/mock-data/{pages/home.json,navigation.json,sitemap.json}` (and drop map mismatch checks)
- [X] T013 [US2] Update `MOCK_ROOT` in `headless-cms-backend/scripts/seed-vukans-bike-cms.js` to `…/src/tenants/vukans-bike/mock-data`
- [X] T014 [US2] Run `pnpm check:tenant` (all tenants) from `next-headless-cms-fe/` and fix any path failures
- [X] T015 [US2] Run `pnpm build:bike` then `TENANT_ID=vukans-bike pnpm verify:build` in `next-headless-cms-fe/` — **must PASS** (no `tenants/resort-example` / old `mock-data.ts` leaks)
- [X] T016 [US2] Run `pnpm build:resort` then `TENANT_ID=resort-example pnpm verify:build` in `next-headless-cms-fe/` — **must PASS** (no `tenants/vukans-bike` / old `mock-data.ts` leaks)
- [X] T017 [US2] Smoke **mock adapter**: `pnpm dev:resort` — confirm `@mock-data` resolves to `tenants/resort-example/mock-data` and home/nav load without missing-module errors (per quickstart Phase D)
- [X] T018 [US2] Smoke **Strapi adapter**: `pnpm dev:bike` with Strapi up — confirm prepare-tenant uses stub for `@mock-data` and a known page loads from CMS (per quickstart Phase E)

**Checkpoint**: FR-003–006, FR-008, SC-003, SC-006; user gates satisfied  

---

## Phase 5: User Story 3 — Docs match reality (P2)

**Goal**: Spec Kit + FE docs only describe `tenants/{id}/mock-data/`  

**Independent Test**: Quickstart Phase G — no required living-doc hits on `core/mock-data.ts`  

### Implementation

- [X] T019 [P] [US3] Update `.specify/memory/knowledge/mock-data.md` paths and tenant reality table to `src/tenants/{id}/mock-data/`
- [X] T020 [P] [US3] Update `.specify/memory/knowledge/{architecture,new-tenant,deployment,typescript}.md` mock-data path references
- [X] T021 [P] [US3] Update `.specify/memory/project-context.md` sync-map row for mock/tenant data paths
- [X] T022 [P] [US3] Update `specs/_catalogs/vukans-bike.md` and `specs/_catalogs/resort-example.md` content paths
- [X] T023 [P] [US3] Update `next-headless-cms-fe/docs/{DEVELOPMENT,BUILD-VERIFICATION,STRAPI-MIGRATION}.md` (and root `README.md` only if it cites the old path)

**Checkpoint**: FR-007 / SC-005  

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Final greps and type-check  

- [X] T024 Run `pnpm type-check` in `next-headless-cms-fe/`
- [X] T025 [P] Grep living docs/scripts for `mock-data.ts` and `tenant-mock-map` — zero required hits outside historical `specs/001-*` / this feature’s research notes
- [X] T026 Record quickstart Phases A–G results in `specs/003-tenant-data-colocate/checklists/requirements.md` Notes (or a short `VALIDATE.md` under the feature dir)
- [X] T027 Confirm `MockAdapter` in `next-headless-cms-fe/src/core/data/adapters/mock.adapter.ts` still only imports `@mock-data` (no hard-coded tenant paths)

---

## Dependencies & Execution Order

```text
Phase 1 Setup
  → Phase 2 Foundational (alias + leak helpers)
    → Phase 3 US1 (move files, delete old tree)  🎯 MVP
      → Phase 4 US2 (scaffold/check/seed + verify:build ×2 + adapter smokes)
        → Phase 5 US3 (docs)
          → Phase 6 Polish
```

| Story | Depends on | Notes |
|-------|------------|-------|
| US1 | Foundational | Move after aliases ready (or move then immediately flip aliases — do not leave broken mid-state) |
| US2 | US1 | Isolation + adapters require files at new path |
| US3 | US1 (+ US2 preferred) | Docs match shipped layout |

### Parallel opportunities

- T007 / T008 file moves in parallel after T002  
- T019–T023 docs in parallel after US2  
- T015 / T016 sequential preferred (disk/CPU) but logically independent  

---

## Implementation Strategy

### MVP (US1)

T001–T010: utils + move + delete old tree — content is colocated.

### Must-complete before “done”

T015–T018: **both** `verify:build` passes; mock resort smoke; Strapi bike smoke.

### Suggested order

Foundational aliases → move files → tooling/seed → **leakage builds** → adapter smokes → docs → polish.

---

## Notes

- Do not redesign JSON shape or fixture legacy blocks.  
- Strapi bike: keep stub for `@mock-data`; `mock-data/` is seed/reference.  
- Constitution VII: minimal comments on script edits.  
- Halt implement if T015 or T016 fails — fix leaks before docs.
