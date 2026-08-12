# Feature Specification: FE Options Types Coverage

**Feature Branch**: `005-fe-options-types-coverage`

**Created**: 2026-08-12

**Status**: Draft

**Input**: User description: "Complete coverage of the new TypeScript options-object / module `types.ts` rules across the whole frontend codebase (app, core, shared, tenants). Prior partial pass left cases such as Strapi adapter helpers with 3+ positional parameters; scan and bring everything remaining into compliance."

## Clarifications

### Session 2026-08-12

- Q: Should “done” mean the entire frontend follows both the component props pattern and the multi-field function options pattern, including leftovers? → A: Whole FE package; **functions** use the **3+ parameters → options object** rule; **components always** use a named props type from the module `types` file (canonical examples: ProductList + loadPageWithNavigation).
- Q: Should thin Next.js route shells also move props types into a nearby `types.ts`? → A: **Always** — every component including `page` / `layout` / `error` / `not-found` route shells gets props in a `types.ts` (no local carve-out).
- Q: Should small shared utilities with three simple values (format/logger) convert to options objects or stay excepted? → A: **Convert all** project-owned 3+ arg helpers (including format/logger); exceptions **only** platform/third-party APIs and React memoization primitive-key internals.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consistent contributor experience (Priority: P1)

A developer or agent editing any frontend module sees two consistent patterns: (1) **components** always take a single props object typed from the module `types` file; (2) **functions/methods** with three or more parameters take a single options object typed from that module’s `types` file (or global domain types). They do not guess which helpers still use long positional lists or which components still colocate props.

**Why this priority**: Incomplete adoption causes confusion and regressions; the user already found leftovers after a first pass.

**Independent Test**: Inventory (a) React components for props typing via module `types`, and (b) callables with three or more parameters for options objects. Every in-scope item matches the dual rule (or a documented exception). Random sample includes private adapter helpers and tenant/shared blocks.

**Acceptance Scenarios**:

1. **Given** a frontend **function or method** that previously took three or more positional parameters (including private methods), **When** a contributor opens its definition, **Then** it accepts a single options object whose type is declared in the module `types` file (or global `core/types` when domain-shared)—as in `loadPageWithNavigation({…}: TenantPageParams)`.
2. **Given** a frontend **component** (including Next.js route shells such as page, layout, error, and not-found), **When** a contributor opens its definition, **Then** it destructures a single props object typed from the module `types` file (e.g. `ProductListProps` or route `PageProps`)—never an ad-hoc colocated props interface in the component/route file.
3. **Given** a call site in `app/`, `core/`, `shared/`, or `tenants/`, **When** it invokes an in-scope multi-field function, **Then** it passes a named options object—not a positional list of three or more values.
4. **Given** the Spec Kit TypeScript conventions, **When** a contributor reads them, **Then** they state whole-frontend scope, **components always** / **functions at 3+**, private-method inclusion, and the documented exceptions list.

---

### User Story 2 - No silent leftovers in content-loading path (Priority: P1)

Content-loading and cache-tag helpers that still use long positional signatures (for example adapter-internal fetch helpers and tag builders with three or more inputs) are brought in line so the data layer matches the public options style already introduced.

**Why this priority**: These paths are high-churn and were explicitly called out as missed.

**Independent Test**: Review CMS adapter helpers, remote list-fetch APIs with three or more inputs, and cache-tag builders with three or more inputs; all in-scope entries use options objects with types in the owning module types file.

**Acceptance Scenarios**:

1. **Given** an adapter-internal helper that loads one content row using collection, query, and cache settings, **When** it is invoked, **Then** those fields are passed as one typed options object.
2. **Given** a cache-tag builder that needs tenant plus two or more other dimensions, **When** it is used from adapters or revalidation entry points, **Then** callers pass one options object (not three or four positional values).
3. **Given** list/pagination content-fetch helpers that take collection, query, and cache options as separate parameters, **When** refactored, **Then** they follow the same options-object pattern as single-request fetch.

---

### User Story 3 - Regression guard for the convention (Priority: P2)

The team can verify compliance without a manual full-repo read each time—via an automated check and/or an explicit inventory checklist tied to Spec Kit—so new three-parameter positional APIs and untyped/colocated component props are not reintroduced casually.

**Why this priority**: Prevents a second incomplete pass; secondary to finishing the migration itself.

**Independent Test**: Run the agreed compliance check against the frontend after migration; it reports zero in-scope violations for both rules. Adding a deliberate three-arg positional helper or a component with colocated props fails the check.

**Acceptance Scenarios**:

1. **Given** the migrated frontend, **When** the compliance check runs, **Then** it reports no in-scope violations for functions (3+) or components (always).
2. **Given** a new in-scope function with three positional parameters **or** a component with colocated props types is introduced, **When** the compliance check runs, **Then** it fails with a clear pointer to the offending symbol.

---

### Edge Cases

