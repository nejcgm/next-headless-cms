# Tasks: Vukan's Bike Mock-to-Strapi Migration & Editor-Friendly Schema

**Input**: Design documents from `/specs/009-bike-strapi-migration/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/{schema-changes,frontend-changes,admin-setup}.md, quickstart.md

**Tests**: None requested in the spec — no automated test tasks. Validation is the M1–M14 sweep plus the two manual walkthroughs (visual parity, editor experience) in [quickstart.md](./quickstart.md).

**Organization**: Foundational carries the full schema redesign (frontend + backend) — nothing downstream has independent value until that shape is final. Then one phase per user story in priority order: backend runs (P1) → visitor parity (P1) → editor experience (P2) → publish-without-deploy (P2).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `next-headless-cms-fe/src/{shared,tenants,core}/`
- Backend: `headless-cms-backend/src/{api,components}/`, `headless-cms-backend/scripts/`
- Spec Kit: `specs/009-bike-strapi-migration/`, `.specify/memory/knowledge/`, `specs/_catalogs/`

**Every schema/component task below implements an exact decision from [research.md](./research.md) — cite it
if you need the "why."** No field in this list is a guess.

---

## Phase 1: Setup

**Purpose**: Confirm context and capture the current (broken) baseline before touching anything

- [X] T001 Verify branch `009-bike-strapi-migration` and that `specs/009-bike-strapi-migration/{spec,plan,research,data-model,quickstart}.md` plus `contracts/` reflect the clarified decision (reset the existing database in place, then re-seed)
- [X] T002 Confirm the current failure one more time: `cd headless-cms-backend && npm run develop`, capture the exact `grid.columns` cast error, then stop the process — this is the "before" evidence that T0xx's fix resolves
- [X] T003 [P] Run frontend baseline gates before any change: `pnpm type-check`, `pnpm lint:bike`, `pnpm lint:resort` in `next-headless-cms-fe/` — confirm all green so any later failure is attributable to this feature's own changes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Land the full schema redesign — frontend and backend — before the database is touched or any content is seeded. Every user story below depends on this shape being final.

**⚠️ CRITICAL**: Do not proceed to the database reset (Phase 3) until every task in this phase is done and `pnpm type-check` passes. Backend schema JSON must already reflect the final shape before Strapi's first post-reset boot, or the reset just recreates a schema that immediately needs changing again.

**Known transitional effect**: once T010 (text.fontSize) and T009 (section.surface) land, `pnpm dev:bike` — still on the mock adapter at this point — will soft-drop some old-shape nodes (old raw `fontSize` strings, `section.backgroundColor`) until the Strapi cutover (Phase 5) completes. This is expected, not a regression: production `vukans-bike` is not live on Strapi today, so nothing user-facing is affected mid-implementation. Do not use `pnpm dev:bike` against mock data as a correctness check during this phase — use `pnpm type-check` / `pnpm lint:bike` instead.

### Frontend: shared box-style bag

- [X] T004 In `next-headless-cms-fe/src/shared/utils/box-style.ts`, change `boxStyleSchema`'s `color` and `backgroundColor` from `z.string().optional()` to `z.enum(["primary","secondary","accent","background","foreground","muted","border","text-primary"]).optional()` (research R7)
- [X] T005 In the same file, change `border` from `z.string().optional()` to `z.enum(["none","hairline","invertedOutline"]).optional()`; remove `borderTop`; add `dividerTop: z.boolean().optional()` (research R10, R11)
- [X] T006 In the same file, remove `width`; add `fullWidth: z.boolean().optional()` (research R12)
- [X] T007 In the same file, remove `minHeight` and `lineHeight` from `boxStyleSchema` entirely (research R13, R8 — zero non-hero/non-text uses of either)
- [X] T008 In `toBoxStyle()` (same file), add the internal maps and branches: `border` enum → `{none: "none", hairline: "1px solid var(--color-border)", invertedOutline: "2px solid var(--color-background)"}`; `dividerTop: true` → `style.borderTop = "1px solid var(--color-border)"`; `fullWidth: true` → `style.width = "100%"`. Leave `color`/`backgroundColor` resolution via the existing `resolveColor()` untouched (research R7)

### Frontend: `section` primitive

- [X] T009 [P] In `next-headless-cms-fe/src/shared/components/primitives/layout/section/{types.ts,schema.ts}`, add `surface: z.enum(["background","muted","accent","foreground"]).optional()` replacing the free-string `surface`; remove `backgroundColor` from this component's own prop set (research R7)
- [X] T010 [P] In the same folder's `section.tsx`, update the non-hero branch to resolve `backgroundColor: surface ?? "background"` (was `surface ?? "default"`); add `heroHeight?: "standard" | "tall"` to `types.ts`/`schema.ts`, consulted only in the `backgroundImage` branch, mapping `standard → "clamp(480px, 72vh, 720px)"` and `tall → "clamp(520px, 82vh, 820px)"`; remove `minHeight` from this component's own prop set (research R13)

### Frontend: `grid` primitive (additive — do not remove the legacy `columns` prop)

- [X] T011 In `next-headless-cms-fe/src/shared/components/primitives/layout/grid/types.ts`, add optional `columnsMobile?: 1|2|3|4`, `columnsTablet?: 1|2|3|4`, `columnsDesktop?: 1|2|3|4`; keep the existing `columns` prop exactly as it is (research R9, R16 — `resort-example` depends on this)
- [X] T012 In `grid/schema.ts`, add matching Zod enums for the three new fields as `.optional()`, alongside the existing `columns` union schema, unchanged
- [X] T013 In `grid.tsx`, add logic: if any of `columnsMobile`/`columnsTablet`/`columnsDesktop` is present, build `{mobile,tablet,desktop}` from those flat props directly; otherwise fall back to the existing `resolveColumns(columns)` path unchanged

### Frontend: `text` primitive

- [X] T014 In `next-headless-cms-fe/src/shared/components/primitives/content/text/types.ts`, narrow `fontSize` to `"cardTitle"|"sectionTitle"|"priceCompact"|"pageTitle"|"price"|"display"|"statement"|"custom"`; add `customFontSize?: string`; remove `lineHeight`
- [X] T015 In `text/schema.ts`, override the inherited `fontSize` with `z.enum([...same 8 values]).optional()` via `boxStyleSchema.extend({...})`; add `customFontSize: z.string().optional()`
- [X] T016 In `text.tsx`, add the internal step map (7 named steps → exact `{fontSize, lineHeight: 1.625}` pairs per the table in [data-model.md](./data-model.md)) plus the `custom` → `customFontSize` fallback; apply the mapped size+line-height via inline style whenever `fontSize` is set, regardless of `variant`, bypassing that variant's own Tailwind size/leading class for this instance only (research R8 — this is also the fix for `008`'s R3 finding)

### Frontend: `accordion`

- [X] T017 [P] In `next-headless-cms-fe/src/shared/components/ui/accordion/{types.ts,schema.ts}`, narrow `backgroundColor` and `border` to the same enums as T004/T005 (accordion's narrower box-style subset has no `borderTop`/`width`/`minHeight`/`lineHeight` to remove)

### Frontend: tenant-specific

- [X] T018 [P] In `next-headless-cms-fe/src/tenants/vukans-bike/blocks/product-list/{types.ts,schema.ts}`, remove the dead `category` field (research R15 — confirmed no-op, `product-list` unreferenced by any current page)

### Backend: Strapi component/content-type schemas

- [X] T019 [P] `headless-cms-backend/src/components/blocks/section.json`: add `surface` enum, remove `backgroundColor`, remove `minHeight`, add `heroHeight` enum, plus the shared box-style changes (T020's mapping) for `color`/`border`/`dividerTop`/`fullWidth`
- [X] T020 [P] Apply the shared box-style attribute changes (T004–T006's Strapi equivalents: `color`/`backgroundColor` → enum, `border` → enum, remove `borderTop`/`width`/`minHeight`/`lineHeight`, add `dividerTop`/`fullWidth` booleans) to `headless-cms-backend/src/components/blocks/{stack,flex,image,iframe,icon,button,link}.json`
- [X] T021 [P] `headless-cms-backend/src/components/blocks/grid.json`: remove `columns`; add `columnsMobile` (enum 1–4, default `"1"`, required), `columnsTablet` (enum 1–4, optional), `columnsDesktop` (enum 1–4, optional)
- [X] T022 [P] `headless-cms-backend/src/components/blocks/text.json`: change `fontSize` to the 8-value enum; add `customFontSize` (string); remove `lineHeight`; apply the shared box-style changes from T020
- [X] T023 [P] `headless-cms-backend/src/components/blocks/product-list.json`: remove `category` (research R15)
- [X] T024 [P] `headless-cms-backend/src/components/shared/accordion.json` (or wherever the accordion component schema lives): narrow `backgroundColor` and `border` to the matching enums (T017's Strapi equivalent)
- [X] T025 Delete `headless-cms-backend/src/components/shared/cta-link.json` and `headless-cms-backend/src/components/shared/stat-item.json` (research R2 — confirmed zero references anywhere)
- [X] T026 [P] `headless-cms-backend/src/api/page/content-types/page/schema.json`: set `options.draftAndPublish: true`
- [X] T027 [P] `headless-cms-backend/src/api/product/content-types/product/schema.json`: set `options.draftAndPublish: true`

### Checkpoint

- [X] T028 Run `pnpm type-check`, `pnpm lint:bike`, `pnpm lint:resort` in `next-headless-cms-fe/` — all must pass before continuing. Manually diff every backend JSON file changed above against [contracts/schema-changes.md](./contracts/schema-changes.md) to confirm nothing was missed.

**Checkpoint**: The redesigned schema exists on both sides, type-checks, and lints clean. Nothing has touched
the database yet.

---

## Phase 3: User Story 1 - The backend actually runs (Priority: P1) 🎯 MVP

**Goal**: Strapi starts successfully from the redesigned schema and serves basic requests — independent of any content existing yet.

**Independent Test**: From a reset database, start the backend and confirm it reaches a ready state, the admin panel loads, and an empty-content API call succeeds — no manual workarounds.

### Implementation for User Story 1

- [X] T029 [US1] Per [contracts/admin-setup.md](./contracts/admin-setup.md) §1: stop any running Strapi process, then re-confirm with the operator immediately before running the actual reset command (this authorization is not substituted by the spec alone)
- [X] T030 (skipped — user chose to proceed without a backup) [US1] Optional safety net per contracts/admin-setup.md §1: take a `pg_dump` of the current database before resetting
- [X] T031 [US1] Execute the reset: connect to the database named in `headless-cms-backend/.env` and run `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
- [X] T032 [US1] Start the backend: `cd headless-cms-backend && npm run develop` — confirm it reaches a ready state with zero schema-sync errors (validation M1–M2)
- [X] T033 [US1] Open `http://localhost:1337/admin` and confirm the admin panel loads and every content type/component from Phase 2 is visible there
- [X] T034 [US1] Confirm a basic API call succeeds against the empty (not-yet-seeded) backend, e.g. `GET /api/pages` returns an empty `data: []` rather than an error

