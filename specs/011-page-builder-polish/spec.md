# Feature Specification: Page Builder Editor Experience Upgrade

**Feature Branch**: `011-page-builder-polish`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "The Strapi page composition surface shipped in `010-admin-page-builder` is only an MVP. Polish its UX/UI and functionality, improve the underlying code quality to the project's standards, and research + add live preview of in-progress edits so editors don't have to save/publish to see their changes. Full redesign or refactor of the existing admin surface is acceptable if it produces a meaningfully better editor experience — nothing specific is off the table except that editors' experience must improve drastically."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A modern, confident editing experience (Priority: P1)

An editor opens a Page in the CMS admin and works in the page composition surface. Every block in the tree is labeled with a short summary of its own content (not just its generic type), so editors can tell apart several "Text" or "Button" blocks at a glance. Reordering is a direct, modern interaction. Branches can be collapsed and re-expanded without losing context. The field panel for a selected block groups and labels fields in plain language instead of raw schema attribute names. Deleting a block asks for confirmation using the CMS's own interface language, not a browser popup. Every control in the surface looks and behaves like it belongs in the CMS admin, not a bare prototype.

**Why this priority**: This is the headline ask. The current MVP is functionally complete but reads as a rough prototype — same-type blocks are indistinguishable in the tree, reordering is clunky, fields are unlabeled raw schema keys, and delete uses a jarring native browser dialog. That gap is what most directly blocks "drastically improved" editor experience.

**Independent Test**: Given a page with 15+ nested blocks, including several of the same type (e.g. multiple `Text` blocks), an editor can find, reorder, and edit any specific block on the first attempt using only the on-screen summaries and controls — no trial-and-error clicking through same-looking rows.

**Acceptance Scenarios**:

1. **Given** a tree with multiple blocks of the same type, **When** viewing the tree, **Then** each row shows a distinguishing summary drawn from that block's own authored content (e.g. its text, label, or heading), not only its type name.
2. **Given** a branch with children, **When** the editor collapses it, **Then** its children are hidden and can be re-expanded, without losing the current selection or field panel state for any block that stays visible.
3. **Given** two sibling blocks, **When** the editor reorders them, **Then** the action is a direct, immediate interaction (e.g. drag), not a sequence of discrete "move one step" clicks for each position.
4. **Given** the field panel for a selected block, **When** viewed, **Then** fields are grouped and labeled in plain language, with content fields visually separated from appearance/style fields.
5. **Given** a delete action, **When** the editor confirms it, **Then** the confirmation control matches the CMS admin's own dialog style, not a native browser confirm popup.

---

### User Story 2 - See your draft without publishing (live preview) (Priority: P1)

While editing a page's composition, the editor can save their draft and see a visual, up-to-date preview reflecting it — without leaving the page editor, without opening the live site in a separate tab, and without publishing unfinished work just to check how it looks.

**Why this priority**: Explicitly requested. Today, validating any visual change means saving, opening the live site in another tab, and checking — slow, and it tempts editors into publishing half-finished work just to see it rendered.

**Independent Test**: An editor changes a block's field (text, color, layout), saves the page as a draft, and sees that change reflected in a visual preview of the actual page — without publishing and without navigating away from the page editor.

**Acceptance Scenarios**:

1. **Given** an edit to a block's field that the editor has saved as a draft, **When** they open the preview, **Then** it reflects that saved change without the editor publishing.
2. **Given** a preview is visible, **When** the editor saves further edits, **Then** the preview reflects the latest saved state rather than going stale.
3. **Given** a page that has never been published, **When** previewed, **Then** the preview still renders using the current draft content.
4. **Given** the editor closes and reopens the page, **When** they return, **Then** the preview reflects the draft state they last saved, not a stale or blank view.

---

### User Story 3 - An editor that doesn't get in the way (Priority: P2)

The composition surface behaves predictably: it reliably replaces the raw technical editing view every time a Page is opened, recovers from bad or unexpected input without leaving the editor stuck, and clearly explains problems instead of failing silently.

**Why this priority**: The MVP already covers the core happy path; this is about the surface staying trustworthy under real, everyday use (repeated navigation, occasional bad input, the odd unexpected error) rather than adding new capability. A polished surface that occasionally reverts to the raw view or fails silently would undermine the trust User Story 1 and 2 are meant to build.

**Independent Test**: After normal, repeated navigation between several pages, the composition surface is present every time with no manual workaround; deliberately entering invalid data (e.g. malformed technical JSON) produces a clear, specific error rather than a blank or broken panel.

**Acceptance Scenarios**:

1. **Given** the editor opens several pages in a row, **When** each one loads, **Then** the composition surface is present every time — never a flash or fallback to the raw technical view as the resting state.
2. **Given** the editor enters invalid data via the technical fallback, **When** they try to apply it, **Then** they see a clear, specific error message and the editor remains fully usable.
3. **Given** an unexpected error occurs while editing, **When** it happens, **Then** it is communicated to the editor rather than leaving a blank panel or unresponsive controls.

---

### Edge Cases

