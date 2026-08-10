# Feature Specification: Clean Block Request Params

**Feature Branch**: `002-block-request-params`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "ok lets fix the issue addressed here in the most clean way" — stop merging all URL query parameters into every page block’s content props; give blocks that need request input an explicit, opt-in channel while keeping CMS-authored block content pure (block composition architecture preserved).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - CMS content props stay authoritative (Priority: P1)

As a content author (or agent editing page content), I want block fields I define in the CMS to render as authored, so URL query strings cannot silently override headlines, CTAs, or other content fields.

**Why this priority**: Blanket merging of request query into every block breaks the content contract and makes pages unpredictable; this is the core defect.

**Independent Test**: Open a page with a query string that matches a content field name (e.g. `?headline=hacked`); the hero (or equivalent) still shows the CMS headline, not the query value.

**Acceptance Scenarios**:

1. **Given** a published page whose hero headline is set in CMS content, **When** a visitor opens that page with a query parameter whose name matches a hero content field, **Then** the rendered headline remains the CMS value.
2. **Given** a page with multiple content blocks, **When** any arbitrary query string is present, **Then** blocks that do not need request input render identically to the same page with no query string (aside from intentional request-driven blocks covered in Story 2).

---

### User Story 2 - Request-driven blocks still work (Priority: P1)

As a visitor (or integrator) using URL query for filters, dates, or similar request input, I want blocks that intentionally depend on that input to still receive it, so booking/filter-style experiences keep working without polluting unrelated blocks.

**Why this priority**: Removing the global merge without a replacement would break legitimate request-driven behavior; both purity and capability are required for a clean fix.

**Independent Test**: A block that is declared to use request input can read the relevant query values (or equivalent request context) and behave correctly; undeclared blocks do not receive those values as content props.

**Acceptance Scenarios**:

1. **Given** a block that is explicitly set up to use request query (or request context) for specific inputs, **When** the visitor opens the page with those query parameters, **Then** that block’s request-dependent behavior uses those values.
2. **Given** the same page and query string, **When** other blocks on the page are not set up for request input, **Then** those blocks do not receive the query fields as if they were CMS content props.
3. **Given** a client-interactive block that manages its own URL/query state in the browser, **When** the visitor changes filters or dates in that UI, **Then** it may continue to use client-side URL reading without requiring every sibling block to receive query props from the server.

---

### User Story 3 - Contributors know the rule (Priority: P2)

As a developer or agent adding a new block, I want clear project guidance that CMS content and request input are separate channels, so I do not reintroduce a global merge or invent a one-off hack.

**Why this priority**: Prevents regression; secondary to the runtime fix.

**Independent Test**: Spec Kit / human docs describe the rule; a new contributor can answer “how does a block get URL params?” without pointing at a page-level merge of all query into all blocks.

**Acceptance Scenarios**:

1. **Given** updated project guidance, **When** someone asks how blocks get request/query input, **Then** the documented answer is an explicit opt-in or request-context channel (plus client-side URL reading where appropriate), not “page merges all query into all block props.”
2. **Given** the product tenant’s block catalog / block-system knowledge, **When** the fix ships, **Then** those living docs reflect the separation of CMS props vs request input in the same change set.

---

### Edge Cases

- Empty query string: pages render exactly from CMS content; no errors.
- Query keys that collide with CMS field names: CMS content wins for blocks not opted into request input.
- Multiple values for one query key: system uses a single defined resolution (first value or joined string) consistently for opted-in consumers.
- Blocks that load extra data (data contracts): request input is available through the same explicit request channel as for render, not by smuggling query into CMS props.
- Isolation fixture tenant (`resort-example`): must not block the product fix; fixture-specific request-driven blocks may be updated only as needed for compile/isolation, not as a product polish goal.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST NOT merge the full page request query into every block’s CMS content props by default.
- **FR-002**: System MUST keep CMS-authored block content as the sole source of content props for blocks that do not opt into request input.
- **FR-003**: System MUST provide an explicit channel so blocks that need request/query input can access it (request context for server-side data/behavior and/or declared opt-in for specific query keys on that block).
- **FR-004**: System MUST allow interactive client blocks to read URL/query state themselves without requiring a global server-side merge into all blocks.
- **FR-005**: System MUST preserve existing visitor-facing behavior for product flows that already depend on query input, by migrating those consumers to the explicit channel (not by retaining the global merge).
- **FR-006**: Project agent and human guidance MUST document the CMS-props vs request-input separation and the approved ways for a block to receive request params.
- **FR-007**: The single page route and block-composition model MUST remain the only page rendering path (no new per-page routes for this feature).

### Key Entities

- **CMS block content**: Authoritative fields for a block instance from the content source (headline, CTAs, copy, etc.).
- **Request input**: Visitor-supplied query (and related request-only values) for the current page view.
- **Request-capable block**: A block that is explicitly allowed or designed to consume request input for defined purposes.
- **Content-only block**: A block that renders solely from CMS content and must ignore request query as content.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a sample product page, 100% of content-only blocks show identical authored content with and without a colliding query parameter (same field name as a CMS prop).
- **SC-002**: Every block that previously relied on page-level query merging for real behavior still fulfills that behavior after the change via the explicit channel (zero known broken request-driven flows on the product tenant).
- **SC-003**: A reviewer can confirm in under 5 minutes that the page composition path no longer applies “all query → all blocks” as the default.
- **SC-004**: A new contributor can state the approved ways a block receives request params using only Spec Kit / project docs, without reverse-engineering the page route.
- **SC-005**: No new page routes are introduced; all pages still compose through the existing single catch-all page + blocks + templates model.

## Assumptions

- “Most clean way” means: separate CMS content from request input; prefer request context for server-side consumers; allow declared opt-in where a block component must see specific query keys; allow client components to read the URL themselves for interactive UI.
- Reintroducing any form of unconditional merge of all query keys into all block content props is out of scope and rejected.
- Primary validation target is the product tenant (`vukans-bike`); `resort-example` is a build-isolation fixture and is updated only if required for builds/isolation.
- Existing product blocks that do not use query input need no behavior change beyond immunity to query collision.
- Spec Kit knowledge (`block-system`, relevant catalogs) and FE human docs that mention the old pattern are updated in the same change set as the runtime fix.
- Preview, webhooks, and Strapi schema changes are out of scope unless incidentally required (they are not expected to be).

## Out of Scope

- Redesigning booking/filter UX or adding new query-driven features
- Migrating `resort-example` mock content fidelity beyond compile/isolation needs
- Changing the CMS adapter contract or Strapi content model for unrelated reasons
- Multi-tenancy scaffold / plug-and-play CMS seeding work
