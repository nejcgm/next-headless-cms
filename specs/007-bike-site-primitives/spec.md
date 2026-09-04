# Feature Specification: Vukan's Bike Site Primitives Redesign

**Feature Branch**: `007-bike-site-primitives`

**Created**: 2026-09-04

**Status**: Draft

**Input**: User description: "now when i have primitives i want to redesign the whole vukansbike website using mock json for now so for the sections and the components we can just use the primitives replace them and remove them keep only the components we can not replace with or build with primitives. also remove them from strapi"

## Clarifications

### Session 2026-09-04

- Q: How should shared opaque blocks that `resort-example` still uses (but Vukan's Bike no longer needs) be handled when removing them from the product surface? → A: Vukan's Bike is SOT — drop those blocks from resort fixture pages; do not rebuild them with primitives on resort; then delete the shared types.
- Q: Does this migration cover only shared opaque blocks, or also bike proprietary (tenant) blocks? → A: Both — shared opaques and bike proprietary expressible blocks are in scope to replace with primitives and remove; Keep list compounds stay.
- Q: What visual quality bar should the redesign meet beyond “uses primitives”? → A: Professional, craft-led brand site — not vibecoded template stacks; deliberate hierarchy, restraint, and place-specific atmosphere across all public pages.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entire bike site on the composition language (Priority: P1)

A visitor browses every public Vukan's Bike page (home, shop, service, about, contact, brands, bike school, guided tours, and bike detail) and sees a coherent, redesigned experience. Marketing and layout regions are authored as **Level 1 primitives and Level 2 compositions**. Pages no longer depend on opaque one-off section types that can be expressed with the shared primitive vocabulary.

**Why this priority**: Extends the home composition proof to the full product site so the CMS language is the default, not an exception.

**Independent Test**: With mock data, open each bike locale page (`sl` / `en` / `de`); confirm routes still work; confirm page trees use only allowed types (see Keep vs Replace); confirm no superseded opaque types remain in bike mock JSON.

**Acceptance Scenarios**:

1. **Given** mock adapter for Vukan's Bike, **When** a visitor opens each public page in each locale, **Then** the page loads with redesigned content and navigation chrome intact.
2. **Given** any bike mock page JSON, **When** its block tree is inspected, **Then** every node is either an L1 primitive, an L2 composition of primitives, or an approved L3 compound from the Keep list.
3. **Given** home and shop, **When** product listing regions render, **Then** `product-list` remains the catalog compound (not decomposed into CMS primitives).
4. **Given** a bike product URL, **When** the detail page renders, **Then** `bike-detail` remains the product-detail compound with existing catalog behavior.

---

### User Story 2 - Replace expressible sections with primitives (Priority: P1)

Authors rebuild expressible marketing and layout sections as trees of shared primitives (`section`, `stack`, `flex`, `grid`, `text`, `image`, `button`, …) instead of dedicated section components. **Design quality is a primary acceptance gate**, not a polish pass: the site must read as a professional workshop/trail brand (Apače, craft, place) — coherent type hierarchy, intentional spacing, real visual anchors, and restrained section rhythm. Reject generic “AI landing page” patterns (stacked unrelated promo blocks, vanity stat strips, card grids for non-interactive content, competing heroes, cluttered chip/pill rows).

**Why this priority**: Removing opaque sections without rebuilding content would blank pages; replacement is the core delivery, and a sloppy composition would undermine the product.

**Independent Test**: Diff bike mock pages before/after; each replaced type has a primitive-tree equivalent; visual review of every public page (mobile + desktop) against the professional-design checklist in FR-012 / SC-005–SC-006.

**Acceptance Scenarios**:

1. **Given** a page that previously used `hero`, `cta-banner`, `stats-bar`, `image-text`, or similar expressible marketing blocks, **When** redesigned, **Then** those regions are L1/L2 trees only.
2. **Given** about / bike-school / guided-tours / service narrative regions previously owned by tenant one-offs (`about-*`, `bike-school-intro`, `bike-school-program`, `guided-tour-experience`, `service-process`, `service-contact`, …), **When** redesigned, **Then** they are expressed with primitives unless listed under Keep.
3. **Given** redesigned pages, **When** viewed on mobile and desktop, **Then** layout remains usable (responsive grid columns and stacking where authored).
4. **Given** any public page first viewport, **When** reviewed, **Then** brand/place is the hero-level signal, with one clear headline, one short support line, and one CTA group — not a dashboard of competing modules.
5. **Given** each page section, **When** reviewed, **Then** it has one primary job and does not rely on decorative card chrome or filler metric strips to look “complete.”

---

### User Story 3 - Keep only irreducible compounds (Priority: P1)

Complex interactive or data-bound experiences that cannot be faithfully rebuilt as CMS primitive trees remain as Level 3 compounds and stay registered.

**Why this priority**: Prevents fake decompositions that lose maps, accordions, pricing tables, galleries, or catalog wiring.

**Independent Test**: Inventory Keep list against registry and mocks; each Keep type is still used where needed; no Keep type is deleted.

**Acceptance Scenarios**:

1. **Given** the Keep list below, **When** the feature completes, **Then** those block types remain available for bike pages that need them.
2. **Given** a Keep compound, **When** placed on a page beside L1/L2 nodes, **Then** it participates as a tree leaf (no CMS-exposed inner slots unless already designed).

**Keep (Level 3 / chrome — do not remove)** — all are bike proprietary compounds or site chrome:

| Type | Ownership | Reason irreducible |
|------|-----------|-------------------|
| `product-list` | Bike proprietary | Catalog `dataContract`, product cards, stock labels |
| `bike-detail` | Bike proprietary | Catalog `dataContract`, product gallery/specs UX |
| `gallery` | Bike proprietary | Lightbox / expand interaction beyond static images |
| `partners-gallery` | Bike proprietary | Partner entities with logos, blurbs, outbound links |
| `service-pricing` | Bike proprietary | Structured packages/prices/features tables |
| Header / footer chrome | Bike templates | Site templates — not page DZ blocks |

**Replace with L1/L2 (then remove)** — migration scopes **both** shared opaques and bike proprietary expressible sections:

| Type | Ownership | Typical replacement |
|------|-----------|---------------------|
| `cta-banner` | Shared | `section` + `stack` / `text` / `button` |
| `stats-bar` | Shared | `section` + `grid` / `stack` / `text` |
| `image-text` | Shared | `section` + `grid` + `image` + `stack` |
| `section-header` | Shared | `text` (`fontSize` + `bold`) + body `text` |
| `rich-text`, `image-gallery` (when used on bike) | Shared | Prefer `text` / `image`+`grid`; default is replace and drop if unused |
| `hero` | Bike proprietary | `section` (image/overlay) + `text` / `button` |
| `about-story`, `about-person`, `about-values` | Bike proprietary | `section` / `grid` / `stack` / `image` / `text` / `button` |
| `bike-school-intro`, `bike-school-program` | Bike proprietary | Same primitive vocabulary (program tiers as stacks of text) |
| `guided-tour-experience` | Bike proprietary | `section` + `grid`/`stack` of text (+ optional images) |
| `service-process`, `service-contact` | Bike proprietary | `section` + stacks/buttons (process as ordered text stacks) |
| `contact` | Bike proprietary | `section` + `grid`/`stack` + `text`/`link`/`icon` + `iframe` (map) |
| `heading` | Shared | `text` with `fontSize` + `bold` (+ `color`) |
| `service-faq` | Bike proprietary | L1 intro/CTA + shared `accordion` (items) |

---

### User Story 4 - Remove superseded types from product surface and Strapi (Priority: P2)

After bike pages no longer reference a replaceable type, that type is removed from the bike frontend registry and from the Strapi content model (component schemas and page dynamic zone). Dead code and seed references are cleared. **Vukan's Bike is the source of truth** for which shared types survive: if a shared opaque is not needed by bike after redesign, remove it from the product surface even if `resort-example` still references it. For the fixture, **drop those blocks from the page trees** (do not redesign resort with primitives). Resort tenant-only compounds that are not shared stay as-is for build isolation.

**Why this priority**: Cleanup prevents Component Pokémon and keeps mock/Strapi models aligned to the product tenant.

**Independent Test**: Grep bike mocks/registry for removed types (zero hits); Strapi page DZ and component folders lack removed types; `resort-example` mocks no longer reference deleted shared opaques (nodes removed, not replaced); bike mock pages still validate; fixture tenant still builds.

**Acceptance Scenarios**:

1. **Given** a replaced bike-tenant block type unused after redesign, **When** cleanup runs, **Then** it is removed from bike block registration and Strapi components / page DZ.
2. **Given** a shared opaque type bike no longer needs, **When** cleanup runs, **Then** it is removed from shared registration and Strapi, and any `resort-example` page nodes of that type are deleted (not rebuilt as primitive trees).
3. **Given** Keep types, **When** cleanup runs, **Then** they remain in registration and Strapi.
4. **Given** seed/reference scripts for bike, **When** updated, **Then** they author L1/L2 + Keep types only.

---

### Edge Cases

- Localized triples (`home.json`, `en--*`, `de--*`) must stay in sync structurally; copy differs by locale only.
- Removing a Strapi component that still appears in live Strapi content requires content migration or re-seed; for this feature **mock-first** is the delivery surface, with Strapi schema cleanup prepared for the same model.
- Illegal nesting after redesign must fail soft validation (drop + warn in development) without crashing the page.
- Empty optional headings on compounds (e.g. blank `product-list` heading when framed by primitives) must not render empty chrome.
- `resort-example` remains a build-isolation fixture: when shared opaques are deleted because bike no longer needs them, **drop** those nodes from resort mock pages — do not rebuild resort with primitives; do not treat resort as a second product redesign.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST redesign all public Vukan's Bike pages in mock JSON using the shared L1 primitive vocabulary plus approved L3 Keep compounds only.
- **FR-002**: System MUST preserve locales `sl`, `en`, and `de` for every redesigned page with equivalent information architecture.
- **FR-003**: System MUST NOT leave replaceable opaque section types in bike mock page trees after migration — covering **both** shared opaques and bike proprietary expressible blocks listed under Replace.
- **FR-004**: System MUST retain Keep compounds (`product-list`, `bike-detail`, `gallery`, `partners-gallery`, `service-pricing`) and shared interactive leaves (`accordion`) where the page needs their irreducible behavior.
- **FR-005**: System MUST remove superseded bike proprietary block implementations from the bike registry once unused.
- **FR-006**: System MUST remove superseded Strapi components from the page dynamic zone and delete unused component definitions that no tenant content requires (shared and bike proprietary alike when bike no longer needs them).
- **FR-007**: System MUST drop (delete, not rewrite) any `resort-example` mock page nodes whose shared opaque types are deleted because Vukan's Bike no longer needs them, so the fixture keeps building without depending on those types.
- **FR-008**: System MUST update Spec Kit knowledge and the Vukan's Bike catalog to reflect the new page→block map and Keep/Replace inventory (shared vs proprietary ownership called out).
- **FR-009**: Redesigned pages MUST remain readable and navigable on common mobile and desktop widths.
- **FR-010**: Delivery for visitor-facing verification MUST work with the bike mock data adapter; Strapi schema cleanup MUST match the same content model even if live re-seed is a follow-on ops step.
- **FR-011**: Migration scope MUST include shared opaque blocks and bike proprietary (tenant) blocks; resort proprietary blocks are out of scope except dropping deleted shared nodes per FR-007.
- **FR-012**: Redesigned pages MUST meet a professional craft bar: brand-first first viewport; one job per section; real place/product imagery as visual anchors where a section needs atmosphere; clear typographic hierarchy (display/title/section vs body/lead); generous but purposeful spacing; no vanity stats strips, no non-interactive card grids for marketing filler, no competing full-bleed bands stacked for “more wow,” and no chip/pill/badge clutter. Copy and composition MUST feel specific to Vukan's Bike in Apače — not a interchangeable template.

### Key Entities

- **Page composition tree**: Ordered root blocks; layout nodes carry nested `slots`.
- **Level 1 primitive**: Shared layout/content atom with optional box styles and composition policy.
- **Level 2 composition**: Authored subtree of L1 (no separate type).
- **Level 3 compound**: Encapsulated domain block (Keep list) with optional data loading — bike proprietary unless noted.
- **Shared opaque**: Former multi-tenant section type (e.g. `cta-banner`) expressible with L1/L2 and scheduled for removal when bike no longer needs it.
- **Bike proprietary block**: Tenant-only section or compound under Vukan's Bike (expressible ones Replace; irreducible ones Keep).
- **Superseded section type**: Shared opaque or bike proprietary expressible block replaced by L1/L2 and scheduled for removal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of public bike pages in all three locales load successfully from mock data after redesign.
- **SC-002**: 0 references to the Replace list remain in bike mock page JSON.
- **SC-003**: 100% of Keep-list capabilities still appear on the pages that previously relied on them (catalog, FAQ, pricing, galleries, partners, bike detail); contact map/address remains via L1 `iframe` + stacks.
- **SC-004**: Superseded types (shared and bike proprietary) show 0 registrations where removed and 0 Strapi page-DZ entries after cleanup.
- **SC-005**: A reviewer can open every public bike page and confirm each primary section has a single clear purpose, brand-consistent presentation, and professional restraint (not leftover opaque sections or vibecoded filler).
- **SC-006**: On a structured design review of home, service, about, shop, contact, bike school, guided tours, and brands, the first viewport of each marketing page passes the brand/hero-budget test (brand or place remains dominant if nav were ignored), and zero pages rely on vanity metric strips or decorative card grids as the main section idea.

## Assumptions

- Design quality is an acceptance gate: professional craft-led brand presentation across all public pages; vibecoded / generic template aesthetics are out of scope for “done.”
- Migration scope covers **shared opaques and bike proprietary** expressible blocks; Keep list bike compounds stay; resort proprietary blocks stay except shared-node drops.
- Mock JSON is the primary authoring and verification surface for this feature; live Strapi content is re-seeded or migrated using the same schemas afterward.
- Header and footer stay template chrome (not rebuilt as page primitives).
- No new primitives are required beyond the existing L1 set for this redesign; if a gap appears, prefer composition first.
- Vukan's Bike decides which shared types remain; `resort-example` only drops deleted shared nodes from mock pages so the fixture still builds — not a product redesign and not a primitive rewrite of resort.
- Visual editor remains out of scope; trees are hand-authored in JSON.
- Pricing tables, partner gallery lightbox/links, and product catalog UIs stay compounds rather than lossy primitive approximations. FAQ uses shared `accordion` + L1 framing. Contact map/address is L1 (`iframe` + stacks/links).
