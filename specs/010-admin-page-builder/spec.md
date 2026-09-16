# Feature Specification: Admin Page Builder

**Feature Branch**: `010-admin-page-builder`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "Give CMS editors a full nested-block authoring experience (add / nest / reorder / edit / delete) with no JSON. Keep the existing page composition model. Allow Flex inside Flex where current site rules already allow it. Prefer one page composition surface over raw nested JSON or a second page data shape."

## Clarifications

### Session 2026-09-14

- Q: Native nested pickers on layout types (the Section experiment) vs one composition canvas over the existing nest tree? → A: The Section nested picker was an **experiment and is not the product**. Implement the Ask-mode solution: one page composition surface; **storage** of root bands remains the existing page composition list (not a new document field); **all** layouts (Section, Stack, Flex, Grid) nest the same way as Stack/Flex/Grid already do. Do not roll nested native pickers out to other layouts. Revert the Section experiment so authors are not split across two nest UIs.
- Q: When dropping the Section experiment, how should existing Section children be handled? → A: **Auto-convert** those children into the unified nest format Flex/Stack/Grid already use. Public pages stay equivalent; authors do not re-enter nested blocks by hand. Do not keep reading two nest formats indefinitely.
- Q: Where should editors add top-level bands (Section, catalog list, gallery) — only in the new composition surface, or still in the current page block list? → A: **Only the composition surface** for the whole page body, including adding/reordering top-level bands. Slug, locale, template, and SEO stay on the normal page form. The native top-level block list is not a second place to add or reorder root bands.
- Q: Should authors still be able to open nested structure as raw JSON as a technical fallback, or is that control gone from the page editor? → A: Keep a **clearly labeled technical JSON fallback**, hidden from the default flow (advanced/debug only). The composition surface remains the default nested-edit UI.
- Q: Should that JSON fallback be editable, or only a read-only dump of the same nested tree? → A: **Editable** advanced view of the **same** nest as the composition surface; one page save with the rest of the page. Not a second copy of the tree.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Compose a page as a nested tree without JSON (Priority: P1)

A content editor opens a page in the CMS admin and works on the **whole page body** as nested blocks in the composition surface: add a top-level band, add layouts and copy inside it, nest another layout inside a layout, fill fields (padding, color, text, links), reorder siblings (including root bands), and delete a block. They do not use a separate native block list to add root bands. Nested JSON is not part of this default path.

**Why this priority**: Nested JSON is not usable for editors. Site pages are already trees; only the admin experience is missing.

**Independent Test**: On a draft page, build Section → Flex → Text (and Flex → Flex → Text) using only add/nest/field controls; save; confirm the public page shows that structure. Confirm no nested JSON editor was required.

**Acceptance Scenarios**:

1. **Given** a page in the CMS admin, **When** the editor adds a top-level layout band and nested content, **Then** they do so in the composition surface with add/nest/reorder/delete and ordinary fields — not a nested JSON textarea as the default control, and not a second native root-block list.
2. **Given** a layout that already has children, **When** the editor adds another allowed child, **Then** the new block appears nested under that parent in the same composition view.
3. **Given** sibling blocks, **When** the editor reorders them, **Then** the saved order matches what the public site renders.
4. **Given** a saved page that already has nested content, **When** the editor reopens it, **Then** they see the same tree and can keep editing without reconstructing JSON by hand.

---

### User Story 2 - Nesting follows the live site’s rules (including Flex inside Flex) (Priority: P1)

The editor can nest only what the public site already accepts. **Flex inside Flex is allowed.** Stack cannot nest Grid. Section cannot nest Section. Catalog/gallery/detail blocks are leaves (no children). Depth is capped per layout type the same way the public site already drops illegal depth.

**Why this priority**: A friendlier editor that saves trees the site silently drops is worse than JSON. Flex → Flex is an explicit product need.

**Independent Test**: Attempt legal Flex → Flex → Text (within the existing depth cap) — it saves and renders. Attempt Stack → Grid, Section → Section, or children on a leaf — the editor refuses or clearly blocks before a successful “valid” save. Attempt one level past a layout’s depth cap — blocked in the editor.

**Acceptance Scenarios**:

1. **Given** a Flex, **When** the editor adds another Flex as a child (within the existing depth cap), **Then** the nest is allowed, saves, and appears on the public page.
2. **Given** a Stack, **When** the editor tries to add a Grid as a child, **Then** Grid is not offered (or is rejected) and is not saved as a valid child.
3. **Given** a Section, **When** the editor tries to nest another Section inside it, **Then** that nest is not allowed.
4. **Given** a catalog list, gallery, or bike detail block, **When** the editor tries to add children, **Then** nesting is not available.
5. **Given** a nest that would exceed that layout’s existing depth cap, **When** the editor tries to add another level, **Then** the action is blocked in the editor (not only dropped later on the public site).

---

### User Story 3 - Existing pages keep working; default authoring is not raw nested JSON (Priority: P2)

