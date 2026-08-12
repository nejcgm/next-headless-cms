# Implementation Plan: FE Options Types Coverage

**Branch**: `005-fe-options-types-coverage` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-fe-options-types-coverage/spec.md`

## Summary

Finish adopting the dual TypeScript house style across all of `next-headless-cms-fe`: **components always** take props from a module `types.ts`; **functions/methods with 3+ parameters** take a single options object from that module’s `types.ts` (exceptions only platform APIs and React `cache` primitive-key internals). Migrate remaining leftovers (adapter helpers, cache tags, fetch helpers, format/logger, route shell props), update Spec Kit `typescript.md` (+ api-contract touchpoints), and add a CI-wired compliance script so the convention cannot regress silently.

## Technical Context

**Language/Version**: TypeScript; Node.js 20+; Next.js 15 (frontend only)

**Primary Dependencies**: Next.js 15, React 19; existing ESLint; new repo script (Node, no new runtime deps preferred)

**Storage**: N/A (refactor of call shapes / type placement only)

**Testing**: `pnpm type-check`; new `pnpm check:types-style` (name TBD in research); `pnpm lint:bike` / `lint:resort`; smoke via existing tenant verify if needed

**Target Platform**: Frontend package + GitHub Actions CI (`type-check` job)

**Project Type**: Monorepo — frontend-only change set

**Performance Goals**: N/A (no product behavior change)

**Constraints**: One build = one tenant; pnpm only in FE; Spec Kit sync for `typescript.md` / `api-contract.md` in same change set; no re-exports of types from implementation files; React `cache` must keep primitive keys internally

**Scale/Scope**: Entire `next-headless-cms-fe/src/{app,core,shared,tenants}` + `scripts/` compliance tool; both tenants’ blocks/templates/route consumers

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| I. One build, one tenant | PASS | No tenant bundling changes |
| II. Layer boundaries | PASS | Types stay in owning module / `core/types`; no new `core→tenants` imports |
| III. Single route | PASS | Route shells get `types.ts` beside existing page/layout/error only |
| IV. Spec Kit SoT | PASS | Update `knowledge/typescript.md` (+ api-contract if adapter signatures documented) |
| V. Minimal focused changes | PASS | Signature/type placement refactor only; no product features |
| VI. Data adapter contract | PASS | REST unchanged; FE adapter method *shapes* may change — document in api-contract |
| VII. Clean maintainable code | PASS | Aligns with explicit interfaces at boundaries; no comment essays |

**Post–Phase 1 re-check**: PASS — contracts document dual rule + compliance CLI; no new architecture layers.

## Project Structure

### Documentation (this feature)

```text
specs/005-fe-options-types-coverage/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── typing-conventions.md
│   └── types-style-check.md
└── tasks.md                 # /speckit-tasks (not this command)
```

### Source Code (repository root)

```text
next-headless-cms-fe/
├── src/app/                 # Route shells → add/use folder types.ts for props
├── src/core/                # Finish 3+ options; module types.ts
├── src/shared/              # Components + format/logger options
├── src/tenants/*/           # Blocks already strong; fix any leftovers
├── scripts/                 # check-types-style (compliance)
├── package.json             # check:types-style script
└── .eslintrc.json           # unchanged unless script alone insufficient

.github/workflows/ci.yml     # Run check:types-style with type-check
.specify/memory/knowledge/typescript.md
.specify/memory/knowledge/api-contract.md  # if adapter helper signatures listed
```

**Structure Decision**: Frontend package only. Compliance lives under `next-headless-cms-fe/scripts/` and is invoked via pnpm + CI. Spec Kit knowledge updated in the same change set.

## Complexity Tracking

> No constitution violations requiring justification.
