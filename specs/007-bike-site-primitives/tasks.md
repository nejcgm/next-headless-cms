# Tasks: Vukan's Bike Site Primitives Redesign

**Input**: Design documents from `/specs/007-bike-site-primitives/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/page-block-inventory.md, quickstart.md

**Tests**: None requested in spec — no automated test tasks. Validate via [quickstart.md](./quickstart.md) + inventory grep + FR-012 design checklist.

**Organization**: Foundational allowlists → US1 full-site mock trees → US2 design gate → US3 Keep compounds → US4 delete/cleanup → polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `next-headless-cms-fe/src/{app,core,tenants,shared}/`
- Backend: `headless-cms-backend/src/{api,components}/`
- Spec Kit: `specs/007-bike-site-primitives/`, `.specify/memory/knowledge/`, `specs/_catalogs/`

---

## Phase 1: Setup

**Purpose**: Confirm feature context before code/content changes

- [x] T001 Verify branch `007-bike-site-primitives` and that `specs/007-bike-site-primitives/{plan,spec,research,data-model,quickstart}.md` plus `contracts/page-block-inventory.md` match clarify decisions (bike SOT / drop resort shared nodes; shared + proprietary scope; FR-012 design gate)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Composition policies allow Keep L3 nesting; mock adapter ready for visitor verify. No page redesign until this completes.

**⚠️ CRITICAL**: No user-story content migration until this phase completes

- [x] T002 Extract a shared Keep L3 allowlist constant (or duplicated consistent arrays) for layout policies per `data-model.md` nestAllow — include `product-list`, `bike-detail`, `contact`, `gallery`, `partners-gallery`, `service-pricing`, `service-faq` — used by section/stack/flex/grid schemas under `next-headless-cms-fe/src/shared/components/blocks/`
- [x] T003 [P] Update `sectionPolicy` allowlist in `next-headless-cms-fe/src/shared/components/blocks/section/schema.ts` to include all Keep L3 types from T002 (still no nested `section`)
- [x] T004 [P] Update `stackPolicy` allowlist in `next-headless-cms-fe/src/shared/components/blocks/stack/schema.ts` to include Keep L3 types from T002
- [x] T005 [P] Update `flexPolicy` allowlist in `next-headless-cms-fe/src/shared/components/blocks/flex/schema.ts` to include Keep L3 types from T002
- [x] T006 [P] Update `gridPolicy` allowlist in `next-headless-cms-fe/src/shared/components/blocks/grid/schema.ts` to include Keep L3 types from T002
- [x] T007 Add/confirm Level 3 leaf `policy` (`level: 3`, `maxDepth: 1`, empty `slots`) on Keep registrations in `next-headless-cms-fe/src/tenants/vukans-bike/blocks/index.ts` for `contact`, `gallery`, `partners-gallery`, `service-pricing`, `service-faq`, `bike-detail` (and keep existing `product-list` policy)
- [x] T008 Set Vukan's Bike `dataAdapter` to `"mock"` for redesign verification in `next-headless-cms-fe/src/tenants/vukans-bike/config.ts` (note catalog still documents Strapi for production; restore/document in polish)

**Checkpoint**: Keep compounds can nest under L1 bands; mock adapter serves bike pages

---

## Phase 3: User Story 1 - Entire bike site on the composition language (Priority: P1) 🎯 MVP

**Goal**: Every public bike page (all locales) uses only L1 primitives + Keep L3 per `contracts/page-block-inventory.md`; routes still work; `product-list` / `bike-detail` behavior preserved

**Independent Test**: Grep bike mocks for zero Forbidden types; open each public route in mock mode (`sl`/`en`/`de`); shop/home still list products; bike detail still loads product

### Implementation for User Story 1

- [x] T009 [US1] Polish `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/home.json` if needed so tree is inventory-clean and coherent with site-wide redesign (already L1+`product-list`; align section rhythm with other pages)
- [x] T010 [P] [US1] Mirror home structure/copy updates in `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/en--home.json`
- [x] T011 [P] [US1] Mirror home structure/copy updates in `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/de--home.json`
- [x] T012 [US1] Redesign `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/shop.json` as L1 bands + Keep `product-list` (replace `hero` / `cta-banner`)
- [x] T013 [P] [US1] Mirror shop tree with localized copy in `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/en--shop.json`
- [x] T014 [P] [US1] Mirror shop tree with localized copy in `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/de--shop.json`
- [x] T015 [US1] Redesign `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/contact.json` as L1 intro/band + Keep `contact` (replace `hero`)
- [x] T016 [P] [US1] Mirror contact tree in `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/en--contact.json`
- [x] T017 [P] [US1] Mirror contact tree in `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/de--contact.json`
- [x] T018 [US1] Redesign `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/brands.json` as L1 bands + Keep `partners-gallery` (replace `hero` / `cta-banner`)
- [x] T019 [P] [US1] Mirror brands tree in `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/en--brands.json`
- [x] T020 [P] [US1] Mirror brands tree in `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/de--brands.json`
- [x] T021 [US1] Redesign `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/service.json` as L1 process/CTA bands + Keep `service-pricing` + `service-faq` (replace `hero`, `service-process`, `service-contact`)
- [x] T022 [P] [US1] Mirror service tree in `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/en--service.json`
- [x] T023 [P] [US1] Mirror service tree in `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/de--service.json`
- [x] T024 [US1] Redesign `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/about.json` as L1 story/person/values compositions (replace `hero`, `about-story`, `about-person`, `about-values`, `cta-banner`)
- [x] T025 [P] [US1] Mirror about tree in `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/en--about.json`
- [x] T026 [P] [US1] Mirror about tree in `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/de--about.json`
- [x] T027 [US1] Redesign `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/bike-school.json` as L1 intro/program bands + Keep `gallery` (replace `hero`, `bike-school-intro`, `bike-school-program`, `cta-banner`)
- [x] T028 [P] [US1] Mirror bike-school tree in `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/en--bike-school.json`
- [x] T029 [P] [US1] Mirror bike-school tree in `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/de--bike-school.json`
- [x] T030 [US1] Redesign `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/guided-tours.json` as L1 experience bands + Keep `gallery` (replace `hero`, `guided-tour-experience`, `service-process`, `cta-banner`)
- [x] T031 [P] [US1] Mirror guided-tours tree in `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/en--guided-tours.json`
- [x] T032 [P] [US1] Mirror guided-tours tree in `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/de--guided-tours.json`
- [x] T033 [US1] Confirm `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/bikes--merida.json` (+ `en--` / `de--`) remain Keep `bike-detail` only (or minimal L1 framing that does not compete with product UX); no Replace types
- [x] T034 [US1] Run inventory grep from `contracts/page-block-inventory.md` / `quickstart.md` against `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/` — expect **zero** Forbidden `__component` hits
- [x] T035 [US1] Manually smoke-load all public bike routes via mock adapter (`/`, `/shop`, `/service`, `/about`, `/contact`, `/brands`, `/bike-school`, `/guided-tours`, `/bikes/merida` + en/de) per quickstart §3

**Checkpoint**: Full site trees are inventory-legal; MVP visitor paths work on mock data

---

## Phase 4: User Story 2 - Replace expressible sections with professional design (Priority: P1)

**Goal**: Redesigned pages meet FR-012 craft bar — brand-first first viewport, one job per section, no vibecoded filler — not merely type migration

**Independent Test**: Structured design review checklist in quickstart §4 for home, shop, service, about, contact, brands, bike school, guided tours (mobile + desktop)

### Implementation for User Story 2

- [x] T036 [US2] Design-pass shop + contact + brands mock trees in `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/{shop,contact,brands,en--*,de--*}.json` against FR-012 (hero budget, hierarchy, place-specific copy, px spacing, real imagery)
- [x] T037 [US2] Design-pass service + about mock trees in `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/{service,about,en--*,de--*}.json` against FR-012 (no vanity stats, no decorative card grids as main idea, process as purposeful stacks)
- [x] T038 [US2] Design-pass bike-school + guided-tours + home polish in `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/{bike-school,guided-tours,home,en--*,de--*}.json` against FR-012
- [x] T039 [US2] Record design-review pass for SC-005/SC-006 using quickstart checklist (fix any remaining vibecode patterns found in review)

**Checkpoint**: Design gate passed — professional craft, not vibecoded

---

## Phase 5: User Story 3 - Keep only irreducible compounds (Priority: P1)

**Goal**: Keep list compounds remain registered and used where needed; not deleted or falsely decomposed

**Independent Test**: Inventory Keep types in registry + mocks; each still appears on the pages that need them; dataContracts for `product-list` / `bike-detail` still work

### Implementation for User Story 3

- [x] T040 [US3] Verify Keep compounds remain registered in `next-headless-cms-fe/src/tenants/vukans-bike/blocks/index.ts`: `product-list`, `bike-detail`, `contact`, `gallery`, `partners-gallery`, `service-pricing`, `service-faq` (+ header/footer templates untouched)
- [x] T041 [US3] Confirm Keep usage in mocks: `product-list` on home/shop; `bike-detail` on bikes pages; `contact` on contact; `gallery` on bike-school/guided-tours; `partners-gallery` on brands; `service-pricing` + `service-faq` on service — under `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/`
- [x] T042 [US3] Spot-check `product-list` and `bike-detail` dataContracts still load products via mock collections (`next-headless-cms-fe/src/tenants/vukans-bike/mock-data/collections/` + loaders under `blocks/product-list/`, `blocks/bike-detail/`)

**Checkpoint**: Irreducible compounds intact beside L1 trees

---

## Phase 6: User Story 4 - Remove superseded types from FE + Strapi (Priority: P2)

**Goal**: Delete Replace-list implementations from bike/shared FE and Strapi; drop shared deleted nodes from resort mocks; Keep types remain in DZ

**Independent Test**: Zero bike registry/mock references to Replace types; Strapi DZ = L1 + Keep only; resort builds without deleted shared opaques; Keep still in Strapi DZ

### Implementation for User Story 4

- [x] T043 [US4] Drop deleted shared opaque nodes (`cta-banner`, `stats-bar`, `section-header`, and any other shared Forbidden types present) from `next-headless-cms-fe/src/tenants/resort-example/mock-data/pages/{home,about,contact,rooms}.json` — delete nodes only, do not rebuild with primitives
- [x] T044 [US4] Unregister shared opaques from `next-headless-cms-fe/src/shared/components/blocks/index.ts` and delete folders: `cta-banner/`, `stats-bar/`, `image-text/`, `section-header/`, `rich-text/`, `image-gallery/`
- [x] T045 [US4] Unregister bike proprietary Replace types from `next-headless-cms-fe/src/tenants/vukans-bike/blocks/index.ts` and delete folders: `hero/`, `about-story/`, `about-person/`, `about-values/`, `bike-school-intro/`, `bike-school-program/`, `guided-tour-experience/`, `service-process/`, `service-contact/`
- [x] T046 [US4] Trim page dynamic zone in `headless-cms-backend/src/api/page/content-types/page/schema.json` to L1 + Keep only per `data-model.md`
- [x] T047 [US4] Delete superseded Strapi component JSON under `headless-cms-backend/src/components/blocks/` for Forbidden shared + bike proprietary types (retain L1 + Keep component files; leave resort FE `hero` alone)
- [x] T048 [US4] Run `npm run types:generate` in `headless-cms-backend/` after schema/component deletions
- [x] T049 [US4] Adjust `headless-cms-backend/scripts/seed-vukans-bike-cms.js` if it assumes deleted block types — seed must author L1 + Keep only
- [x] T050 [US4] Confirm resort tenant `hero` (and other resort proprietary blocks) still register in `next-headless-cms-fe/src/tenants/resort-example/blocks/index.ts` for remaining fixture mocks

**Checkpoint**: Product surface cleaned; fixture still builds; Strapi model matches inventory

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Spec Kit sync + verification gates

- [x] T051 [P] Update `.specify/memory/knowledge/block-system.md` for post-migration shared/tenant inventory (L1 + Keep only on bike; deleted opaques gone)
- [x] T052 [P] Update `.specify/memory/knowledge/content-model.md` page DZ / component list to match Strapi cleanup
- [x] T053 [P] Update `.specify/memory/knowledge/mock-data.md` for full-site primitive trees + mock-first verify note
- [x] T054 [P] Update `specs/_catalogs/vukans-bike.md` page→block map, Keep/Replace outcome, remove superseded block rows
- [x] T055 [P] Update `specs/_catalogs/resort-example.md` noting dropped shared nodes / bike-SOT cleanup
- [x] T056 Resolve bike `dataAdapter` documentation vs verify setting in `next-headless-cms-fe/src/tenants/vukans-bike/config.ts` + catalog (mock for feature verify; document production Strapi expectation)
- [x] T057 Run `pnpm type-check`, `pnpm lint:bike`, `pnpm lint:resort` in `next-headless-cms-fe/`
- [x] T058 Run `pnpm build:bike && pnpm verify:build` and `pnpm build:resort && pnpm verify:build` in `next-headless-cms-fe/`
- [x] T059 Execute remaining quickstart.md validation scenarios (inventory grep, locale parity spot-check, design checklist sign-off)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **US1 (Phase 3)**: Depends on Foundational — 🎯 MVP (full-site legal trees)
- **US2 (Phase 4)**: Depends on US1 page trees existing — design gate on those trees
- **US3 (Phase 5)**: Can overlap late US1 verification; must complete before US4 deletes anything
- **US4 (Phase 6)**: Depends on US1 (zero Forbidden refs) + US3 (Keep confirmed) — then delete
- **Polish (Phase 7)**: Depends on US4 completion

### User Story Dependencies

- **US1**: After Foundational — primary content migration
- **US2**: After US1 trees authored — FR-012 pass/polish
- **US3**: After/during US1 — prove Keep intact before deletion
- **US4**: After US1 Forbidden grep clean + US3 Keep confirmed

### Parallel Opportunities

- T003–T006 (layout policy files) after T002
- Locale mirrors `[P]` after each page’s `sl` redesign (T010/T011, T013/T014, …)
- T051–T055 docs in parallel during polish
- US2 design-pass tasks T036–T038 can run in parallel by page group once US1 for those pages is done

### Parallel Example: Shop locales (US1)

```bash
# After T012 shop.json is done:
Task: "Mirror shop tree in en--shop.json"
Task: "Mirror shop tree in de--shop.json"
```

### Parallel Example: Foundational allowlists

```bash
# After T002 nestAllow defined:
Task: "Update section/schema.ts policy"
Task: "Update stack/schema.ts policy"
Task: "Update flex/schema.ts policy"
Task: "Update grid/schema.ts policy"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1–2 (setup + allowlists + mock adapter)
2. Complete Phase 3 US1 (all pages inventory-legal + smoke routes)
3. **STOP and VALIDATE**: Grep + quickstart §2–3
4. Then US2 design gate → US3 Keep check → US4 delete → polish

### Incremental Delivery

1. Foundational → nest Keep under sections  
2. US1 page-by-page (shop/contact early for high traffic) → demo mock site  
3. US2 design pass → professional bar  
4. US3 confirm Keep → US4 delete dead code/Strapi → docs + verify:build  

### Suggested MVP scope

**US1 only** (Phases 1–3): entire bike site on L1 + Keep mocks, routes working. Deletion (US4) and full design polish (US2) follow before calling the feature done per SC-005/SC-006 and SC-004.

---

## Notes

- [P] = different files, no incomplete-task dependencies
- Prefer **px** in authored box styles; use `heading` for titles; brand-first first viewport (FR-012)
- Never delete a Replace type while bike mocks still reference it (US4 after T034)
- Resort: **drop** shared nodes only — do not primitive-rebuild the fixture
- Live Strapi re-seed is ops follow-on; schema cleanup is in-scope (T046–T048)
- Commit after each logical group (page triple, or delete batch)
