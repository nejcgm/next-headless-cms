# Tasks: Block Prop Validation Schemas

**Input**: Design documents from `/specs/004-block-zod-schemas/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md  
**Tests**: Not requested as automated unit tests — validate via [quickstart.md](./quickstart.md) (coverage grep + bike smoke + type-check/lint)

**Organization**: Setup → Foundational → US1 (shared + smoke) → US2 (tenant coverage) → US3 (docs) → Polish  

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Parallelizable (different files, no incomplete blockers)
- **[Story]**: [US1]…[US3] on user-story phase tasks only

## Path Conventions

- Frontend: `next-headless-cms-fe/src/`
- Shared schemas: `next-headless-cms-fe/src/shared/components/blocks/{block}.schema.ts`
- Tenant schemas: `next-headless-cms-fe/src/tenants/{id}/blocks/{block}/schema.ts`
- Spec Kit: `.specify/memory/knowledge/`, `specs/_catalogs/`
- Feature: `specs/004-block-zod-schemas/`
- Reference: `tenants/vukans-bike/blocks/hero/schema.ts`, `tenants/resort-example/blocks/room-list/schema.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm active feature and authoring rules  

- [X] T001 Confirm `.specify/feature.json` → `specs/004-block-zod-schemas` and skim `contracts/block-schema-registry.md` coverage checklist
- [X] T002 [P] Re-read reference schemas `next-headless-cms-fe/src/tenants/vukans-bike/blocks/hero/schema.ts` and `next-headless-cms-fe/src/tenants/resort-example/blocks/room-list/schema.ts` (plain `z.object`, unknown keys stripped, authored props only)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Keep existing validation path; no core redesign  

**⚠️ CRITICAL**: Do not change production/dev validation semantics before adding schemas  

- [X] T003 Confirm `validateBlockProps` in `next-headless-cms-fe/src/core/blocks/renderer.tsx` already matches FR-006/FR-007 (dev-only `safeParse` + warn; no code change unless a bug is found)
- [X] T004 Confirm existing registrations keep schemas: `hero` in `next-headless-cms-fe/src/tenants/vukans-bike/blocks/index.ts` and `room-list` in `next-headless-cms-fe/src/tenants/resort-example/blocks/index.ts` (FR-004)

**Checkpoint**: Renderer + existing schemas OK — story work can begin  

---

## Phase 3: User Story 1 — Catch bad CMS props early (P1) 🎯 MVP

**Goal**: Shared content blocks gain Zod schemas and are wired so development warns on invalid props without blocking render  

**Independent Test**: `pnpm dev:bike` → break a required prop on a shared block used on home (e.g. `stats-bar` / `cta-banner`) → warning names block + paths; page still renders  

### Implementation

- [X] T005 [P] [US1] Add `ctaBannerSchema` in `next-headless-cms-fe/src/shared/components/blocks/cta-banner.schema.ts` from `CtaBannerProps` in `cta-banner.tsx`
- [X] T006 [P] [US1] Add `sectionHeaderSchema` in `next-headless-cms-fe/src/shared/components/blocks/section-header.schema.ts` from `SectionHeaderProps` in `section-header.tsx`
- [X] T007 [P] [US1] Add `statsBarSchema` in `next-headless-cms-fe/src/shared/components/blocks/stats-bar.schema.ts` from `StatsBarProps` in `stats-bar.tsx`
- [X] T008 [P] [US1] Add `imageTextSchema` in `next-headless-cms-fe/src/shared/components/blocks/image-text.schema.ts` from `ImageTextProps` in `image-text.tsx`
- [X] T009 [P] [US1] Add `richTextSchema` in `next-headless-cms-fe/src/shared/components/blocks/rich-text.schema.ts` from `RichTextProps` in `rich-text.tsx`
- [X] T010 [P] [US1] Add `imageGallerySchema` in `next-headless-cms-fe/src/shared/components/blocks/image-gallery.schema.ts` from `ImageGalleryProps` in `image-gallery.tsx`
- [X] T011 [US1] Wire all six shared schemas into `next-headless-cms-fe/src/shared/components/blocks/index.ts` (`schema:` on each registration)
- [X] T012 [US1] Smoke per [quickstart.md](./quickstart.md) §3: `pnpm dev:bike`, temporarily invalidate one shared-block required prop, confirm `logger.warn` / console warning, revert

**Checkpoint**: US1 done — shared registry fully schemated; MVP warn path proven  

---

## Phase 4: User Story 2 — Shared and tenant blocks equally covered (P1)

**Goal**: Every product-tenant and fixture-tenant registered content block has a schema wired (completes SC-001 with US1)  

**Independent Test**: Grep/`schema:` count matches contract checklist; every entry in both tenant `blocks/index.ts` files includes `schema:`  

### vukans-bike schemas

