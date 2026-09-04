# Feature Specification: Bike Home Shared Composition

**Feature Branch**: `006-bike-home-shared-compose`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "Refactor Vukan's Bike (start with home) to use as many primitive and composable shared components as possible so editors can build/customize most of a site from shared components; follow project architecture and clean reuse; decide best architecture after reviewing prior composition experiments (reverted); remove obsolete proprietary bike tenant blocks that shared replacements supersede."

## Clarifications

### Session 2026-08-13

- Q: How much nesting should editors get when customizing shared page sections on home? → A: Constrained nesting; max depth is **per component** (not a global one-level rule for all). Plan/design chooses allowlists and depth caps per shell; no unlimited free-form layout trees.
- Q: For this home delivery, which nested-capable shared shells should editors actually get? → A: Adopt a **composable component-tree** model (layout / content / interactive primitives). Home is reconstructed from a small vocabulary via nesting (e.g. flex→image+stack→text/button, accordion→items→text). Predefined “HeroSection / FAQSection” style one-offs are not the long-term target; reusable “sections” become saved compositions of the same tree. Start with **few primitives sufficient to rebuild home**, adapted to this project’s architecture and CMS.
- Q: For nesting, children-only vs named slots — and how are allowlists enforced? → A: **Slots are in** (including a default/children slot where a type only needs one list). Each component declares validated composition rules for its slots (which node types each slot may hold, plus per-component depth). In this codebase that means per-component **schema validation** (Zod, matching existing block conventions). Leaves have no child slots. Types that need named regions (e.g. media vs content) use named slots with their own allowlists — not a separate system from “children.”
- Q: On rebuilt home, primitives-only vs keeping high-level sections? → A: **B modified**: Home proves the **shared component tree**, with **primitives (and compositions of them) as the default**. Genuinely complex / high-value components may remain **atomic compound nodes** in the same tree where decomposing them into CMS nodes would be impractical (e.g. catalog product list, configurators with domain state). **Composable ≠ decomposable**: compounds participate in the tree (can sit beside Flex/Image/Text) without exposing their internals as CMS nodes. Three levels: (1) primitives, (2) compositions built from primitives, (3) encapsulated compound components. Not a purity test that everything must be carved into atoms.
- Q: For this home delivery, rebuild expressible marketing as Level 1/2 now, or keep some as temporary compounds? → A: **Option A**: Rebuild all expressible home marketing regions (hero, stats, promo/image+text, CTA-class, and any similar) as **Level 1/2** in this feature. For home MVP, the **only** retained existing Level 3 compound is **product list**; do not leave stats-bar, cta-banner, image-text, hero, or other expressible marketing blocks as temporary compounds on home.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Home rebuilt on the shared tree (Priority: P1)

A site visitor opens the Vukan's Bike home page and sees the same essential experience as today: hero with primary messaging and actions, social-proof stats, a service/promo content section, a featured product listing, and a closing call-to-action — authored as a **shared component tree**. All expressible marketing regions are **Level 1 primitives and/or Level 2 compositions**. The **only** Level 3 compound on home for this delivery is **product list** (existing catalog block).

**Why this priority**: Home is the reference surface for a composable CMS with a single justified escape hatch.

**Independent Test**: Load home; confirm content roles match today; confirm structure is a shared tree of Level 1/2 plus product list only as Level 3; confirm no other opaque marketing section types remain on home.

**Acceptance Scenarios**:

1. **Given** home content for Vukan's Bike, **When** a visitor opens home, **Then** they see hero, stats, service/promo, featured products, and closing CTA in an equivalent order and purpose to today.
2. **Given** home’s marketing regions (hero/stats/promo/CTA-class), **When** inspected as content structure, **Then** they are Level 1/2 trees only — not opaque shared section types (`stats-bar`, `cta-banner`, `image-text`, tenant hero, etc.) left as temporary compounds.
3. **Given** featured products, **When** home renders, **Then** **product list** is the sole Level 3 compound node, with existing catalog data behavior, not decomposed into CMS primitives.
4. **Given** product list, **When** placed beside or inside a layout primitive, **Then** composition still works — the compound participates as a leaf in the tree language.

---

### User Story 2 - Shared UI language (primitives, compositions, compounds) (Priority: P1)

Authors and builders share a small vocabulary in three levels:

