# Tasks: Page Builder Editor Experience Upgrade

**Input**: Design documents from `/specs/011-page-builder-polish/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: None requested in the spec — no automated test tasks. Validate via [quickstart.md](./quickstart.md).

**Organization**: Tasks are grouped by user story (US1 tree/panel polish, US2 live preview, US3 reliability) so each can be built and demoed independently, per spec.md's priorities (US1/US2 both P1, US3 P2).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Backend: `headless-cms-backend/src/admin/page-composition/`, `headless-cms-backend/config/`, `headless-cms-backend/src/page-composition/` (unchanged — owned by `010`)
- Spec Kit: `specs/011-page-builder-polish/`, `.specify/memory/knowledge/`
- Frontend: not expected to change (see plan.md's Structure Decision) — `next-headless-cms-fe/src/app/api/preview/route.ts` is reused as-is

Cite [research.md](./research.md) R1–R11 for why (mount mechanism, native preview, save-triggered freshness, drag library, summaries, field grouping, error surfacing).

---

## Phase 1: Setup

**Purpose**: Add the one new piece of tooling this feature needs before any story uses it

- [X] T001 Add `@dnd-kit/core` and `@dnd-kit/sortable` as explicit `dependencies` in `headless-cms-backend/package.json` (already present transitively via `@strapi/content-manager` — declare explicitly per research R6) and run `npm install` in `headless-cms-backend/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The one shared primitive both US1 and US3 build error display on top of

**⚠️ CRITICAL**: Do not start US1's T011/T012 or US3's T020 until T002 completes

- [X] T002 Add a shared inline error-display component wrapping `@strapi/design-system`'s `Field.Error`/`Alert` pattern in `headless-cms-backend/src/admin/page-composition/ErrorMessage.tsx`, per research R9 — one consistent look for every error the surface can show (invalid JSON, disallowed nest, unexpected failure)

**Checkpoint**: Shared error primitive ready — US1, US2, and US3 can all now proceed (US2 does not depend on T002)

---

## Phase 3: User Story 1 - A modern, confident editing experience (Priority: P1) 🎯 MVP

**Goal**: Every control in the composition surface uses the CMS admin's own visual language; tree rows are distinguishable at a glance; reorder is direct drag-and-drop; branches collapse; fields are grouped and plainly labeled; delete uses a native-feeling confirmation.

**Independent Test**: On a page with 15+ blocks including several of the same type, find, reorder, and edit any specific block on the first attempt using only on-screen summaries and Design System controls — no trial-and-error clicking, no bare browser form elements, no `window.confirm`. (`spec.md` US1)

### Implementation for User Story 1

- [X] T003 [P] [US1] Add block-summary derivation in `headless-cms-backend/src/admin/page-composition/block-summary.ts` implementing the per-type source-field/fallback/recursion table in `data-model.md`'s "Block summary rule" (research R7)
- [X] T004 [P] [US1] Extend `fieldsFor()` in `headless-cms-backend/src/admin/page-composition/field-catalog.ts` to also return, per field, a `group: 'content' | 'appearance'` (fixed appearance-field-name list mirroring the frontend's box-style keys, per `data-model.md`'s "Field group") and a plain-language `label` (camelCase → words, with a specific suffix rule for `columnsMobile`/`columnsTablet`/`columnsDesktop`) (research R8)
- [X] T005 [US1] Rewrite `TreeRow` in `headless-cms-backend/src/admin/page-composition/CompositionTree.tsx` to show the block-summary label (T003) instead of only `displayNameForType(type)`, and to use `@strapi/design-system` `Flex`/`Typography`/`IconButton` for its row chrome instead of bare elements (depends on T003)
- [X] T006 [US1] Add drag-and-drop sibling reorder (root array and every `slots.default` array) in `CompositionTree.tsx` using `@dnd-kit/core` + `@dnd-kit/sortable`, replacing the "Up"/"Down" `Button` pair and the `onMove` handler wiring in `headless-cms-backend/src/admin/page-composition/PageCompositionHost.tsx` (depends on T001)
- [X] T007 [US1] Add per-branch collapse/expand state (keyed by node id/`__temp_key__`) in `CompositionTree.tsx`; collapsing a branch MUST NOT clear `selected` or the field panel for a node that remains visible
- [X] T008 [US1] Replace `window.confirm(...)` in `CompositionTree.tsx`'s delete action with `@strapi/design-system`'s `Dialog`
- [X] T009 [US1] Replace the bare `<select>` "Add block…" / "Add top-level block…" controls in `CompositionTree.tsx` with a Design System `SingleSelect`/`SingleSelectOption`
- [X] T010 [US1] Rewrite `FieldControl` in `headless-cms-backend/src/admin/page-composition/FieldInspector.tsx` to render Design System `TextInput`/`Textarea`/`Checkbox`/`SingleSelect`/`Field` instead of bare HTML inputs, and group rendered fields as Content then Appearance (T004) with plain-language labels (depends on T004)
- [X] T011 [US1] Wire `ErrorMessage` (T002) into `FieldInspector.tsx`'s `JsonField` invalid-JSON state, replacing the ad hoc `<div>Invalid JSON...</div>` (depends on T002)
- [X] T012 [US1] Restyle `headless-cms-backend/src/admin/page-composition/JsonFallback.tsx` with Design System components and `ErrorMessage` (T002) for its error state, replacing the ad hoc `Typography textColor="danger600"` (depends on T002)