**Checkpoint**: The backend that would not start at all now runs cleanly. Nothing is seeded yet.

---

## Phase 4: User Story 2 - Visitors see no difference (Priority: P1)

**Goal**: Every current page, in every locale, renders on the Strapi-backed site exactly as it did on mock data.

**Independent Test**: Walk every page in every locale on the Strapi-backed site side by side with the current mock-data site and confirm they match.

### Implementation for User Story 2

- [X] T035 [US2] Per [contracts/admin-setup.md](./contracts/admin-setup.md) §2: create the first Strapi admin account
- [X] T036 [US2] Grant Public role `find` permission on `Page`, `Navigation`, `Product` (Settings → Users & Permissions → Roles → Public)
- [X] T037 [US2] Generate a Strapi API token (Settings → API Tokens) for the seed script and the frontend
- [X] T038 [US2] Update `headless-cms-backend/scripts/seed-vukans-bike-cms.js`'s payload-building helpers to apply the field-shape transforms while reading the existing (untouched) mock JSON: `fontSize` raw string → named-step lookup (data-model.md's 7-row table); `section` `surface`/`backgroundColor` collapse; `columns.{mobile,tablet,desktop}` → three flat fields; `borderTop`/`width`/`minHeight` → `dividerTop`/`fullWidth`/`heroHeight`; drop any stray `product-list.category`
- [X] T039 [US2] Run the seed: `STRAPI_API_TOKEN=<token from T037> npm run seed:vukans-bike` in `headless-cms-backend/` — confirm it completes with the expected counts (27 pages, 3 navigation entries, 1 product × 3 locales)
- [X] T040 [US2] Set `next-headless-cms-fe/.env`'s `STRAPI_API_TOKEN` to the real token from T037
- [X] T041 [US2] In `next-headless-cms-fe/src/tenants/vukans-bike/config.ts`, change `dataAdapter: "mock"` to `dataAdapter: "strapi"`
- [X] T042 [US2] Run `pnpm dev:bike` and walk every page (`/`, `/shop`, `/service`, `/about`, `/contact`, `/brands`, `/bike-school`, `/guided-tours`, `/bikes/merida`) in all three locales per [quickstart.md](./quickstart.md)'s visual parity walkthrough — confirm copy, images, band order/surfaces, navigation (7 header / 8 footer items), flagship-bike content, and the service price list all match the pre-migration mock-data site exactly