Published Vukan’s Bike pages continue to render after this feature. The **default** way to edit nested layouts is the composition view. Raw nested JSON is not in that default flow; a **clearly labeled technical JSON fallback** exists for advanced/debug use only. That fallback is **editable** and shows the same nest as the composition surface; saving the page writes that one nest together with the rest of the page.

**Why this priority**: Editors cannot be blocked on a rewrite of live content. Removing JSON from the happy path is the UX win.

**Independent Test**: Open a previously published nested page; composition view shows the tree; public page unchanged. Confirm the default nested-edit control is not a JSON blob. Confirm a labeled technical JSON fallback exists but is not the first nested-edit control shown. Edit via fallback, save once, reopen: composition surface matches the saved nest.

**Acceptance Scenarios**:

1. **Given** pages already live for Vukan’s Bike (including any that used the Section experiment), **When** this feature ships, **Then** those pages still render equivalently; nested Section children are auto-converted into the unified nest format — authors do not rebuild them.
2. **Given** the default page-edit flow, **When** an editor nests blocks inside Stack, Flex, or Grid, **Then** they use the composition surface, not a nested JSON textarea as the primary control.
3. **Given** page identity fields (title, slug, locale, template) and SEO, **When** editing, **Then** those stay on the normal page form; root bands are added and reordered only in the composition surface.
4. **Given** the reverted Section experiment, **When** an editor opens a page, **Then** Section children are edited in the same composition surface as Flex/Stack/Grid — not a Section-only nested picker.
5. **Given** an advanced/debug need, **When** an editor looks for nested structure as text, **Then** a clearly labeled JSON fallback is available and is not the default nested-edit control.
6. **Given** the JSON fallback, **When** the editor changes the nest and saves the page, **Then** that one nest is persisted with the rest of the page and the composition surface shows the same tree after reopen.

---

### Edge Cases

- Empty parent (layout with no children) remains valid; the editor shows an empty nest with “add block.”
- Deleting a parent deletes its descendants; the editor warns or makes that obvious before confirm.
- Locale copies of a page (`sl` / `en` / `de`) stay separate documents; the editor does not silently copy trees across locales unless the author does that today by other means.
- Illegal nests must not crash the admin or the public page; invalid structure is refused in the editor and still safely omitted on the public site if it somehow arrives.
- Keep/catalog leaves stay leaves even if placed next to nested layouts.
- After the Section experiment is reverted, Section nests the same way as Stack, Flex, and Grid; the composition surface shows one tree with no leftover “Section-only” nested picker.
- Auto-conversion of experimental Section children must not drop copy, order, or allowed nest types; if a page has nothing to convert, it is a no-op.
- Draft vs published: saving a draft must not publish; published pages still follow existing draft/publish behavior.
- Concurrent edits / failed save: the editor surfaces a clear failure; it does not pretend the tree saved.
- Technical JSON fallback is hidden from the default page-edit flow (collapsed, behind an advanced/debug label, or equivalent). It MUST NOT appear as the primary nested-edit control.
- JSON fallback and composition surface are two views of one nest. Saving the page writes that nest once; there is no second stored copy.
- Invalid JSON in the fallback MUST fail the save with a clear error and MUST NOT overwrite the last valid nest.
- Disallowed nests entered via the JSON fallback are refused on save the same way as in the composition surface (not only dropped later on the public site).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: CMS page editors MUST be able to add, nest, reorder, edit fields of, and delete composition blocks from a **single page composition surface** (not a separate site builder product). That surface is the **default** authoring UI for the page body, including top-level bands.
- **FR-002**: The default nested-authoring path MUST NOT require editors to read or write nested structure as raw text/JSON. A technical JSON fallback MAY exist but MUST be clearly labeled as advanced/debug and MUST NOT be the default nested-edit control.
- **FR-003**: The composition surface MUST present the whole page body (root bands and nested children) as one hierarchy. Editors MUST add and reorder root bands there; they MUST NOT use a parallel native top-level block list for the same actions.
- **FR-004**: Allowed children for each block type MUST match the public site’s existing nest rules (same allowlists and per-layout depth caps). Flex MAY nest Flex. Stack MUST NOT nest Grid. Section MUST NOT nest Section. Catalog list, gallery, and bike detail MUST be leaves.
- **FR-005**: The editor MUST only offer block types that exist in the current page composition vocabulary (shared layouts/content/actions, accordion, and bike Keep leaves). This feature MUST NOT invent a second page document shape or a parallel `{ type, props, children }` authoring contract for editors.
- **FR-006**: Saved composition MUST continue to render through the existing public page pipeline without a new public renderer.
- **FR-007**: Existing published pages MUST remain valid and render equivalently after the feature. Authors MUST NOT be required to re-enter nested content. Any Section-experiment children MUST be **auto-converted** into the unified nest format as part of this feature.
- **FR-008**: Adding a child MUST assign a stable identity consistent with today’s nested nodes so later edits still target the same block.
- **FR-009**: Field editing for a selected block MUST use the same closed choices editors already have for that type (enumerations, booleans, short text) — not a free-form nested blob for those fields.
- **FR-010**: Navigation, products, and header/footer chrome MUST remain out of this composition surface (page body only).
- **FR-011**: A pixel-perfect freeform canvas (absolute positioning, Webflow-like drawing) is out of scope. This is structured add/nest/reorder/fields.
- **FR-012**: The product nesting UX MUST be the **page composition surface**, not native nested component pickers on each layout type. The Section nested-picker experiment MUST be reverted so Section, Stack, Flex, and Grid share one nest model (the same nested-children storage Stack/Flex/Grid already use).
- **FR-013**: This feature MUST NOT extend native nested pickers to Stack, Flex, or Grid as the way to get Flex → Flex.
- **FR-014**: After conversion, the public site and the composition surface MUST use **one** nest format for Section/Stack/Flex/Grid. Dual long-term support of the Section-experiment format is out of scope.
- **FR-015**: Title, slug, locale, template, and SEO MUST remain on the existing page form. This feature MUST NOT move those fields into the composition surface or replace the Page document.
- **FR-016**: The page editor MUST provide a clearly labeled technical JSON fallback for nested structure, available for advanced/debug use only. That control MUST be hidden from the default flow (not the first nested-edit UI). It MUST be an **editable** view of the **same** nest the composition surface uses. Saving the page MUST persist that nest once with the rest of the page (not a second copy). Seed/mock files outside admin are unchanged.
- **FR-017**: Invalid JSON in the fallback MUST fail the save with a clear error and MUST NOT persist. Disallowed nests submitted via the fallback MUST be refused on save under the same nest rules as the composition surface.

