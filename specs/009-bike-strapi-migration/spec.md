# Feature Specification: Vukan's Bike Mock-to-Strapi Migration & Editor-Friendly Schema

**Feature Branch**: `009-bike-strapi-migration`

**Created**: 2026-09-06

**Status**: Draft

**Input**: User description: "Migrate vukans-bike from mock JSON to actual Strapi — Strapi doesn't even start up right now. Make new components for things we've added, edit existing ones, fully remove deleted ones, and rebuild the pages to look exactly the same as they do today with mock data. Focus heavily on editor experience: later on, editors need to build new pages and content without coding knowledge, so component prop fields that have a fixed set of named options (e.g. flex-start, flex-end) should be dropdowns, and fields that are pixel values should be number inputs. This is a general direction, not a spec — use best judgment and best practices for our situation. Don't feel anchored to how Strapi is configured today; improve it if a better shape exists. Only vukans-bike is in scope."

## Clarifications

### Session 2026-09-06

- Q: The live Strapi database (a shared Railway Postgres instance) is in a broken, schema-drifted state — `grid.columns` was changed from `integer` to `json` in the source-controlled schema, but the live database table was never migrated, so every Strapi boot attempt fails immediately. How should this feature handle that database? → A: Reset it — drop the existing schema/tables and let Strapi recreate them fresh from the current component/content-type definitions, then re-seed all content from the current mock JSON. Whatever rows exist today are superseded by the mock content anyway; no reconciliation with prior data is needed.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The backend actually runs (Priority: P1)

A developer runs the Strapi backend locally (or in any environment) and it starts successfully, serves its admin panel, and answers API requests — today it crashes on every boot attempt before binding to its port.

**Why this priority**: Nothing else in this feature — schema redesign, content migration, editor experience — is possible or testable while the backend cannot start at all. This is the literal precondition for every other story.

**Independent Test**: Start the backend from a clean state and confirm the admin panel loads and a basic content request succeeds, with no manual workarounds.

**Acceptance Scenarios**:

1. **Given** the backend in its current committed state, **When** it is started, **Then** it boots to a ready state with no unhandled startup errors.
2. **Given** the backend is running, **When** an admin logs into the admin panel, **Then** every content type and component defined in this feature is visible and usable there.
3. **Given** the backend is running, **When** the frontend (configured to read from it) requests any of the site's pages, **Then** it receives a valid response instead of a connection or server error.

---

### User Story 2 - Visitors see no difference (Priority: P1)

A site visitor browses the live vukans-bike site after the migration. Every page, in every language, looks and behaves exactly as it did on the mock-data version — same copy, same layout, same images, same navigation, same product listing.

**Why this priority**: This migration is a plumbing change, not a redesign. Any visible regression — a missing section, a broken image, a page that 404s, a locale that falls out of sync with the others — is a failure of the migration itself, independent of how good the new editing experience is.

**Independent Test**: Walk every page in every locale on the Strapi-backed site side by side with the current mock-data site and confirm they match.

**Acceptance Scenarios**:

1. **Given** the site is now reading from the backend instead of mock data, **When** any of the current public pages is loaded in any of the three languages, **Then** its content, structure, and images are unchanged from today.
2. **Given** the site's navigation menu, **When** it is viewed in any language, **Then** it lists the same items in the same order as today.
3. **Given** the shop and bike-detail pages, **When** they are loaded, **Then** the single current bike listing still displays with the same price, specs, and images.

---

### User Story 3 - A non-technical editor builds content without writing code (Priority: P2)

Someone with no coding background opens the backend's admin panel and edits an existing page — changing a headline, swapping an image, adjusting a section's background — using only point-and-click controls: dropdowns for choices, number fields for sizes, toggles for on/off settings. They never need to type a raw code value (a CSS keyword, a color code, a layout keyword) by hand, for any field that has a fixed set of valid choices.

**Why this priority**: This is the actual new capability this migration exists to unlock — today, every page is a hand-authored JSON file, which nobody without engineering skills can safely touch. It's second priority only because it's meaningless without Stories 1 and 2 first being true.

