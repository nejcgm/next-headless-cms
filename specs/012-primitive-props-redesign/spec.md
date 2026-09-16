# Feature Specification: Primitive Props Redesign

**Feature Branch**: `012-primitive-props-redesign`

**Created**: 2026-09-15

**Status**: Draft

**Input**: User description: "Redesign the prop schemas for the core L1 primitives (Flex, Section, Text, Link, Image, Iframe, Button, Grid, Icon) plus promote Accordion and Gallery into recursive container primitives, adopt a unified px/percent sizing convention, integrate a full icon library (lucide) for the Icon primitive via a searchable picker, and rebuild every Vukan's Bike page onto the new prop shapes with identical visual output. Use dropdowns/enums wherever a closed set works; only diverge from the user's sketch where it's genuinely incompatible with the existing system."

## Clarifications

### Session 2026-09-15

- Q: Should Stack remain a separate primitive in this redesign? → A: No — Stack is retired. Vertical/horizontal stacking is fully covered by Flex's `direction` (`row`/`column`), so keeping a second, largely-overlapping primitive is no longer justified.
- Q: What can each primitive nest? → A: Section, Flex, Grid, and Accordion accept almost any content (the same broad allow-list already governing containers today, still subject to existing depth caps and self-nesting restrictions). Gallery accepts **Image only** — not arbitrary content as earlier drafted. Text, Image, and Icon accept no children (unchanged, already leaves).
- Q: For Link and Button, should they gain the ability to nest Icon and/or Text as child blocks, replacing today's flat `label` string prop, or stay leaves with a flat label plus a separate icon prop? → A: Become light containers — nest Icon and/or Text as children; drop the flat `label` string and the separate `icon`/`iconPosition` props (child order determines icon-before/after-text placement instead of an `iconPosition` enum).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A consistent, predictable sizing model across every primitive (Priority: P1)

Today, sizing behaves inconsistently across primitives: some expose free-text dimension fields, some only expose a "full width" toggle, and none support percentage-based sizing. An editor working with any primitive (Flex, Grid, Section, Text, Image, Iframe, Button, Link) sets width, height, and related dimensions the same way everywhere: a plain value that is pixels by default, or a percentage when a `%` is included.

**Why this priority**: Every other primitive redesign in this feature builds on this convention. Without it landing first and consistently, each primitive would end up with a slightly different sizing rule, defeating the point of a redesign.

**Independent Test**: On any primitive that exposes width/height-style fields, an editor can enter `320` (resolves to 320px), `50%` (resolves to 50%), and leave it blank (no constraint applied) — and the same rule holds no matter which primitive they're editing.

**Acceptance Scenarios**:

