# Tasks: Primitive Props Redesign

**Input**: Design documents from `/specs/012-primitive-props-redesign/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: None requested in the spec — no automated test tasks. Validate via [quickstart.md](./quickstart.md).

**Organization**: Tasks are grouped by user story per spec.md's priorities. Note up front: **User Story 1 (sizing convention) has no tasks of its own** — it's delivered entirely by Foundational T003 and verified for real as each primitive in User Story 2/3 is redesigned; manufacturing separate US1 tasks would just duplicate that work.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `next-headless-cms-fe/src/shared/components/primitives/{layout,content,actions}/`, `next-headless-cms-fe/src/shared/components/ui/`, `next-headless-cms-fe/src/shared/utils/box-style.ts`, `next-headless-cms-fe/src/shared/components/composition-allow.ts`
- Backend: `headless-cms-backend/src/components/blocks/`, `headless-cms-backend/src/api/page/content-types/page/schema.json`, `headless-cms-backend/src/page-composition/`, `headless-cms-backend/src/admin/page-composition/`, `headless-cms-backend/scripts/`
- Spec Kit: `specs/012-primitive-props-redesign/`, `.specify/memory/knowledge/`, `specs/_catalogs/`

Cite [research.md](./research.md) R1–R8 for why (sizing, icon library, nest rules, Gallery promotion, Link/Button containers, migration strategy).

---

## Phase 1: Setup

- [ ] T001 [P] Add `lucide-react` as an explicit dependency in `next-headless-cms-fe/package.json`
- [ ] T002 Generate the icon name list and `next-headless-cms-fe/src/shared/components/primitives/content/icon/icon-map.ts` (kebab-case name → `lucide-react` component, from the library's full static export) — a one-time codegen run, output committed like `types/generated/` (research R2)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The sizing helper and the two new nest-allow constants every later primitive change depends on

**⚠️ CRITICAL**: Do not start Phase 4 (US2) or Phase 5 (US3) until T003 completes

- [ ] T003 Add `minWidth`/`minHeight`/`maxHeight` fields and a `toCssSize()` helper (bare number → px, `%`-suffixed → percentage, anything else → ignored + dev warning) to `next-headless-cms-fe/src/shared/utils/box-style.ts`; wire it into `toBoxStyle()` for every existing sizing field (contracts/sizing-convention.md)
- [ ] T004 [P] Add `GALLERY_NEST_ALLOW` (`["image"]`) and `LINK_BUTTON_NEST_ALLOW` (`["icon", "text"]`) to `next-headless-cms-fe/src/shared/components/composition-allow.ts` — **additions only**; do not remove `"stack"` from `LAYOUT_NEST_ALLOW`/`GRID_NEST_ALLOW` or delete `STACK_NEST_ALLOW` yet (that's T031, after content migration — see contracts/nest-rules.md)
- [ ] T005 [P] Mirror T004's additions in `headless-cms-backend/src/page-composition/nest-rules.ts`
- [ ] T006 Add a `Combobox`-based control path (in place of `SingleSelect`) for enumeration fields with a "large" option count in `headless-cms-backend/src/admin/page-composition/field-catalog.ts` / `FieldInspector.tsx` — generic capability, wired specifically to `icon.name` in T035 once that field's enum exists (contracts/icon-library.md)

**Checkpoint**: Sizing convention and the two new allow-lists exist. No primitive schema has changed yet.

---

## Phase 3: User Story 2 - Each primitive exposes the reviewed, purpose-fit set of fields (Priority: P1)

**Goal**: Flex, Section, Text, Grid, Image, and Iframe — the primitives whose redesign is a field-set change only, not a container conversion — match `data-model.md`'s tables.

**Independent Test**: For each of these six primitives, every field in its `data-model.md` table is present and editable; every removed field is gone. (`spec.md` US2 — Link/Button's field redesign is inseparable from their container conversion, so those two live in Phase 5/US3 instead.)

### Implementation for User Story 2

- [ ] T007 [P] [US2] Redesign Flex per `data-model.md`: `next-headless-cms-fe/src/shared/components/primitives/layout/flex/{schema,types,flex}.ts(x)` — extend `justify`/`align`, `gap` becomes sizing
- [ ] T008 [P] [US2] Mirror T007 in `headless-cms-backend/src/components/blocks/flex.json`
- [ ] T009 [P] [US2] Redesign Section per `data-model.md`: `next-headless-cms-fe/src/shared/components/primitives/layout/section/{schema,types,section}.ts(x)` — `width` (full/contained) replaces `fullWidth`, `minHeight` replaces `heroHeight`, `divider` replaces `dividerTop`, add `backgroundPosition`, drop `justify`/`align`
- [ ] T010 [P] [US2] Mirror T009 in `headless-cms-backend/src/components/blocks/section.json`
- [ ] T011 [P] [US2] Redesign Text per `data-model.md`: `next-headless-cms-fe/src/shared/components/primitives/content/text/{schema,types,text}.ts(x)` — `as` replaces `variant`, `fontSize`/`lineHeight`/`letterSpacing` become numbers, add `uppercase`/`textAlign`, drop `customFontSize`
- [ ] T012 [P] [US2] Mirror T011 in `headless-cms-backend/src/components/blocks/text.json`
- [ ] T013 [P] [US2] Redesign Grid per `data-model.md`: `next-headless-cms-fe/src/shared/components/primitives/layout/grid/{schema,types,grid}.ts(x)` — `gap` becomes sizing, drop the legacy `columns` field
- [ ] T014 [P] [US2] Mirror T013 in `headless-cms-backend/src/components/blocks/grid.json`
- [ ] T015 [P] [US2] Redesign Image per `data-model.md`: `next-headless-cms-fe/src/shared/components/primitives/content/image/{schema,types,image}.ts(x)` — extend `fit`, add `position`/`height`/`fullWidth`/`margin`
- [ ] T016 [P] [US2] Mirror T015 in `headless-cms-backend/src/components/blocks/image.json`
- [ ] T017 [P] [US2] Redesign Iframe per `data-model.md`: `next-headless-cms-fe/src/shared/components/primitives/content/iframe/{schema,types,iframe}.ts(x)` — `aspect` gains `16:9`/`4:3`/`1:1`/`21:9`/`auto` values, add `fullWidth`/`margin`
- [ ] T018 [P] [US2] Mirror T017 in `headless-cms-backend/src/components/blocks/iframe.json`
- [ ] T019 [US2] Run `npm run types:generate` in `headless-cms-backend/` and `pnpm type-check` in `next-headless-cms-fe/` after T007–T018

**Checkpoint**: Six primitives fully redesigned and type-checked. User Story 1 (sizing) is now verifiable for real on all of them.

---

## Phase 4: User Story 3 - Every primitive nests only what makes sense for it (Priority: P2)

**Goal**: Accordion, Gallery, Link, and Button become containers with the narrow-or-broad allow-lists `data-model.md`/`contracts/nest-rules.md` specify; Stack is retired.

**Independent Test**: Accordion/Gallery/Link/Button each accept exactly the children their allow-list permits and nothing else; every pre-existing Stack usage renders identically as Flex; zero `blocks.stack` references remain. (`spec.md` US3)

**Note on sequencing**: Stack's schema/registry **removal** (T031–T032) must not land before its content **migration** (T029–T030) — the same convert-then-drop-schema lesson already applied in `010`. Gallery's promotion (T022) and Stack's removal (T032) both touch `shared/components/index.ts`; different keys in the same registry object, no real conflict, just noted so both edits aren't a surprise to whoever does the other.

### Implementation for User Story 3

- [ ] T020 [P] [US3] Convert Accordion to a container per `data-model.md`: `next-headless-cms-fe/src/shared/components/ui/accordion/{schema,types,accordion}.ts(x)` — policy becomes `maxDepth: 4`, `slots.default.allow: LAYOUT_NEST_ALLOW`; drop `content`, render `children` instead
- [ ] T021 [P] [US3] Mirror T020 in `headless-cms-backend/src/components/blocks/accordion.json` (drop `content`, add `slots: json`)
- [ ] T022 [US3] Promote Gallery to shared per research R5: create `next-headless-cms-fe/src/shared/components/ui/gallery/{schema,types,gallery}.ts(x)` (policy `maxDepth: 2`, `slots.default.allow: GALLERY_NEST_ALLOW` from T004; fields per `data-model.md` — `heading`/`subheading`/`layout`/columns/`gap`, drop `images`/label strings); register in `next-headless-cms-fe/src/shared/components/index.ts`; delete `next-headless-cms-fe/src/tenants/vukans-bike/blocks/gallery/`; remove its registration and its `registerTenantLayoutNestAllow` extra from `next-headless-cms-fe/src/tenants/vukans-bike/blocks/index.ts`
- [ ] T023 [US3] Mirror T022's field shape in `headless-cms-backend/src/components/blocks/gallery.json`
- [ ] T024 [P] [US3] Convert Link to a container per `data-model.md`: `next-headless-cms-fe/src/shared/components/primitives/actions/link/{schema,types,link}.ts(x)` — policy `maxDepth: 2`, `slots.default.allow: LINK_BUTTON_NEST_ALLOW` (`maxItems: 2`) from T004; drop `label`, render `children`; add `target`/`accessibleLabel`; extend `variant`
- [ ] T025 [P] [US3] Mirror T024 in `headless-cms-backend/src/components/blocks/link.json`
- [ ] T026 [P] [US3] Convert Button to a container per `data-model.md`: `next-headless-cms-fe/src/shared/components/primitives/actions/button/{schema,types,button}.ts(x)` — same container policy as Link; drop `label`/`icon`/`iconPosition`, render `children`; add `type`/`disabled`/`accessibleLabel`/`fontSize`/`fontWeight`/`textAlign`; extend `variant` with `ghost`
- [ ] T027 [P] [US3] Mirror T026 in `headless-cms-backend/src/components/blocks/button.json`
- [ ] T028 [US3] Add accessible-label validation (research R6): Link/Button resolving to an Icon-only child (no Text child) with no `accessibleLabel` set is a hard-fail in `headless-cms-backend/src/page-composition/validate.ts` / the `api::page.page` document middleware, and a soft-drop-with-dev-warning in `next-headless-cms-fe/src/core/data/strapi/compose-validate.ts` (depends on T020–T027)
- [ ] T029 [US3] Add Stack→Flex (`direction: column`) conversion logic to a new `headless-cms-backend/scripts/migrate-012-primitive-props.js` (idempotent, modeled on `010`'s `convert-section-children-to-slots.js`) and to `headless-cms-backend/scripts/seed-vukans-bike-cms.js`'s `transformFieldsForComponent`
- [ ] T030 [US3] Run `migrate-012-primitive-props.js` against the live Strapi DB; verify zero remaining `blocks.stack` nodes before proceeding
- [ ] T031 [US3] **Only after T030 is verified**: remove `"stack"` from `LAYOUT_NEST_ALLOW`/`GRID_NEST_ALLOW` and delete `STACK_NEST_ALLOW` in `next-headless-cms-fe/src/shared/components/composition-allow.ts`; mirror in `headless-cms-backend/src/page-composition/nest-rules.ts`
- [ ] T032 [US3] Delete Stack: `next-headless-cms-fe/src/shared/components/primitives/layout/stack/` folder, its entry in `next-headless-cms-fe/src/shared/components/index.ts`, `headless-cms-backend/src/components/blocks/stack.json`, and `"blocks.stack"` from `headless-cms-backend/src/api/page/content-types/page/schema.json`'s `blocks` dynamic zone; run `npm run types:generate`

**Checkpoint**: Accordion/Gallery/Link/Button are containers with the correct narrow-or-broad allow-lists; Stack no longer exists anywhere.

---

## Phase 5: User Story 4 - The Icon primitive offers a real icon library (Priority: P1)

**Goal**: Icon's `name` field offers the full lucide set through a searchable picker, in place of the 3-icon list.

**Independent Test**: Searching the Icon field's picker for a concept surfaces matching results from the full library; existing `map-pin`/`phone`/`mail` usages keep rendering unchanged (no migration needed — research R3). (`spec.md` US4)

### Implementation for User Story 4

- [X] T033 [US4] Replace the hand-drawn SVG branches in `next-headless-cms-fe/src/shared/components/primitives/content/icon/icon.tsx` with a lookup into `icon-map.ts` (T002); widen `schema.ts`'s `name` enum to the full generated list; change `size` from `sm|md|lg` to a plain px number
- [X] T034 [US4] Mirror T033's field shape in `headless-cms-backend/src/components/blocks/icon.json` (same generated enum list)
- [X] T035 [US4] Wire the `Combobox` control from T006 specifically to the `icon.name` field in `field-catalog.ts`/`FieldInspector.tsx`, with a live-filtered search over the full list (depends on T006, T034) — confirmed automatic: `SearchableEnumControl` fires for any enum field with >20 options, `icon.name` (1,838 options) included, no per-field wiring needed

**Checkpoint**: Icon primitive fully redesigned; searchable in the admin.

---

## Phase 6: User Story 5 - Vukan's Bike renders identically on the new props (Priority: P1)

**Goal**: Every Vukan's Bike page rebuilt on the redesigned primitives with identical visual output; `resort-example` mechanically kept buildable.

**Independent Test**: Page-by-page comparison against a pre-migration reference shows no visual difference; `pnpm verify:build` passes for both tenants. (`spec.md` US5)

**Depends on**: Phases 3–5 all complete (every primitive this rebuild touches must already have its new shape).

### Implementation for User Story 5

- [X] T036 [US5] Add the remaining `transformFieldsForComponent` cases to `headless-cms-backend/scripts/seed-vukans-bike-cms.js` per `data-model.md`'s migration-mapping table: Button/Link `label`(+`icon`) → `children`; Accordion `content` → `children`; Gallery `images[]` → `children`; Text's named `fontSize` steps → px numbers — plus an added `ICON_SIZE_VALUE_MAP` (`sm`/`md`/`lg` → 16/18/22 px) for the icon `size` migration, needed once T033/T034 landed
- [ ] T037 [US5] Re-seed `vukans-bike` (`npm run seed:vukans-bike`) or run `migrate-012-primitive-props.js` (T029, extended with the same mappings) against already-live content; verify every page per quickstart.md §6
- [X] T038 [P] [US5] Mechanically migrate `next-headless-cms-fe/src/tenants/resort-example/mock-data/**` to the new field shapes (Grid's legacy `columns`, any Stack usage, any Button/Link/Accordion/Gallery usage) — shape only, no content/design changes — **investigated, no migration needed**: resort-example uses the mock adapter and barely touches shared primitives at all (10 bespoke tenant blocks, its own schemas); its one `blocks.grid` usage (`mock-data/pages/home.json`) nests children under a stale `items` array instead of `slots.default` and was already silently dropped by `compose-validate` before `012` for that unrelated reason — `012` did not change this page's behavior, so left as-is rather than fixing a pre-existing, out-of-scope bug
- [ ] T039 [US5] Run `pnpm verify:build` for both `bike` and `resort` tenants; confirm both pass

**Checkpoint**: All five user stories independently functional; Vukan's Bike unchanged visually; both tenants still build.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T040 [P] Update `.specify/memory/knowledge/content-model.md` with every primitive's new field table
- [X] T041 [P] Update `.specify/memory/knowledge/block-system.md` (Stack removed from the L1 list; Accordion/Gallery/Link/Button now containers; sizing convention documented)
- [X] T042 [P] Update `.specify/memory/knowledge/api-contract.md` if the icon enum or any nest wire documentation needs it (storage/wire shape is otherwise unchanged)
- [X] T043 [P] Update `specs/_catalogs/vukans-bike.md`
- [X] T044 Run full quality gates: backend `npx tsc --noEmit` (both tsconfigs) + `npm run types:generate`; frontend `pnpm type-check`, `pnpm check:types-style`, `pnpm lint:bike`, `pnpm lint:resort` — all pass clean
- [ ] T045 Execute `specs/012-primitive-props-redesign/quickstart.md` end to end (all 6 sections)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — T003/T004/T005 block Phases 3 and 4; T006 blocks only T035
- **US2 (Phase 3)**: Depends on Phase 2 (T003)
- **US3 (Phase 4)**: Depends on Phase 2 (T003, T004/T005); internally sequential for Stack (T029/T030 before T031/T032)
- **US4 (Phase 5)**: Depends on Phase 1 (T002) and Phase 2 (T006); independent of US2/US3
- **US5 (Phase 6)**: Depends on Phases 3, 4, **and** 5 all landing first (it rebuilds content using every redesigned primitive)
- **Polish (Phase 7)**: Depends on whichever of US2–US5 you intend to ship

### Parallel Opportunities

- T001 alongside T002 (different concerns)
- T004 and T005 (different files, same additions)
- Every `[P]` pair within Phase 3 (T007/T008, T009/T010, … ) — six primitives, fully independent of each other
- Every `[P]` pair within Phase 4 for Accordion/Link/Button (T020/T021, T024/T025, T026/T027) — Gallery (T022/T023) is not marked `[P]` since it also touches shared registration/removal files
- T038 alongside T036/T037 (different tenants' content)
- T040–T043 (separate docs)

---

## Parallel Example: User Story 2

```bash
Task: "Redesign Flex per data-model.md in next-headless-cms-fe/src/shared/components/primitives/layout/flex/"
Task: "Redesign Section per data-model.md in next-headless-cms-fe/src/shared/components/primitives/layout/section/"
Task: "Redesign Text per data-model.md in next-headless-cms-fe/src/shared/components/primitives/content/text/"
Task: "Redesign Grid per data-model.md in next-headless-cms-fe/src/shared/components/primitives/layout/grid/"
Task: "Redesign Image per data-model.md in next-headless-cms-fe/src/shared/components/primitives/content/image/"
Task: "Redesign Iframe per data-model.md in next-headless-cms-fe/src/shared/components/primitives/content/iframe/"
```

---

## Implementation Strategy

### MVP First

There isn't a clean single-story MVP here the way `010`/`011` had one — User Story 5 (the actual deliverable proof) depends on Users Stories 2, 3, **and** 4 all landing first. The smallest meaningful checkpoint is: Phase 1 + 2 (Setup + Foundational) → Phase 3 (US2) alone, demonstrated on one tenant page that only uses the six non-container primitives, before taking on the container/Stack-retirement work in Phase 4.

### Incremental Delivery

1. Setup + Foundational → sizing convention and new allow-lists exist
2. US2 → six primitives redesigned, independently type-checkable
3. US3 → Accordion/Gallery/Link/Button containers land; Stack retired (convert-then-drop, in that order)
4. US4 → Icon gets the full library (fully independent of US2/US3; could run in parallel with either)
5. US5 → the whole site rebuilt on top of 2–4, proving it end to end
6. Polish → docs + full quality gates + quickstart

### Parallel Team Strategy

After Phase 2:
- Developer A: US2 (six independent primitives)
- Developer B: US3 (Accordion/Link/Button in parallel; Gallery and Stack need more care due to the registry/migration ordering)
- Developer C: US4 (fully independent)
- All three converge before anyone starts US5

---

## Notes

- [P] = different files, no incomplete-task dependencies
- No test tasks — spec requested none; quickstart.md is the validation record
- Every schema.json edit needs `npm run types:generate` before the next backend task that depends on the regenerated types — batched at T019/T032/T034 rather than after every single file, to avoid 12 redundant regenerations
- Suggested next command: `/speckit-implement`
