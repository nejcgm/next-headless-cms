# Tasks: Vukan's Bike Full Visual Redesign (Content-Only)

**Input**: Design documents from `/specs/008-bike-site-redesign/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/{design-system,page-blueprints,shared-recommendations}.md, quickstart.md

**Tests**: None requested in the spec — no automated test tasks. Validation is the V1–V14 grep sweep plus the visual and first-impression review in [quickstart.md](./quickstart.md).

**Organization**: Theme first (everything else is authored against its token roles), then one phase per user story in priority order, each phase covering all three locales so the story is genuinely shippable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Tenant content: `next-headless-cms-fe/src/tenants/vukans-bike/`
- Spec Kit: `specs/008-bike-site-redesign/`, `.specify/memory/knowledge/`, `specs/_catalogs/`

**Authoring rules apply to every page task**: every `text` node sets `color`; `fontSize` only with `variant: "body"`; no raw hex; ids sequential and unique per file; no `navigation` key; band surfaces alternate. See [contracts/design-system.md](./contracts/design-system.md).

---

## Phase 1: Setup

**Purpose**: Confirm context and capture the "before" state so the redesign can be compared against it

- [X] T001 Verify branch `008-bike-site-redesign` and that `specs/008-bike-site-redesign/{spec,plan,research,data-model,quickstart}.md` plus `contracts/` reflect the clarify decisions (single-product catalog, full theme rethink allowed, real photos before stock)
- [X] T002 Run `pnpm dev:bike` in `next-headless-cms-fe/` and capture the current appearance of all nine pages at 1280px as the "before" reference, then confirm baseline gates pass (`pnpm type-check`, `pnpm lint:bike`, `pnpm lint:resort`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the theme and the asset inventory that every page is authored against

**⚠️ CRITICAL**: No page authoring starts until T003 and T004 are done — pages reference token roles, not colors, and picking imagery per page without an inventory leads to the same photo appearing twice

- [X] T003 Apply the eight-token palette, `borderRadius: "0rem"`, the honest system font stack, and remove the photograph `logoUrl` in `next-headless-cms-fe/src/tenants/vukans-bike/config.ts` per the Theme table in [data-model.md](./data-model.md) — leave `contact`, `domains`, `locales` and `features` untouched
- [X] T004 Compile the tenant image inventory into `specs/008-bike-site-redesign/contracts/asset-inventory.md`: list every Cloudinary URL currently referenced across `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/**`, note what each photo shows, and assign each to a page/band from [contracts/page-blueprints.md](./contracts/page-blueprints.md), flagging any band with no suitable real photo as a stock-image gap (FR-017)
- [X] T005 Verify the new theme renders as intended by loading `http://localhost:3002` — header wordmark, hairlines, surfaces and button red — before authoring any page content

**Checkpoint**: Theme is live and every band has a designated photo or a flagged gap

---

## Phase 3: User Story 1 - First impression on the homepage (Priority: P1) 🎯 MVP

**Goal**: `/` reads as a professional local bike shop within seconds — one hero, one job per band, no duplicate CTA pattern, no placeholder copy

**Independent Test**: Load `/`, `/en`, `/de` at 375/768/1280 with every other page untouched, and check against the US1 acceptance scenarios and the per-page review in [quickstart.md](./quickstart.md)

### Implementation for User Story 1

- [X] T006 [US1] Re-author `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/home.json` to the six bands in [contracts/page-blueprints.md](./contracts/page-blueprints.md) (photo hero → positioning → service 3-up → flagship bike → school & tours → inverse closing), renumber ids sequentially, and rewrite `seo`
- [X] T007 [US1] Remove the dead `navigation` key, the `product-list` node (`id 13`, `limit: 3`) and the plural "bikes ready to ride" framing from `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/home.json`, replacing the catalog moment with the flagship-bike pattern (5.5) whose name/price/specs match `mock-data/collections/products.json`
- [X] T008 [P] [US1] Mirror the finished home tree into `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/en--home.json` — identical structure, ids and box styles; English copy and `seo` only
- [X] T009 [P] [US1] Mirror the finished home tree into `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/de--home.json` — identical structure, ids and box styles; German copy and `seo` only
- [X] T010 [US1] Review `/`, `/en`, `/de` at 375/768/1280 against the per-page list in [quickstart.md](./quickstart.md): hierarchy, no headline collision, band alternation, no stranded grid item, first-party CTA present, real photography

**Checkpoint**: The homepage sets the visual bar every later page is measured against

---

## Phase 4: User Story 2 - Evaluating and buying a bike (Priority: P2)

**Goal**: The single real bike is presented as a deliberate flagship, and no category or "browse all" affordance implies a catalog the shop does not have

**Independent Test**: Load `/shop` and `/bikes/merida` in all three locales; confirm the flagship reads as intentional and that no category label, filter or browse control appears anywhere (V7)

### Implementation for User Story 2

- [X] T011 [US2] Re-author `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/shop.json` to the four bands in the blueprint (compact header → flagship bike on `muted` → ordering/service cross-link → `accent` closing), removing the `product-list` node (`id 300`) and every category/browse affordance
- [X] T012 [P] [US2] Mirror the shop tree into `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/en--shop.json` (strings and `seo` only)
- [X] T013 [P] [US2] Mirror the shop tree into `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/de--shop.json` (strings and `seo` only)
- [X] T014 [US2] Remove the dead inline `bike` object from `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/bikes--merida.json` (V6) and polish the 17 `labels` strings to the redesigned voice, keeping CTA verbs within real capability (FR-008)
- [X] T015 [P] [US2] Apply the same `bike` removal and label polish to `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/en--bikes--merida.json`
- [X] T016 [P] [US2] Apply the same `bike` removal and label polish to `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/de--bikes--merida.json`
- [X] T017 [US2] Verify `/shop` → `/bikes/merida` in all three locales: flagship name, price and specs match `collections/products.json`, the detail page still loads from the collection, and no category badge appears

**Checkpoint**: The commercial path is honest about one product and looks deliberate doing it

---

## Phase 5: User Story 3 - Judging credibility via Service and About (Priority: P2)

**Goal**: Pricing is scannable and specific; the About page reads as this shop in this town rather than interchangeable template copy

**Independent Test**: Load `/service` and `/about` in all three locales; check price-row alignment, FAQ behavior, and that no values copy could be pasted onto another business unchanged

### Implementation for User Story 3

- [X] T018 [US3] Re-author `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/service.json` to the five bands in the blueprint (compact header → price list rows (pattern 5.7) → how-it-works 4-up → FAQ accordions on an untinted band → quiet hairline closing), preserving all nine existing price tiers
- [X] T019 [US3] Renumber every block id in `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/service.json` so the duplicated ranges (298–330, 401–404) become unique, and remove the dead `navigation` key (V3, V4)
- [X] T020 [P] [US3] Mirror the service tree into `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/en--service.json` (strings and `seo` only)
- [X] T021 [P] [US3] Mirror the service tree into `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/de--service.json` (strings and `seo` only)
- [X] T022 [US3] Re-author `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/about.json` to the four bands in the blueprint (compact header → story → owner → values, closing without a CTA band) and rewrite the generic values copy into specifics about the workshop, the place and how the shop works
- [X] T023 [P] [US3] Mirror the about tree into `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/en--about.json` (strings and `seo` only)
- [X] T024 [P] [US3] Mirror the about tree into `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/de--about.json` (strings and `seo` only)

**Checkpoint**: The two trust pages carry specific, scannable content in the new system

---

## Phase 6: User Story 4 - Community pages: Brands, Bike school, Guided tours (Priority: P3)

**Goal**: Supporting pages match the site's polish — consistent cards, no orphan rows, no placeholder captions, and a first-party action on every page

**Independent Test**: Load `/brands`, `/bike-school`, `/guided-tours` and `/contact` in all three locales; confirm every grid row is complete at all widths and every page offers an action the shop owns

### Implementation for User Story 4

- [X] T025 [US4] Re-author `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/brands.json` to a compact header plus a `{ mobile: 1, tablet: 2, desktop: 4 }` grid of **eight** cards — the seven partners plus a "work with us" card linking to `/contact` — giving "Apače mlinarji" the link its siblings have, using `fit: "contain"` at a fixed height for logos, and removing the dead `navigation` key
- [X] T026 [P] [US4] Mirror the brands tree into `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/en--brands.json` (strings and `seo` only)
- [X] T027 [P] [US4] Mirror the brands tree into `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/de--brands.json` (strings and `seo` only)
- [X] T028 [US4] Re-author `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/bike-school.json` to the five bands in the blueprint, curating the `gallery` image count and order (5.9), and making the inverse closing band carry both the external Flat Out Days link and a first-party `/contact` action (FR-012)
- [X] T029 [P] [US4] Mirror the bike-school tree into `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/en--bike-school.json` (strings and `seo` only)
- [X] T030 [P] [US4] Mirror the bike-school tree into `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/de--bike-school.json` (strings and `seo` only)
- [X] T031 [US4] Re-author `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/guided-tours.json` to the five bands in the blueprint and **delete the gallery `subheading` that admits the photos are temporary** (V12), curating the gallery images instead
- [X] T032 [P] [US4] Mirror the guided-tours tree into `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/en--guided-tours.json` (strings and `seo` only)
- [X] T033 [P] [US4] Mirror the guided-tours tree into `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/de--guided-tours.json` (strings and `seo` only)
- [X] T034 [US4] Restyle `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/contact.json` to the token system (compact header + details/map grid), keeping the existing structure and inventing no business facts beyond what `config.ts` already holds
- [X] T035 [P] [US4] Mirror the contact tree into `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/en--contact.json` (strings and `seo` only)
- [X] T036 [P] [US4] Mirror the contact tree into `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/de--contact.json` (strings and `seo` only)

**Checkpoint**: All nine pages are authored in the new system

---

## Phase 7: User Story 5 - Consistent navigation and locale switching (Priority: P3)

**Goal**: Header, footer and locale switching are consistent everywhere and reflect the redesigned information architecture

**Independent Test**: Move between every page in each locale and confirm identical nav structure, a clean wordmark, and no locale left behind

- [X] T037 [US5] Rewrite `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/navigation.json`: `header` trimmed to six items (Servis, Trgovina, Vodene ture, Kolesarska šola, O nas, Kontakt), `footer` keeping all eight, and `footerCopy` rewritten — including a `tagline` that covers the full range of bikes the shop serves, not only mountain bikes
- [X] T038 [P] [US5] Mirror the navigation changes into `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/en--navigation.json` — identical ids, order and count; English labels
- [X] T039 [P] [US5] Mirror the navigation changes into `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/de--navigation.json` — identical ids, order and count; German labels
- [X] T040 [US5] Verify chrome across locales against the site-wide list in [quickstart.md](./quickstart.md): six header items plus the locale pill fit at 1024px without wrapping, the wordmark reads cleanly at 375px, the footer carries all eight links, and switching locale keeps the visitor on the same page

**Checkpoint**: Site chrome matches the redesigned pages in every locale

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Prove the whole site meets the spec's measurable outcomes, then sync Spec Kit

- [X] T041 Run the V1–V14 validation sweep from [quickstart.md](./quickstart.md) across `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/` — no page carries `navigation`, no page references `product-list`, no duplicate ids, no inline `bike`, every `text` node sets `color`, `fontSize` only on `variant: "body"`
- [X] T042 Compare the closing band of Home, Service, Shop, Bike school and Guided tours side by side against the closing-band budget in [contracts/page-blueprints.md](./contracts/page-blueprints.md) and confirm no layout-and-copy pattern repeats near-verbatim more than once (SC-003)
- [X] T043 Confirm all eight theme tokens from the Theme table in [data-model.md](./data-model.md) are visibly in play across the site and that no grid strands a lone item at 375/768/1280 (SC-004, SC-007)
- [ ] T044 Walk all nine pages in all three locales at 375/768/1280 against the per-page review list in [quickstart.md](./quickstart.md), checking German copy length in particular (SC-005)
- [ ] T045 Run the first-impression check in [quickstart.md](./quickstart.md) with three people unfamiliar with the project (5-second homepage test, then free browsing) and rework any page that draws an "AI-generated", "template" or "unfinished" reaction (SC-001, SC-008)
- [X] T046 [P] Update `.specify/memory/knowledge/mock-data.md` with the redesigned authoring conventions for this tenant (token-role colors, `fontSize`-with-`body` rule, no per-page `navigation`)
- [X] T047 [P] Update `specs/_catalogs/vukans-bike.md`: new page → band tables, the theme change, the trimmed header nav, the single-product catalog note, and that `product-list` is registered but currently unreferenced
- [X] T048 Run the full gate set from `next-headless-cms-fe/`: `pnpm type-check`, `pnpm lint:bike`, `pnpm lint:resort`, `pnpm build:bike`, `pnpm verify:build`
- [X] T049 Hand [contracts/shared-recommendations.md](./contracts/shared-recommendations.md) to the tenant owner for a separate decision — implement nothing from it without an explicit go-ahead (FR-013)

---

## Dependencies

```text
Phase 1 (Setup)
  └─> Phase 2 (Theme + asset inventory)  ⚠️ BLOCKING
        ├─> Phase 3  US1  Home                     🎯 MVP — sets the visual bar
        │     ├─> Phase 4  US2  Shop + bike detail
        │     ├─> Phase 5  US3  Service + About
        │     └─> Phase 6  US4  Brands, school, tours, contact
        ├─> Phase 7  US5  Navigation + chrome  (independent of page phases)
        └─> Phase 8  Polish  (requires all page phases)
```

**Story dependencies**: US2, US3 and US4 are independent of each other and each independently testable. They depend on US1 only for the visual precedent it establishes — technically they could be authored first, but the homepage is where the system is proven, so it goes first. US5 touches only navigation files and can run at any point after Phase 2.

## Parallel execution examples

Within each story, the two locale mirrors are independent files and can be done together:

```text
US1:  T008 + T009          (en--home.json, de--home.json)
US2:  T012 + T013          (en--shop.json, de--shop.json)
      T015 + T016          (en--bikes--merida.json, de--bikes--merida.json)
US3:  T020 + T021          (en--service.json, de--service.json)
      T023 + T024          (en--about.json, de--about.json)
US4:  T026 + T027 · T029 + T030 · T032 + T033 · T035 + T036
US5:  T038 + T039          (en--navigation.json, de--navigation.json)
Polish: T046 + T047        (knowledge doc, tenant catalog)
```

Whole story phases can also run in parallel once Phase 2 is complete, since no two stories share a file.

## Implementation strategy

**MVP**: Phases 1–3. A redesigned homepage on the new theme is independently valuable, demonstrable, and proves the design system before it is applied nine times.

**Increment 2**: Phase 4 (US2) — the commercial path, which is where the current design is weakest.

**Increment 3**: Phases 5–7 — trust pages, community pages and chrome.

**Always last**: Phase 8. The validation sweep and the first-impression check are what turn "pages were edited" into "the spec's outcomes are met", and the Spec Kit sync is required by the constitution in the same change set.

**If time is short**: cut scope by dropping *pages*, never by dropping locales on a page that ships — a half-localized page fails SC-005 and looks worse than an untouched one.