- React request memoization helpers that must key on primitive arguments: public API may still use an options object while an internal primitive-keyed implementation remains (already established pattern)—document as an exception, not a violation.
- Third-party / platform APIs (DOM listeners, framework APIs, utility class-name mergers invoked as platform helpers) are out of scope; project-owned wrappers around them **are** in scope when the wrapper itself exposes three or more parameters (must use an options object).
- Tiny project-owned utilities (currency formatting, structured logging helpers, etc.) with three or more parameters **are in scope** — convert to options objects; they are **not** exceptions.
- Error class constructors that mirror platform `Error` signatures may remain positional if they only forward message/status fields; prefer options objects when adding structured context beyond that.
- Block registration “large config object” APIs already take objects; they are compliant and must not be forced into artificial splits.
- Tenant product UI (blocks, services, integrations) is in scope the same as core—no “core only” carve-out.
- Functions with **one or two** parameters may stay positional; the options-object rule starts at **three**.
- **Components always** use module `types` props even when they have fewer than three fields — including Next.js route shells (`page`, `layout`, `error`, `not-found`); each route folder owns a `types.ts` for those props.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The frontend package (`app/`, `core/`, `shared/`, `tenants/`) MUST apply the dual typing convention end-to-end.
- **FR-002**: Any project-owned **function or method** (public or private) with **three or more** parameters MUST take a single options object, except entries on the documented exception list. Canonical example: `loadPageWithNavigation({…}: TenantPageParams)`.
- **FR-002b**: Every project-owned **React component** MUST take a single props object whose type lives in the owning module’s `types` file (no colocated props interfaces in the component file). This includes Next.js route shells (`page`, `layout`, `error`, `not-found`) — each route folder MUST provide a `types.ts`. Canonical example: `ProductList({…}: ProductListProps)`. This applies **always**, regardless of prop count.
- **FR-003**: Options-object and component-props types MUST live in the owning module’s `types` file (or global domain types under `core/types` when shared across modules). Implementation files MUST import those types and MUST NOT re-export them.
- **FR-004**: Remaining known leftovers from the prior partial pass MUST be migrated, including at least: CMS adapter internal single-row and pattern-matching helpers with three or more inputs; multi-arg remote list-fetch helpers; cache-tag builders with three or more inputs; any components still colocating props; and any other in-scope hits found by a full frontend inventory during implementation.
- **FR-005**: Spec Kit TypeScript knowledge MUST be updated in the same change set to state whole-frontend scope, **components always** / **functions at 3+**, private-method inclusion, exception categories, and the compliance check expectation.
- **FR-006**: A repeatable compliance check MUST exist (repository script and/or lint rule) that flags both in-scope three-or-more positional parameters **and** component props colocated outside `types` files.
- **FR-007**: After migration, the frontend typecheck MUST pass with no new behavioral changes to product features (refactor of call shape only).

### Key Entities

- **Component props type**: Named props interface for a UI component; owned by the module `types` file (always required for components).
- **Options object type**: Named type describing all inputs for a multi-field function/method (3+ parameters); owned by a module types file.
- **Module types file**: Per-folder types surface for that module’s owned shapes (props, labels, helper args).
- **Exception**: Documented category of **functions** allowed to keep positional parameters: **(1)** React memoization internal primitive-key implementations, **(2)** direct platform/third-party APIs. Project-owned utilities (format, logger, cache-tag builders, adapter helpers) are **not** exempt. **Components have no carve-out** — all project-owned components including app route files use module `types`.
- **Compliance finding**: A reported in-scope symbol that violates either the component-always or function-3+ rule.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A full inventory of the frontend source tree shows **zero** in-scope **functions/methods** with three or more positional parameters (exceptions only as documented).
- **SC-001b**: A full inventory shows **zero** in-scope **components** with colocated props types outside the module `types` file.
- **SC-002**: **100%** of previously identified leftovers in the content-loading path (adapter helpers, multi-arg fetch, multi-dimension cache tags) use options objects with types in the owning types file.
- **SC-003**: Contributors can confirm compliance in **under 2 minutes** by running the documented compliance check (single command).
- **SC-004**: Spec Kit TypeScript conventions describe the dual rule so a new contributor can apply it correctly on first try (whole FE; components always; functions at 3+).
- **SC-005**: Product-facing behavior (page load, navigation, CMS reads, tenant blocks) remains unchanged—verified by existing smoke/typecheck paths used for tenant builds.

## Assumptions

- Scope is `next-headless-cms-fe/` only (backend Strapi package out of scope unless a shared contract type must stay aligned).
- “Covered” means both definitions and call sites updated.
- Private methods are in scope (the missed adapter helper is the motivating example).
- Documented function exceptions are **only**: React memoization internal primitive keys; direct platform/third-party APIs. No carve-out for format/logger/cache-tag/adapter helpers or for components/route shells.
- Cache-tag helpers with three or more inputs are in scope even if they are short one-liners.
- Enforcement may start as a repo script wired into frontend CI; a lint rule is acceptable if equivalent.
- No new product features are required—this is a consistency and maintainability completion of an adopted convention.
