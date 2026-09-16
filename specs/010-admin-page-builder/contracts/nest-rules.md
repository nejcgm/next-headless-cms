# Contract: Nest rules (admin write = public policy)

**Feature**: `010-admin-page-builder`  
**Date**: 2026-09-14  
**Source of truth for public render**: frontend registry policies (`section`/`stack`/`flex`/`grid` `schema.ts` + `composition-allow.ts` + `registerTenantLayoutNestAllow`). Admin/CMS write must **match**, not loosen.

## Shared allowlists

`LAYOUT_NEST_ALLOW`: `stack`, `flex`, `grid`, `text`, `image`, `iframe`, `icon`, `button`, `link`, `accordion`

`STACK_NEST_ALLOW`: `LAYOUT_NEST_ALLOW` minus `grid`

`GRID_NEST_ALLOW`: `stack`, `flex`, `text`, `image`, `iframe`, `icon`, `button`, `link`, `accordion`  
(no nested `grid`, no `section`)

None of the layout allowlists include `section` (no Section in Section).

## maxDepth (subtree height; node itself = 1; parent caps do not subtract from children)

| Type | maxDepth |
|------|----------|
| `section` | 6 |
| `grid` | 5 |
| `flex` | 4 |
| `stack` | 4 |
| Every leaf (L1 content/actions, `accordion`, Keep L3) | 1 |

## Tenant extras (`vukans-bike`)

Add `product-list`, `bike-detail`, `gallery` to every **non-empty** `slots.default` allowlist (same as FE `withTenantNestAllow`).

Those types remain leaves (`maxDepth: 1`, no children).

## Root page bands

A root `blocks[]` entry may be any component listed on `page.schema.json` `blocks.components` (layouts, L1 leaves, accordion, Keep). Root is not subject to a parent allowlist; it is still subject to that node’s own `maxDepth` for its subtree.

## Write vs read

| Path | Illegal nest |
|------|----------------|
| Admin tree / JSON fallback / document middleware | **Reject save** with a clear error |
| Public `compose-validate.ts` | Soft-drop node (existing) |

## Sync duty

If frontend policy or `composition-allow.ts` changes, update `headless-cms-backend/src/page-composition/nest-rules.ts` (or equivalent) in the **same change set**.
