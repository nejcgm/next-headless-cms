# Research: Bike Home Shared Composition

**Feature**: `006-bike-home-shared-compose`  
**Date**: 2026-08-13

## R1 — Canonical tree model on the frontend

**Decision**: Extend `BlockInstance` with optional `slots?: Record<string, BlockInstance[]>` (default slot key: `"default"`). Page `blocks` remains an ordered list of root nodes. Renderer becomes recursive for **render only** (resolve → visibility → searchParams → dataContract → component + slot children). Tree structure is validated in the adapter (see R5), not re-invented in the renderer.

**Rationale**: Matches the clarified AST (type + props + slots). Reuses registry, `dataContract`, Suspense. Avoids a parallel type system.

**Alternatives considered**:
- Separate `ComponentNode` type alongside `BlockInstance` — extra adapter mapping, dual renderers.
- Children-only array — rejected by clarify (slots + Zod allowlists).

## R2 — Strapi / seed storage for nesting

**Decision**: Keep the page **dynamic zone as a flat list of root nodes**. Nesting lives in a **`slots` JSON field** on layout (and any nesting) primitives. Seed/mock JSON uses the same shape: root DZ entries with `__component`, and nested nodes inside `slots` as an array of objects that also use `__component` + `id` (adapter recursively `toDynamicZoneBlock`-style maps them into `BlockInstance` trees). `product-list` remains a normal typed DZ component with **no** nesting slots (Level 3 leaf).

**Rationale**: Content-model already allows `json` where free-form structure beats component explosion. Prior nested-DZ / nested-component experiments were reverted; unlimited typed Strapi nesting is high cost for home MVP. Recursive JSON + FE schema rules deliver tree semantics without Component Pokémon in Strapi schemas.

**Alternatives considered**:
- Fully typed nested Strapi components per depth — admin-friendly but schema explosion; rejected for MVP.
- Single page-level `composition` JSON replacing DZ — breaks existing page contract and other pages’ flat blocks.
- FE-only trees with opaque legacy DZ on Strapi — fails product tenant (`dataAdapter: "strapi"`) and seed parity.

## R3 — Home Level 1 vocabulary (minimal)

**Decision**: Ship only what home needs:

| Kind | Types |
|------|--------|
| Layout | `section`, `stack`, `flex`, `grid` |
| Content | `text`, `image`, `button` |
| Compound (L3) | `product-list` (existing tenant block) |

- **`section`**: page band — padding, optional background image/overlay/fit (covers today’s hero chrome without a bespoke `hero` type on home).
- **`stack` / `flex` / `grid`**: arrangement; props for gap, direction/align/justify, columns as needed.
- **`text`**: `variant` enum (`heading` \| `title` \| `subheading` \| `body`) + `content` + box styles (`fontSize`, …). Stats = stack of two texts.
- **`image`**: `src`, `alt`, optional sizing props.
- **`button`**: `label`, `href` (maps to today’s CTA links).

No accordion/tabs for home MVP (FR-013).

**Rationale**: Enough to rebuild hero, stats, image+text, CTA as Level 1/2; product-list stays L3.

**Alternatives considered**: Separate `heading` type — unnecessary if `text.variant` covers it. Keep using `hero` / `stats-bar` / `image-text` / `cta-banner` on home — rejected by clarify Option A.

## R4 — Level 2 compositions

**Decision**: Level 2 = **documented / hard-authored subtrees** in home mock+seed (and optional comments in catalog). No composition gallery CMS UI this feature. No separate renderer.

**Rationale**: Spec marks gallery as follow-on; home proves trees by authoring compositions directly.

## R5 — Composition validation (adapter is primary; untrusted JSON)

**Decision**: **Registry is the single source of truth** for each type: `component` + Zod **props** `schema` + **composition `policy`** (slot names, allowlists, `maxDepth`, level). The recursive **adapter** (`strapi-document` / shared `toBlockInstance` path) is the **only primary composition validator**:

```
CMS / mock JSON
  → known registry type?
  → Zod authored props valid?
  → slot name declared on policy?
  → child type allowlisted for that slot?
  → subtree depth within this node's maxDepth?
  → yes: BlockInstance  |  no: drop node + logger.warn (dev); never crash
```

Do **not** treat “looks like a component” JSON as trusted. Unknown types, illegal children, unknown slots, bad props, and over-depth nodes are omitted before `PageData` reaches the renderer.

**maxDepth semantics (explicit)**: A node is valid only when the **subtree rooted at that node** does not exceed **that node type’s** `maxDepth` (self = depth 1). **Parent remaining depth is not added to / subtracted from the child’s own `maxDepth`.** Example: `section`(4) → `stack`(3) → `flex`(3) → `text`(1) is valid if each subtree fits its own policy independently.

**Renderer**: Assumes a normalized tree. Does **not** re-run composition/allowlist/depth validation. May keep existing **dev-only Zod on merged props** (authored + dataContract) for drift detection — that is separate from composition policy.

**Rationale**: Clean boundary; one place owns tree safety; registry avoids duplicated allowlists across files.

**Alternatives considered**: Dual validation in adapter + renderer — drift risk. Global depth budget across ancestors — too restrictive vs per-type policies. Hard-fail 500 — rejected by edge cases.

## R6 — Renderer recursion vs top-level only

**Decision**: Replace flat-only `BlockRenderer` mapping with recursive **render**. Top-level `page.blocks` and every `slots.*` child use the same resolve → visibility → searchParams → dataContract → component path. Layout primitives render children via a shared recursive helper (not ad-hoc per component). Depth was already enforced at adapt time per R5.

**Rationale**: Spec FR-007; avoids NestedBlockList one-off from the reverted experiment.

## R7 — Legacy opaque blocks

**Decision**:
- **Home**: only Level 1 primitives + `product-list`. No `hero`, `stats-bar`, `image-text`, `cta-banner` on home.
- **Other bike pages**: keep existing `hero` and shared opaque blocks until a later migration.
- **Shared implementations**: keep registering `stats-bar`, `image-text`, `cta-banner`, etc., for non-home usage / resort fixture.
- **Remove** only bike-proprietary types that this feature fully replaces **and** that become unused — home does not delete tenant `hero` (still used elsewhere).

**Rationale**: Clarify Option A + FR-009; avoid breaking `/service`, `/about`, etc.

## R8 — Stale knowledge cleanup

**Decision**: In the same change set as implementation, rewrite `block-system.md` (and related catalog/content-model/mock-data/api notes) to describe the tree+slots model; remove inaccurate claims about live `grid` / `NestedBlockList` / `primitives/` that are not in code today.

**Rationale**: Constitution sync map; explore found docs ahead of code.

## R9 — Resort / other tenants

**Decision**: Additive shared primitives + recursive renderer. Resort mocks may keep flat legacy blocks; optional later playground tree. No mandatory resort home rewrite.

**Rationale**: Spec assumption; Principle V minimal scope.

## R10 — Editor UX consciously out of scope

**Decision**: This feature delivers **architecture + home content authored as trees** (mock/seed/Strapi `slots` JSON). It does **not** deliver a visual drag-and-drop composition editor. “Editors can build/customize most of a site from shared components” remains the product north star; comfortable in-admin composition UX is a **follow-on**.

**Rationale**: Spec/plan already exclude visual editor; call it out so implementers do not treat JSON authoring as the final editor experience.

**Alternatives considered**: Block feature on visual editor — rejected; would hostage the composition runtime.