**Checkpoint**: User Story 1 is fully functional and demoable on its own, on top of the existing (pre-`011`) mount mechanism — no dependency on US2 or US3.

---

## Phase 4: User Story 2 - See it before you save it (live preview) (Priority: P1)

**Goal**: Editors see a visual preview of in-progress edits within a few seconds, without publishing, without leaving the page editor — by enabling Strapi 5.44's native Content Manager preview and pointing it at the existing `/api/preview` route.

**Independent Test**: Change a block's field; within a few seconds and without publishing, see that change reflected in Strapi's native preview panel for that Page. (`spec.md` US2)

### Implementation for User Story 2

- [X] T013 [US2] Add `PREVIEW_BASE_URL` to `headless-cms-backend/.env.example` (document alongside the existing `PREVIEW_SECRET` requirement — same value the frontend already uses) per `contracts/live-preview.md`
- [X] T014 [US2] Implement `admin.preview` (`enabled: true`, `config.allowedOrigins: [PREVIEW_BASE_URL]`, `config.handler(uid, { documentId, locale, status })`) in `headless-cms-backend/config/admin.ts`: for `uid === 'api::page.page'`, resolve `slug` via `strapi.documents('api::page.page').findOne({ documentId, locale })` and return `` `${PREVIEW_BASE_URL}/api/preview?secret=${PREVIEW_SECRET}&slug=${encodeURIComponent(slug)}` ``; return `undefined` for any other `uid` or an unresolved document, per `contracts/live-preview.md`
- [X] T015 [US2] **Reverted.** Originally a debounced draft autosave in `PageCompositionHost.tsx`; found to silently drop edits made while a background save was in flight (real data loss, reported after initial implementation). Removed — the preview now reflects the editor's own explicit Save only, per research R3.
- [X] T016 [US2] **Moot** — no autosave (T015) means nothing to flush on navigate-away. `PageCompositionHost.tsx` no longer needs `useEffect`/`useRef`/`useCallback` at all.
- [ ] T017 [US2] **Needs a human in a logged-in browser session** — not something verifiable from the CLI. Open a Page's native Preview panel; check the console for a blocked-frame/CSP error; if blocked, add the narrowest possible allowance (research R4).

**Checkpoint**: User Stories 1 and 2 both independently functional. US2 does not depend on US1.

---

## Phase 5: User Story 3 - An editor that doesn't get in the way (Priority: P2)

**Goal**: The composition surface reliably replaces the raw technical view every time, and every error condition is surfaced clearly instead of failing silently — paying down the current MVP's fragile DOM-text-scraping mount mechanism.

**Independent Test**: Navigate across 3+ pages in a row — the composition surface is present every time with no flash of the native dynamic-zone view; entering invalid technical JSON produces a clear, specific error and the editor stays usable. (`spec.md` US3)

### Implementation for User Story 3

- [X] T018 [US3] Replace the DOM-scraping mount in `headless-cms-backend/src/admin/page-composition/hide-native-blocks.ts` (CSS-class-fragment + literal "Blocks"-label-text matching) and `PageCompositionHost.tsx`'s manual `document.querySelector('main form')` portal with `app.addFields({ type: 'dynamiczone', Component: PageCompositionHost })` registered in `register(app)` in `headless-cms-backend/src/admin/app.tsx` (currently only implements `bootstrap`), per research R1 — update `PageCompositionHost.tsx` to read/write `value`/`onChange` from the props Strapi passes a registered field component instead of `useContentManagerContext()`'s `ctx.form.values`/`ctx.form.onChange`
- [X] T019 [US3] **Not needed** — verified via `node_modules/@strapi/content-manager/.../InputRenderer.mjs`: a type registered via `addFields` is checked *before* the native `dynamiczone` case and receives the field consistently; confirmed with a clean `tsc --noEmit` and a full `npm run build` (production admin bundle) with no errors. `hide-native-blocks.ts` deleted; the R1 fallback path was not required.
- [X] T020 [US3] Wire `ErrorMessage` (T002) into any remaining unhandled-error path in `PageCompositionHost.tsx` (e.g. an exception while applying a tree mutation) so the editor never shows a blank or unresponsive panel (FR-011)
- [X] T021 [US3] Structurally guaranteed rather than just spot-checked: `InputRenderer` decides synchronously, during its own render, whether to use the registered `fields['dynamiczone']` component — there is no longer a native-render-then-hide step (unlike the deleted DOM-mutation approach), so a "flash of the native view" is no longer architecturally possible. A human click-through across several pages remains good practice but is not the only guard anymore.