**Checkpoint**: The live site is now Strapi-backed and indistinguishable from the mock-data version.

---

## Phase 5: User Story 3 - A non-technical editor builds content without writing code (Priority: P2)

**Goal**: Confirm the redesigned schema (built in Phase 2) actually delivers a no-code editing experience in practice.

**Independent Test**: Give a non-technical person a small, defined content edit and confirm they complete it entirely through admin-panel controls, never being handed a raw value to type where a choice/number control exists instead.

### Implementation for User Story 3

- [X] T043 [US3] In the Strapi admin, spot-check a `text` node and confirm `fontSize` renders as a dropdown already set to one of the 7 named steps (or `custom`, never a raw string box) — validation M5
- [X] T044 [US3] Spot-check a `grid` node and confirm three separate column dropdowns exist (`columnsMobile`/`columnsTablet`/`columnsDesktop`) with no leftover `columns` field anywhere — validation M6
- [X] T045 [US3] Spot-check a `section` node and confirm `surface` renders as a single dropdown (no separate `backgroundColor` field on `section` specifically) — validation M4
- [X] T046 [US3] Confirm `shared.cta-link` and `shared.stat-item` no longer appear anywhere in the admin's component picker — validation M3
- [X] T047 [US3] Run the full editor-experience walkthrough from [quickstart.md](./quickstart.md): change a headline, change a section's `surface`, change a grid's desktop column count, reorder two navigation items — all using only admin-panel controls, no hand-typed CSS/color/keyword values. Note any field that still required typing a raw value where a control could have existed — that's a gap this feature was meant to close (SC-003)

