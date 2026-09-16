# Data Model: Admin Page Builder

**Feature**: `010-admin-page-builder`  
**Date**: 2026-09-14

Runtime `BlockInstance` / `CompositionPolicy` / per-node `maxDepth` stay as in [006 data-model](../006-bike-home-shared-compose/data-model.md) and `knowledge/block-system.md`. This document records **admin + storage** entities for unified `slots` and the composition surface.

## Entities

### Page (unchanged collection)

`api::page.page`. Draft & publish. Locale field is `lang` (not Strapi i18n).

| Field | Role in this feature |
|-------|----------------------|
| `tenant`, `lang`, `slug`, `slugPattern`, `template` | Native page form only (FR-015) |
| `seo` | Native page form only |
| `blocks` | Root composition **storage** (dynamic zone). Authored only via the composition surface (default) or technical JSON fallback. Native DZ widget hidden/replaced. |

Navigation and product collections are not in this surface.

### Composition node (wire)

Same as 006 composition-tree wire. One shape for every layout after conversion:

```json
{
  "__component": "blocks.section",
  "id": 101,
  "padding": "lg",
  "slots": {
    "default": [
      {
        "__component": "blocks.flex",
        "id": 102,
        "direction": "row",
        "slots": {
          "default": [
            { "__component": "blocks.text", "id": 103, "content": "…", "variant": "body" }
          ]
        }
      }
    ]
  }
}
```

Rules:

1. Root entries are `page.blocks[]` DZ items (`__component` + numeric `id` **after persist**). New roots must be saved **without** a composition `id` (use `__temp_key__` only). Sending a nested composition `id` on a new root makes Strapi reject the save (`Some of the provided components in blocks are not related to the entity`).
2. Nested children live only in `slots.default` (JSON on section/stack/flex/grid).
3. Leaves omit `slots` or use empty `{ "default": [] }`.
4. No `children` array on section after this feature.
5. Do not wrap fields in `props` on the wire.
6. New nested `id` values: `max(ids in this document tree) + 1`.
7. Admin form may add `__temp_key__` on **root** DZ items only; strip before public API if Strapi does not persist it.

### Nesting rule (admin catalog)

Backend copy of FE policy. See [contracts/nest-rules.md](./contracts/nest-rules.md).

Used by: picker (which types to offer), depth checks, JSON fallback validate, document middleware.

### Page composition surface (admin, not stored)

In-memory tree = `blocks` form value. Operations: add (root or under parent), nest, reorder siblings, edit fields, delete (parent deletes descendants, with confirm). Empty parent is valid.

### Technical JSON fallback (admin, not stored)

Pretty-printed serialization of the same `blocks` array. Not a schema field.

## Conversion (Section experiment → unified slots)

Input node may have `children: Component[]` (old section DZ) and/or `slots: { default: Component[] }`.

| Incoming | Result |
|----------|--------|
| `children` present (array) | `slots.default = map(convert, children)`; delete `children` |
| only `slots` | recurse into `slots.default` |
| neither | leaf or empty layout; if layout type, may set `slots: { default: [] }` |
| both | `children` wins, then delete `children` |

Apply to every page `blocks[]` item recursively. Idempotent.

## Validation (write path)

On create/update of `api::page.page`:

1. Convert (above).
2. Each root `__component` must be in the page DZ list.
3. Recurse `slots.default`: child type ∈ parent allowlist (tenant extras applied).
4. Leaves must not have non-empty slots.
5. Subtree height at each node ≤ that type’s `maxDepth` (per-node, non-accumulating — 006 semantics).
6. Invalid JSON in a `slots` value → fail (not coerce).

Failure: do not persist; surface a clear error (FR-017).

Public frontend remains soft-drop.

## State (draft / publish)

Unchanged: saving a draft must not publish. Conversion and validation run on the document being saved (draft or publish action as Strapi already does).

## Tenant extras

`vukans-bike` Keep L3 (`product-list`, `bike-detail`, `gallery`) may appear at root and under any layout that has a `default` slot, matching `registerTenantLayoutNestAllow`. Other tenants: shared allowlists only (this repo’s Page DZ still lists Keep types; picker should still filter by `tenant` when offering Keep).