- [X] T013 [P] [US2] Add `contactSchema` in `next-headless-cms-fe/src/tenants/vukans-bike/blocks/contact/schema.ts` from `contact/types.ts`
- [X] T014 [P] [US2] Add `aboutStorySchema` in `next-headless-cms-fe/src/tenants/vukans-bike/blocks/about-story/schema.ts` from `about-story/types.ts`
- [X] T015 [P] [US2] Add `aboutValuesSchema` in `next-headless-cms-fe/src/tenants/vukans-bike/blocks/about-values/schema.ts` from `about-values/types.ts`
- [X] T016 [P] [US2] Add `aboutPersonSchema` in `next-headless-cms-fe/src/tenants/vukans-bike/blocks/about-person/schema.ts` from `about-person/types.ts`
- [X] T017 [P] [US2] Add `bikeDetailSchema` in `next-headless-cms-fe/src/tenants/vukans-bike/blocks/bike-detail/schema.ts` (authored `labels` only; omit injected `bike`)
- [X] T018 [P] [US2] Add `bikeSchoolIntroSchema` in `next-headless-cms-fe/src/tenants/vukans-bike/blocks/bike-school-intro/schema.ts` from `bike-school-intro/types.ts`
- [X] T019 [P] [US2] Add `bikeSchoolProgramSchema` in `next-headless-cms-fe/src/tenants/vukans-bike/blocks/bike-school-program/schema.ts` from `bike-school-program/types.ts`
- [X] T020 [P] [US2] Add `gallerySchema` in `next-headless-cms-fe/src/tenants/vukans-bike/blocks/gallery/schema.ts` from `gallery/types.ts`
- [X] T021 [P] [US2] Add `guidedTourExperienceSchema` in `next-headless-cms-fe/src/tenants/vukans-bike/blocks/guided-tour-experience/schema.ts` from `guided-tour-experience/types.ts`
- [X] T022 [P] [US2] Add `partnersGallerySchema` in `next-headless-cms-fe/src/tenants/vukans-bike/blocks/partners-gallery/schema.ts` from `partners-gallery/types.ts`
- [X] T023 [P] [US2] Add `productListSchema` in `next-headless-cms-fe/src/tenants/vukans-bike/blocks/product-list/schema.ts` (omit injected `products` / loader `locale`)
- [X] T024 [P] [US2] Add `servicePricingSchema` in `next-headless-cms-fe/src/tenants/vukans-bike/blocks/service-pricing/schema.ts` from `service-pricing/types.ts`
- [X] T025 [P] [US2] Add `serviceProcessSchema` in `next-headless-cms-fe/src/tenants/vukans-bike/blocks/service-process/schema.ts` from `service-process/types.ts`
- [X] T026 [P] [US2] Add `serviceFaqSchema` in `next-headless-cms-fe/src/tenants/vukans-bike/blocks/service-faq/schema.ts` from `service-faq/types.ts`
- [X] T027 [P] [US2] Add `serviceContactSchema` in `next-headless-cms-fe/src/tenants/vukans-bike/blocks/service-contact/schema.ts` from `service-contact/types.ts`
- [X] T028 [US2] Import and wire all new bike schemas (keep `heroSchema`) in `next-headless-cms-fe/src/tenants/vukans-bike/blocks/index.ts`

### resort-example schemas

- [X] T029 [P] [US2] Add `heroSchema` in `next-headless-cms-fe/src/tenants/resort-example/blocks/hero/schema.ts` from inline `HeroProps` in `hero/hero.tsx`
- [X] T030 [P] [US2] Add `roomDetailSchema` in `next-headless-cms-fe/src/tenants/resort-example/blocks/room-detail/schema.ts` (empty/minimal authored props; omit injected room/hotel/availability/dates)
- [X] T031 [P] [US2] Add `hotelInfoSchema` in `next-headless-cms-fe/src/tenants/resort-example/blocks/hotel-info/schema.ts` (`z.object({})` or equivalent; omit `hotel`)
- [X] T032 [P] [US2] Add `aboutStorySchema` in `next-headless-cms-fe/src/tenants/resort-example/blocks/about-story/schema.ts` from `about-story/types.ts`
- [X] T033 [P] [US2] Add `locationContactSchema` in `next-headless-cms-fe/src/tenants/resort-example/blocks/location-contact/schema.ts` from `location-contact/types.ts`
- [X] T034 [P] [US2] Add `amenitiesGridSchema` in `next-headless-cms-fe/src/tenants/resort-example/blocks/amenities-grid/schema.ts` from `amenities-grid/types.ts`
- [X] T035 [P] [US2] Add `teamGallerySchema` in `next-headless-cms-fe/src/tenants/resort-example/blocks/team-gallery/schema.ts` from `team-gallery/types.ts`
- [X] T036 [P] [US2] Add `bookingWidgetSchema` in `next-headless-cms-fe/src/tenants/resort-example/blocks/booking-widget/schema.ts` from `booking-widget/types.ts`
- [X] T037 [P] [US2] Add `testimonialsSchema` in `next-headless-cms-fe/src/tenants/resort-example/blocks/testimonials/schema.ts` (omit injected `reviews`)
- [X] T038 [US2] Import and wire all new resort schemas (keep `roomListSchema`) in `next-headless-cms-fe/src/tenants/resort-example/blocks/index.ts`
- [X] T039 [US2] Verify coverage against `contracts/block-schema-registry.md` — every shared + bike + resort content-block registration has `schema:` (SC-001 / SC-004)