**Checkpoint**: The schema redesign is verified end-to-end as an actual no-code editing experience, not just a schema diff on paper.

---

## Phase 6: User Story 4 - Publishing a change goes live without a code deploy (Priority: P2)

**Goal**: An editor's published change reaches the live site without a redeploy.

**Independent Test**: Publish a small change in the admin panel and confirm it appears on the live site within the expected refresh window, with no deploy.

### Implementation for User Story 4

- [X] T048 [US4] Per [contracts/admin-setup.md](./contracts/admin-setup.md) §2 step 4: register a Strapi webhook (Settings → Webhooks) pointed at the frontend's `/api/webhooks/strapi` route, header `x-revalidate-secret` = the value of `REVALIDATE_SECRET`
- [X] T049 [US4] Confirm Draft & Publish is active on `Page` and `Product`: save a page as a draft and confirm it does **not** appear in an unauthenticated `find` request (validation M10)
- [X] T050 [US4] Publish a small text change to an existing page in the Strapi admin and confirm it appears on the live site without a redeploy, within the documented revalidation window (validation M12)

**Checkpoint**: The full editor workflow — author, save as draft, publish, see it live — works end to end.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Prove the migration didn't regress the other tenant, then sync Spec Kit

- [X] T051 Run `pnpm lint:resort`, `pnpm build:resort`, and `TENANT_ID=resort-example pnpm verify:build` — confirm all pass unchanged (validation M14)
- [X] T052 Open `resort-example`'s homepage locally (`pnpm dev:resort`) and confirm its one `grid` block (using the legacy `columns: 3` shorthand) still renders 3 columns exactly as before (validation M13)
- [X] T053 Run `pnpm build:bike` and `TENANT_ID=vukans-bike pnpm verify:build` for the now-Strapi-backed tenant
- [X] T054 In `headless-cms-backend/`, run `npm run types:generate` now that the backend has booted successfully post-reset, to regenerate `types/generated/**` from the final schema
- [X] T055 [P] Update `.specify/memory/knowledge/content-model.md`: every changed table in "Block components" and "Collection types" per [contracts/schema-changes.md](./contracts/schema-changes.md)
- [X] T056 [P] Update `.specify/memory/knowledge/api-contract.md`: refresh the "Response shape — page" example (currently shows a stale `fontSize: "56px"` literal)
- [X] T057 [P] Update `.specify/memory/knowledge/strapi-backend.md`: note `draftAndPublish` now enabled on `page`/`product`
- [X] T058 [P] Update `.specify/memory/knowledge/block-system.md`: the box-style field list (remove `borderTop`/`width`/`minHeight`/`lineHeight`, add `dividerTop`/`fullWidth`)
- [X] T059 [P] Update `specs/_catalogs/vukans-bike.md`: `dataAdapter` note flips from "mock for redesign/verification" to "strapi" (live), reflecting T041
- [X] T060 Final full gate re-run: `pnpm type-check`, `pnpm lint:bike`, `pnpm lint:resort`, `pnpm build:bike` + `verify:build`, `pnpm build:resort` + `verify:build`, and re-walk the M1–M14 validation table in [data-model.md](./data-model.md) end to end

