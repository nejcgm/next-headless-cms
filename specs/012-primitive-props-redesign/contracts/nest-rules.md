# Contract: Nest rules

**Feature**: `012-primitive-props-redesign`

Extends `specs/010-admin-page-builder/contracts/nest-rules.md`, which still governs the general mechanism (frontend `composition-allow.ts` is the source of truth; backend `page-composition/nest-rules.ts` mirrors it; admin write-path hard-fails, public render soft-drops). This contract states only what changes.

## Allow-list changes

| Constant | Change |
|----------|--------|
| `LAYOUT_NEST_ALLOW` | remove `"stack"` |
| `GRID_NEST_ALLOW` | remove `"stack"` |
| `STACK_NEST_ALLOW` | **deleted** |
| `GALLERY_NEST_ALLOW` | **new**: `["image"]` |
| `LINK_BUTTON_NEST_ALLOW` | **new**: `["icon", "text"]` |

## Policy changes

| Primitive | Before | After |
|-----------|--------|-------|
| Accordion | leaf (`maxDepth: 1`, `slots: {}`) | container (`maxDepth: 4`, `slots.default.allow: LAYOUT_NEST_ALLOW`) |
| Gallery | not a registry container at all (tenant Keep leaf) | container (`maxDepth: 2`, `slots.default.allow: GALLERY_NEST_ALLOW`) |
| Link | leaf | container (`maxDepth: 2`, `slots.default.allow: LINK_BUTTON_NEST_ALLOW`, `maxItems: 2`) |
| Button | leaf | container (`maxDepth: 2`, `slots.default.allow: LINK_BUTTON_NEST_ALLOW`, `maxItems: 2`) |
| Stack | container | **removed from the registry entirely** — not merely emptied |

## Tenant extras

`registerTenantLayoutNestAllow(tenantId, types)` (`vukans-bike/blocks/index.ts`) currently adds `product-list`/`bike-detail`/`gallery` to every layout policy's default allow. Since Gallery becomes shared with its own dedicated narrow policy, it's removed from this tenant-extras call — `product-list`/`bike-detail` remain (they're still tenant-specific Keep leaves).

## Validation split (unchanged from `010`/`011`)

| Layer | Behavior |
|-------|----------|
| Composition surface + JSON fallback | Block illegal add/nest before save (picker omits disallowed types; save rejects) |
| Strapi document middleware | Hard-fail (`ApplicationError`); does not persist |
| Public `compose-validate.ts` | Soft-drop (safety net for any pre-existing bad data, e.g. mid-migration) |

## Out of this contract

Depth-cap *values* beyond what's listed above (Section/Flex/Grid keep their existing `010` depth budgets); anything about the composition-surface UX itself (that's `011`, unaffected except the one new Combobox control — see `contracts/icon-library.md`).
