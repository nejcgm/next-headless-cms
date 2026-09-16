# Research: Admin Page Builder

**Feature**: `010-admin-page-builder`  
**Date**: 2026-09-14

Phase 0 decisions. Nest rules and wire shape are taken from live frontend policy (`composition-allow.ts`, layout `schema.ts` policies, `compose-validate.ts`) and Spec Kit `knowledge/content-model.md` / `block-system.md`. Admin APIs are from Strapi 5.44 docs.

## R1 — Where the composition surface lives

**Decision**: Implement the editor in **`headless-cms-backend/src/admin`** (enable `app.tsx` from `app.example.tsx`). Do **not** add a marketplace plugin, a second CMS, or a Next.js authoring app. Do **not** replace the Page collection.

**Rationale**: Spec requires one Page document: identity/SEO stay native; only the page body needs a new UI. Strapi 5 custom fields cannot wrap `dynamiczone` / `component` types. A full plugin package is heavier than needed for a single content type.

**Alternatives considered**:

| Option | Rejected because |
|--------|------------------|
| Next.js visual editor writing Strapi REST | Second product; preview-as-source-of-truth risk |
| Native nested DZs on every layout (finish the Section experiment) | Spec FR-012/013; Flex→Flex and depth caps are not native DZ product UX |
| Marketplace page-builder plugin | Parallel document shape; constitution V |
| `addEditViewSidePanel` as the only surface | Sidebar is too narrow for the whole page tree + field inspector |

**Host mechanics** (implement in this order):

1. Bind the surface to the existing form field `blocks` via Content Manager form context (`unstable_useContentManagerContext` / `useField('blocks')` as exposed in Strapi 5.44).
2. Prefer replacing the **page-only** dynamic-zone input (after R3, `page.blocks` is the **only** DZ in this repo). Investigate 5.44 internals for a typed input override; if none, **hide** the native DZ widget on `api::page.page` and inject the surface into the edit view so it occupies the main form column (portal into the edit form, or equivalent). Do not leave two add/reorder UIs for root bands.
3. Hide layout `slots` JSON from native component cards (`pluginOptions.content-manager.visible: false` on `slots`). The labeled technical JSON fallback (R7) is the only nested-JSON control.

## R2 — Storage stays the 006 composition tree (unified `slots`)

**Decision**: Keep **`page.blocks` as a dynamic zone** (root composition list). Unify **Section, Stack, Flex, and Grid** nested children on **`slots` JSON**: `{ "default": [ { "__component": "blocks.*", "id": <number>, …fields } ] }`. Do **not** add `contentTree`, `{ type, props, children }`, or a second page field.

**Rationale**: Spec FR-005/015 and out-of-scope “new top-level storage.” Frontend already normalizes `slots` into `BlockInstance.slots.default`. Public renderer unchanged (FR-006).

**Alternatives considered**: Nested DZs on Flex/Stack/Grid (the Section experiment path) — rejected in clarify. Root `blocks` as JSON — would replace DZ storage.

## R3 — Revert the Section `children` experiment

**Decision**: Remove `children` (dynamiczone) from `blocks.section`. Add `slots` (json) matching stack/flex/grid. Seed must **stop** rewriting `slots` → `children` (`seed-vukans-bike-cms.js` today copies `out.children = out.slots.default`).

**Rationale**: Spec FR-012/014. After this, the only remaining dynamic zone in the backend is `page.blocks` (confirmed by repo grep). That makes a page-level DZ input replacement safe (R1).

**Order of operations** (same feature, no long-term dual format):

1. Convert stored documents while `children` still exists (R4).
2. Change `section.json`; `npm run types:generate`.
3. Frontend drops the `children` → `slots` fold in `compose-validate.ts` in the same change set (defensive strip of a leftover `children` key from `props` is OK; do not keep a second nest reader).

## R4 — Auto-convert existing Section children

**Decision**: One migration that walks every Page document (draft **and** published, all `lang` values). For each node with `__component === "blocks.section"` and a `children` array: set `slots.default` to those children (recursively converted), then delete `children`. Preserve `id`, order, and component fields. Empty `children` → `{ default: [] }`. If a section already has `slots` and no `children`, recurse only. If both exist, **`children` wins** (that was the experimental source of truth).

**Delivery**:

- Script: `headless-cms-backend/scripts/convert-section-children-to-slots.js` (idempotent; no-op when nothing to convert).
- Document-service middleware on `api::page.page` create/update: same convert, then **hard-fail** validate (R6). Covers JSON fallback and REST clients.

**Rationale**: Spec FR-007/SC-004. Authors do not re-enter trees. Local/prod DBs that ran the Section experiment need the script before or with the schema drop.

**Alternatives considered**: Leave FE reading both formats indefinitely — forbidden by FR-014. Manual re-author — forbidden by FR-007.

## R5 — Nest rules: copy FE policy; hard-fail in admin/CMS write

**Decision**: Backend `src/page-composition/nest-rules.ts` **mirrors** live frontend policy (do not invent new caps):

