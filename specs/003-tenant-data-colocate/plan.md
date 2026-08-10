# Implementation Plan: Colocate Tenant Mock Data

**Branch**: `003-tenant-data-colocate` | **Date**: 2026-08-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-tenant-data-colocate/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Move tenant mock/seed JSON from `src/core/mock-data.ts/{folder}/` into `src/tenants/{tenantId}/mock-data/`. Point `@mock-data` (tsconfig + webpack) at that path for mock-adapter tenants; keep Strapi tenants on the existing stub. Remove `tenant-mock-map.json` short-folder indirection. Update scaffold, check-tenant, seed, leak patterns, and Spec Kit/human docs. **Gate the feature on:** (1) `verify:build` with no cross-tenant leakage for bike and resort builds, (2) mock adapter still resolves/loads content for `resort-example`, (3) Strapi adapter path for `vukans-bike` unchanged at runtime (stub + live CMS).

## Technical Context

**Language/Version**: TypeScript; Node.js 20+; Next.js 15 (frontend); Strapi seed script (Node) in backend

**Primary Dependencies**: Existing `prepare-tenant` / `tenant-build-utils` / `MockAdapter` / `StrapiAdapter` — path plumbing only

**Storage**: JSON files on disk (mock + seed source); Strapi remains runtime store for bike

**Testing**: `pnpm check:tenant`; `pnpm type-check`; `pnpm build:{tenant}` + `pnpm verify:build` for **both** tenants; manual/dev smoke for mock + Strapi adapters (see [quickstart.md](./quickstart.md))

**Target Platform**: Local FE builds; seed against local Strapi when validating FR-006

**Project Type**: Monorepo — primarily `next-headless-cms-fe/` + seed path in `headless-cms-backend/scripts/` + Spec Kit docs

**Performance Goals**: N/A (file move / alias change)

**Constraints**: Constitution I (isolation), II (layers — `data/` under tenant package is content, not a new `core`→`tenants` import), IV (Spec Kit sync), VII (clear structure, minimal noise). No adapter API redesign.

**Scale/Scope**: Two existing content trees (`vukans-bike`, `resort`→`resort-example`); tooling + docs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. One build, one tenant | PASS | Hard gate: verify:build both tenants after move; Strapi tenant must not webpack-resolve other tenants’ `data/` |
| II. Layer boundaries | PASS | Content under `tenants/{id}/mock-data/`; mock adapter still only imports `@mock-data` (build alias), not hard-coded cross-tenant paths |
| III. Single route | PASS | Untouched |
| IV. Spec Kit SoT | PASS | Update knowledge/catalogs/docs in same change set |
| V. Minimal changes | PASS | Path + scripts + docs; no JSON shape rewrite |
| VI. Data adapter contract | PASS | Mock vs Strapi selection unchanged; only on-disk location + alias targets |
| VII. Clean code | PASS | Drop obsolete mock-map; clear `data/` name |

**Post–Phase 1 re-check**: PASS — contract documents alias + isolation + dual-adapter validation explicitly.

## Project Structure

### Documentation (this feature)

```text
specs/003-tenant-data-colocate/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── tenant-data-paths.md
└── tasks.md                 # /speckit-tasks
```

### Source Code (touched)

```text
# Move
src/core/mock-data.ts/vukans-bike/**  →  src/tenants/vukans-bike/mock-data/**
src/core/mock-data.ts/resort/**       →  src/tenants/resort-example/mock-data/**
# Delete empty src/core/mock-data.ts/

next-headless-cms-fe/scripts/
├── tenant-build-utils.cjs      # alias → tenants/{id}/mock-data; simplify/remove map
├── tenant-registry.js          # leak patterns; map helpers
├── create-tenant.js            # stub under tenants/{id}/mock-data
├── check-tenant-setup.js       # required files new path
└── tenant-mock-map.json        # remove or empty + stop reading

headless-cms-backend/scripts/seed-vukans-bike-cms.js   # MOCK_ROOT

# Docs
.specify/memory/knowledge/{mock-data,architecture,new-tenant,deployment,typescript}.md
.specify/memory/project-context.md
specs/_catalogs/{vukans-bike,resort-example}.md
next-headless-cms-fe/docs/{DEVELOPMENT,BUILD-VERIFICATION,STRAPI-MIGRATION}.md
```

**Structure Decision**: Colocate under `tenants/{tenantId}/mock-data/`. Keep `@mock-data` alias. Frontend + seed script + Spec Kit.

## Complexity Tracking

> No constitution violations requiring justification.

## Phase 0 / Phase 1 outputs

| Artifact | Path |
|----------|------|
| Research | [research.md](./research.md) |
| Data model | [data-model.md](./data-model.md) |
| Contract | [contracts/tenant-data-paths.md](./contracts/tenant-data-paths.md) |
| Quickstart | [quickstart.md](./quickstart.md) |

## Implementation Phases (for `/speckit-tasks`)

| Phase | Goal | Exit criteria |
|-------|------|----------------|
| 1. Move files | Trees under `tenants/{id}/mock-data/`; old core tree gone | FR-001, FR-002, SC-001 |
| 2. Tooling aliases | tsconfig/webpack/scaffold/check/seed/map | FR-004–006 |
| 3. Isolation | Leak patterns + **verify:build both tenants** | FR-003, SC-003 |
| 4. Adapter smoke | Mock (resort) + Strapi (bike) still work | FR-008 + user gate |
| 5. Docs | Spec Kit + FE docs | FR-007, SC-005 |

## Next Command

`/speckit-tasks` — generate tasks including mandatory verify:build + mock/Strapi validation from quickstart.
