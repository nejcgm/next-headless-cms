# Feature Specification: Composition Live Preview

**Feature Branch**: `013-composition-live-preview`

**Created**: 2026-09-21

**Status**: Draft

**Input**: User description: "Embed a preview of the page being edited in the page composition surface. On a wide screen the block tree is on the left, the preview is in the center, and the property fields are on the right. Unsaved composition edits appear in the preview. Do not write the page in the background. Include a save control with the preview. Leave click-to-highlight and navigation/product editing out."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See the page while composing it (Priority: P1)

An editor opens a Page in the content admin on a wide screen. The composition area is three columns: the block tree on the left, a visual preview of that page in the center, and the property fields for the selected block on the right. The preview is the real public page (theme, header, and footer), not a sketch. Changing composition content updates the center preview within about a second, before the editor saves. Closing the editor without saving does not keep those unsaved changes on the public site.

**Why this priority**: The wide editor already has empty space, and editors cannot judge layout until they leave the screen or publish. Filling that space with the live page is the feature.

**Independent Test**: On a wide screen, edit a text block's wording and a layout choice. Within about a second the center preview shows both changes. Reload the public site in another window without saving: it still shows the last saved page.

**Acceptance Scenarios**:

1. **Given** a saved Page open on a wide screen, **When** the editor looks at the composition area, **Then** the block tree is on the left, the page preview is in the center, and the property fields are on the right.
2. **Given** the preview is visible, **When** the editor changes a block's wording or layout and has not saved, **Then** the center preview shows that change within about a second.
3. **Given** unsaved composition edits are visible in the preview, **When** the editor reloads the public site without saving, **Then** the public site still shows the last saved page.
4. **Given** a page that has been saved at least once but never published, **When** the editor opens it, **Then** the center preview shows the draft, including header and footer.

---

### User Story 2 - Save from the preview (Priority: P1)

The editor can persist the page from the preview column. That save is the same action as the content admin's own save: one page, one draft, no second copy of the document. After a successful save, the preview matches what a later visit to the draft would show.

**Why this priority**: The preview is the place the editor is looking. Sending them to a distant save control makes the new layout fail in daily use.

**Independent Test**: Change a heading, click the save control in the preview column, reopen the page. The heading is still changed. The public published site does not change until the editor publishes.

**Acceptance Scenarios**:

1. **Given** unsaved composition edits, **When** the editor uses the save control in the preview column, **Then** those edits are stored as the page draft and the preview remains on the same screen.
2. **Given** a successful save, **When** the editor reopens the page, **Then** the tree, fields, and preview all show the saved draft.
3. **Given** the editor only saves, **When** a visitor opens the published site, **Then** they do not see the draft.

---

### User Story 3 - A usable layout on a narrow screen (Priority: P2)

On a narrow window the three regions stay in the same order and remain reachable: tree, then preview, then fields. The editor can still change a block and see it in the preview.

**Why this priority**: Wide-screen layout is the main case. Narrow screens must not hide the preview or trap the fields off-screen.

**Independent Test**: Narrow the window until the columns no longer sit side by side. Confirm the order is tree, preview, fields, and that an edit still appears in the preview.

**Acceptance Scenarios**:

1. **Given** a narrow window, **When** the composition area is shown, **Then** the regions stack in this order: block tree, preview, property fields.
2. **Given** that stacked layout, **When** the editor changes a block, **Then** the preview still updates before save.

---

### Edge Cases

- A Page that has never been saved has no public address yet. The center shows a short explanation instead of a broken preview. After the first successful save, the preview appears.
- The public site is unreachable or the preview is refused. The tree and fields stay usable, and the center explains that the preview could not be shown.
- Invalid composition (a nest the editor is not allowed to create) is not shown as a successful preview. The last valid preview stays, and the editor sees the existing composition error.
- Collection-backed blocks (the bike detail page and a product list) still show their loaded catalog data in the preview. Composition edits around them update immediately. The preview does not invent catalog rows.
- Two browser tabs open on the same page do not silently overwrite each other. Saving still follows the content admin's normal save rules.
- Locale-specific pages preview that locale's draft, not another language.
- A very tall page scrolls inside the preview. The tree and fields stay reachable beside it on a wide screen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: On a wide screen the page composition area MUST show three regions in this order: block tree (left), page preview (center), property fields for the selected block (right).
- **FR-002**: The center preview MUST show the public page for the document being edited, including the site theme, header, and footer, using the draft rather than the published page.
- **FR-003**: Unsaved changes to the page composition MUST appear in the center preview within about a second, without writing the page.
- **FR-004**: Unsaved preview updates MUST NOT change the saved draft or the published page.
- **FR-005**: The preview column MUST offer a save control that persists the current page the same way as the content admin's own save, and MUST NOT publish by itself.
- **FR-006**: A Page that has never been saved MUST show a short empty state in the center instead of a failed preview, until the first successful save.
- **FR-007**: If the preview cannot be loaded, the block tree and property fields MUST remain usable, and the center MUST say that the preview is unavailable.
- **FR-008**: On a narrow screen the same three regions MUST remain available in this order: tree, preview, fields.
- **FR-009**: Identity fields (tenant, language, slug, template, and SEO) MUST stay on the native page form, not inside the three composition columns.
- **FR-010**: The preview MUST follow the same composition rules as a saved page. Disallowed nests are not presented as a successful preview.
- **FR-011**: Preview MUST be limited to the Page being edited. Navigation and product records are not edited or previewed as their own screens.
- **FR-012**: Selecting a block in the preview MUST NOT be required to select that block in the tree. The tree remains the way to choose which block's fields are shown.

### Key Entities

- **Page draft**: The saved, unpublished page. The preview starts from this draft and may temporarily show newer unsaved composition on top of it.
- **Composition edit**: The in-progress block tree and field values on the composition surface. Visible in the preview before save. Discarded if the editor leaves without saving.
- **Preview pane**: The center region. Shows the public page for this draft, or an empty or error state when that page cannot be shown yet.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a wide screen, an editor can point to the tree, the preview, and the fields in left-to-right order without opening another screen.
- **SC-002**: After changing a visible heading or layout, the editor sees that change in the center preview within 2 seconds, without saving and without publishing.
- **SC-003**: A public visitor who loads the published page during that unsaved edit still sees the last published version.
- **SC-004**: After using the preview column's save control, reopening the page shows the same heading or layout without the editor retyping it.
- **SC-005**: On a window too narrow for three columns, the editor can still reach the tree, the preview, and the fields, in that order, and complete the same edit check as SC-002.

## Assumptions

- Editors who compose pages already use the existing page composition surface. This feature rearranges that surface and adds the center preview. It does not replace page storage or nesting rules.
- "Within about a second" allows a short pause so rapid typing does not rebuild the preview on every keystroke. It is not an instant character-by-character requirement.
- The preview reuses the public site's draft view. It does not introduce a second page renderer or a second saved document.
- Catalog data for collection-backed blocks is loaded the same way the public draft loads it. The preview does not require a separate product editor.
- Clicking inside the preview to jump to a block is out of scope.
- A pixel-level design canvas, navigation editing, and product editing are out of scope.
- Narrow means the three regions no longer fit comfortably side by side (about the width of a typical tablet in portrait or a small laptop window). Wide means they do.
- The save control in the preview column persists a draft only. Publishing stays the content admin's existing publish action.