1. **Given** a sizing field (width, height, min/max variants) on any primitive that has one, **When** an editor enters a bare number, **Then** it is applied as pixels.
2. **Given** the same field, **When** an editor enters a number followed by `%`, **Then** it is applied as a percentage.
3. **Given** the same field left empty, **When** the page renders, **Then** no explicit constraint is applied for that dimension (today's behavior for an unset field is unchanged).
4. **Given** two different primitives (e.g. Flex and Image), **When** an editor sets width the same way on both, **Then** the value is interpreted identically on both.

---

### User Story 2 - Each primitive exposes the reviewed, purpose-fit set of fields (Priority: P1)

Content editors get the specific field set reviewed and approved for each primitive (Flex, Section, Text, Link, Image, Iframe, Button, Grid) — organized by Content, Layout, Spacing, and Appearance — instead of today's mixed, partially inconsistent set. Closed-set choices (alignment, variants, fit modes, overflow, etc.) remain dropdowns; free-text remains only where no reasonable closed set exists.

**Why this priority**: This is the core of the redesign — the actual field-level editing experience for the primitives that make up nearly every page.

**Independent Test**: For each of the eight primitives, an editor can find and set every field named in the reviewed shape (FR-002–FR-008) through a labeled control, and no field that shape omits is still presented as editable.

**Acceptance Scenarios**:

1. **Given** the Flex primitive, **When** an editor opens its fields, **Then** direction, justify (including `between`/`around`/`evenly`), align (including `baseline`), wrap, gap, and the sizing/spacing/appearance set from User Story 1 are all present.
2. **Given** the Section primitive, **When** an editor opens its fields, **Then** background image/fit/position, overlay, anchor, a width mode (full vs. contained), minimum height, padding, surface, divider placement, and overflow are all present.
3. **Given** the Text primitive, **When** an editor opens its fields, **Then** the semantic HTML element (`p`/`span`/`h1`–`h6`), font size, line height, bold, uppercase, letter spacing, and text alignment are all present alongside the existing content field.
4. **Given** the Link and Button primitives, **When** an editor opens their fields, **Then** each offers its own style-preset variant list, target/show-arrow (Link), sizing/spacing/appearance, and behavior fields (`href`, `type`, `disabled`) — with the visible label composed from nested Icon/Text children rather than a flat label field (see User Story 3).
5. **Given** the Image and Iframe primitives, **When** an editor opens their fields, **Then** fit/position (Image) or aspect ratio (Iframe) are present alongside sizing.
6. **Given** the Grid primitive, **When** an editor opens its fields, **Then** per-breakpoint column counts, gap, and sizing/appearance are present as today, with the sizing convention from User Story 1 applied.

---

### User Story 3 - Every primitive nests only what makes sense for it (Priority: P2)

Each primitive has a clear, deliberate rule for what it can contain. Section, Flex, Grid, and Accordion accept almost any content — composing freely, the same as today. Gallery accepts Image children only — it arranges pictures, nothing else. Link and Button become light containers that hold an optional Icon and/or Text child instead of a flat label field, so a "label" can be icon-only, text-only, or both, in either order. Text, Image, and Icon accept no children at all, unchanged.

**Why this priority**: A real product improvement (Accordion and Gallery both move past today's fixed-field limitation, and Link/Button gain composable labels), but it's a structural change to specific blocks rather than the sizing/field-set foundation the rest of the feature depends on — safe to sequence after User Stories 1 and 2.

**Independent Test**: An editor adds an Accordion, nests a Text block and a Button inside it, and confirms both render inside the panel when expanded. An editor adds a Gallery, nests three Image blocks inside it, and confirms they lay out in the chosen grid/masonry arrangement — and confirms a non-Image block cannot be added to it. An editor adds a Button, nests an Icon and a Text child in that order, and confirms the button renders icon-then-text.

**Acceptance Scenarios**:

1. **Given** an Accordion block, **When** an editor adds children to it, **Then** any block type already allowed inside a similar container (e.g. Flex) can be added, nested the same way.
2. **Given** an Accordion with nested children, **When** a visitor expands it, **Then** all nested children render in the order authored.
3. **Given** a Gallery block, **When** an editor tries to add a child, **Then** only Image is offered — no other block type can be nested inside it.
4. **Given** a Link or Button block, **When** an editor adds children to it, **Then** only Icon and Text are offered, in any combination and order, and the rendered control reflects that order.
5. **Given** a Link or Button with only an Icon child and no Text child, **When** the page renders, **Then** the control still has an accessible name (see FR-012) rather than being silently unlabeled.
6. **Given** existing Accordion, Gallery, Link, or Button content from before this feature, **When** it is opened after this feature ships, **Then** it has been migrated to the new nested shape with no visible content loss (see User Story 5).

---

### User Story 4 - The Icon primitive offers a real icon library (Priority: P1)

An editor picking an icon is no longer limited to three hardcoded choices (map pin, phone, mail). They search and pick from a full, modern icon set, the same way they'd expect from any current site builder.

**Why this priority**: Directly requested and independently valuable on its own — the current three-icon limit is the single most restrictive primitive today.

**Independent Test**: An editor opens the Icon field, searches for a concept (e.g. "arrow", "star", "calendar"), and selects a matching icon from the results; the chosen icon renders correctly on the public page.

**Acceptance Scenarios**:

1. **Given** the Icon field, **When** an editor searches by name or concept, **Then** matching icons from the full set appear for selection.
2. **Given** an icon has been selected, **When** the page renders, **Then** that icon appears at the chosen size and color.
3. **Given** the previous three icons (map pin, phone, mail) were already in use on live pages, **When** this feature ships, **Then** those pages continue to render the same icons without manual re-selection.

---

### User Story 5 - Vukan's Bike renders identically on the new props (Priority: P1)

Every existing Vukan's Bike page is rebuilt to use the new prop shapes end to end. A site visitor sees no difference — same layout, same copy, same look — before and after this feature ships.

**Why this priority**: This is the proof that the redesign actually works end-to-end on real content, not just in isolation. It's also the point at which the old prop shapes can be safely retired.

**Independent Test**: Compare every live Vukan's Bike page (all three locales) before and after this feature ships — visually and structurally equivalent. No page references a field name or shape this feature removed.

**Acceptance Scenarios**:

1. **Given** any existing Vukan's Bike page, **When** it is opened after this feature ships, **Then** its visual layout, copy, and behavior are unchanged from before.
2. **Given** the site's Accordion, Gallery, Link, or Button usages, **When** viewed after this feature ships, **Then** they render the same visible content as before, now via nested children instead of the old fixed fields.
3. **Given** the redesigned primitives, **When** the whole site is rebuilt, **Then** no page authors against a field name this feature removed or renamed without migration.

---

### Edge Cases

- A sizing value with neither a bare number nor a `%` suffix (e.g. `"2rem"`, `"auto"`): treated as not matching the convention — reject or ignore rather than silently mis-rendering.
- An Accordion, Gallery, Link, or Button with zero nested children: renders as an empty, still-functional container (matches how an empty Flex/Grid already behaves).
- Deeply nested Accordion (e.g. an Accordion inside a Flex inside an Accordion): follows the same depth caps and allow-lists already governing every other container, not a new unlimited case. Gallery cannot participate in this kind of nesting chain at all — it only ever holds Image leaves.
- A non-Image block someone attempts to add to a Gallery, or anything other than Icon/Text attempted on a Link or Button: rejected the same way an disallowed nest is rejected on any other container today (offer omitted in the composition surface; hard-rejected on save).
- Every existing `stack` usage across Vukan's Bike content: migrated to `flex` with `direction: column` (and `direction: row` only where the original stack's layout intent was actually horizontal, if any such usage exists) — not left as an orphaned, unrenderable block type.
- An icon chosen from the new library that has no equivalent in the old three-icon set: renders correctly; nothing about the redesign requires every icon to map back to something old.
- A locale variant (`en`/`de`) of a Vukan's Bike page missing content the `sl` version has: migrated on its own terms, not assumed identical to `sl`.
- A primitive field this feature removes or renames (including Stack as a primitive, and Link/Button's old flat `label`/`icon`/`iconPosition` fields): no remaining authored content (Vukan's Bike or otherwise) may reference it after migration; the migration step must account for every existing usage before the old shape is retired.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every primitive's sizing-family fields (width, height, min/max width, min/max height, and equivalents) MUST accept a bare number (pixels) or a number with a `%` suffix (percentage), with no value meaning no constraint.
- **FR-002**: Flex MUST expose direction, justify (`start`/`center`/`end`/`between`/`around`/`evenly`), align (`start`/`center`/`end`/`stretch`/`baseline`), wrap, gap, sizing, spacing, and appearance (background, text color, border, radius, overflow) as dropdown/typed fields except where free-text sizing applies (FR-001).
- **FR-003**: Section MUST expose background image, background fit, background position, an overlay control, an anchor identifier, a width mode (full vs. contained), a minimum-height choice, padding, surface, a divider placement choice (none/top/bottom/both), and overflow.
- **FR-004**: Text MUST expose its semantic HTML element choice, font size, line height, bold, uppercase, letter spacing, text alignment, color, sizing (width/max-width), spacing, background, border, and radius.
- **FR-005**: Link and Button MUST each expose their own style-preset variant list, typography controls (font size/weight, text alignment), color/background/border/radius, spacing, and sizing; Link additionally exposes a link target and an optional arrow indicator. Neither exposes a flat label or icon/icon-position field — see FR-012 for how the visible content is composed instead.
- **FR-006**: Image MUST expose fit and focal position, sizing (including a full-width convenience), spacing, border, radius, and overflow.
- **FR-007**: Iframe MUST expose an aspect-ratio choice (in addition to free sizing), a full-width convenience, spacing, background, border, radius, and overflow.
- **FR-008**: Grid MUST keep its per-breakpoint column counts and gap, gain the sizing convention from FR-001, and keep its existing appearance fields.
- **FR-009**: Accordion MUST become a container: it keeps its title and open-by-default toggle, gains the shared appearance/spacing fields other containers already have, and accepts nested children using the same broad allow-list and depth rules already governing similar containers (e.g. Flex, Section, Grid).
- **FR-010**: Gallery MUST become a container restricted to **Image children only**: it keeps heading/subheading and a layout choice (grid/masonry) with per-breakpoint column counts and gap, drops its fixed image-array field, and accepts nested Image blocks — no other block type is offered or accepted.
- **FR-011**: Stack MUST be retired as a primitive. Flex's `direction` (`row`/`column`) covers every layout case Stack previously served. Every existing Stack usage MUST be migrated to Flex with the equivalent `direction` before Stack is removed; no page may reference a `stack` block after migration.
- **FR-012**: Link and Button MUST become light containers accepting only Icon and/or Text as children (in either order, either or both present), replacing today's flat `label` string and separate icon/icon-position fields. A Link or Button with only an Icon child (no Text child) MUST still expose an accessible name through some other means (e.g. a dedicated accessible-label field), so removing the flat label never leaves a control unlabeled for assistive technology.
- **FR-013**: The Icon primitive's name field MUST offer the full selected icon library, discoverable through a searchable picker, in both the CMS's native editing view and the custom page-composition surface — not a fixed short list.
- **FR-014**: Existing Icon usages (map pin, phone, mail) MUST be automatically migrated to their equivalents in the new library; no editor re-selection required.
- **FR-015**: Existing Accordion, Gallery, Link, and Button content MUST be automatically migrated into the new nested-children shape with no loss of visible content; no editor re-authoring required.
- **FR-016**: Every Vukan's Bike page (all locales) MUST be rebuilt to use the redesigned prop shapes with identical visual output to before this feature.
- **FR-017**: Any primitive (including Stack) or field name/shape this feature removes or renames MUST NOT remain referenced by any authored Vukan's Bike content after migration.
- **FR-018**: Closed-set choices (alignment, variants, fit/position modes, overflow, dividers, and similar) MUST remain dropdown/enum fields, not free text, consistent with the project's existing editor-friendliness standard — this redesign is not a regression back to free-text styling for anything that already has (or reasonably can have) a closed set.

### Key Entities

- **Primitive prop schema**: The named, typed field set a given primitive (Flex, Section, Text, Link, Image, Iframe, Button, Grid, Icon, Accordion, Gallery) exposes to editors. This feature changes the shape for all eleven; it does not add a twelfth. Stack — a twelfth primitive that exists today — is retired outright, not redesigned (FR-011).
- **Sizing value**: A dimension entered as a bare number (pixels) or a number with a `%` suffix (percentage). Applies wherever a primitive exposes a sizing-family field (FR-001).
- **Icon library**: The full set of selectable icons backing the Icon primitive's name field, replacing today's fixed three-icon list.
- **Container primitive**: A primitive whose content is a nested list of child blocks rather than fixed fields, each with its own allow-list of what it accepts. Section, Flex, and Grid already are (broad allow-list); this feature adds Accordion (broad allow-list), Gallery (Image only), and Link/Button (Icon and/or Text only) to that set.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An editor can express a sizing value as either a pixel number or a percentage on 100% of primitives that expose sizing fields, with identical interpretation across all of them.
- **SC-002**: 100% of the fields named in this spec's per-primitive requirements (FR-002–FR-010) are reachable through a labeled, typed control — zero free-text fields for anything with a closed set.
- **SC-003**: An editor can locate and select any icon in the new library via search in under a few seconds, without scrolling a long unfiltered list.
- **SC-004**: 100% of live Vukan's Bike pages (all locales) render visually identically before and after this feature, verified page by page.
- **SC-005**: 100% of pre-existing Accordion, Gallery, Link, Button, and Icon usages migrate automatically with no visible content loss and no manual editor re-authoring.
- **SC-006**: Zero authored Vukan's Bike content references a field name or shape removed by this feature after migration completes, including zero remaining `stack` blocks.
- **SC-007**: 100% of migrated Link/Button usages that show only an icon (no visible text) still have a real accessible name, verified against every such usage on Vukan's Bike.

## Assumptions

- The existing shared, reusable field bag that today backs every primitive's spacing/appearance fields is extended and adjusted rather than discarded — each primitive continues to pick the subset of that shared field set that fits it, exactly as today, rather than each primitive defining its own one-off field bag from scratch.
- Colors, borders, surfaces, and other currently-closed-set style fields stay closed-set dropdowns; this feature does not reintroduce free-text CSS values for anything already a dropdown today, per the user's own "use the dropdowns where we can" direction, even where the reference sketch showed a generic string/type placeholder.
- Background image and iframe/image `src` fields remain plain URL strings, as today; this feature does not introduce a media-library upload/relation system — that is a separate, larger feature.
- A "full width" convenience field is kept wherever the reviewed shape explicitly keeps it alongside a general sizing field (Image, Iframe); Section's equivalent becomes an explicit width-mode choice (full vs. contained) per the reviewed shape, replacing its current toggle with a more descriptive dropdown.
- Gallery becomes a container restricted to Image children (not arbitrary content) per clarification. It still stops "knowing about image data" in the sense that matters architecturally — it no longer owns a fixed `images` array with its own alt-text/src fields; each image is now a real, independently-editable Image block. The current lightbox-on-click and progressive "show more/less" reveal behavior — both tied to the old fixed image-array shape — are dropped as a direct consequence; Gallery becomes a grid/masonry layout container with an optional heading, not a specialized image viewer. A dedicated lightbox/carousel capability, if wanted later, is separate follow-on work.
- Stack's retirement (FR-011) is a removal, not a redesign: no new "Stack v2" shape is introduced. Every current Stack usage has a direct Flex equivalent (`direction: column` for the common case), so no content is lost, only re-expressed.
- Link and Button's move to Icon/Text children (FR-012) means their `variant` and other flat style props stay on the Link/Button node itself; only the visible label content moves to children. A required accessible-label field is added specifically to cover the icon-only case (FR-012) — this is a new, small field, not a regression back to a flat label for every usage.
- The icon library is a single, consistently-licensed, actively-maintained set (not a mix of multiple libraries) chosen during planning; "the full set" means every icon that library ships, not a curated subset.
- This feature's shared-primitive changes reach every tenant that uses these primitives (they're shared code), but only Vukan's Bike's actual page content is rebuilt by this feature (per the explicit ask). The build-isolation fixture tenant's mock content is updated only to the minimum needed to keep it compiling and rendering against the new shapes — its design/content is not otherwise a target of this feature.
- No new editor permission or role model is introduced; the same admin users who can edit content today can use the redesigned primitives.

## Out of Scope

- A real media-library upload/relation system for images and background images.
- A dedicated lightbox, carousel, or other specialized image-viewer capability for Gallery.
- Any other block type nesting inside Gallery, or anything besides Icon/Text nesting inside Link/Button — these allow-lists are intentionally narrow, not a stepping stone to "almost any content" for those three.
- Rebuilding or redesigning the build-isolation fixture tenant's actual page content/design.
- Changing the composition surface's own UX (tree, drag-and-drop, live preview) — that was `011-page-builder-polish`; this feature only changes what fields each primitive exposes and how children nest.
- Introducing a twelfth primitive, or removing/redesigning any named primitive beyond what's specified here — Stack's removal (FR-011) is the one explicit exception.
