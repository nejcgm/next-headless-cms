# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  DEFAULT for headless-cms monorepo — replace or extend per feature in /speckit-plan.
  See also: .specify/memory/constitution.md and .specify/memory/project-context.md
-->

**Language/Version**: TypeScript; Node.js 20+; Next.js 15 (frontend); Strapi 5.44 (backend)

**Primary Dependencies**: Next.js 15, React 19, Strapi 5, Zod, Tailwind (frontend); Strapi core (backend)

**Storage**: Strapi → SQLite (local dev default) or Postgres (production/Railway); mock JSON files for mock tenants

**Testing**: ESLint matrix per tenant; `pnpm type-check`; `pnpm verify:build` for tenant isolation; manual dev verification

**Target Platform**: Vercel (frontend, one project per tenant); Railway or self-hosted (Strapi)

**Project Type**: Monorepo — web application (frontend + headless CMS backend)

**Performance Goals**: Standard marketing/CMS site expectations; Strapi fetch timeout 15s; ISR revalidate 60–300s by content type

**Constraints**: One build = one tenant (`TENANT_ID`); pnpm only in `next-headless-cms-fe/`; npm only in `headless-cms-backend/`; no cross-tenant bundles

**Scale/Scope**: 2 tenants today (vukans-bike Strapi, resort-example mock); 3 locales on bike; block-based page composition

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

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
