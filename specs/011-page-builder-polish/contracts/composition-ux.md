# Contract: Composition surface UX upgrade

**Feature**: `011-page-builder-polish`
**Date**: 2026-09-14

Extends `specs/010-admin-page-builder/contracts/page-composition-admin.md`, which still governs data binding, add/nest/reorder/delete semantics, and nest-rule enforcement. This contract covers only what changes in presentation and interaction.

## Tree (`CompositionTree.tsx`)

| Behavior | Before (010 MVP) | After (this feature) |
|----------|-------------------|------------------------|
| Row label | Generic type name only (`Text`, `Stack`, ...) | Type-specific content summary (research R7), type name as fallback |
| Reorder | "Up"/"Down" buttons, one click per step | Direct drag-and-drop (`@dnd-kit`) within a sibling list |
| Branch visibility | Always fully expanded | Collapsible/expandable per branch; collapsing preserves selection/inspector state for nodes that remain visible |
| Delete confirmation | `window.confirm(...)` | Design System `Dialog`, same visual language as the rest of the CMS admin |
| Controls | Bare `<select>` for add-child/add-root | Compact Design System `Button` with plus icon that opens an allowed-type list (not `SimpleMenu`; that component crashed this custom field with a null-object error) |

Nest-rule enforcement (which child types are offered, maxDepth checks) is unchanged — still delegated to `allowedAdds`/`canAddChild` in `tree-ops.ts`, which still calls the unchanged `src/page-composition/nest-rules.ts` and `validate.ts`.

## Field panel (`FieldInspector.tsx`)

| Behavior | Before | After |
|----------|--------|-------|
| Field controls | Bare `<input>`/`<select>`/`<textarea>` | Design System `Field`/`TextInput`/`SingleSelect`/`Checkbox` |
| Field labels | Raw schema attribute name (`columnsMobile`) | Plain-language label (research R8) |
| Field order | Schema attribute declaration order, all mixed | Grouped: "Content" fields, then "Appearance" fields, each visually separated |
| JSON/component sub-fields | Raw `<textarea>` of stringified JSON | Unchanged mechanism (still the least-bad option for a handful of non-tree JSON leaves like `bike-detail.labels`), but Design System-styled |

## JSON fallback (`JsonFallback.tsx`)

| Behavior | Before | After |
|----------|--------|-------|
| Container/toggle | Plain `Button` + conditional `Box` | Unchanged mechanism, Design System-consistent (already mostly is) |
| Error display | Ad hoc `Typography textColor="danger600"` | Design System `Field.Error`/`Alert`, same pattern as the tree and inspector |
| Behavior on invalid JSON / disallowed nest | Fails silently into an error line; last valid tree kept | Unchanged behavior, consistent error presentation (FR-011/SC-006) |

## Mount mechanism

Per `research.md` R1: primary path is `app.addFields({ type: 'dynamiczone', Component: PageCompositionHost })` (registered in `register(app)`), replacing `useHideNativeBlocksField` + the manual `document.querySelector('main form')` portal. If the field-props contract doesn't support this cleanly (verify first), the existing `injectComponent('editView', 'right-links', ...)` + hide-native-field approach stays, but `hide-native-blocks.ts` narrows its matching from label-text/class-fragment scanning to the least brittle selector available.

## Out of this contract

Everything `010`'s `page-composition-admin.md` contract already covers unchanged: form binding (`blocks` is still the one field), nest-rule source of truth, JSON fallback being the same underlying tree, and the boundary against pixel-perfect canvas / navigation / product editing.