---

## Dependencies

```text
Phase 1 (Setup)
  └─> Phase 2 (Foundational — full schema redesign, both sides)  ⚠️ BLOCKING
        └─> Phase 3  US1  Backend runs                          🎯 MVP
              └─> Phase 4  US2  Visitor parity (needs a running backend to seed into)
                    ├─> Phase 5  US3  Editor experience (verifies Phase 2's work, needs seeded content to spot-check against)
                    └─> Phase 6  US4  Publish without deploy (needs seeded, running content)
                          └─> Phase 7  Polish
```

**Story dependencies**: US1 must complete before US2 (nothing can be seeded into a backend that doesn't run).
US2 must complete before US3/US4 can be meaningfully spot-checked (both need real seeded content to inspect
in the admin). US3 and US4 are independent of each other once US2 is done.

## Parallel execution examples

```text
Foundational: T009+T010 (section) · T011-T013 (grid) · T014-T016 (text) · T017 (accordion) · T018 (product-list)
              can all proceed in parallel once T004-T008 (shared box-style) land, since each touches a
              disjoint set of files.
Foundational (backend): T019, T020, T021, T022, T023, T024, T026, T027 are all independent files — run together.
Polish:       T055-T059 (five independent Spec Kit docs) — run together.
```

## Implementation strategy

**MVP**: Phases 1–3. A backend that boots cleanly from a schema that previously crashed it on every attempt
is independently valuable and demonstrable, even with zero content seeded yet.

**Increment 2**: Phase 4 — full content parity, the point at which the live site is genuinely cut over.

**Increment 3**: Phases 5–6 — verifying the actual new capability (editor experience, publish-without-deploy)
this migration exists to deliver.

**Always last**: Phase 7. The `resort-example` re-verification (T051–T052) is what turns "I checked the grep
counts in research.md" into "I confirmed the other tenant is still fine after the fact" — do not skip it even
though R16 already made the case it should be safe.

**If time is short**: the database reset (Phase 3) is the one step that cannot be partially done or safely
deferred once started — do not begin it until every Phase 2 task is complete and type-checked.
