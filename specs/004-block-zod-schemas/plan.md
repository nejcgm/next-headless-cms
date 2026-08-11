# Implementation Plan: Block Prop Validation Schemas

**Branch**: `004-block-zod-schemas` | **Date**: 2026-08-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-block-zod-schemas/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Add a Zod prop schema for every registered content block that lacks one (shared + `vukans-bike` + `resort-example`), wire each at registration, and update Spec Kit so schemas are required for new blocks. Reuse the existing renderer path: development-only `safeParse` + warn, unknown keys stripped. Do not change production behavior or introduce hard failures. Reference patterns: `vukans-bike/blocks/hero/schema.ts`, `resort-example/blocks/room-list/schema.ts`.

## Technical Context

**Language/Version**: TypeScript; Node.js 20+; Next.js 15 (frontend only)

**Primary Dependencies**: Zod (already in FE); existing `BlockDefinition.schema` + `validateBlockProps` in `core/blocks/renderer.tsx`

**Storage**: N/A (no CMS schema or mock JSON shape changes required)

**Testing**: `pnpm type-check`; `pnpm lint:bike` / `pnpm lint:resort`; manual `pnpm dev:bike` / `pnpm dev:resort` prop-break smoke (see [quickstart.md](./quickstart.md))

**Target Platform**: Local FE development (validation is NODE_ENV=development only)

**Project Type**: Monorepo — `next-headless-cms-fe/` + Spec Kit docs

**Performance Goals**: Zero production cost (existing no-op when not development)

**Constraints**: Constitution I–VII; no new cross-layer imports; no comments inside interfaces; schemas mirror authored props (not full `dataContract` entities unless already required); header/footer out of scope

**Scale/Scope**: ~6 shared + ~15 bike (1 existing) + ~10 resort (1 existing) content block registrations; docs in `knowledge/block-system.md` + both tenant catalogs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. One build, one tenant | PASS | Schemas colocated under shared / per-tenant block folders; no cross-tenant imports |
| II. Layer boundaries | PASS | Shared schemas under `shared/components/blocks/`; tenant schemas under `tenants/{id}/blocks/`; core renderer unchanged except consuming existing `schema` field |
| III. Single route | PASS | Untouched |
| IV. Spec Kit SoT | PASS | Same change set: `knowledge/block-system.md`, `specs/_catalogs/vukans-bike.md`, `specs/_catalogs/resort-example.md` |
| V. Minimal changes | PASS | Add `schema.ts` + registration wiring; no renderer redesign |
| VI. Data adapter contract | PASS | No Strapi/REST shape change; schemas mirror existing FE prop contracts |
| VII. Clean code | PASS | No interface JSDoc; follow hero/room-list Zod style; no narrating comments |

**Post–Phase 1 re-check**: PASS — contracts document registry inventory, authored-vs-injected split, and doc sync without new architecture.

## Project Structure

### Documentation (this feature)

```text
specs/004-block-zod-schemas/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── block-schema-registry.md
└── tasks.md                 # /speckit-tasks
```

### Source Code (touched)

```text
next-headless-cms-fe/
├── src/shared/components/blocks/
│   ├── schema.ts or per-block schema.ts   # prefer per-block next to component for shared
│   └── index.ts                           # wire schema on each registration
├── src/tenants/vukans-bike/blocks/
│   ├── {block}/schema.ts                  # missing only; keep hero/schema.ts
│   └── index.ts
├── src/tenants/resort-example/blocks/
│   ├── {block}/schema.ts                  # missing only; keep room-list/schema.ts
│   │                                      # resort hero: add schema.ts (+ optional types.ts not required)
│   └── index.ts
└── (core/blocks/renderer.tsx — no behavior change expected)

.specify/memory/knowledge/block-system.md
specs/_catalogs/vukans-bike.md
specs/_catalogs/resort-example.md
```

**Structure Decision**: Frontend-only. One `schema.ts` per block folder (shared: colocate next to the `.tsx` or a sibling `schema.ts` in the same blocks directory using the block name — see research). No backend or mock-data changes unless a schema reveals real drift (fix as follow-up, do not weaken schemas to hide bad data without noting it).

## Complexity Tracking

> No constitution violations.
