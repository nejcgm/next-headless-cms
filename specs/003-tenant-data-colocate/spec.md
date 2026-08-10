# Feature Specification: Colocate Tenant Mock Data

**Feature Branch**: `003-tenant-data-colocate`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "ok lets migrate the mockdata into each tenant id folder so the mock data for each tenant will live under its tenant id" — move each tenant’s mock/seed JSON content so it lives under that tenant’s own package folder (with the tenant id), instead of a shared central mock-data tree under the core engine.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Find a tenant’s content files with the tenant (Priority: P1)

As a developer or agent working on one tenant, I want that tenant’s mock/seed page and collection JSON to live under the same tenant id package as its config and blocks, so I do not hunt a separate core tree or confuse engine code with tenant content.

**Why this priority**: This is the whole migration goal — clearer ownership and folder mental model.

**Independent Test**: For each existing tenant, open the tenant package folder and find its content JSON there (pages/navigation/collections as applicable); the old central mock-data tree under core no longer holds those files.

**Acceptance Scenarios**:

1. **Given** the product tenant package, **When** someone looks for its seed/mock JSON, **Then** those files live under that tenant’s id folder (not under a shared core mock-data location).
2. **Given** the isolation-fixture tenant package, **When** someone looks for its mock JSON, **Then** those files live under that fixture’s tenant id folder.
3. **Given** migration is complete, **When** someone searches the former central mock-data location under core, **Then** tenant content trees are gone from there (no duplicate sources of truth).

---

### User Story 2 - Builds and tooling still isolate tenants (Priority: P1)

As a maintainer, I want one-build-one-tenant isolation, tenant scaffolding, setup checks, and CMS seeding (where used) to keep working after the move, so colocation does not break plug-and-play or leakage verification.

**Why this priority**: A folder move that breaks build isolation or seed is a regression.

**Independent Test**: Build/verify each tenant; create/check-tenant expectations point at the new location; product seed still finds bike content JSON.

**Acceptance Scenarios**:

1. **Given** a mock-adapter tenant build, **When** isolation verification runs, **Then** another tenant’s content files are not present in that build’s output (same bar as today).
2. **Given** a Strapi-adapter product tenant, **When** the site runs against the CMS, **Then** runtime behavior is unchanged (seed/reference JSON may still exist under the tenant folder for seeding/shape reference, without being required at runtime).
3. **Given** new-tenant scaffolding and tenant setup checks, **When** a contributor adds or validates a tenant, **Then** content stubs and required-file checks use the per-tenant-id location.
4. **Given** the existing product seed process, **When** seed runs after migration, **Then** it reads JSON from the product tenant’s colocated content folder.

---

### User Story 3 - Docs and Spec Kit match reality (Priority: P2)

As an agent or new contributor, I want Spec Kit knowledge, catalogs, and human FE docs to describe the colocated layout only, so nobody is sent back to the old core mock-data path.

**Why this priority**: Prevents immediate drift after the move.

**Independent Test**: Search project guidance for the old central path; only historical feature specs (if any) may mention it; living docs point at tenant-id folders.

**Acceptance Scenarios**:

1. **Given** Spec Kit knowledge and tenant catalogs, **When** migration ships, **Then** they describe content under each tenant id package and no longer require the old core mock-data tree.
2. **Given** human frontend docs that mention mock/seed paths, **When** migration ships, **Then** those paths are updated in the same change set.

---

### Edge Cases

- Tenant id folder name vs former short mock folder name (e.g. fixture previously used a shorter folder name): after migration, content lives under the **tenant id** folder; obsolete short-name mapping is removed or unused.
- Strapi product tenant: colocated JSON remains for seed/reference; runtime still must not pull another tenant’s content.
- Empty or missing content folder for a brand-new scaffolded tenant: setup check fails clearly until stubs exist (same expectation as today, new path).
- Backend seed and frontend scripts must not leave a second copy of the trees under the old location.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST store each tenant’s mock/seed content JSON under that tenant’s own package folder identified by the tenant id.
- **FR-002**: System MUST remove tenant content trees from the former shared core mock-data location so there is a single source of truth per tenant.
- **FR-003**: System MUST preserve one-build-one-tenant isolation: a tenant build MUST NOT include another tenant’s colocated content files.
- **FR-004**: System MUST update tenant scaffolding so new tenants create content stubs under their tenant id folder.
- **FR-005**: System MUST update tenant setup validation to require content files at the colocated path (for tenants that use mock content or seed stubs as today).
- **FR-006**: System MUST update the product CMS seed process to read from the product tenant’s colocated content folder.
- **FR-007**: Spec Kit knowledge, tenant catalogs, sync map entries, and human FE docs that describe mock/seed locations MUST be updated in the same change set as the file move.
- **FR-008**: Runtime page composition and adapter selection (mock vs Strapi per tenant) MUST remain behaviorally equivalent aside from file location.

### Key Entities

- **Tenant package**: The per-tenant-id folder holding config, blocks, templates, and (after this feature) colocated content JSON.
- **Tenant content JSON**: Pages, navigation, collections, sitemap (and similar) used for mock runtime and/or CMS seed/reference.
- **Isolation fixture tenant**: Non-product tenant kept so leakage checks remain meaningful; its content also colocates under its tenant id.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of existing tenants that had content under the old central tree have that content under their tenant id package after migration (zero tenants left only on the old path).
- **SC-002**: A reviewer can locate a tenant’s content JSON in under 30 seconds by opening that tenant’s package folder alone.
- **SC-003**: Isolation verification still passes for each built tenant (no cross-tenant content leakage introduced by the move).
- **SC-004**: New-tenant happy path creates content stubs only under the new tenant’s id folder (not under a shared core mock tree).
- **SC-005**: Living Spec Kit + FE human docs contain zero required references to the old central mock-data location for current work.
- **SC-006**: Product seed completes using the colocated product content folder (no dependency on the deleted old path).

## Assumptions

- Colocation means a dedicated content subfolder under `tenants/{tenant-id}/` (name to be fixed in planning — e.g. `data/`), always keyed by tenant id (not a separate short folder name under core).
- Former short-folder aliases (fixture mapped to a different folder name) are eliminated in favor of the tenant id path.
- Alias/indirection used by the mock adapter may remain; only the on-disk location changes.
- No change to Strapi schemas, block components, or public site UX beyond path plumbing.
- `resort-example` remains an isolation fixture; content moves with it but fidelity is still not a product goal.
- Principle VII applies: minimal comments; clear folder ownership; update docs in the same change set.

## Out of Scope

- Redesigning mock JSON shape or migrating fixture legacy page format
- Changing which tenants use mock vs Strapi adapters
- Extracting a monorepo shared package for content
- New CMS features, preview, or webhook work
