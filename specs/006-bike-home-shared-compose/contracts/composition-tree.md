# Contract: Composition tree (CMS ↔ frontend)

**Feature**: `006-bike-home-shared-compose`  
**Date**: 2026-08-13

## Purpose

Define the wire shape for composable page trees: root dynamic-zone blocks plus nested `slots` JSON, and the normalized `BlockInstance` tree the frontend renders.

## Wire shape (Strapi / mock / seed)

Root page document unchanged except `blocks[]` entries may be new primitive `__component` values. Nesting example:

```json
{
  "__component": "blocks.section",
  "id": 101,
  "backgroundImage": "https://example.com/hero.jpg",
  "overlay": 0.5,
  "padding": "lg",
  "slots": {
    "default": [
      {
        "__component": "blocks.stack",
        "id": 102,
        "gap": "md",
        "align": "start",
        "slots": {
          "default": [
            {
              "__component": "blocks.text",
              "id": 103,
              "variant": "heading",
              "content": "Vukan's Bike Shop"
            },
            {
              "__component": "blocks.button",
              "id": 104,
              "label": "Shop",
              "href": "#kolesa",
              "variant": "primary"
            }
          ]
        }
      }
    ]
  }
}
```

Level 3 sibling (no slots):

```json
{
  "__component": "blocks.product-list",
  "id": 201,
  "heading": "Featured bikes",
  "limit": 3,
  "layout": "grid",
  "anchorId": "kolesa",
  "outOfStockLabel": "Ni na zalogi"
}
```

### Rules

1. Root entries MUST use `__component` + numeric `id` (existing DZ contract).
2. Nested slot children MUST use the same `__component` + `id` convention inside `slots` JSON.
3. Leaf primitives MUST omit `slots` or set empty.
4. `slots` object keys are slot names; values are arrays of nodes.
5. Unknown `__component` values are dropped (existing adapter behavior) with visibility in logs where applicable.
6. Do **not** wrap fields in a `props` object on the wire — flat fields + `slots` only (same as today’s DZ).

## Normalized frontend shape

After `strapi-document` (recursive):

```ts
interface BlockInstance {
  id: string
  type: string // "section" | "stack" | "flex" | "grid" | "text" | "image" | "button" | "product-list" | legacy...
  props: Record<string, unknown> // all fields except id / __component / slots
  slots?: Record<string, BlockInstance[]>
  visibility?: BlockVisibility
}
```

`type` = `__component` without `blocks.` / `primitives.` prefix (match existing `toDynamicZoneBlock` naming).

## Composition policy (logical contract)

**Registry is the single source of truth** — each type registers `component` + props `schema` + `policy`:

```ts
type CompositionPolicy = {
  level: 1 | 2 | 3
  maxDepth: number
  slots: Record<string, { allow: string[]; maxItems?: number }>
}
```

**maxDepth**: subtree height from that node (self = 1). Parent and child limits are **independent** (not a global remaining budget).

**Validation pipeline** (adapter only — primary):

1. Known registry type? else drop + warn  
2. Zod authored props valid? else drop + warn  
3. Slot name on policy? else drop slot + warn  
4. Child type in slot allowlist? else drop child + warn  
5. Subtree ≤ this type’s maxDepth? else drop offending branch + warn  
6. Else emit `BlockInstance`

Do not render “looks like a component” JSON without this pipeline. Renderer assumes normalized trees.

## Home root order (product contract)

After migration, Vukan's Bike `/` roots MUST be Level 1 trees + exactly one `product-list`, and MUST NOT include: `hero`, `stats-bar`, `image-text`, `cta-banner`.

Expected role order: hero-band → stats → image+content → product-list → CTA-band.

## Non-goals

- Visual CMS editor API
- Saved Level 2 composition gallery collection type
- Accordion / tabs primitives
- Exploding `product-list` into atoms
