# Tasks: FE Options Types Coverage

**Input**: Design documents from `/specs/005-fe-options-types-coverage/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not requested in spec — no TDD task phase; validation via `pnpm type-check`, `pnpm check:types-style`, and quickstart.md

**Organization**: Tasks grouped by user story (US1 dual convention, US2 content-loading leftovers, US3 compliance gate)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `next-headless-cms-fe/src/{app,core,tenants,shared}/`
- Scripts: `next-headless-cms-fe/scripts/`
- Spec Kit: `.specify/memory/knowledge/`
- CI: `.github/workflows/`

---

## Phase 1: Setup

**Purpose**: Confirm feature scope and baseline inventory before migrations

- [X] T001 Confirm active feature dir via `.specify/feature.json` → `specs/005-fe-options-types-coverage` and skim `contracts/typing-conventions.md` + `contracts/types-style-check.md`
- [X] T002 [P] Produce a baseline inventory note (commit message or short comment in PR) listing known `positional-arity` leftovers: `next-headless-cms-fe/src/core/data/adapters/strapi.adapter.ts` (`findOne`, `matchPatternPage`, `logFailure`), `next-headless-cms-fe/src/core/data/strapi/strapi-client.ts` (`strapiFetchAll`), `next-headless-cms-fe/src/core/data/cache-tags.ts` (`page`, `entry`), `next-headless-cms-fe/src/core/blocks/renderer.tsx` (`validateBlockProps`), `next-headless-cms-fe/src/shared/utils/format.ts` (`formatCurrency`), `next-headless-cms-fe/src/shared/lib/logger.ts` (`log`)
- [X] T003 [P] Produce a baseline inventory of colocated component props: `next-headless-cms-fe/src/app/[domain]/[[...slug]]/page.tsx` (`PageProps`), `next-headless-cms-fe/src/app/[domain]/layout.tsx` (`LayoutProps`), `next-headless-cms-fe/src/app/[domain]/tenant-analytics.tsx` (`TenantAnalyticsProps`), plus any other `interface *Props` under `src/app` / `src/shared` / `src/core` / `src/tenants` found by scan

---

## Phase 2: Foundational (Blocking)

**Purpose**: Compliance script + package script so stories can fail-closed and go green

**⚠️ CRITICAL**: No user story migration should be considered done until the checker exists (may start red)

- [X] T004 Implement types-style scanner in `next-headless-cms-fe/scripts/check-types-style.mjs` per `specs/005-fe-options-types-coverage/contracts/types-style-check.md` (scan `src/**/*.{ts,tsx}`; report `positional-arity` and `colocated-props`; exit 1 on findings; allowlist only `getPageCachedImpl` or equivalent React `cache` primitive impl names)
- [X] T005 Add `"check:types-style": "node scripts/check-types-style.mjs"` to `next-headless-cms-fe/package.json` scripts
- [X] T006 Run `pnpm check:types-style` once from `next-headless-cms-fe/` to capture the failing baseline (script works; findings match inventory)

**Checkpoint**: Checker runnable; expected to fail until US1–US2 migrations complete

---

## Phase 3: User Story 1 — Consistent contributor experience (P1) 🎯 MVP

**Goal**: Dual house style visible across FE — components always use module `types.ts` props; remaining non-data-path 3+ functions use options objects; Spec Kit states the rule

**Independent Test**: Spot-check ProductList + `loadPageWithNavigation` patterns remain; app route props live in `types.ts`; `formatCurrency` / logger / `validateBlockProps` use options objects; `typescript.md` documents dual rule; `pnpm type-check` passes

### Implementation for User Story 1

- [X] T007 [P] [US1] Move `PageProps` into `next-headless-cms-fe/src/app/[domain]/[[...slug]]/types.ts` and import it from `next-headless-cms-fe/src/app/[domain]/[[...slug]]/page.tsx`
- [X] T008 [P] [US1] Add props types for `error.tsx` / `not-found.tsx` as needed under `next-headless-cms-fe/src/app/[domain]/[[...slug]]/types.ts` (or sibling `types.ts`) and wire `next-headless-cms-fe/src/app/[domain]/[[...slug]]/error.tsx` + `not-found.tsx`
- [X] T009 [P] [US1] Move `LayoutProps` into `next-headless-cms-fe/src/app/[domain]/types.ts` and import from `next-headless-cms-fe/src/app/[domain]/layout.tsx`
- [X] T010 [P] [US1] Move `TenantAnalyticsProps` into `next-headless-cms-fe/src/app/[domain]/types.ts` (or dedicated file in that folder) and import from `next-headless-cms-fe/src/app/[domain]/tenant-analytics.tsx`
- [X] T011 [P] [US1] Extract root/app layout or `not-found` props into `next-headless-cms-fe/src/app/types.ts` if those components declare props; update `next-headless-cms-fe/src/app/layout.tsx` / `next-headless-cms-fe/src/app/not-found.tsx`
- [X] T012 [P] [US1] Add `FormatCurrencyArgs` to `next-headless-cms-fe/src/shared/utils/types.ts` and refactor `formatCurrency` in `next-headless-cms-fe/src/shared/utils/format.ts` + all call sites under `src/`
- [X] T013 [P] [US1] Add logger options types to `next-headless-cms-fe/src/shared/lib/types.ts` (new if needed) and refactor `Logger.log` / public methods in `next-headless-cms-fe/src/shared/lib/logger.ts` + call sites if signatures change
- [X] T014 [P] [US1] Add `ValidateBlockPropsArgs` to `next-headless-cms-fe/src/core/blocks/types.ts` and refactor `validateBlockProps` in `next-headless-cms-fe/src/core/blocks/renderer.tsx`
- [X] T015 [US1] Sweep remaining colocated `*Props` / component prop interfaces under `next-headless-cms-fe/src/shared/**` and `next-headless-cms-fe/src/core/**` into each module’s `types.ts` (import-only; no re-exports)
- [X] T016 [US1] Sweep remaining colocated component props under `next-headless-cms-fe/src/tenants/vukans-bike/**` and `next-headless-cms-fe/src/tenants/resort-example/**` into each block/template folder `types.ts`
- [X] T017 [US1] Update `.specify/memory/knowledge/typescript.md` for whole-FE scope, components-always / functions-at-3+, exception list (cache primitives + platform only), no impl re-exports, and `pnpm check:types-style`
- [X] T018 [US1] Run `pnpm type-check` in `next-headless-cms-fe/` and fix any breakage from US1 refactors

**Checkpoint**: US1 independently verifiable via spot-checks + type-check (compliance may still fail on US2 leftovers)

---

## Phase 4: User Story 2 — Content-loading leftovers (P1)

**Goal**: CMS/data path helpers with 3+ args use options objects from module types (motivating `findOne` case)

**Independent Test**: `strapi.adapter.ts` `findOne` / `matchPatternPage` / related helpers take one options object; `strapiFetchAll` and `cacheTags.page` / `entry` use options; adapters + webhooks compile; `pnpm type-check` passes

### Implementation for User Story 2

- [X] T019 [P] [US2] Add `FindOneArgs`, `MatchPatternPageArgs`, `LogFailureArgs` (names per style) to `next-headless-cms-fe/src/core/data/adapters/types.ts`
- [X] T020 [US2] Refactor `findOne`, `matchPatternPage`, and `logFailure` in `next-headless-cms-fe/src/core/data/adapters/strapi.adapter.ts` to options objects; update all internal call sites in that file
- [X] T021 [P] [US2] Add `StrapiFetchAllArgs` (or extend existing fetch types) in `next-headless-cms-fe/src/core/data/strapi/types.ts` and refactor `strapiFetchAll` in `next-headless-cms-fe/src/core/data/strapi/strapi-client.ts` + callers in `strapi.adapter.ts`
- [X] T022 [P] [US2] Refactor `cacheTags.page` and `cacheTags.entry` (and any other 3+ builders) in `next-headless-cms-fe/src/core/data/cache-tags.ts` to options objects; add arg types beside them or in `next-headless-cms-fe/src/core/data/types.ts`
- [X] T023 [US2] Update all `cacheTags` call sites in `next-headless-cms-fe/src/core/data/adapters/strapi.adapter.ts`, `next-headless-cms-fe/src/app/api/webhooks/strapi/route.ts`, and `next-headless-cms-fe/src/app/api/revalidate/route.ts` (and any other matches under `src/`)
- [X] T024 [US2] Sync `.specify/memory/knowledge/api-contract.md` frontend data-layer table if helper/options signatures are documented there
- [X] T025 [US2] Run `pnpm type-check` in `next-headless-cms-fe/` and fix US2 breakage

**Checkpoint**: Data-path leftovers gone; US1+US2 type-check green

---

## Phase 5: User Story 3 — Regression guard (P2)

**Goal**: Compliance check green and wired into CI

**Independent Test**: `pnpm check:types-style` exits 0; deliberate dummy 3-arg function fails the check; CI job runs the script

### Implementation for User Story 3

- [X] T026 [US3] Extend allowlist / skip logic in `next-headless-cms-fe/scripts/check-types-style.mjs` only for documented exceptions (`getPageCachedImpl` / React cache primitives); remove any temporary broad skips
- [X] T027 [US3] Drive `pnpm check:types-style` to exit 0 by fixing any remaining findings under `next-headless-cms-fe/src/`
- [X] T028 [US3] Wire `pnpm check:types-style` into `.github/workflows/ci.yml` frontend `type-check` job (after or with `pnpm type-check`)
- [X] T029 [P] [US3] Optionally add the same script step to `.github/workflows/deploy-bike.yml` and `.github/workflows/deploy-resort.yml` type-check steps if those jobs should enforce parity
- [X] T030 [US3] Document the command in `next-headless-cms-fe/README.md` (short pointer) consistent with Spec Kit `typescript.md`

**Checkpoint**: SC-001 / SC-001b / SC-003 satisfied locally and in CI config

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Final validation per quickstart

- [X] T031 Run full `specs/005-fe-options-types-coverage/quickstart.md` validation (`type-check`, `check:types-style`, spot-checks, Spec Kit review)
- [X] T032 [P] Run `pnpm lint:bike` and/or `pnpm lint:resort` in `next-headless-cms-fe/` and fix any lint issues from the refactor
- [X] T033 Confirm no `export type { … } from "./types"` re-exports remain in implementation files under `next-headless-cms-fe/src/core` (except `core/types/page.ts` domain barrel if still intentional)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Start immediately
- **Foundational (Phase 2)**: After Setup — **blocks “done” for all stories** (checker must exist)
- **US1 (Phase 3)**: After Foundational; can proceed while checker is red
- **US2 (Phase 4)**: After Foundational; parallelizable with US1 if staffing allows (different primary files); merge carefully on `strapi.adapter.ts` if overlapping
- **US3 (Phase 5)**: After US1 + US2 migrations (needs green inventory)
- **Polish (Phase 6)**: After US3

### User Story Dependencies

- **US1**: No dependency on US2; MVP for contributor-facing convention + docs
- **US2**: Independent content-loading focus; complements US1
- **US3**: Depends on US1+US2 code being compliant so CI can go green

### Parallel Opportunities

- T002/T003; T007–T014; T019/T021/T022; T029/T032

### Parallel Example: User Story 1

```bash
# In parallel after T006:
# - Route types: T007–T011
# - Shared/core helpers: T012–T014
# Then sequential sweeps: T015 → T016 → T017 → T018
```

### Parallel Example: User Story 2

```bash
# After types added (T019):
# - T021 strapiFetchAll and T022 cacheTags in parallel
# - T020 adapter methods sequential with call-site updates T023
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + 2 (inventory + checker)
2. Phase 3 US1 (route/shared/core component+helper convention + Spec Kit)
3. **STOP**: Validate type-check + spot-checks (checker may still fail on US2)

### Incremental Delivery

1. Setup + Foundational → checker exists  
2. US1 → contributor convention + docs  
3. US2 → data-path leftovers  
4. US3 → CI green  
5. Polish → quickstart complete  

### Parallel Team Strategy

- Dev A: US1 app/shared sweeps  
- Dev B: US2 adapter/cache-tags  
- Dev C: checker hardening (T004–T006 early, T026–T028 after migrations)

---

## Notes

- [P] = different files, no incomplete dependencies
- Do not re-export types from implementation files
- Keep React `getPageCachedImpl` positional; public APIs stay options objects
- No product behavior changes — call-shape / type placement only
- Suggested MVP: **US1** (T007–T018) after foundational checker
