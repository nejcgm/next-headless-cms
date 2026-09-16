# Contract: Page composition admin surface

**Feature**: `010-admin-page-builder`  
**Date**: 2026-09-14

## Scope

Content Manager **Page** edit view (`api::page.page`) only.

## Layout of the edit view

| Region | Controls |
|--------|----------|
| Native form | `tenant`, `lang`, `slug`, `slugPattern`, `template`, `seo` |
| Composition surface (default nested UI) | Entire page body: add/reorder **root** bands and nested children; field inspector for the selected node |
| Technical JSON fallback | Collapsed, labeled advanced editor of the **same** `blocks` value |

Must **not** appear as a second authoring path:

- Native dynamic-zone picker/list for `blocks`
- Native JSON textarea for layout `slots`
- Native Section `children` component picker (field removed)

## Surface behavior

- Tree shows the full `blocks` hierarchy (`slots.default` under layouts).
- Add child: only types allowed for that parent ([nest-rules.md](./nest-rules.md)); omit illegal types from the picker.
- Add root band: types from the page DZ list, filtered by tenant for Keep L3.
- Reorder: sibling arrays only (root array or one `slots.default`).
- Delete parent: confirm; descendants go with it.
- Empty layout: show an add-child affordance; valid save.
- Selecting a node: inspector uses that component’s schema fields (not `slots`).
- Flex → Flex: offered when `flex` is allowed and the new subtree would not exceed `flex` maxDepth.
- Save: Strapi document save (draft vs publish unchanged). Middleware convert + validate runs on the server.

## JSON fallback

- Hidden from the default path (collapsed / advanced label).
- Editable; `JSON.parse` of the `blocks` array (including nested `slots`).
- Invalid JSON or nest-rule failure: save fails; last valid tree remains.
- After a successful save, reopening the page: tree and JSON show the same nest.

## Form binding

One field: `blocks`. No parallel `composition` / `contentTree` attribute.

## Out of this contract

Pixel-perfect canvas, live public preview, Navigation/Product screens, replacing Page as a document.