**Checkpoint**: All three user stories independently functional.

**Note on sequencing**: T018 changes how `PageCompositionHost.tsx` receives `value`/`onChange` — the same file US1's T006 (drag reorder wiring) touches. If implementing serially rather than in parallel, doing T018 **before** T006 avoids rebasing it onto a changed prop-binding shape after the fact; doing stories in spec priority order (US1 → US2 → US3) as written is still fully correct, just with that one known rework cost if T018 lands last. (T015/T016's autosave was later reverted — see their entries above — so they no longer factor into this note.)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Docs and final validation

- [X] T022 [P] Update `.specify/memory/knowledge/strapi-backend.md` with the `admin.preview` config and `PREVIEW_BASE_URL` env var (research R11)
- [X] T023 `types:generate` not needed (no schema change). Ran `npx tsc --noEmit -p src/admin/tsconfig.json` (whole admin surface, clean) and `npx tsc --noEmit -p tsconfig.json` (server code incl. `config/admin.ts`, clean), plus a full `npm run build` (production admin bundle, clean — this is what actually exercises the real Vite/esbuild resolution of `@dnd-kit`/`@strapi/icons`/Design System imports, since a plain Node `require()` of `@strapi/icons` is misleading — it's an ESM-only package). Frontend untouched, so no `pnpm type-check`/`check:types-style` run needed.
- [ ] T024 **Needs a human in a logged-in browser session** to click through — I verified everything reachable from the CLI (types, production build, live API round-trips for the earlier section-nesting work, backend config), but composing a real page in the tree, dragging to reorder, opening the preview panel, and watching it update are all only meaningfully verifiable by actually using the admin UI. Sections 1–2 and 4 of quickstart.md are the most load-bearing to check first.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — blocks US1's T011/T012 and US3's T020 only (US2 has no dependency on it)
- **US1 (Phase 3)**: Depends on Phase 2 (T002) for T011/T012 only; otherwise depends only on Phase 1 (T001, for T006)
- **US2 (Phase 4)**: Depends on Phase 1/2 completing; independent of US1
- **US3 (Phase 5)**: Depends on Phase 2 (T002) for T020; T018 touches the same file as US1's T006 and US2's T015/T016 (see sequencing note above)
- **Polish (Phase 6)**: Depends on whichever of US1–US3 you intend to ship

### User Story Dependencies

- **User Story 1 (P1)**: After Setup + Foundational — MVP
- **User Story 2 (P1)**: After Setup + Foundational — independent of US1
- **User Story 3 (P2)**: After Foundational — see sequencing note; independent in principle, cheaper to do first in practice

### Parallel Opportunities

- T003 and T004 (different files)
- T005–T012 mostly sequential within US1 (same two files); T003/T004 can run parallel to each other before them
- T013 and T014 can be drafted together; T014 needs T013's env var name decided first
- T022 can run any time after the preview handler (T014) exists, in parallel with T023/T024

---

## Parallel Example: User Story 1 setup

```bash
Task: "Add block-summary derivation in headless-cms-backend/src/admin/page-composition/block-summary.ts"
Task: "Extend fieldsFor() with group + label in headless-cms-backend/src/admin/page-composition/field-catalog.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup
2. Phase 2 Foundational
3. Phase 3 US1
4. **STOP**: quickstart.md §1–2 (tree usability + visual consistency)
5. Demo if ready — US2/US3 add preview and reliability on top, in either order

### Incremental Delivery

1. Setup + Foundational → shared error primitive and drag library ready
2. US1 → visually and interactionally polished surface (MVP)
3. US2 → live preview, independent of US1
4. US3 → reliable mount + full error coverage (cheapest to do first if resequencing)
5. Polish → docs + quickstart

---

## Notes

- [P] = different files, no incomplete-task dependencies
- No test tasks — spec requested none; quickstart.md is the validation record
- Storage, nest rules, and the public renderer are unchanged by every task above (FR-012) — none of these tasks touch `src/page-composition/{nest-rules,validate,ids,convert-section-children}.ts` or any `.json` component schema
- Suggested next command: `/speckit-implement`
