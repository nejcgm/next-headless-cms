# Implementation Plan: Bike Home Shared Composition

**Branch**: `006-bike-home-shared-compose` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-bike-home-shared-compose/spec.md`

## Summary

Rebuild Vukan's Bike **home** as a **shared composition tree**: Level 1 layout/content primitives (`section`, `stack`, `flex`, `grid`, `text`, `image`, `button`) with **slots** + Zod/composition policies on the **registry**, recursive **adapter validation** then recursive **renderer**, and **`product-list` as the only Level 3** node. Page DZ stays a flat root list; nesting is stored in **`slots` JSON** (mock/seed/Strapi; untrusted until validated). Opaque marketing blocks stay available for other pages; home must not use them. **No visual editor** this feature (JSON/seed authoring only). Prior flat-only nesting docs/`NestedBlockList` claims are replaced by this model.

## Technical Context

**Language/Version**: TypeScript; Node.js 20+; Next.js 15 (frontend); Strapi 5.44 (backend)

**Primary Dependencies**: Next.js 15, React 19, Strapi 5, Zod, Tailwind (frontend); Strapi core (backend)

**Storage**: Strapi page `blocks` DZ + `slots` JSON on nesting primitives; mock JSON seed/reference; SQLite/Postgres per env

**Testing**: ESLint matrix per tenant; `pnpm type-check`; `pnpm verify:build`; manual home + locale checks per [quickstart.md](./quickstart.md)

**Target Platform**: Vercel (frontend per tenant); Railway/self-hosted Strapi

**Project Type**: Monorepo — frontend + headless CMS backend

**Performance Goals**: Marketing-site norms; recursive depth capped per policy (≤4 for home layouts)

**Constraints**: One build = one tenant; shared ↛ tenants; pnpm FE / npm BE; no visual editor or composition gallery this feature (architecture + home trees only — editor UX is follow-on)

**Scale/Scope**: Bike home (3 locales) first; additive shared primitives; other pages/tenants unchanged unless broken by renderer

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|--------|
| I. One build, one tenant | Pass | No cross-tenant bundling; `product-list` stays tenant-owned |
| II. Layer boundaries | Pass | Primitives in `shared/`; recursive render in `core/`; tenant compound unchanged |
| III. Single route, block composition | Pass | Still one `[[...slug]]` page; richer trees inside blocks |
| IV. Spec Kit SoT | Pass | Plan updates knowledge/catalog in implement change set |
| V. Minimal focused changes | Pass | Home-only content migration; legacy blocks kept for other pages |
| VI. Data adapter contract | Pass | Extend `strapi-document` recursively; seed + content-model + api notes together |
| VII. Clean maintainable code | Pass | Match registry/schema/`types.ts` conventions; minimal comments |

**Post-design re-check**: Still Pass — JSON `slots` is an intentional content-model exception (already used for free-form JSON elsewhere), documented in research R2 / data-model.

## Project Structure

### Documentation (this feature)

```text
specs/006-bike-home-shared-compose/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── composition-tree.md
└── tasks.md                 # /speckit-tasks (not this command)
```

### Source Code (packages touched)

```text
next-headless-cms-fe/
├── src/core/types/page.ts              # BlockInstance.slots
├── src/core/blocks/registry.ts         # SoT: component + schema + policy
├── src/core/blocks/types.ts            # CompositionPolicy on BlockDefinition
├── src/core/blocks/renderer.tsx        # recursive render (no composition re-validation)
├── src/core/data/strapi/strapi-document.ts  # recursive slots → validate → BlockInstance
├── src/shared/components/blocks/       # section, stack, flex, grid, text, image, button + index
└── src/tenants/vukans-bike/mock-data/pages/{home,en--home,de--home}.json

headless-cms-backend/
├── src/components/blocks/{section,stack,flex,grid,text,image,button}.json
├── src/api/page/content-types/page/schema.json   # DZ components list
└── scripts/seed-vukans-bike-cms.js               # if seed assumptions change

.specify/memory/knowledge/{block-system,content-model,mock-data}.md
specs/_catalogs/vukans-bike.md
```

**Structure Decision**: Both FE and BE. Core engine + shared primitives + bike home content/seed + Spec Kit docs. No new Next routes. No resort mandatory rewrite.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Phase 0 & 1 outputs

| Artifact | Path |
|----------|------|
| Research | [research.md](./research.md) |
| Data model | [data-model.md](./data-model.md) |
| Contract | [contracts/composition-tree.md](./contracts/composition-tree.md) |
| Quickstart | [quickstart.md](./quickstart.md) |

## Plan adjustments (post-review 2026-08-13)

Accepted without redesign — see research R5 / R10 and data-model maxDepth section:

| Topic | Decision |
|-------|----------|
| maxDepth | Per-node subtree height; parent limits do **not** accumulate onto children |
| Validation locus | **Adapter primary**; renderer assumes normalized tree |
| Registry SoT | `component` + `schema` + `policy` on registration |
| slots JSON | Untrusted until registry + Zod + allowlist + depth pass |
| Editor UX | Consciously **out of scope**; JSON/seed/Strapi authoring only |

## Implementation outline (for `/speckit-tasks`)

1. Core: `slots` on `BlockInstance`; `CompositionPolicy` on registry; recursive **adapter validate-then-normalize**; recursive **renderer** (no composition re-check).
2. Shared Level 1 primitives: each registers schema + policy together (quoted keys).
3. Strapi components + page DZ + types generate.
4. Rewrite bike home mocks (sl/en/de) + seed; keep `product-list` props/behavior.
5. Remove home usage of opaque marketing blocks; do not delete `hero`/shared sections still used elsewhere.
6. Update Spec Kit knowledge + bike catalog; fix stale grid/NestedBlockList docs; note editor UX follow-on.
7. Quickstart verification (type-check, lint:bike, home locales, verify:build).
