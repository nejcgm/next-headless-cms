# Tasks: Admin Page Builder

**Input**: Design documents from `/specs/010-admin-page-builder/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: None requested in the spec — no automated test tasks. Validate via [quickstart.md](./quickstart.md).

**Organization**: Unified `slots` storage + write-path validation first (blocks every story). Then US1 composition surface (MVP), US2 editor nest-rule UX, US3 conversion/JSON fallback/docs.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `next-headless-cms-fe/src/{app,core,tenants,shared}/`
- Backend: `headless-cms-backend/src/{admin,api,components,page-composition}/`, `headless-cms-backend/scripts/`
- Spec Kit: `specs/010-admin-page-builder/`, `.specify/memory/knowledge/`, `specs/_catalogs/`

Cite [research.md](./research.md) R1–R12 for why (admin host, unified slots, convert-then-schema, hard-fail writes).

---

## Phase 1: Setup

**Purpose**: Confirm design artifacts and enable the Strapi admin extension entrypoint

- [x] T001 Verify branch `010-admin-page-builder` and that `specs/010-admin-page-builder/{spec,plan,research,data-model,quickstart}.md` plus `contracts/{composition-storage,nest-rules,page-composition-admin}.md` match the clarify decisions (one composition surface, revert Section `children`, auto-convert to `slots`, JSON fallback same tree)
- [x] T002 Copy `headless-cms-backend/src/admin/app.example.tsx` to `headless-cms-backend/src/admin/app.tsx` (bootstrap only; do not wire the composition surface yet)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Unify Section onto `slots` JSON, convert existing `children`, and hard-fail illegal nests on Page write. No story UI until this lands.

**⚠️ CRITICAL**: Do not start US1 until T010 completes (`types:generate` after `section.json`)

- [x] T003 [P] Add nest-rule catalog (allowlists + maxDepth + `vukans-bike` Keep extras) in `headless-cms-backend/src/page-composition/nest-rules.ts` per `specs/010-admin-page-builder/contracts/nest-rules.md` (mirror `next-headless-cms-fe/src/shared/components/composition-allow.ts` and layout `schema.ts` policies)
- [x] T004 [P] Add Section `children` → `slots.default` converter (idempotent; `children` wins if both exist; recurse) in `headless-cms-backend/src/page-composition/convert-section-children.ts` per `specs/010-admin-page-builder/data-model.md`
- [x] T005 Add hard-fail composition validator (root DZ types, allowlists, leaves, per-node maxDepth, invalid `slots` JSON) in `headless-cms-backend/src/page-composition/validate.ts` using T003
- [x] T006 Replace `children` dynamiczone with `slots` json on `headless-cms-backend/src/components/blocks/section.json` (same `slots` shape as stack/flex/grid; update `info.description`)
- [x] T007 [P] Add idempotent convert script `headless-cms-backend/scripts/convert-section-children-to-slots.js` that loads all Page documents (draft + published) and applies T004
- [x] T008 Stop rewriting section `slots` → `children` in `headless-cms-backend/scripts/seed-vukans-bike-cms.js` (persist `slots` on `blocks.section`)
- [x] T009 Register document-service middleware on `api::page.page` create/update in `headless-cms-backend/src/index.ts`: run T004 then T005; on failure throw `ApplicationError` and do not persist
- [x] T010 Run `npm run types:generate` in `headless-cms-backend/` after T006 and confirm generated section types use `slots` not `children` in `headless-cms-backend/types/generated/components.d.ts`

**Checkpoint**: Schema and seed are `slots`-only; writes convert leftover `children` and reject illegal nests. Native admin is still the old DZ UI until US1.

---

## Phase 3: User Story 1 - Compose a page as a nested tree without JSON (Priority: P1) 🎯 MVP

**Goal**: One composition surface on Page edit for the whole body: add/nest/reorder/edit/delete with ordinary fields. Identity/SEO stay native. Native root DZ is not a second add/reorder path.

**Independent Test**: On a draft Page, build Section → Flex → Text and Flex → Flex → Text with add/nest/field controls only; save draft (must not publish); public page shows that tree. Nested JSON was not required. (`specs/010-admin-page-builder/spec.md` US1)

### Implementation for User Story 1

- [x] T011 [P] [US1] Add stable nested-id helper (`max(ids in tree) + 1`) in `headless-cms-backend/src/page-composition/ids.ts`
- [x] T012 [P] [US1] Add inspector field catalog from component JSON in `headless-cms-backend/src/admin/page-composition/field-catalog.ts` (read `headless-cms-backend/src/components/blocks/*.json` plus accordion/Keep; omit `slots`/`children`)
- [x] T013 [US1] Add tree mutations (add root, add child using T003 allowlists, reorder siblings, delete parent+descendants, preserve root `__temp_key__`) in `headless-cms-backend/src/admin/page-composition/tree-ops.ts` using T011
- [x] T014 [US1] Implement outline tree (select, expand, empty-parent “add block”, delete confirm) in `headless-cms-backend/src/admin/page-composition/CompositionTree.tsx`
- [x] T015 [P] [US1] Implement selected-node field inspector (enums as dropdowns, booleans, short text) in `headless-cms-backend/src/admin/page-composition/FieldInspector.tsx` using T012
- [x] T016 [US1] Implement `PageCompositionHost` bound to form field `blocks` (Content Manager context / `useField`) in `headless-cms-backend/src/admin/page-composition/PageCompositionHost.tsx` composing T014–T015; keep `tenant`/`lang`/`slug`/`template`/`seo` on the native form
- [x] T017 [US1] Inject the host on `api::page.page` and hide/replace the native `blocks` dynamic-zone widget in `headless-cms-backend/src/admin/app.tsx` per research R1 (`specs/010-admin-page-builder/contracts/page-composition-admin.md`)

**Checkpoint**: Editors can build and save a nested band without JSON or a second root-block list. Flex→Flex may already work via T003 allowlists; US2 still owns depth/leaf UX.

---

## Phase 4: User Story 2 - Nesting follows the live site’s rules (Priority: P1)

**Goal**: Picker and in-editor checks match public policy before a valid save: Flex→Flex allowed; Stack↛Grid; Section↛Section; Keep/gallery/detail are leaves; per-type maxDepth.

**Independent Test**: Flex → Flex → Text saves and renders. Stack→Grid, Section→Section, children on a Keep leaf, and one level past maxDepth are blocked in the editor (not only dropped on the public site). (`spec.md` US2)

### Implementation for User Story 2

- [x] T018 [US2] Block add-child when the new subtree would exceed that parent type’s maxDepth in `headless-cms-backend/src/admin/page-composition/tree-ops.ts` (same semantics as `headless-cms-backend/src/page-composition/validate.ts`)
- [x] T019 [US2] Omit illegal child types from the add picker and disable nest on leaves (`text`/`image`/`iframe`/`icon`/`button`/`link`/`accordion`/`product-list`/`bike-detail`/`gallery`) in `headless-cms-backend/src/admin/page-composition/CompositionTree.tsx`
- [x] T020 [US2] Pass `page.tenant` from the Page form into allowlist extras (`vukans-bike` Keep types) in `headless-cms-backend/src/admin/page-composition/PageCompositionHost.tsx`

**Checkpoint**: Illegal nests cannot be offered or saved as valid. Middleware T009 remains the server backstop.

---

## Phase 5: User Story 3 - Existing pages keep working; default is not raw nested JSON (Priority: P2)

**Goal**: Auto-converted Section children; no Section-only picker; collapsed editable JSON fallback on the same `blocks` tree; public FE no longer reads a second nest format.

**Independent Test**: Open a previously nested published page — tree shows children, public layout equivalent. Default nested UI is not JSON. Labeled technical JSON exists but is collapsed; edit via fallback, save once, reopen: tree matches. Invalid JSON or Stack→Grid in JSON fails save. (`spec.md` US3)

### Implementation for User Story 3

- [x] T021 [US3] Hide native `slots` JSON from Content Manager on `headless-cms-backend/src/components/blocks/{section,stack,flex,grid}.json` (`pluginOptions.content-manager.visible: false` on `slots`)
- [x] T022 [US3] Add collapsed labeled technical JSON editor in `headless-cms-backend/src/admin/page-composition/JsonFallback.tsx` (pretty-print the same `blocks` array; not a new schema field)
- [x] T023 [US3] Wire T022 into `headless-cms-backend/src/admin/page-composition/PageCompositionHost.tsx`: parse on apply/save; invalid JSON or T005 failure keeps the last valid tree and blocks persist
- [x] T024 [US3] Remove the `children` dynamic-zone fold in `next-headless-cms-fe/src/core/data/strapi/compose-validate.ts` (slots-only nest; may still strip a leftover `children` key from `props`)
- [x] T025 [P] [US3] Update `.specify/memory/knowledge/content-model.md` (section nests via `slots`; delete mixed-storage / `children` DZ rollout language)
- [x] T026 [P] [US3] Update `.specify/memory/knowledge/block-system.md` (composition surface in Strapi admin; nested DZ experiment undone; canvas still not a freeform pixel editor)
- [x] T027 [P] [US3] Update `.specify/memory/knowledge/api-contract.md` (`slots` only; `populate[blocks][populate]=*` still for root embeds)
- [x] T028 [P] [US3] Update `.specify/memory/knowledge/strapi-backend.md` (admin `src/admin` composition, convert script, write-path validation)
- [x] T029 [P] [US3] Update `specs/_catalogs/vukans-bike.md` (authors edit page body via the composition surface)

**Checkpoint**: Live pages convert and render; default authoring is the tree; JSON is advanced-only and the same nest.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Human docs, type gates, end-to-end quickstart

- [x] T030 Document convert + seed + `types:generate` for operators in `headless-cms-backend/README.md`
- [x] T031 Run `pnpm type-check` and `pnpm check:types-style` in `next-headless-cms-fe/` after T024
- [ ] T032 Execute `specs/010-admin-page-builder/quickstart.md` (draft nested band, nest-rule attempts, JSON fallback, one published nested page)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **US1 (Phase 3)**: Depends on Phase 2
- **US2 (Phase 4)**: Depends on US1 (picker/host must exist)
- **US3 (Phase 5)**: Depends on US1 (fallback sits on the same host). Convert script (T007) should be run against existing DBs before relying on T024 in production
- **Polish (Phase 6)**: Depends on US1–US3 as far as you intend to ship

### User Story Dependencies

- **User Story 1 (P1)**: After Phase 2 — MVP
- **User Story 2 (P1)**: After US1 — editor-side rule UX (server already hard-fails from T009)
- **User Story 3 (P2)**: After US1 — conversion already in Phase 2; this story is fallback + FE fold + docs + hide native JSON

### Within Each User Story

- Shared modules (`nest-rules`, `convert`, `validate`) before admin UI
- Tree ops before tree/inspector
- Host before `app.tsx` injection
- JSON fallback after host exists
- Knowledge/catalog in the same change set as behavior (T025–T029)

### Parallel Opportunities

- T003 and T004 (different files)
- T007 and T008 after T004/T006 respectively (script vs seed)
- T011 and T012
- T015 with T014 after T012/T013
- T025–T029 (separate docs)

---

## Parallel Example: Foundational

```bash
Task: "Add nest-rule catalog in headless-cms-backend/src/page-composition/nest-rules.ts"
Task: "Add Section children converter in headless-cms-backend/src/page-composition/convert-section-children.ts"
```

## Parallel Example: User Story 1

```bash
Task: "Add nested-id helper in headless-cms-backend/src/page-composition/ids.ts"
Task: "Add inspector field catalog in headless-cms-backend/src/admin/page-composition/field-catalog.ts"
```

## Parallel Example: User Story 3 docs

```bash
Task: "Update .specify/memory/knowledge/content-model.md"
Task: "Update .specify/memory/knowledge/block-system.md"
Task: "Update .specify/memory/knowledge/api-contract.md"
Task: "Update .specify/memory/knowledge/strapi-backend.md"
Task: "Update specs/_catalogs/vukans-bike.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup
2. Phase 2 Foundational (schema + convert + hard-fail writes)
3. Phase 3 US1 composition surface
4. **STOP**: quickstart sections 1–2 (nested band without JSON)
5. Demo if ready (US2/US3 still needed before production authors)

### Incremental Delivery

1. Setup + Foundational → `slots`-only storage and safe writes
2. US1 → authors can compose without JSON (MVP)
3. US2 → editor blocks illegal nests (including depth)
4. US3 → convert leftover experiment data, JSON fallback, Spec Kit sync, FE fold removed
5. Polish → README + type-check + full quickstart

### Parallel Team Strategy

After Phase 2:

- A: US1 admin UI
- B: convert script runbooks / seed (T007–T008 if not done)
- After US1: C can take US3 docs in parallel with US2 picker work (T025–T029 vs T018–T020)

---

## Notes

- [P] = different files, no incomplete-task dependencies
- No new Page field, no nested DZs on Flex/Stack/Grid, no Next.js authoring app
- Public `compose-validate.ts` stays soft-drop; admin/middleware hard-fail
- Run T007 against any DB that stored Section `children` before relying on T006/T024
- Suggested next command: `/speckit-implement`