| Parent | `maxDepth` (subtree height; self = 1) | `slots.default` allow |
|--------|----------------------------------------|------------------------|
| `section` | 6 | `LAYOUT_NEST_ALLOW` |
| `flex` | 4 | `LAYOUT_NEST_ALLOW` |
| `stack` | 4 | `STACK_NEST_ALLOW` (no `grid`) |
| `grid` | 5 | `GRID_NEST_ALLOW` (no nested `grid`) |
| Leaves (`text`, `image`, `iframe`, `icon`, `button`, `link`, `accordion`, Keep L3) | 1 | no slots |

Shared allowlists (from `composition-allow.ts`):

- `LAYOUT_NEST_ALLOW`: stack, flex, grid, text, image, iframe, icon, button, link, accordion
- `STACK_NEST_ALLOW`: same minus `grid`
- `GRID_NEST_ALLOW`: stack, flex, text, image, iframe, icon, button, link, accordion

Tenant extras (same as `registerTenantLayoutNestAllow`): for `tenant === "vukans-bike"`, add `product-list`, `bike-detail`, `gallery` to **every** nesting policy’s `default` allow (including stack/grid). Root `page.blocks` may also be those Keep types (already on the DZ).

**Flex inside Flex is allowed** (`flex` ∈ `LAYOUT_NEST_ALLOW`). **Section inside Section is not.** **Stack inside Grid is allowed; Grid inside Stack is not.**

**Validation split**:

| Layer | Behavior |
|-------|----------|
| Composition surface + JSON fallback | Block illegal add/nest before save (picker omit + save reject) |
| Strapi document middleware | **Hard-fail** (`ApplicationError`); do not persist |
| Public `compose-validate.ts` | Unchanged **soft-drop** (safety net if bad data already exists) |

Do **not** import frontend Zod into Strapi (separate packages). Field enumerations for the inspector come from **backend component JSON** (already the editor vocabulary). Nest-rules comments / Spec Kit contract must stay in lockstep with FE `schema.ts` policies; if FE policy changes later, update both in one change set.

**Alternatives considered**: Soft-fail in admin (same as public) — would pass SC-003. Sharing a new npm workspace of policies — over-engineered for this feature.

## R6 — Stable ids for new nested nodes

**Decision**: Nested `slots` nodes keep numeric `id` like today’s seed/JSON. New nested nodes get `max(existing ids in this page tree) + 1` (scan root DZ + nested slots). Do not use random UUIDs (frontend fallback is `${type}-${index}` only when `id` is missing). **New root** DZ items must **omit** `id` and use `__temp_key__` only; Strapi assigns the row id on save. Preserve `__temp_key__` on existing in-form roots. Never copy a nested composition `id` onto a new root (Strapi then treats it as an existing DZ row and throws).

**Rationale**: FR-008; matches `content-model.md` id notes.

## R7 — Technical JSON fallback

**Decision**: One React state: the `blocks` array (root DZ entries, each layout carrying `slots`). Default UI is the tree. Collapsed, labeled control (“Technical JSON (advanced)” or equivalent) shows pretty-printed JSON of that **same** array. Edits parse on apply/save. Invalid JSON → fail save, keep last valid tree. Disallowed nests in parsed JSON → same hard-fail as the tree (R5). Not a second stored field.

**Rationale**: Clarify Q4/Q5. Hide native `slots` textareas (R1) so authors are not shown two JSON boxes.

## R8 — Field inspector (not a freeform blob)

**Decision**: Selecting a node shows ordinary inputs for that component’s attributes (enumerations as dropdowns, booleans as toggles, strings as text), driven by `src/components/blocks/*.json` (+ Keep + accordion). Omit `slots`/`children` from the inspector (children are the tree). Do not change image strings to media relations (spec assumption).

**Rationale**: FR-009. Pixel-perfect canvas is out of scope (FR-011).

## R9 — Public API / populate

**Decision**: After R3, nested section children are JSON; they do **not** need extra populate. Keep `populate[blocks][populate]=*` because **root** DZ still embeds component sub-fields (`gallery.images`, `bike-detail.labels`). Update `knowledge/api-contract.md` in implement: remove “section `children` DZ” language; `slots` remains the nest wire.

**Frontend**: Remove the `rawChildren` fold in `compose-validate.ts` after conversion. Renderer unchanged.

## R10 — What this feature does not touch

**Decision**: No new Next routes; no navigation/product admin; no live public preview button; no `resort-example` authoring UX; no loosening of maxDepth/allowlists; no drive-by primitive restyles.

## R11 — Knowledge / catalog sync (implement change set)

**Decision**: Same PR as code, per `project-context.md` sync map:

- `knowledge/content-model.md` — section uses `slots`; mixed-storage rollout language removed
- `knowledge/block-system.md` — composition surface is in-scope; nested DZ experiment undone
- `knowledge/api-contract.md` — nest wire is `slots` only
- `knowledge/strapi-backend.md` — admin `src/admin` composition + convert script
- `specs/_catalogs/vukans-bike.md` — authors edit pages via composition surface

## R12 — Open implementation detail (not a product ambiguity)

Strapi 5.44 has **no documented public API** to replace a dynamic-zone Input. R1 lists a fallback (hide native widget + inject surface). If 5.44 internals offer a clean `dynamiczone` input override gated to `api::page.page`, prefer that. This does not change spec behavior.
