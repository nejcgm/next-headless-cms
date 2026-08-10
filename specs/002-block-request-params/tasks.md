# Tasks: Clean Block Request Params

**Input**: Design documents from `/specs/002-block-request-params/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md  
**Tests**: Not requested in spec — validate via quickstart.md + `pnpm type-check`

**Organization**: Setup → Foundational → US1 → US2 → US3 → Polish  

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Parallelizable (different files, no incomplete blockers)
- **[Story]**: [US1]…[US3] on user-story phase tasks only

## Path Conventions

- Frontend: `next-headless-cms-fe/src/{app,core,tenants,shared}/`
- Spec Kit: `.specify/memory/knowledge/`, `specs/_catalogs/`
- Feature: `specs/002-block-request-params/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm touch points and add a small shared normalizer if useful  

- [X] T001 Confirm feature active via `.specify/feature.json` → `specs/002-block-request-params` and skim `contracts/block-request-context.md`
- [X] T002 [P] Add `normalizeSearchParams` helper (first string if array; drop empties) in `next-headless-cms-fe/src/core/blocks/search-params.ts` (or colocated under `core/blocks/`) per research R2

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Block engine can accept request input without polluting CMS props  

**⚠️ CRITICAL**: Complete before US1 page change and US2 consumer migration  

- [X] T003 Extend `DataContractFn` `ctx` with `searchParams: Record<string, string | undefined>` and add optional `acceptSearchParams?: string[]` on `BlockDefinition` in `next-headless-cms-fe/src/core/blocks/types.ts`
- [X] T004 Update `BlockRenderer` in `next-headless-cms-fe/src/core/blocks/renderer.tsx` to accept `searchParams`, apply allowlist merge only when `acceptSearchParams` is set, and pass `searchParams` into `dataContract` ctx (never merge full query by default)
- [X] T005 Fix any TypeScript call sites that construct `dataContract` ctx or call `BlockRenderer` without `searchParams` (empty object OK) under `next-headless-cms-fe/src/`

**Checkpoint**: Renderer supports explicit request channel; page still has old merge until US1  

---

## Phase 3: User Story 1 — CMS content props stay authoritative (P1) 🎯 MVP

**Goal**: URL query cannot override CMS content on content-only blocks  

**Independent Test**: `?headline=hacked` (or colliding field) does not change hero/CMS headline on product page (quickstart Phase B)  

### Implementation

- [X] T006 [US1] Remove `blocksWithQuery` / global `...query` into every block props in `next-headless-cms-fe/src/app/[domain]/[[...slug]]/page.tsx`
- [X] T007 [US1] Pass normalized `searchParams` from the page into `<BlockRenderer searchParams={…} />` in `next-headless-cms-fe/src/app/[domain]/[[...slug]]/page.tsx` (use T002 helper)
- [X] T008 [US1] Verify with `rg` that `page.tsx` no longer spreads full query into block props (quickstart Phase A)

**Checkpoint**: SC-001 / FR-001 / FR-002 satisfied for content-only blocks  

---

## Phase 4: User Story 2 — Request-driven blocks still work (P1)

**Goal**: Blocks that need query input use `ctx.searchParams` and/or `acceptSearchParams`  

**Independent Test**: Fixture `room-detail` reads dates from context; no reliance on global props merge; type-check passes  

### Implementation

- [X] T009 [US2] Audit `next-headless-cms-fe/src/tenants/vukans-bike/` for props that only existed via global query merge; document none or migrate any hits
- [X] T010 [US2] Change `fetchRoomDetailData` in `next-headless-cms-fe/src/tenants/resort-example/services/roomDetail.service.ts` to take/use `searchParams` (or full ctx) for `checkin` / `checkout` instead of CMS `props`
- [X] T011 [US2] Update `dataContract` wiring in `next-headless-cms-fe/src/tenants/resort-example/blocks/index.ts` so `room-detail` passes `ctx.searchParams` into `fetchRoomDetailData`
- [X] T012 [P] [US2] Grep `next-headless-cms-fe/src` for comments/usages assuming “searchParams merged into props by page” and fix remaining consumers
- [X] T013 [US2] Optionally set `acceptSearchParams` on any block that must receive selected keys on component props (prefer `ctx.searchParams` when a dataContract exists)

**Checkpoint**: FR-003 / FR-004 / FR-005 / SC-002  

---

## Phase 5: User Story 3 — Contributors know the rule (P2)

**Goal**: Spec Kit (+ light human docs) describe the three channels  

**Independent Test**: Quickstart Phase D — old merge wording gone; `ctx.searchParams` / `acceptSearchParams` / client URL documented  

### Implementation

- [X] T014 [P] [US3] Update `.specify/memory/knowledge/block-system.md` — remove “URL search params are merged into props by the page renderer”; document `ctx.searchParams`, `acceptSearchParams`, and client `useSearchParams`
- [X] T015 [P] [US3] Align `next-headless-cms-fe/docs/DEVELOPMENT.md` if it implies the old merge (or confirm N/A)
- [X] T016 [P] [US3] Update `specs/_catalogs/resort-example.md` only if it still claims props-from-query for room-detail dates

**Checkpoint**: FR-006 / SC-004  

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Validation and handoff  

- [X] T017 Run `pnpm type-check` in `next-headless-cms-fe/` (both tenants as CI expects)
- [X] T018 [P] Run quickstart Phases A–D from `specs/002-block-request-params/quickstart.md` and note results in `specs/002-block-request-params/checklists/requirements.md` Notes (or short CUTOVER/validate note under the feature dir)
- [X] T019 [P] Optional: `pnpm build:bike && TENANT_ID=vukans-bike pnpm verify:build` (quickstart Phase E)
- [X] T020 Confirm FR-007 — no new page routes added under `next-headless-cms-fe/src/app/`

---

## Dependencies & Execution Order

### Phase dependencies

```text
Phase 1 Setup
  → Phase 2 Foundational (types + renderer)
    → Phase 3 US1 (page: remove merge)     🎯 MVP
    → Phase 4 US2 (consumers)              [needs foundational; ideally after US1]
    → Phase 5 US3 (docs)                   [after US1+US2 behavior settled]
      → Phase 6 Polish
```

### User story dependencies

| Story | Depends on | Notes |
|-------|------------|-------|
| US1 | Foundational | Must pass `searchParams` into renderer without global props merge |
| US2 | Foundational (+ US1 recommended) | Migrate loaders to `ctx.searchParams` |
| US3 | US1 + US2 | Docs match shipped behavior |

### Parallel opportunities

- T002 parallel with T001  
- T014–T016 docs in parallel after code done  
- T012 audit grep parallel with T010/T011 once signature known  

### Parallel example (US3)

```bash
# After US1+US2 code landed:
# T014 block-system.md, T015 DEVELOPMENT.md, T016 resort catalog (if needed)
```

---

## Implementation Strategy

### MVP (User Story 1)

T001–T008: types/renderer + remove global merge + pass `searchParams`. Content purity fixed even before fixture migration.

### Incremental delivery

1. US2 — migrate `room-detail` (+ audit bike)  
2. US3 — Spec Kit / docs  
3. Polish — type-check + quickstart  

### Suggested MVP scope

**T001–T008** (Setup + Foundational + US1). Then continue US2 immediately so request-driven fixture path does not silently break.

---

## Notes

- No automated unit/integration test tasks (not requested).  
- Do not reintroduce unconditional all-query → all-props merge.  
- Prefer `ctx.searchParams` over `acceptSearchParams` when a `dataContract` already exists.  
- `resort-example` is isolation fixture — migrate only what’s needed for the contract.
