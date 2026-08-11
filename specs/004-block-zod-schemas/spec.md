# Feature Specification: Block Prop Validation Schemas

**Feature Branch**: `004-block-zod-schemas`

**Created**: 2026-08-11

**Status**: Draft

**Input**: User description: "i want to add zod schemas to all the blocks that are missing it"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Catch bad CMS props early in development (Priority: P1)

As a developer working on a tenant site in development, I want every registered content block to validate its incoming props against a declared shape, so CMS or mock drift shows up as a clear warning instead of a silent broken section.

**Why this priority**: Today only two blocks validate props; most pages can ship mismatched content with no development signal. Closing that gap is the core value of this feature.

**Independent Test**: Open representative pages for each tenant in development; deliberately break one required prop in mock/CMS-shaped content for a previously unvalidated block; confirm a development warning names the block and failing fields, and the page still renders.

**Acceptance Scenarios**:

1. **Given** a registered content block that previously had no validation schema, **When** it is registered with a schema and receives valid props in development, **Then** no validation warning is logged for that block.
2. **Given** that block receives props that violate its schema in development, **When** the page renders, **Then** a warning identifies the block type and the failing paths, and rendering is not blocked.
3. **Given** production (or non-development) runtime, **When** the same invalid props are rendered, **Then** validation does not run (no extra cost / no production warnings from this path).

---

### User Story 2 - Shared and tenant blocks are equally covered (Priority: P1)

As a maintainer, I want every registered shared block and every registered tenant block (product and isolation fixture) that is missing a schema to gain one, so coverage is not limited to a single demo block per tenant.

**Why this priority**: Partial coverage leaves the same drift risk on most pages; “all missing” is the stated goal.

**Independent Test**: Inventory all registered block types; confirm each has a schema attached at registration except none left without; existing schemas remain in place and still work.

**Acceptance Scenarios**:

1. **Given** the shared block registry, **When** coverage is complete, **Then** every shared block type has a validation schema registered.
2. **Given** the product tenant block registry, **When** coverage is complete, **Then** every product tenant block type has a validation schema registered (including those that already had one).
3. **Given** the isolation-fixture tenant block registry, **When** coverage is complete, **Then** every fixture tenant block type has a validation schema registered (including those that already had one).

---

### User Story 3 - New blocks cannot skip schemas by convention (Priority: P2)

As an agent or contributor adding a new content block, I want project guidance to treat a prop validation schema as required for new blocks (not optional), so the gap does not reopen after this cleanup.

**Why this priority**: Without updating guidance, the next new block will recreate the same hole.

**Independent Test**: Read living Spec Kit block-system and tenant catalog guidance after the change; confirm new-block instructions require a schema and registration wires it.

**Acceptance Scenarios**:

1. **Given** Spec Kit block-system guidance, **When** a contributor follows “create a new block”, **Then** the documented checklist requires a prop validation schema and registering it with the block.
2. **Given** tenant catalogs that list blocks, **When** docs are updated for this feature, **Then** they no longer describe schemas as optional/rare exceptions for the covered tenants.

---

### Edge Cases

- Props include unknown keys (injected ids, allowlisted request params, `dataContract` payload): validation MUST NOT false-fail solely because of extra keys (same behavior as existing schemas that strip unknown keys).
- Blocks that load runtime data via `dataContract`: schema SHOULD validate the CMS/authoring props the block declares; injected collection/entity payloads may be omitted from the schema when they are not CMS static props (follow the existing room-list pattern).
- Header and footer chrome are not registry content blocks — they are out of scope.
- Unused but still registered blocks (e.g. shared blocks not used on every tenant) still get schemas because they remain in the registry.
- Invalid props in development warn only; pages must still render (no hard fail).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST attach a prop validation schema to every registered shared content block that currently lacks one.
- **FR-002**: System MUST attach a prop validation schema to every registered product-tenant content block that currently lacks one.
- **FR-003**: System MUST attach a prop validation schema to every registered isolation-fixture tenant content block that currently lacks one.
- **FR-004**: Existing block schemas that already work MUST remain registered and behaviorally equivalent (no regression of current development warnings).
- **FR-005**: Each new schema MUST describe the block’s authored prop shape (required vs optional fields and nested objects/enums as used by that block’s props contract).
- **FR-006**: Development validation MUST continue to warn on mismatch without blocking render; non-development MUST remain a no-op for this validation path.
- **FR-007**: Schemas MUST tolerate unknown keys on the validated object so injected runtime fields do not cause spurious failures.
- **FR-008**: Spec Kit block-system knowledge and affected tenant catalogs MUST be updated in the same change set so schemas are documented as required for registered content blocks going forward.
- **FR-009**: Registration for each covered block MUST wire its schema the same way existing validated blocks do today (schema attached at block registration).

### Key Entities

- **Content block**: A registered page-building unit with a type key, component, optional data loader, and (after this feature) a required prop validation schema.
- **Prop validation schema**: Declares the expected shape of authored block props used at render time in development.
- **Block registration**: Per-tenant or shared map that binds type → component (+ schema, data contract).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of registered content block types (shared + both tenants) have a prop validation schema attached at registration (zero registered content blocks left without one).
- **SC-002**: For a sample of at least one previously unvalidated block per registry (shared, product tenant, fixture tenant), introducing an invalid required prop in development produces a visible validation warning naming the block within one page load.
- **SC-003**: The same invalid-prop case in a production-like build does not emit this validation warning path (validation stays development-only).
- **SC-004**: A reviewer can confirm coverage by inspecting block registration alone in under 5 minutes (every entry lists a schema).
- **SC-005**: Living Spec Kit guidance no longer describes content-block prop schemas as optional after the feature ships.

## Assumptions

- “All blocks that are missing it” means all **registered content blocks** in shared + `vukans-bike` + `resort-example` registries — not header/footer chrome.
- Existing development-only warn behavior stays; this feature does not introduce production hard failures or CI gates that fail builds on schema mismatch.
- Zod remains the project’s established library for these schemas (already used by product `hero` and fixture `room-list`); schemas follow that authoring style (`z.object`, unknown keys stripped).
- `dataContract`-injected entities/collections are generally outside authored-prop schemas unless already validated today; unknown-key stripping covers merged extras.
- Unused registered shared blocks are in scope.
- Spec Kit knowledge/catalog updates are part of done, not a follow-up.
