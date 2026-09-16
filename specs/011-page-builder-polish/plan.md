# Implementation Plan: Page Builder Editor Experience Upgrade

**Branch**: `011-page-builder-polish` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-page-builder-polish/spec.md`

## Summary

Polish the `010-admin-page-builder` MVP's composition surface (tree, field panel, JSON fallback) to look and behave like a first-party part of the Strapi admin — Design System controls throughout, drag-and-drop reorder, collapsible branches, per-node content summaries, grouped/labeled fields, and a native-feeling delete confirmation — without touching the underlying composition data model, nest rules, or public renderer (all owned by 010). Add live preview by enabling **Strapi 5.44's built-in Content Manager preview feature** (`admin.preview` config — already installed, currently unconfigured) and wiring its `handler` to the frontend's **existing** `/api/preview` draft-mode route; Strapi's preview always reflects the persisted document, so freshness is tied to the editor's own explicit Save rather than a background autosave (a debounced-autosave attempt was tried and reverted — it silently dropped edits made while a background save was in flight) — no new frontend page/route either way. Also fixed a concrete robustness gap in the current MVP: `PageCompositionHost` found and hid the native `blocks` field by scanning the DOM for CSS class fragments and literal "Blocks" label text, fragile across admin updates/localization — replaced with `app.addFields({ type: 'dynamiczone', Component })`, a documented Strapi extension point that fully replaces the native input instead of hiding it after the fact.

## Technical Context

**Language/Version**: TypeScript; Node.js 20+; Strapi 5.44 admin (React 18, `@strapi/design-system`, `@strapi/content-manager` extension points) — same package as `010-admin-page-builder`

**Primary Dependencies**: `@strapi/design-system` (already used, extend coverage — `Select`, `TextInput`, `Field`, `Checkbox`, drag affordances); `@dnd-kit/core` + `@dnd-kit/sortable` (already present transitively via Strapi's own Content Manager — add as an explicit `headless-cms-backend` dependency rather than relying on an undeclared transitive one); Strapi 5.44's native `admin.preview` config (built into `@strapi/strapi`/`@strapi/content-manager`, no new package); existing Next.js `/api/preview` route (frontend, unchanged) as the preview's rendering target

**Storage**: Unchanged — `page.blocks` dynamic zone + layout `slots` JSON (FR-012). No schema, seed, or migration changes in this feature.

**Testing**: Manual [quickstart.md](./quickstart.md); `pnpm type-check` / `pnpm check:types-style` in `next-headless-cms-fe/` only if the frontend needs a narrow preview-cooperation change; `npm run types:generate` only if `config/admin.ts` types require it (schema is unchanged, so likely not)

**Target Platform**: Strapi admin (authors, Railway-hosted per `strapi-backend.md`); existing Vercel bike frontend as the preview iframe's target (no new deploy target)

**Project Type**: Monorepo — **backend-primary** (admin UI polish + `config/admin.ts` preview wiring); frontend touched only if the optional field-focus-highlight enhancement or a CSP allowance is pursued

**Performance Goals**: Tree interactions (select/expand/collapse/drag/delete) feel immediate for pages with tens of nodes (existing scale, per `010` Technical Context); preview reflects an edit within a few seconds (SC-004), bounded by the debounce window, not per-keystroke

**Constraints**: No change to `page.blocks`/`slots` storage, nest rules, or public renderer (FR-012); no new Page document field; no pixel-perfect canvas; npm in `headless-cms-backend/`, pnpm in `next-headless-cms-fe/`; Spec Kit knowledge updated in the implement change set only if documented behavior actually changes (mount mechanism and preview are additive, not contract changes — confirm during implement whether `strapi-backend.md` needs a preview-config note)

**Scale/Scope**: Same as `010` — `vukans-bike` Page documents (3 locales); `resort-example` (mock adapter, no Strapi) is not an authoring or preview target

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|--------|
| I. One build, one tenant | Pass | Admin-only change; preview handler reads `page.tenant`/`slug` per document, no cross-tenant bundling. |
| II. Layer boundaries | Pass | Entirely within `headless-cms-backend/src/admin` + `config/admin.ts`; no new `shared/` → tenant imports; frontend touched only if the optional highlight script is pursued. |
| III. Single route, block composition | Pass | Preview reuses the existing single page route and `/api/preview`; no new Next.js routes. |
| IV. Spec Kit SoT | Pass | `strapi-backend.md` gets a short preview-config note in the implement change set; no other knowledge doc's documented contract changes (storage/nest-rules/API shape are all unchanged). |
| V. Minimal, focused changes | Pass | Explicitly forbids touching storage/nest-rules/renderer (FR-012); reuses Strapi's own native preview feature and its own transitively-available drag library instead of building either from scratch. |
| VI. Data adapter contract | Pass | No REST contract change — `/api/preview` is called with the same `secret`/`slug` params it already accepts. |
| VII. Clean, maintainable code | Pass | Directly targets code-quality debt named in Assumptions/FR-015 (fragile DOM-text-matching mount hook, unlabeled raw-schema field rendering) with the least invasive fix Strapi's own APIs allow. |

**Post-design re-check**: Pass — see [research.md](./research.md) R1 (mount mechanism), R4 (preview handler) for why each choice stays inside these boundaries.

## Project Structure

### Documentation (this feature)

```text
specs/011-page-builder-polish/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── live-preview.md
    └── composition-ux.md
```

### Source Code (packages touched)

```text
headless-cms-backend/
├── config/admin.ts                              # add `preview.enabled` + `handler` + `allowedOrigins`
├── src/admin/page-composition/
│   ├── PageCompositionHost.tsx                   # addFields-based mount; no autosave (research R1/R3)
│   ├── CompositionTree.tsx                       # drag-and-drop reorder, collapse/expand, block summaries
│   ├── FieldInspector.tsx                        # Design System controls, grouped content/appearance fields
│   ├── JsonFallback.tsx                          # Design System styling, clearer inline error state
│   ├── field-catalog.ts                          # field grouping + block-summary field mapping
│   ├── ErrorMessage.tsx                          # NEW — shared error display
│   └── block-summary.ts                          # NEW — per-type summary derivation (data-model.md)
├── src/page-composition/                          # nest-rules/validate/ids/convert — unchanged (owned by 010)
└── package.json                                   # add @dnd-kit/core, @dnd-kit/sortable as explicit deps

next-headless-cms-fe/                              # touched only if research R5's optional enhancement is taken
└── (no required change — /api/preview is reused as-is)

.specify/memory/knowledge/strapi-backend.md         # short preview-config note (implement change set)
```

**Structure Decision**: Backend admin package only for the required scope (US1, US2, US3). The frontend needs no required change — `/api/preview` already does exactly what the preview handler needs. A tiny optional frontend script (research R5) is called out separately so it doesn't block the rest of the feature if deferred.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

Default monorepo layout — delete or narrow in plan.md if the feature touches only one package:

```text
next-headless-cms-fe/
├── src/app/                 # Next.js routing (thin)
├── src/core/                # CMS engine, adapters, blocks registry
├── src/tenants/{tenant-id}/ # Blocks, templates, config
├── src/shared/              # Shared UI
└── scripts/                 # prepare-tenant, verify-build, create-tenant

headless-cms-backend/
├── src/api/                 # page, navigation, product
├── src/components/          # blocks.*, shared.*
└── scripts/                 # seed-vukans-bike-cms.js

.github/workflows/           # ci.yml, deploy-bike.yml, deploy-resort.yml
```

**Structure Decision**: [Document which packages this feature touches — frontend, backend, or both — and reference directories above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
