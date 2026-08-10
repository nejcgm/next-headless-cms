# Implementation Plan: Clean Block Request Params

**Branch**: `002-block-request-params` | **Date**: 2026-08-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-block-request-params/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Stop merging the full URL query into every block’s CMS `props` in `page.tsx`. Pass request query through an explicit **block request context** into `BlockRenderer` / `dataContract` (`ctx.searchParams`), with optional per-block `acceptSearchParams` for components that must see selected keys on props. Client interactive blocks keep using client URL APIs. Update Spec Kit `block-system` (+ fixture consumers as needed) in the same change set.

## Technical Context

**Language/Version**: TypeScript; Node.js 20+; Next.js 15 (frontend)

**Primary Dependencies**: Next.js 15, React 19, Zod (frontend only for this feature)

**Storage**: N/A (request-scoped query only; no CMS schema change)

**Testing**: `pnpm type-check`; tenant lint; manual checks in [quickstart.md](./quickstart.md) (colliding query vs CMS headline; room-detail dates via context if exercised)

**Target Platform**: Vercel frontend (product tenant); local `pnpm dev:bike` / `dev:resort` for validation

**Project Type**: Monorepo — **frontend-only** change (`next-headless-cms-fe/` + Spec Kit docs)

**Performance Goals**: No extra network; same RSC composition path; negligible CPU (normalize query once per request)

**Constraints**: One build = one tenant; single catch-all page route; constitution layer boundaries; Spec Kit sync in same change set; no unconditional all-query→all-props merge

**Scale/Scope**: Core block engine + `page.tsx`; migrate fixture `room-detail` loader that today reads dates from props; product bike likely has no query consumers today

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. One build, one tenant | PASS | No cross-tenant imports; fixture touch only if needed |
| II. Layer boundaries | PASS | Changes in `app/` + `core/blocks`; tenants only update their `dataContract` signatures/usages |
| III. Single route, block composition | PASS | Still only `[[...slug]]/page.tsx`; no new routes |
| IV. Spec Kit SoT | PASS | Update `knowledge/block-system.md` (+ catalog note if room-detail docs mention props-from-query) |
| V. Minimal focused changes | PASS | Remove merge; extend ctx; optional registry field; migrate known consumers |
| VI. Data adapter contract | PASS | Adapters unchanged; Strapi out of scope |

**Post–Phase 1 re-check**: Still PASS — contracts are internal FE block APIs only; no adapter/REST changes.

## Project Structure

### Documentation (this feature)

```text
specs/002-block-request-params/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── block-request-context.md
└── tasks.md                 # /speckit-tasks (not this command)
```

### Source Code (touched)

```text
next-headless-cms-fe/
├── src/app/[domain]/[[...slug]]/page.tsx          # remove global query→props merge; pass searchParams to BlockRenderer
├── src/core/blocks/types.ts                       # extend DataContract ctx; optional acceptSearchParams
├── src/core/blocks/renderer.tsx                   # thread searchParams; opt-in prop merge; pass ctx.searchParams
├── src/tenants/resort-example/services/roomDetail.service.ts  # read dates from ctx.searchParams (not CMS props)
├── src/tenants/resort-example/blocks/index.ts     # wire ctx into fetchRoomDetailData
└── docs/DEVELOPMENT.md                            # if it implies old pattern (align lightly)

.specify/memory/knowledge/block-system.md          # document channels
specs/_catalogs/resort-example.md                  # only if it claims props-from-query
```

**Structure Decision**: Frontend + Spec Kit only. No `headless-cms-backend/` changes.

## Complexity Tracking

> No constitution violations requiring justification.

## Phase 0 / Phase 1 outputs

| Artifact | Path |
|----------|------|
| Research | [research.md](./research.md) |
| Data model | [data-model.md](./data-model.md) |
| Contract | [contracts/block-request-context.md](./contracts/block-request-context.md) |
| Quickstart | [quickstart.md](./quickstart.md) |

## Implementation Phases (for `/speckit-tasks`)

| Phase | Goal | Exit criteria |
|-------|------|----------------|
| 1. Types + renderer | `searchParams` on renderer/ctx; optional `acceptSearchParams` | FR-001–003 |
| 2. Page route | Remove global merge; pass query into renderer | SC-001, SC-003 |
| 3. Consumers | Migrate `room-detail` (and any other props-from-query uses) | FR-005, SC-002 |
| 4. Docs | Spec Kit block-system + light FE doc align | FR-006, SC-004 |

## Next Command

**Implement complete** (2026-08-10): tasks T001–T020 done. Validate SC-001 manually with `pnpm dev:bike` + colliding query if desired.