- **Level 1 — Primitives**: layout (section/container, stack, flex, grid, …) and content (text/heading, image, button/link, …); interactive primitives only as needed (e.g. accordion family).
- **Level 2 — Compositions**: saved or documented subtrees built from Level 1 (e.g. “FAQ”, “Image + content”, “CTA”) — not a separate renderer.
- **Level 3 — Compound components**: encapsulated nodes for complex domain UI. On **home for this feature**, only **product list**. Other compounds (configurator, booking, maps, …) may join later under the same model.

Composition creates most design. Each type declares **slots** and **validated rules** (allowlists + per-component max depth). Leaves (including compounds that do not expose CMS children) have no nesting slots unless designed to.

**Why this priority**: Composable system with escape hatches scales better than primitives-only purity or endless section types.

**Independent Test**: Document home vocabulary by level; rebuild all home marketing regions with Level 1/2; keep only product list as Level 3; verify illegal nests fail schema validation.

**Acceptance Scenarios**:

1. **Given** the shared vocabulary for home, **When** a builder reconstructs marketing regions, **Then** they use Level 1/2 without opaque marketing section types on home.
2. **Given** a parent node (e.g. flex, stack, accordion), **When** children are added to a slot, **Then** only allowlisted types (including product list where allowed) within max depth pass validation.
3. **Given** a leaf primitive or product list, **When** child slots are populated, **Then** validation fails (non-nesting leaves).
4. **Given** tenant theme tokens, **When** the tree renders, **Then** presentation respects branding; shared Level 1/2 stay tenant-agnostic; product list may use tenant catalog services.
5. **Given** a type that needs distinct regions, **When** used, **Then** named slots use the same validation model as a default children slot.

---

### User Story 3 - Remove superseded bike-only sections (Priority: P2)

After home uses the shared tree, bike-tenant (and home-used shared opaque) section types fully replaced by Level 1/2 and unused are removed. On home, **product list** is the only intentional Level 3 retention.

**Why this priority**: Avoids Component Pokémon while keeping one justified catalog escape hatch.

**Independent Test**: Inventory bike registered types vs usage; remove superseded unused types; home still passes Story 1 with product list as sole L3.

**Acceptance Scenarios**:

1. **Given** a bike-only or home-used opaque marketing section type replaced by Level 1/2, **When** unused elsewhere after migration, **Then** it is removed from the tenant / home surface as applicable.
2. **Given** product list, **When** the feature completes, **Then** it remains as the only Level 3 compound on home.
3. **Given** removal of superseded types, **When** seed/reference home content is checked, **Then** it only references Level 1/2 types plus product list.

---

### Edge Cases

- Illegal slot children or exceeding a node’s max depth must not crash the page; invalid structure fails schema validation or is safely omitted with a clear development signal.
- Leaves and non-nesting compounds must not expose nesting slots unless explicitly designed to.
- Do not artificially decompose product list into CMS primitives; do not retain other opaque marketing blocks on home as “temporary” Level 3.
- Shared Level 1/2 must not encode bike-specific copy, URLs, or catalog assumptions.
- Locale variants of home (sl/en/de) must keep equivalent structure/roles.
- Missing/removed types in content must not yield a silently empty main — treat as migration defects.
- Empty catalog for products remains handled as today.
- Other tenants consuming today’s shared flat sections must not break; migration is additive or carefully compatible.
- Saved composition gallery (Level 2 library) is follow-on unless planning includes it; home may hard-author compositions.
- Visual / drag-and-drop composition editor is **out of scope** for this feature; authors use mock/seed/Strapi JSON (`slots`). Architecture enables composition; comfortable editor UX is a follow-on.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST deliver Vukan's Bike home as a **shared component tree**, preserving visitor-facing roles and order unless a documented content migration says otherwise.
- **FR-002**: For this home delivery, System MUST retain **product list** as the **only** Level 3 compound on home, keeping existing catalog data/integration behavior without CMS-visible internal decomposition. Architecture MAY allow additional Level 3 compounds later; home MVP MUST NOT use them for marketing regions.
- **FR-003**: System MUST rebuild all home marketing regions (hero, stats, promo/image+text, CTA-class, and equivalents) as **Level 1 and/or Level 2** — MUST NOT leave those as opaque temporary compounds on home.
- **FR-004**: System MUST provide a **minimal Level 1 shared vocabulary** sufficient for those regions, and MAY document hard-authored Level 2 compositions (same renderer; gallery optional).
- **FR-005**: System MUST represent home content as a **tree of nodes** (`type`, props, **slots**). Level 1, Level 2, and product list participate in the same tree model.
- **FR-006**: System MUST enforce **per-component composition rules via schema validation** (project convention: Zod): slots, per-slot allowlists (which MAY include product list), and per-component max depth.
- **FR-007**: System MUST render the tree via a recursive shared renderer that resolves types from a registry and renders validated slot children.
- **FR-008**: System MUST apply tenant theme tokens to shared primitives/compositions; product list follows existing tenant theming/integration patterns.
- **FR-009**: System MUST remove bike-tenant proprietary section implementations (and home usage of opaque shared marketing sections) this feature fully replaces with Level 1/2 and that are unused after migration.
- **FR-010**: System MUST update project documentation (tenant catalog + composition rules + Level 1 vs product-list Level 3) when vocabulary or home tree shape change.
- **FR-011**: System MUST keep one-build-one-tenant isolation and layer boundaries (shared Level 1/2 must not import tenants; product list remains tenant-owned).
- **FR-012**: System MUST NOT grow one-off page sections for layouts Level 1/2 can express; MUST NOT explode product list into CMS atoms.
- **FR-013**: Interactive Level 1 primitives for home MUST stay minimal.
- **FR-014**: Named slots and default children slots MUST use the same validation model.
- **FR-015**: Classification for this feature: expressible marketing → Level 1/2 now; **only product list** → Level 3 on home. Future Level 3 types follow the domain-state decision test (variants, pricing, inventory, booking, maps, etc.).

