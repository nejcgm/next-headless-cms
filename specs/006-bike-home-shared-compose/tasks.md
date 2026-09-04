# Tasks: Bike Home Shared Composition

**Input**: Design documents from `/specs/006-bike-home-shared-compose/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/composition-tree.md, quickstart.md

**Tests**: None requested in spec — no automated test tasks. Validate via quickstart.md.

**Organization**: Foundational tree engine → US2 vocabulary (primitives) → US1 home migration → US3 cleanup → polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `next-headless-cms-fe/src/{app,core,tenants,shared}/`
- Backend: `headless-cms-backend/src/{api,components}/`
- Spec Kit: `specs/006-bike-home-shared-compose/`, `.specify/memory/knowledge/`, `specs/_catalogs/`

---

## Phase 1: Setup

**Purpose**: Confirm feature context and docs readiness before code changes

- [x] T001 Verify feature branch `006-bike-home-shared-compose` and that `specs/006-bike-home-shared-compose/{plan,spec,research,data-model,quickstart}.md` plus `contracts/composition-tree.md` match the post-review decisions (adapter-primary validation, per-node maxDepth, registry SoT, editor UX out of scope)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tree runtime — `slots`, composition policy on registry, recursive validate-then-normalize adapter, recursive renderer. Legacy flat blocks must keep working.

**⚠️ CRITICAL**: No user-story content work until this phase completes

- [x] T002 Extend `BlockInstance` with optional `slots?: Record<string, BlockInstance[]>` in `next-headless-cms-fe/src/core/types/page.ts`
- [x] T003 Add `CompositionPolicy` type and optional `policy` on `BlockDefinition` in `next-headless-cms-fe/src/core/blocks/types.ts` (level, maxDepth, slots allowlists per data-model.md)
- [x] T004 [P] Expose policy lookup helpers from `next-headless-cms-fe/src/core/blocks/registry.ts` (resolve definition/policy by tenant + type for adapter validation)
- [x] T005 Implement recursive soft-fail composition validation (known type → Zod authored props → slot names → allowlist → per-node maxDepth; drop + `logger.warn`) in `next-headless-cms-fe/src/core/data/strapi/` (new helper module e.g. `compose-validate.ts` or colocated with `strapi-document.ts`)
- [x] T006 Extend `toDynamicZoneBlock` / `toPageData` in `next-headless-cms-fe/src/core/data/strapi/strapi-document.ts` to recursively map `slots` JSON (`__component` + `id` children) into `BlockInstance.slots`, passing tenant into validation (untrusted JSON never becomes a node without the pipeline)
- [x] T007 Update `MockAdapter` / `StrapiAdapter` call sites in `next-headless-cms-fe/src/core/data/adapters/` if `toPageData` signature gains `tenantId` (or equivalent) for registry-aware validation
- [x] T008 Make `BlockRenderer` in `next-headless-cms-fe/src/core/blocks/renderer.tsx` recursive: render each node, then render `slots` children via the same resolve → visibility → searchParams → dataContract → component path; **do not** re-run composition allowlist/depth validation (adapter is primary)
- [x] T009 Ensure layout components can receive rendered slot children (shared recursive helper or children injection pattern) without each primitive inventing its own nest walker — wire through `next-headless-cms-fe/src/core/blocks/renderer.tsx` (+ minimal shared helper if needed under `next-headless-cms-fe/src/core/blocks/`)
- [x] T010 Confirm legacy flat pages still map/render (no `slots`) after T006–T008 — spot-check that existing bike non-home mock shape still produces `BlockInstance[]` without `slots`

**Checkpoint**: Foundation ready — flat legacy pages work; empty/missing `slots` OK; nested trees can be validated once primitives register policies

---

## Phase 3: User Story 2 - Shared UI language (Priority: P1)

**Goal**: Minimal Level 1 vocabulary with registry policies; Strapi components; `product-list` marked Level 3 leaf policy

**Independent Test**: Register primitives; feed a small nested mock tree (and an illegal nest); adapter drops illegal nodes; valid tree renders with theme tokens; document vocabulary in catalog/knowledge later in polish

### Implementation for User Story 2

- [x] T011 [P] [US2] Add shared `section` primitive (`section.tsx`, `types.ts`, `schema.ts` + policy: maxDepth 4, `default` allowlist) under `next-headless-cms-fe/src/shared/components/blocks/section/`
- [x] T012 [P] [US2] Add shared `stack` primitive under `next-headless-cms-fe/src/shared/components/blocks/stack/` (schema + policy per data-model.md)
- [x] T013 [P] [US2] Add shared `flex` primitive under `next-headless-cms-fe/src/shared/components/blocks/flex/`
- [x] T014 [P] [US2] Add shared `grid` primitive under `next-headless-cms-fe/src/shared/components/blocks/grid/`
- [x] T015 [P] [US2] Add shared `text` leaf under `next-headless-cms-fe/src/shared/components/blocks/text/`
- [x] T016 [P] [US2] Add shared `image` leaf under `next-headless-cms-fe/src/shared/components/blocks/image/`
- [x] T017 [P] [US2] Add shared `button` leaf under `next-headless-cms-fe/src/shared/components/blocks/button/`
- [x] T018 [US2] Register all Level 1 primitives with quoted keys + `schema` + `policy` in `next-headless-cms-fe/src/shared/components/blocks/index.ts`
- [x] T019 [US2] Add Level 3 leaf `policy` on `product-list` registration in `next-headless-cms-fe/src/tenants/vukans-bike/blocks/index.ts` (maxDepth 1, no slots; keep existing `schema` + `dataContract`)
- [x] T020 [P] [US2] Add Strapi component schemas `blocks.section|stack|flex|grid|text|image|button` (props + `slots` JSON where nesting) under `headless-cms-backend/src/components/blocks/`
- [x] T021 [US2] Add new components to page dynamic zone in `headless-cms-backend/src/api/page/content-types/page/schema.json`
- [x] T022 [US2] Run `npm run types:generate` in `headless-cms-backend/` after schema changes
- [x] T023 [US2] Verify composition soft-fail with a temporary illegal nest (e.g. `image` with slotted `text`) via mock path — illegal child omitted, page does not crash

**Checkpoint**: Vocabulary + policies live; nested sample tree can render; `product-list` is an allowlisted leaf compound

---

## Phase 4: User Story 1 - Home rebuilt on the shared tree (Priority: P1) 🎯 MVP

**Goal**: Vukan's Bike home (sl/en/de) is Level 1/2 trees + sole L3 `product-list`; visitor roles preserved (hero, stats, promo, products, CTA)

**Independent Test**: Load home; same content roles as today; no `hero` / `stats-bar` / `image-text` / `cta-banner` on home; products still load via dataContract

### Implementation for User Story 1

- [x] T024 [US1] Rewrite `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/home.json` as root DZ trees: hero-band / stats / image+content / `product-list` / CTA-band per data-model Level 2 patterns and `contracts/composition-tree.md`
- [x] T025 [P] [US1] Mirror home tree structure with localized copy in `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/en--home.json`
- [x] T026 [P] [US1] Mirror home tree structure with localized copy in `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/de--home.json`
- [x] T027 [US1] Ensure seed script `headless-cms-backend/scripts/seed-vukans-bike-cms.js` still ingests home mocks (adjust only if seed assumptions break on `slots` JSON)
- [x] T028 [US1] Manually verify bike home (default locale) shows equivalent hero/stats/promo/products/CTA roles with theme tokens — `TENANT_ID=vukans-bike` per quickstart.md
- [x] T029 [US1] Verify `product-list` remains the only Level 3 on home and still loads catalog products (dataContract unchanged)

**Checkpoint**: Home MVP delivers visitor experience via composition tree

---

## Phase 5: User Story 3 - Remove superseded sections (Priority: P2)

**Goal**: Home does not use opaque marketing blocks; remove only types this feature fully replaces **and** that become unused; keep `hero` / shared sections used on other pages

**Independent Test**: Inventory usage; home JSON has no superseded opaque types; other pages still render; `product-list` retained

### Implementation for User Story 3

- [x] T030 [US3] Inventory bike mock pages + registries: confirm `hero`, `stats-bar`, `image-text`, `cta-banner` still used outside home — **do not delete** those implementations if still referenced
- [x] T031 [US3] Confirm home mocks (`home.json`, `en--home.json`, `de--home.json`) contain zero `__component` values for `blocks.hero`, `blocks.stats-bar`, `blocks.image-text`, `blocks.cta-banner`
- [x] T032 [US3] Remove only bike-proprietary block implementations/registrations/schemas that are fully replaced by Level 1/2 **and** unused after home migration (likely none beyond home content — delete code only if inventory proves unused); leave `product-list` intact
- [x] T033 [US3] Spot-check a non-home bike page (e.g. `/service` or `/about`) still works with legacy `hero` + opaque shared blocks

**Checkpoint**: Cleanup complete without breaking other pages; home L3 set = product-list only

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Spec Kit sync + verification gates

- [x] T034 [P] Update `.specify/memory/knowledge/block-system.md` for tree+slots, registry policy SoT, adapter-primary validation, recursive renderer; remove stale `NestedBlockList` / live `grid`+`primitives` claims
- [x] T035 [P] Update `.specify/memory/knowledge/content-model.md` with new `blocks.*` primitives and `slots` JSON nesting notes
- [x] T036 [P] Update `.specify/memory/knowledge/mock-data.md` with nested `slots` examples (canonical `__component` shape)
- [x] T037 [P] Update `specs/_catalogs/vukans-bike.md` — home block order as composition trees; Level 1 vs `product-list` Level 3; note visual editor out of scope
- [x] T038 Update `.specify/memory/knowledge/api-contract.md` only if adapter/`toPageData` contract notes need a slots/validation mention
- [x] T039 Run `pnpm type-check` and `pnpm lint:bike` in `next-headless-cms-fe/`
- [x] T040 Run `pnpm build:bike && pnpm verify:build` in `next-headless-cms-fe/`
- [x] T041 Execute remaining quickstart.md scenarios (locales, illegal nest soft-fail, other-pages spot-check)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: None
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **US2 (Phase 3)**: Depends on Foundational — vocabulary before home content
- **US1 (Phase 4)**: Depends on US2 (primitives must exist to author home)
- **US3 (Phase 5)**: Depends on US1 (cleanup after migration)
- **Polish (Phase 6)**: Depends on US1–US3 as delivered

### User Story Dependencies

- **User Story 2 (P1)**: After Foundational — no dependency on US1
- **User Story 1 (P1) MVP**: After US2
- **User Story 3 (P2)**: After US1

### Parallel Opportunities

- T011–T017 (primitive folders) in parallel after T010
- T020 Strapi schemas in parallel with late FE registration once props shapes stable
- T025–T026 locale homes in parallel after T024
- T034–T037 docs in parallel during polish

---

## Parallel Example: User Story 2

```bash
# After foundational checkpoint, launch primitive scaffolds together:
Task: "Add section under shared/components/blocks/section/"
Task: "Add stack under shared/components/blocks/stack/"
Task: "Add flex under shared/components/blocks/flex/"
Task: "Add grid under shared/components/blocks/grid/"
Task: "Add text under shared/components/blocks/text/"
Task: "Add image under shared/components/blocks/image/"
Task: "Add button under shared/components/blocks/button/"
# Then serialize: register index → Strapi DZ → types:generate → illegal-nest check
```

---

## Parallel Example: User Story 1

```bash
# After home.json rewrite:
Task: "Mirror tree in en--home.json"
Task: "Mirror tree in de--home.json"
```

---

## Implementation Strategy

### MVP First (US2 + US1)

1. Phase 1 Setup  
2. Phase 2 Foundational (tree engine)  
3. Phase 3 US2 (primitives + Strapi)  
4. Phase 4 US1 (home trees) → **STOP and validate** per quickstart  
5. Phase 5 US3 cleanup  
6. Phase 6 polish + verify:build  

### Incremental Delivery

1. Foundation → legacy pages still work  
2. Primitives → sample nest works  
3. Home migration → visitor MVP  
4. Cleanup + docs → feature complete  

---

## Notes

- [P] = different files, no incomplete-task dependencies
- No visual editor tasks (R10 / plan constraints)
- Do not explode `product-list` into CMS atoms
- Do not delete shared opaque blocks still used off-home
- Registry keys always quoted (`"section"`, `"stack"`, …)
- Format validation: all tasks use `- [ ]`, Task ID, optional [P]/[USn], and file paths