**Checkpoint**: US2 done — 100% registered content-block schema coverage  

---

## Phase 5: User Story 3 — New blocks cannot skip schemas (P2)

**Goal**: Spec Kit treats schemas as required for registered content blocks  

**Independent Test**: Read living docs — no “optional schema” guidance for new content blocks; catalogs reflect coverage  

### Implementation

- [X] T040 [P] [US3] Update `.specify/memory/knowledge/block-system.md` — schema required for registered content blocks; keep hero/`schema.ts` as reference; note authored-vs-injected / unknown-key strip
- [X] T041 [P] [US3] Update `specs/_catalogs/vukans-bike.md` so block docs no longer imply schemas are rare/optional
- [X] T042 [P] [US3] Update `specs/_catalogs/resort-example.md` so block docs no longer imply schemas are rare/optional

**Checkpoint**: US3 / FR-008 / SC-005  

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates from quickstart  

- [X] T043 Run `pnpm type-check` in `next-headless-cms-fe/` and fix schema/registration type errors
- [X] T044 [P] Run `pnpm lint:bike` in `next-headless-cms-fe/` (after `prepare-tenant` for bike if needed) and fix issues from this feature
- [X] T045 [P] Run `pnpm lint:resort` in `next-headless-cms-fe/` (after `prepare-tenant` for resort if needed) and fix issues from this feature
- [X] T046 Complete remaining [quickstart.md](./quickstart.md) checklist items (coverage, docs); note resort visual smoke limitation if legacy mock shape blocks render

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Start immediately
- **Foundational (Phase 2)**: After Setup — blocks story work only if renderer semantics must stay stable (read/confirm)
- **US1 (Phase 3)**: After Foundational — MVP
- **US2 (Phase 4)**: After Foundational (can parallel with US1 if staffed; sequential is safer to reuse patterns from US1)
- **US3 (Phase 5)**: After US1+US2 preferred (docs describe completed coverage); can draft earlier but finalize after wiring
- **Polish (Phase 6)**: After desired stories complete

### User Story Dependencies

- **US1**: Independent after Phase 2 — delivers shared coverage + smoke
- **US2**: Independent of US3; ideally after US1 so shared pattern is established; completes full tenant coverage
- **US3**: Docs; depends on knowing final “required schema” convention (can start after US1)

### Parallel Opportunities

- T005–T010 shared schema files in parallel
- T013–T027 bike schema files in parallel (then T028 wire)
- T029–T037 resort schema files in parallel (then T038 wire)
- T040–T042 docs in parallel
- T044–T045 lint tenants in parallel after type-check

---

## Parallel Example: User Story 1

```bash
# Create all shared schema files in parallel:
Task: "Add ctaBannerSchema in …/cta-banner.schema.ts"
Task: "Add sectionHeaderSchema in …/section-header.schema.ts"
Task: "Add statsBarSchema in …/stats-bar.schema.ts"
Task: "Add imageTextSchema in …/image-text.schema.ts"
Task: "Add richTextSchema in …/rich-text.schema.ts"
Task: "Add imageGallerySchema in …/image-gallery.schema.ts"
# Then sequentially:
Task: "Wire schemas in shared/components/blocks/index.ts"
Task: "Smoke invalid prop warning on pnpm dev:bike"
```

---

## Parallel Example: User Story 2

```bash
# Bike schema files in parallel (T013–T027), then wire index (T028)
# Resort schema files in parallel (T029–T037), then wire index (T038)
# Coverage verify (T039)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1–2  
2. Phase 3: shared schemas + wire + bike smoke  
3. **STOP and VALIDATE** US1  

### Incremental Delivery

1. US1 → shared registry covered + warn proven  
2. US2 → full bike + resort coverage  
3. US3 → Spec Kit required-schema guidance  
4. Polish → type-check / lint / quickstart  

### Suggested MVP scope

**US1 only** (T001–T012): enough to prove development warnings for previously unvalidated blocks.

---

## Notes

- No comments inside interfaces (constitution VII)
- Omit `dataContract`-injected fields from schemas (research.md)
- Do not weaken schemas to hide mock/CMS drift — fix content or note follow-up
- Header/footer out of scope
- Resort empty pages (legacy mock shape) do not block schema registration tasks