### Key Entities

- **Component node**: Tree node — identity, type, props, slots.
- **Slot**: Named child collection with allowlisted child types (may include compounds).
- **Primitive (Level 1)**: Layout/content/(minimal) interactive building block.
- **Composition (Level 2)**: Reusable subtree of primitives (authored or saved template) — same renderer.
- **Compound (Level 3)**: Encapsulated component in the tree; composable with primitives; not necessarily decomposable in CMS.
- **Composition schema**: Per-type Zod (project convention) for props + slots + allowlists + depth.
- **Tenant catalog compound (home MVP)**: **product list** — the only Level 3 node on home, with data loading.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Home marketing regions (hero, stats, promo, CTA-class) are Level 1/2 only; **product list** is the only Level 3 node on home.
- **SC-002**: Authors/builders can change those marketing regions via node props/slots without opaque marketing section types on home.
- **SC-003**: After completion, zero unused superseded bike-only section types remain for types replaced by Level 1/2; home does not reference opaque shared marketing blocks as compounds.
- **SC-004**: Home locale variants still render the same content roles without blank main from missing types.
- **SC-005**: Each type used on home is documented as Level 1, 2, or (product list only) Level 3 with slot rules.
- **SC-006**: Illegal nests fail validation and do not take down the page.
- **SC-007**: Home demonstrates product list participating in the same tree as primitives (adjacent or nested under a layout node where allowlisted).
- **SC-008**: Product list is not exploded into an impractical CMS atom tree.

## Assumptions

- **Target architecture**: Composable UI language with three levels — primitives, compositions, compounds. Adjusted to this monorepo.
- **Home MVP Level 3 set**: **product list only**; other Level 3 types are out of scope for home content even if the registry could support them later.
- **Default vs escape hatch**: Marketing → Level 1/2 now; catalog product list → Level 3.
- **Start small**: Level 1 kit sized for current home; expand later.
- **Slots + schema**: First-class; Zod per project convention.
- **CMS storage**: Tree + slots semantics required; storage mapping is planning.
- **Visual intent**: Preserve home roles/branding; not a marketing redesign.
- **Opaque shared sections elsewhere**: Other pages/tenants may still use today’s shared sections until migrated; home must not.
- **Resort / other tenants**: Need not fully migrate this feature; shared changes safe/additive.
- **Saved Level 2 gallery**: Optional follow-on.
- **Visual editor**: Out of scope; this feature is runtime + home trees, not in-admin builder UX.
- **Stale knowledge**: Update docs that only describe flat opaque sections when this lands.
- **maxDepth**: Per-node subtree limit; parent depth does not accumulate onto child policies (see plan/data-model).
- **Validation**: Adapter is primary composition gate; registry owns policy with schema.