- A very large or deeply nested tree: the surface must stay usable (e.g. sensible default collapse, scrolling) rather than degrading or becoming unresponsive.
- The same page open in two browser tabs at once.
- Preview for a locale (`sl`/`en`/`de`) whose content differs from the default locale.
- Preview while required fields on a block are incomplete or otherwise invalid.
- A network interruption mid-edit must not silently discard the editor's unsaved work.
- Pages built under the prior MVP surface continue to open and edit correctly — this feature changes presentation, interaction, and preview, not the underlying composition data.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The composition surface MUST present every control using the CMS admin's own visual and interaction language — no unstyled native browser form controls (bare `<select>`, `<input>`, `window.confirm`, etc.) remain in the default authoring path.
- **FR-002**: Each tree node MUST display a short, human-meaningful summary derived from that block instance's own authored content (e.g. its text, label, or heading), not only its generic type name, so editors can distinguish same-type siblings at a glance. A block with no naturally identifying field MAY fall back to its type name.
- **FR-003**: Editors MUST be able to reorder siblings via a direct, modern interaction (e.g. drag-and-drop), not only discrete step-by-step controls.
- **FR-004**: Editors MUST be able to independently collapse and expand any branch of the tree; collapsing MUST NOT discard the current selection or field-panel state for a block that remains visible.
- **FR-005**: The field panel MUST group and label fields in plain language rather than raw schema attribute names, and MUST visually separate content-oriented fields from appearance/style fields where a block has both.
- **FR-006**: Deleting a block MUST use a confirmation control consistent with the CMS admin's own interaction patterns, not a native browser confirmation dialog.
- **FR-007**: Editors MUST be able to see a visual preview of the page reflecting their saved draft edits, without leaving the page editor and without requiring a full publish.
- **FR-008**: The preview MUST update to reflect newly saved edits without a separate manual "refresh preview" action beyond Strapi's own preview affordances.
- **FR-009**: The preview MUST reflect the same locale and template a visitor would actually see for that page.
- **FR-010**: The composition surface MUST reliably replace the raw technical editing view every time a Page is opened in the admin, across normal navigation and reloads.
- **FR-011**: Errors (invalid technical JSON, a disallowed nest, an unexpected failure) MUST be surfaced to the editor with a clear, specific message; the editor MUST remain usable afterward.
- **FR-012**: This feature MUST NOT change the underlying page composition data model, the public rendering pipeline, or the nest rules (allowed children, depth caps) established by `010-admin-page-builder` — improvements are to presentation, interaction, and preview only.
- **FR-013**: The technical JSON fallback MUST remain available for advanced/debug use and MUST continue to represent the exact same underlying tree as the visual composition surface — not a second copy.
- **FR-014**: Navigation, products, and header/footer chrome remain out of this composition/preview surface (page body only), unchanged from the prior feature's boundary.
- **FR-015**: The composition surface's implementation MUST follow the project's established code-quality and maintainability standards, such that adding support for a new block or field type does not require duplicating tree, reorder, or validation logic.

### Key Entities

- **Page composition surface** (from `010-admin-page-builder`): the in-admin editor for a page's block tree. This feature changes its presentation and interaction, not its data shape.
- **Live preview**: a visual rendering of a page's current saved draft state, viewable from within the page editor.
- **Block summary**: the short, human-meaningful label shown for a tree node, derived from that instance's own authored content.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An editor can locate and correctly select a specific block within a tree of 15+ mixed blocks — including several of the same type — on the first attempt, using only on-screen summaries, with no trial-and-error clicking.
- **SC-002**: An editor can move a block to a new position among its siblings in a single direct interaction, regardless of how many positions it moves.
- **SC-003**: Zero unstyled native browser form controls remain in the default authoring path; every control visually matches the CMS admin's own look and feel.
- **SC-004**: An editor sees a saved edit reflected in a visual preview without publishing and without leaving the page editor.
- **SC-005**: Every page that worked correctly before this feature continues to open, edit, and render identically after it ships — no visual or functional regression.
- **SC-006**: 100% of error conditions (invalid technical JSON, a disallowed nest, an unexpected failure) produce a clear, specific on-screen message rather than a silent failure or blank panel.
- **SC-007**: Editors complete a typical page-editing session (compose a nested band, adjust a few fields, confirm the result) without needing to open the live site in a separate tab to check their work.

## Assumptions

- The composition data model, storage (`page.blocks` dynamic zone plus layout `slots` JSON), nest rules, and public rendering pipeline established by `010-admin-page-builder` are correct and unchanged by this feature; only admin presentation, interaction, and preview change.
- Live preview reuses the site's existing draft-preview mechanism as its rendering source rather than building a second, parallel page renderer inside the Strapi admin. The exact mechanism is a planning-phase decision.
- The preview updates on the editor's own explicit Save, not automatically as they type. An implementation that auto-saved in the background to avoid this was tried and reverted after it was found to silently drop edits made while a background save was in flight — correctness takes priority over shaving off the one remaining manual step.
- Vukan's Bike remains the tenant this is built and validated against; the build-isolation mock tenant is not an authoring or preview target.
- No new editor permission or role model is introduced; the same admin users who can edit Pages today can use the upgraded surface and preview.
- This feature may introduce reasonable new tooling to the admin surface if it materially improves the editing experience, consistent with the user's explicit openness to redesign or refactor.

## Out of Scope

- Changing the page composition data model, nest rules/allowlists, or the public rendering pipeline (owned by `010-admin-page-builder`).
- A pixel-perfect freeform/absolute-position canvas.
- Multi-user real-time collaborative editing (simultaneous cursors/presence) of the same page.
- Editing navigation, products, or header/footer chrome in this surface.
- A public, shareable preview link for unauthenticated visitors — this feature covers the authenticated editor's in-admin preview only.
- Replacing the CMS's content editing system or moving page editing to an external tool.
