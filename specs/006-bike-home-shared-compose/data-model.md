# Data Model: Bike Home Shared Composition

**Feature**: `006-bike-home-shared-compose`  
**Date**: 2026-08-13

## Entities

### BlockInstance (extended)

Canonical frontend node (page roots and nested slot children).

| Field | Type | Rules |
|-------|------|--------|
| `id` | `string` | Required; stable within page |
| `type` | `string` | Registry key (`"stack"`, `"product-list"`, …) — always quoted at registration |
| `props` | `Record<string, unknown>` | Authored CMS props only (no injected dataContract fields in Zod props schema) |
| `slots` | `Record<string, BlockInstance[]>`? | Optional; omitted on leaves. Default list uses key `"default"` |
| `visibility` | `BlockVisibility`? | Unchanged |

### Slot

Named child collection on a parent.

| Field | Type | Rules |
|-------|------|--------|
| name | `string` | `"default"` or named (`"media"`, `"content"`, …) when a type needs regions |
| children | `BlockInstance[]` | Each child must pass parent’s composition policy for that slot |

### CompositionPolicy (per registered type)

Owned by the **block registry** entry alongside `component` and props `schema` (single source of truth — not a separate ad-hoc map).

| Field | Type | Rules |
|-------|------|--------|
| `slots` | `Record<string, { allow: string[]; maxItems?: number }>` | Empty / absent ⇒ leaf (no nesting). Unknown slot names in CMS JSON are dropped |
| `maxDepth` | `number` | See **maxDepth semantics** below. Layout typical 3–4; leaves 1 |
| `level` | `1 \| 2 \| 3` | Documentation / catalog; Level 2 is authored trees not separate runtime types |

### maxDepth semantics

- Depth is counted on the **subtree rooted at the node being checked** (the node itself = depth 1; each nested child level adds 1).
- A node is valid iff that subtree’s height ≤ **its own type’s** `maxDepth`.
- **Parent limits do not accumulate onto children.** A child is not required to fit inside “parent maxDepth − depthFromParent”; it only must satisfy its own `maxDepth` for its own subtree.
- Example (valid): `section` (maxDepth 4) → `stack` (3) → `flex` (3) → `text` (1), if each type’s own subtree height ≤ its policy.
- Example (invalid): `stack` (maxDepth 3) whose subtree is 4 levels deep → drop the offending deep branch (soft-fail).

### Validation ownership

| Stage | Responsibility |
|-------|----------------|
| Adapter (`toBlockInstance` / recursive slots) | **Primary**: registry type known, Zod authored props, slot names, allowlists, maxDepth; soft-drop + warn |
| Renderer | **Render only** on normalized tree; optional existing dev Zod on *merged* props (dataContract drift) — not composition policy |

### Level 1 primitives (home kit)

#### `section`

- **Props**: `padding?`, `backgroundImage?`, `backgroundFit?` (`cover`\|`contain`), `overlay?` (0–1), `anchorId?`
- **Slots**: `default` — allow: `stack`, `flex`, `grid`, `text`, `image`, `button`, `product-list`
- **maxDepth**: 4
- **Role**: Full-bleed / band wrapper (home hero band)

#### `stack`

- **Props**: `gap?` (`sm`\|`md`\|`lg`), `align?` (`start`\|`center`\|`end`\|`stretch`)
- **Slots**: `default` — allow: `stack`, `flex`, `text`, `image`, `button`, `product-list` (not `section` — avoid page-band nesting)
- **maxDepth**: 3

#### `flex`

- **Props**: `direction?` (`row`\|`column`), `gap?`, `align?`, `justify?`, `wrap?` (bool)
- **Slots**: `default` — allow: `stack`, `flex`, `grid`, `text`, `image`, `button`, `product-list`
- **maxDepth**: 3

#### `grid`

- **Props**: `columns?` (2–4), `gap?`
- **Slots**: `default` — allow: `stack`, `flex`, `text`, `image`, `button` (no nested `grid` in MVP; no `section`)
- **maxDepth**: 3

#### `text`

- **Props**: `content` (string), `variant` (`body`\|`lead`\|`caption`\|`label`) + box styles. Headings use `blocks.heading` (`level` + visual `variant`). Stats are two `text` nodes in a `stack`.
- **Slots**: none (leaf)
- **maxDepth**: 1

#### `image`

- **Props**: `src`, `alt?`, `fit?` (`cover`\|`contain`)
- **Slots**: none
- **maxDepth**: 1

#### `button`

- **Props**: `label`, `href`, `variant?` (`primary`\|`secondary`)
- **Slots**: none
- **maxDepth**: 1

### Level 3 compound (home MVP)

#### `product-list` (existing)

- **Props**: unchanged (`heading?`, `subheading?`, `limit?`, `layout?`, `anchorId?`, labels, …)
- **Slots**: none
- **dataContract**: unchanged (`load-products`)
- **maxDepth**: 1
- **Ownership**: tenant `vukans-bike`

### Level 2 compositions (authored, not new types)

Documented subtree patterns for home (hard-authored in mock/seed):

| Name | Pattern (conceptual) |
|------|----------------------|
| Hero band | `section`(bg) → `stack` → `text`×2 + `flex`(`button`×2) |
| Stats | `section` → `grid`/`flex` → N× `stack`(`text` + `text`) |
| Image + content | `section` → `flex` → `image` + `stack`(`text`, `text`, `button`?) |
| CTA | `section` → `stack`(center) → `text` + `button` |
| Featured products | `product-list` as sibling root or child of `section`/`stack` where allowlisted |

## Page: home (target)

Ordered **root** `page.blocks` (illustrative):

1. Hero composition (`section` tree)
2. Stats composition (`section`/`grid` tree)
3. Image + content composition (`section`/`flex` tree)
4. `product-list` (L3)
5. CTA composition (`section`/`stack` tree)

Locales `sl` / `en` / `de`: same structure; copy/media differ.

## Strapi mapping

| FE | Strapi |
|----|--------|
| Root nodes | `page.blocks` dynamic zone entries |
| New primitives | New `blocks.section`, `blocks.stack`, `blocks.flex`, `blocks.grid`, `blocks.text`, `blocks.image`, `blocks.button` components; add to page DZ |
| Nesting | `slots` **JSON** on nesting components; values are arrays of node objects (`__component`, `id`, fields, optional nested `slots`) |
| `product-list` | Existing `blocks.product-list` (no `slots`) |
| Legacy blocks | Remain in DZ for other pages |

Adapter: recursively convert nested `__component` objects inside `slots` JSON into `BlockInstance` trees; validate composition policies; strip illegal children with warn.

## Validation rules (summary)

1. Leaf types must not define or populate `slots`.
2. Child `type` must be in the parent slot allowlist (from registry policy).
3. Each node’s subtree height must not exceed **that** type’s `maxDepth` (per-node, non-accumulating — see above).
4. CMS `slots` JSON is untrusted until it passes the adapter pipeline (unknown type ≠ render).
5. Home content must not include opaque marketing types (`hero`, `stats-bar`, `image-text`, `cta-banner`) after migration.
6. Home may include only `product-list` as Level 3 among domain compounds.

## State / lifecycle

No workflow states. Content is static CMS trees + runtime catalog fetch for `product-list`.
