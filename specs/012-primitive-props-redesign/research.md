# Research: Primitive Props Redesign

**Feature**: `012-primitive-props-redesign`
**Date**: 2026-09-15

Phase 0 decisions. Grounded in the actual current primitive source (`next-headless-cms-fe/src/shared/components/primitives/**`, `.../ui/accordion/`, `tenants/vukans-bike/blocks/gallery/`), the current Strapi component schemas (`headless-cms-backend/src/components/blocks/*.json`), the `010`/`011` nest-rule and admin-surface precedents, and live verification of `lucide-react` and `@strapi/design-system`'s `Combobox`.

## R1 — Sizing convention: extend the existing free-text box-style fields, don't replace them

**Decision**: `width`/`height`/`maxWidth` are *already* free-text strings in `boxStyleSchema` (`z.string().nullish()`) — no schema type change needed there. Add `minWidth`/`minHeight`/`maxHeight` as the same free-text shape (missing today, needed for Flex per spec FR-002). Add one small shared helper, `toCssSize(value: string): string | undefined`, used everywhere `toBoxStyle()` currently passes a raw sizing string straight into an inline style: bare digits → append `px`; a value ending in `%` → pass through unchanged; anything else (e.g. `"2rem"`, `"auto"`) → treat as invalid per spec's Edge Cases (drop it and dev-warn, the same soft-fail posture `compose-validate.ts` already uses for other invalid authored data — not a hard save-time rejection, since this is a rendering-time concern, not a composition-tree-shape concern).

**Rationale**: The current system already migrated *away* from free-text sizing once (`009-bike-strapi-migration`, replacing `width: "100%"` with a `fullWidth` boolean) specifically because untyped sizing was error-prone for editors. This feature deliberately reverses that call per explicit, detailed user instruction — but the fix this time is to make the free-text convention itself predictable (one parsing rule, applied uniformly) rather than leaving it ad hoc like before. Keeping `fullWidth` alongside general sizing wherever the reviewed shape explicitly keeps it (Image, Iframe — spec Assumptions) means both conventions coexist without conflict: `fullWidth: true` is sugar for "treat as 100% width," `toCssSize` handles the general case.

**Alternatives considered**: A numeric-only field with a separate unit enum (`{ value: number, unit: "px" | "%" }`) — rejected, more fields for less editor-friendliness than the single-string convention the user explicitly specified (`"320"` / `"50%"`).

## R2 — Icon library: `lucide-react`, static map for server render, `Combobox` for the admin picker

**Decision**: Add `lucide-react` (ISC license, ~1,847 icons as of this writing) as a new frontend dependency. The server-rendered `Icon` primitive (`icon.tsx`, a React Server Component with no client interactivity) resolves its icon by **direct property lookup on a small generated map** (`icon-map.ts`: `Record<string, LucideIcon>`, built from `lucide-react`'s full static export, keyed by kebab-case name) — **not** `lucide-react/dynamic`'s `DynamicIcon`/`dynamicIconImports`. The Strapi admin's icon picker (a genuinely interactive, client-side, ~1,850-option search UI) uses `@strapi/design-system`'s `Combobox` (already installed via `011`), which ships its own `VirtualizedList` for exactly this scale of option list, plus `filterValue`/`onFilterValueChange` for live search.

**Rationale**: `lucide-react`'s own docs explicitly say `DynamicIcon` "is not recommended" for statically-known icon names and warns of SSR flash-of-missing-icon and extra per-icon network requests — tradeoffs that exist to solve a *client bundle size* problem. A Server Component's own code is never shipped to the browser at all, so that tradeoff buys nothing here; a synchronous static lookup avoids the SSR caveat entirely. The *admin picker*, by contrast, is a real client-side interactive surface where rendering/searching ~1,850 options without virtualization would be sluggish — that's exactly what `Combobox`'s `VirtualizedList` exists for, and it's already in this codebase's dependency tree via `011`.

**Icon names**: kebab-case, matching `lucide-react`'s own canonical naming (`dynamicIconImports`'s keys) — e.g. `"arrow-right"`, `"calendar"`. The Strapi `icon.json` schema's `name` field stays a real `enumeration` (closed set, per FR-018 / the project's dropdown-first standard), generated from `lucide-react`'s icon list by a small script rather than hand-typed — treated as a build artifact, the same way `types/generated/` already is.

