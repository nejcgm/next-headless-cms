# Tasks: Composition Live Preview

**Input**: Design documents from `/specs/013-composition-live-preview/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/compose-preview.md, quickstart.md

**Tests**: None requested. Validate with quickstart.md.

## Phase 1: Setup

- [x] T001 Confirm `specs/013-composition-live-preview/spec.md` layout (tree, preview, fields) and unsaved-preview rule match `contracts/compose-preview.md`

## Phase 2: Foundational

- [x] T002 Add the in-memory overlay store in `next-headless-cms-fe/src/core/preview/compose-session.ts` per `data-model.md`
- [x] T003 Add `POST` `next-headless-cms-fe/src/app/api/compose-preview/route.ts` that accepts a draft-mode overlay and does not call Strapi (`contracts/compose-preview.md`)
- [x] T004 Allow the Strapi origin to frame the frontend in `next-headless-cms-fe/next.config.ts` (`research.md` R5)

## Phase 3: User Story 1 - See the page while composing it (P1)

**Goal**: Wide layout is tree, preview, fields. Unsaved composition edits show in the center. The published page does not change.

**Independent Test**: Change a heading without saving. The center preview shows it. The published site does not.

- [x] T005 [US1] Add the draft listener in `next-headless-cms-fe/src/core/preview/compose-preview-listener.tsx` (accept messages only from `STRAPI_URL`)
- [x] T006 [US1] Apply the overlay in `next-headless-cms-fe/src/app/[domain]/[[...slug]]/page.tsx` only while draft mode is on, and mount T005
- [x] T007 [US1] Add the center preview frame in `headless-cms-backend/src/admin/page-composition/CompositionPreview.tsx` (empty state when there is no document, error state when the preview URL is missing)
- [x] T008 [US1] Lay out tree, preview, and fields left to right in `headless-cms-backend/src/admin/page-composition/PageCompositionHost.tsx`, and post `cms-compose-preview` when `blocks` change

## Phase 4: User Story 2 - Save from the preview (P1)

**Goal**: The preview column can persist the draft using the content admin's own Save. It does not publish.

**Independent Test**: Save from the preview column, reopen the page, the edit is still there.

- [x] T009 [US2] Add the preview-column save control in `headless-cms-backend/src/admin/page-composition/CompositionPreview.tsx` that activates the content admin Save control

## Phase 5: User Story 3 - Narrow layout (P2)

**Goal**: When the three columns do not fit, they stack as tree, preview, fields.

**Independent Test**: Narrow the window and confirm that order. An edit still reaches the preview.

- [x] T010 [US3] Stack the three regions in `PageCompositionHost.tsx` under the narrow breakpoint from `research.md` R1

## Phase 6: Polish

- [x] T011 Note the composition preview in `.specify/memory/knowledge/strapi-backend.md`, `.specify/memory/knowledge/api-contract.md`, and `specs/_catalogs/vukans-bike.md`

## Dependencies

- T002 and T004 can run in parallel
- T005 depends on T003
- T006 depends on T002 and T005
- T008 depends on T007
- T009 and T010 depend on T008
- T011 after the behavior exists

## Parallel example

```text
T002 overlay store
T004 frame-ancestors
```

## MVP

User Story 1 (T002–T008) is enough to see unsaved edits in the center column.