**Independent Test**: Give a non-technical person a small, defined content edit (change a headline, change a section's background color, reorder two navigation items) and confirm they can complete it entirely through the admin panel's own controls, without being told a raw value to type anywhere a choice-based control could have been offered instead.

**Acceptance Scenarios**:

1. **Given** a content field that only ever holds one of a small set of valid values (e.g. an alignment setting, a color choice, a layout style), **When** an editor opens that field in the admin panel, **Then** they are offered a selectable list of the valid options, not a blank text box.
2. **Given** a content field that represents a size or spacing value, **When** an editor opens that field, **Then** they enter a plain number, not a text string they must format themselves.
3. **Given** an editor makes a content change and saves it, **When** the change is reviewed, **Then** nothing about the surrounding page structure was put at risk by the edit (an editor cannot accidentally corrupt the page by typing something unexpected into a free-text field that should have been a controlled choice).

---

### User Story 4 - Publishing a change goes live without a code deploy (Priority: P2)

An editor publishes a content change in the backend admin panel, and the live site reflects it shortly afterward — without anyone needing to redeploy or touch code.

**Why this priority**: Pairs with Story 3 — an editor who can author content but whose changes never appear on the live site hasn't actually been given a usable workflow.

**Independent Test**: Publish a small change in the admin panel and confirm it appears on the live site within the expected refresh window, without a deploy.

**Acceptance Scenarios**:

1. **Given** a published content change, **When** the site's normal refresh window elapses, **Then** the change is visible on the live site.
2. **Given** a draft (unpublished) content change, **When** the live site is viewed normally, **Then** the draft content is not visible to ordinary visitors.

---

### Edge Cases

- What happens to content already sitting in the current (broken) database that doesn't match the redesigned schema? Resolved: it is superseded by a full reset and fresh re-seed from current mock content — no reconciliation attempted.
- What happens if an editor's browser or admin session is offline when a webhook-driven publish notification would normally fire — does the live site still catch up on its own within a bounded time, or does the change get stuck?
- What happens when a future second product is added to the catalog — do the dynamic per-bike pages and the shop listing continue to work for more than one entry, even though only one exists today?
- What happens if a choice-based field's valid options ever need to change later (e.g. a new color is added to the palette) — can that be done without a full redeploy, or does it require a schema change and release?
- What happens to the two supporting locale versions (English, German) if only the default-language version of a field is edited — do the other languages keep their own independent copies, unaffected?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The backend MUST start successfully and remain running, with the root cause of today's startup failure resolved (not worked around) by resetting the current database schema/tables and letting the backend recreate them fresh from the current component/content-type definitions, rather than hand-migrating the drifted state.
- **FR-002**: The vukans-bike tenant MUST be switched to read its content from the backend instead of mock JSON.
- **FR-003**: Every current public page (home, service, shop, about, contact, brands, bike-school, guided-tours, bike detail), in all three current languages, MUST be present in the backend and MUST render on the live site with content, structure, and images matching today's mock-data version.
- **FR-004**: Site navigation (header and footer, all three languages) MUST be present in the backend and MUST match today's mock-data version.
- **FR-005**: The product catalog MUST be present in the backend and MUST match today's single-listing mock-data version (name, price, specs, images) in all three languages.
- **FR-006**: Any backend component representing content that is no longer used anywhere on the site MUST be removed rather than left in place unused.
- **FR-007**: Any backend component field that only ever holds one of a small, known set of values MUST be presented in the admin panel as a selectable choice, not a free-text field — this includes (at minimum) layout alignment/justification settings, and color/surface choices drawn from the site's fixed palette.
- **FR-008**: Any backend component field that represents a size, spacing, or numeric setting MUST be presented in the admin panel as a number field wherever the underlying value can be represented as a plain number, rather than requiring an editor to type a formatted text value.
- **FR-009**: Where a field cannot reasonably be reduced to a choice or a number (e.g. a genuinely free-form value with no fixed set of options), it MUST remain a text field — this migration MUST NOT force every field into a constrained control where doing so would make a legitimate use case impossible.
- **FR-010**: Any known defect in an existing component that is being rebuilt as part of this migration MUST be fixed as part of that rebuild (e.g. a field that is currently accepted but silently has no effect).
- **FR-011**: The migration MUST NOT change what the site's theme (colors, fonts, corner-radius) is or how it is configured — that remains outside this feature.
- **FR-012**: The migration MUST NOT introduce, restore, or modify any content, component, or configuration belonging to the other tenant (`resort-example`).
- **FR-013**: The migration MUST NOT reintroduce any previously-removed page-building pattern that this site deliberately moved away from (see the prior redesign's constraints) — no marketing one-off components, no free-standing visual page-builder/drag-and-drop authoring surface.
- **FR-014**: After the migration, an editor MUST be able to make a supported content edit and see it reflected on the live site without any code change or redeploy.
- **FR-015**: Whatever changes are made to the backend's content structure MUST keep the frontend able to correctly read and display that content — the two sides of this system MUST be updated together, not left inconsistent.
- **FR-016**: The people/process needed to grant a real editor access to the backend admin panel (creating their account, setting their permissions) MUST be documented, even if the act of creating any individual account is a manual step outside this feature's automated scope.

### Key Entities

- **Page**: A localized public page (home, service, shop, about, contact, brands, bike-school, guided-tours, bike detail), now stored and editable in the backend instead of a JSON file.
- **Navigation**: The header and footer link sets, per language, now stored and editable in the backend.
- **Product (bike listing)**: A catalog entry (name, price, specs, images, availability), now stored and editable in the backend.
- **Content component**: A reusable building block (e.g. a text block, an image, a button, a layout band) that a page is assembled from — the unit this feature redesigns for editor-friendliness.
- **Editor**: A person who authors or updates site content through the backend's admin panel and has no expectation of writing or reading code to do so.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The backend starts successfully every time, with zero startup errors (down from failing on every attempt today).
- **SC-002**: 100% of current pages, across all three languages, look and behave identically before and after the migration, as judged by a side-by-side walkthrough.
- **SC-003**: Zero fields in the redesigned components require an editor to type a raw code-like value (a CSS keyword, a color code, a formatted size string) where a bounded set of valid choices exists.
- **SC-004**: A person with no coding background can complete a defined small content edit (change a headline, change a section's background, reorder a navigation item) entirely through point-and-click controls, without being handed a raw value to type.
- **SC-005**: A published content change appears on the live site within the documented refresh window, with no code deploy involved.
- **SC-006**: Zero backend components exist that are not used by any current page.

## Assumptions

- The backend's Public-role read permissions and the one-time creation of the first admin account are manual, one-time setup steps performed by whoever operates the backend — not something this feature automates, though the steps must be documented.
- Standing up a production hosting pipeline for the backend application itself (choosing/configuring where the Strapi process runs long-term, as opposed to its database) is **out of scope** for this feature. This feature's bar is: the backend runs correctly (locally and against its current database), the frontend can read from it end-to-end, and content parity holds. Where and how the backend process is hosted for production traffic is a separate, follow-on concern.
- The product catalog stays at its current single real listing — this feature carries that listing over faithfully; it does not add additional catalog entries.
- The visual "drag-and-drop page builder" style of authoring remains explicitly out of scope, consistent with this project's existing direction — "editor-friendly" in this feature means well-chosen field controls (dropdowns, number inputs, toggles) within today's structured-content editing model, not a freeform visual canvas.
- Locale handling continues to use the project's existing plain-text language field convention, not the backend's built-in localization plugin.
- "Fully remove the removed ones" in the request refers to any backend component still present but no longer used anywhere on the current site — not a request to re-verify work already completed in an earlier, separate content redesign.
- Before the database reset, a plain export/dump MAY be taken as a low-cost safety net (the reset is irreversible otherwise) — not required, since the clarified direction is that prior content is superseded regardless, but cheap enough to be worth doing.