**Alternatives considered**: MUI icons (rejected — pulls in Material Design's own visual language and a much heavier dependency for a project with no other MUI usage); a curated icon subset instead of the full library (rejected — spec FR-013 explicitly asks for the full library, not a curated one); `DynamicIcon` everywhere including the server render (rejected per the SSR caveat above).

## R3 — Icon migration: already trivial, no data transform needed

**Decision**: The three existing icon names (`"map-pin"`, `"phone"`, `"mail"`) already exactly match `lucide-react`'s own canonical kebab-case names (`MapPin`, `Phone`, `Mail`). Widening the enum to the full library and swapping the hand-drawn inline-SVG branches in `icon.tsx` for the generated map is sufficient — no seed-script or Strapi-content transform is needed for existing Icon usages (confirms spec FR-014 is satisfied "for free" here).

## R4 — Nest rules: mirror the `010`/`011` two-registry pattern for every changed primitive

**Decision**: Update both registries the same way `010` and `011` already established (frontend `composition-allow.ts` is the source of truth; backend `page-composition/nest-rules.ts` mirrors it — Strapi can't import the Next app):

| Primitive | Change |
|-----------|--------|
| Stack | Removed entirely from every allow-list and from both registries' component maps. |
| Accordion | `accordionPolicy` moves from leaf (`maxDepth: 1, slots: {}`) to a container: `maxDepth: 4` (matching Flex's existing depth budget — an accordion panel is a bounded content area, not a full page section), `slots.default.allow = LAYOUT_NEST_ALLOW` (the same broad set Flex/Stack already used, now that Stack is gone). |
| Gallery | New, narrow policy: `maxDepth: 2`, `slots.default.allow = ["image"]` only. |
| Link, Button | New, narrow policy: `maxDepth: 2`, `slots.default.allow = ["icon", "text"]` only, `slots.default.maxItems = 2` (one Icon, one Text — no reason to allow more than one of each). |
| Section, Flex, Grid | Allow-lists lose `"stack"`; otherwise unchanged (they already allowed `flex`, which now covers what `stack` used to). |

**Rationale**: This is the exact mechanism `010` built and `011` reused — no new pattern needed, just new entries and one removal in existing data structures (`LAYOUT_NEST_ALLOW`, `STACK_NEST_ALLOW` (deleted), `GRID_NEST_ALLOW`, plus two new narrow constants for Gallery and Link/Button).

**Depth budget note**: `subtreeHeight` in both `compose-validate.ts` (frontend, soft-drop safety net) and `validate.ts` (backend, hard-fail on write) already compute per-node, not globally, so adding Accordion/Gallery/Link/Button to the policy map doesn't require touching that shared logic — only the policy *data* (allow-lists, `maxDepth`) changes, exactly as `010`'s own research already found for Section/Stack/Flex/Grid.

## R5 — Gallery promotion: from tenant Keep leaf to shared container, following the Accordion precedent exactly

**Decision**: Move `gallery.tsx`/`schema.ts`/`types.ts` from `tenants/vukans-bike/blocks/gallery/` to `shared/components/ui/gallery/` (the same folder Accordion already lives in — `content-model.md`'s existing "L3 Compounds" category: "shared, interactive/domain leaves"). Register it in `shared/components/index.ts` alongside Accordion instead of in the tenant's `blocks/index.ts`. Backend `blocks/gallery.json` (already a shared, non-tenant-namespaced component file — confirmed: it was never actually under a tenant-specific Strapi component category) needs no path change, only a field-shape change (drop `images`/`defaultImageAlt`/label strings, add `slots: json`, keep `heading`/`subheading`, add `layout`/`columnsMobile`/`columnsTablet`/`columnsDesktop`/`gap`).

**Rationale**: Gallery's new shape (heading + layout + Image-only children, no bike-specific data) is architecturally identical in kind to Accordion (a shared, generic, interactive content compound) — it no longer has any Vukan's-Bike-specific knowledge, so keeping it under `tenants/vukans-bike/` would misrepresent it as tenant-owned when it's now general-purpose. `resort-example` gains access to it "for free" as a shared primitive (consistent with the spec's Assumption that shared-primitive changes reach every tenant), even though only Vukan's Bike's actual content is rebuilt.

## R6 — Link/Button as containers: component signature, and the accessible-label fallback

**Decision**: `ButtonBlock`/`LinkBlock` (currently `{ label: string, href, variant, ...box }`) become `{ children: ReactNode, href, variant, accessibleLabel?: string, ...box }`, where `children` is the already-recursively-rendered nested Icon/Text output (the existing block renderer already recurses into `slots.default` for every container — Button/Link just join that mechanism instead of taking a flat string). `showArrow` (Link) stays a flat boolean, applied by the component *after* `children`, same visual position as today's `${label} →` suffix — it's a decorative affordance, not part of the composed label. `accessibleLabel` is a new, optional flat string field on both Strapi schemas; when present, it becomes the `aria-label` on the rendered `<a>`/native button element. Validation (frontend Zod, backend hard-fail) requires `accessibleLabel` whenever a Link/Button's children resolve to Icon-only (no Text child) — the exact condition spec FR-012 names.

**Rationale**: Reuses the container-render path every other container already has; adds exactly one new field, scoped to exactly the case that needs it (an Icon-only control has no other source of an accessible name once the flat `label` is gone).

**Alternatives considered**: Always require `accessibleLabel` regardless of children — rejected, redundant/annoying for the common Text-only or Icon+Text cases where the rendered text already serves as the accessible name.

## R7 — Content migration: seed-script reshape (new content) + a one-time Strapi migration script (already-seeded content)

**Decision**: Two coordinated mechanisms, matching the precedent `009` (seed-script field reshaping) and `010` (`convert-section-children-to-slots.js`, a one-time idempotent migration script) already established:

1. `scripts/seed-vukans-bike-cms.js` gains new `transformFieldsForComponent` cases: Stack nodes become Flex nodes (`direction: "column"`) as they're read from mock JSON; Button/Link's `label` (+ optional `icon`) becomes a synthesized `children` array (a `text` node, optionally preceded by an `icon` node); Gallery's `images[]` becomes a `children` array of `image` nodes; Accordion's flat `content` string becomes a single `text` child. Mock JSON source files themselves are **not** rewritten by hand — the seed script keeps doing the reshaping on the way in, exactly as it already does for the `009` field renames.
2. `scripts/migrate-012-primitive-props.js` (new, idempotent, modeled directly on `convert-section-children-to-slots.js`): walks every already-seeded Page document (draft **and** published, every `lang`) and applies the same node-level transforms server-side, for any Strapi database that was seeded before this migration lands (so re-seeding isn't the only path to a consistent state).

**Rationale**: This is the same two-track approach `009`/`010` already used for a schema-shape change reaching both fresh seeds and already-live content — no new migration mechanism invented.

## R8 — What this feature does not touch

**Decision** (explicit boundary, restated from spec Out-of-Scope): No media-library upload/relation system; no Gallery lightbox/carousel; no changes to `011`'s composition-surface UX (tree/drag-drop/live-preview) beyond the one new Combobox control for the icon field; no redesign of `resort-example`'s actual page content/design — only the mechanical field-shape migration needed to keep it compiling and rendering.
