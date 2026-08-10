# Implementation Plan: Cursor Rules to Spec Kit Full Migration

**Branch**: `001-cursor-to-speckit` | **Date**: 2026-08-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-cursor-to-speckit/spec.md` (amended for full migration + `.mdc` removal)

**Note**: This plan is filled by `/speckit-plan`. Implementation tasks come from `/speckit-tasks`.

## Summary

Migrate all agent guidance from Cursor `.mdc` rules into Spec Kit as the **single source of truth**, then delete legacy rule trees. Durable knowledge lives under `.specify/memory/knowledge/`; tenant catalogs under `specs/_catalogs/`; `project-context.md` replaces `rules-sync.mdc`. Spec Kit skills and human docs remain. Approach: lift-and-adapt existing rule content (no architecture rewrite), retarget scaffold/docs, audit parity, then cutover delete.

## Technical Context

**Language/Version**: Markdown / Spec Kit 0.15.2; TypeScript monorepo unchanged at runtime

**Primary Dependencies**: Spec Kit (`cursor-agent` integration); existing Cursor rules as migration source

**Storage**: Git-tracked files under `.specify/memory/` and `specs/`

**Testing**: Quickstart phases A–F; inventory parity checklist; stale-reference grep

**Target Platform**: Agent + developer docs in this monorepo (not a deployed service)

**Project Type**: Documentation / process migration for monorepo (Next.js + Strapi)

**Performance Goals**: Reduce agent context duplication — one SoT; no dual `.mdc` + Spec Kit loads

**Constraints**: Constitution invariants preserved; no runtime app regression; skills kept; human docs kept; deletion only after `verified` inventory

**Scale/Scope**: 17 legacy rule files → ~11 knowledge docs + 2 catalogs + constitution/context; cutover removes 3 rule trees

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| I. One Build, One Tenant | PASS | Migration does not change `TENANT_ID` builds; catalogs still document per-tenant isolation |
| II. Strict Layer Boundaries | PASS | Architecture knowledge migrates constraints; no new cross-boundary imports |
| III. Single Route, Block Composition | PASS | Preserved in architecture + block-system knowledge |
| IV. Living Documentation Sync | PASS → AMEND | Sync target becomes Spec Kit paths only after cutover (see research R4); constitution Principle IV must be updated during implement |
| V. Minimal, Focused Changes | PASS | Lift-and-adapt docs; no unrelated refactors |
| VI. Data Adapter Contract | PASS | Content-model + api-contract knowledge preserve `tenant` + `lang` |

**Post-design re-check**: PASS — plan only creates/moves documentation and scaffolding pointers; application packages unchanged until optional scaffold script update (still docs-oriented).

## Project Structure

### Documentation (this feature)

```text
specs/001-cursor-to-speckit/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── migration-inventory.md
│   ├── agent-doc-sync.md
│   └── target-layout.md
├── checklists/requirements.md
└── tasks.md             # Phase 2 — /speckit-tasks (not created here)
```

### Source Code / docs touched by implementation

```text
.specify/memory/
├── constitution.md              # Expand + SoT wording
├── project-context.md           # Index + sync map
└── knowledge/                   # NEW — migrated domain docs
    ├── architecture.md
    ├── block-system.md
    ├── deployment.md
    ├── typescript.md
    ├── i18n.md
    ├── mock-data.md
    ├── new-tenant.md
    ├── integrations.md
    ├── strapi-backend.md
    ├── content-model.md
    └── api-contract.md

specs/_catalogs/                 # NEW
├── vukans-bike.md
└── resort-example.md

next-headless-cms-fe/scripts/create-tenant.js   # catalog path retarget
README.md / next-headless-cms-fe/docs/*         # point to Spec Kit
.specify/templates/*                            # already monorepo-aware; verify sync language

# DELETE after audit (cutover):
.cursor/rules/**/*.mdc
next-headless-cms-fe/.cursor/rules/**/*.mdc
headless-cms-backend/.cursor/rules/**/*.mdc
```

**Structure Decision**: Documentation-only feature across Spec Kit memory, `specs/_catalogs/`, and light tooling/doc pointer updates in the frontend package. No Strapi schema or Next.js runtime changes required for MVP.

## Implementation Phases (for `/speckit-tasks`)

| Phase | Goal | Exit criteria |
|-------|------|----------------|
| 1. Memory foundation | Constitution SoT + project-context index | FR-001, FR-002 |
| 2. Knowledge migration | All 11 knowledge files content-complete | Inventory topical rows `migrated` |
| 3. Catalog migration | Both tenant catalogs | Catalog rows `migrated` |
| 4. Tooling & human docs | Scaffold + README/docs + templates | FR-007, FR-008 |
| 5. Audit | Parity → all inventory `verified` | SC-001, SC-004 |
| 6. Cutover | Delete `.mdc` rules; grep clean | FR-009, SC-003, SC-006 |

## Complexity Tracking

No constitution violations requiring justification.

| Note | Detail |
|------|--------|
| Dual context during implement | Resolved at cutover — `.mdc` rule trees deleted; Spec Kit only |
| Large doc volume | Necessary for SC-004 parity; split across knowledge files to keep agent load selective via project-context |

## Generated Artifacts (Phase 0–1)

| Artifact | Path |
|----------|------|
| Research | [research.md](./research.md) |
| Data model | [data-model.md](./data-model.md) |
| Quickstart | [quickstart.md](./quickstart.md) |
| Inventory contract | [contracts/migration-inventory.md](./contracts/migration-inventory.md) |
| Sync contract | [contracts/agent-doc-sync.md](./contracts/agent-doc-sync.md) |
| Layout contract | [contracts/target-layout.md](./contracts/target-layout.md) |

## Next Command

**Implement complete** (2026-08-10): all tasks T001–T051 done; inventory rows `deleted`; Spec Kit is sole agent SoT. Start new work with `/speckit-specify`.