### Key Entities

- **Page**: Locale-specific CMS document (slug, template, SEO, composition tree) already used by the public site.
- **Composition block**: One node in the tree (layout, content, action, accordion, or Keep leaf) with typed fields and optional children.
- **Nesting rule**: Per parent type, which child types are allowed and how deep that parent’s subtree may go — identical to public-site validation.
- **Page composition surface**: The admin view where authors add, nest, reorder, edit, and delete the **entire page body** (including root bands) as the default nested-edit UI. Identity and SEO stay on the page form.
- **Technical JSON fallback**: An advanced/debug, **editable** nested-structure control on the page editor, clearly labeled and hidden from the default flow. Same nest as the composition surface; saved with the page.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An editor can create a Flex nested inside another Flex (plus inner text) and see it on the public page without typing nested structure as text.
- **SC-002**: An editor can complete a typical nested band (section heading + nested row of copy) in one page-edit session using only the composition surface.
- **SC-003**: 100% of disallowed nest attempts in the composition surface are blocked before a successful valid save (Stack→Grid, Section→Section, children on Keep leaves, depth past the existing cap).
- **SC-004**: After launch, previously published Vukan’s Bike pages still load and match their prior public layout; authors do not re-enter nested Section children (conversion is automatic).
- **SC-005**: In the default page-edit flow, nested Stack/Flex/Grid/Section children are not authored via a JSON/text blob; a labeled technical JSON fallback is present but is not that default control.
- **SC-006**: After this feature, editors do not use a Section-only nested picker; Section nesting is only via the page composition surface, same as Flex/Stack/Grid.
- **SC-007**: An editor can add and reorder a top-level band (for example a Section) from the composition surface in one session, without using a separate native page block list for that action.
- **SC-008**: An editor can change the nest via the JSON fallback, save the page once, and see the same tree in the composition surface; invalid JSON or a disallowed nest fails that save and does not replace the last valid nest.

## Assumptions

- Authors are existing CMS admins who already edit Pages (no new public user type).
- Vukan’s Bike is the product surface; the build-isolation fixture tenant is not the design target.
- Public-site nest rules stay as they are today unless this feature only **exposes** them in the editor (no silent loosening of depth or allowlists).
- Image URLs and similar string fields stay as they are; this feature does not switch images to a media-library relation.
- Seed/mock JSON for developers may still exist; it is not the editor UX. The in-admin technical JSON fallback is for advanced/debug, not everyday authoring.
- Header, footer, navigation, and product catalog editing are unchanged.
- Live “open the public site from this button” preview is out of scope unless already present.
- Feature `006` treated a visual composition editor as follow-on; **this feature is that follow-on** for CMS authors.
- Current mixed storage (native nested picker on Section vs nested JSON on Stack/Flex/Grid) is an **experiment to undo**, not a pattern to finish. Unify on the existing Stack/Flex/Grid nest model as part of this feature, **auto-converting** any experimental Section children.

## Out of Scope

- Replacing the CMS or moving page composition to an external builder as source of truth.
- A new top-level page field that replaces the existing root composition **storage**.
- A parallel native top-level block list as a second way to add or reorder root bands.
- Showing nested JSON as the default nested-edit control (a hidden, labeled, editable technical fallback is in scope).
- A second stored copy of the nest used only by the JSON fallback.
- Unlimited nesting beyond current per-layout depth caps.
- Native nested component pickers as the product way to recurse (including keeping or spreading the Section experiment).
- Keeping two nest formats long-term (Section-experiment picker vs unified nest).
- Redesigning block types, themes, or public templates.
- Editing navigation or products in the same surface.
