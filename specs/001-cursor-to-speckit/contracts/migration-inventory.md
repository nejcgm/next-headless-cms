# Contract: Migration Inventory

**Feature**: `001-cursor-to-speckit`  
**Purpose**: Canonical mapping of every legacy Cursor rule → Spec Kit target. Cutover complete: all source `.mdc` rule trees deleted.

## Status legend

| Status | Meaning |
|--------|---------|
| `pending` | Not yet copied |
| `migrated` | Content copied; parity not audited |
| `verified` | Parity checklist passed |
| `deleted` | Source `.mdc` removed after cutover |

## Inventory

| # | Legacy path | Spec Kit target(s) | Status |
|---|-------------|-------------------|--------|
| 1 | `.cursor/rules/monorepo.mdc` | `.specify/memory/constitution.md`, `.specify/memory/project-context.md`, `knowledge/architecture.md` | deleted |
| 2 | `next-headless-cms-fe/.cursor/rules/rules-sync.mdc` | `.specify/memory/project-context.md` (sync map) | deleted |
| 3 | `next-headless-cms-fe/.cursor/rules/project-architecture.mdc` | `knowledge/architecture.md`, constitution principles I–III | deleted |
| 4 | `next-headless-cms-fe/.cursor/rules/block-system.mdc` | `knowledge/block-system.md` | deleted |
| 5 | `next-headless-cms-fe/.cursor/rules/deployment.mdc` | `knowledge/deployment.md` | deleted |
| 6 | `next-headless-cms-fe/.cursor/rules/typescript-conventions.mdc` | `knowledge/typescript.md` | deleted |
| 7 | `next-headless-cms-fe/.cursor/rules/i18n.mdc` | `knowledge/i18n.md` | deleted |
| 8 | `next-headless-cms-fe/.cursor/rules/mock-data-pages.mdc` | `knowledge/mock-data.md` | deleted |
| 9 | `next-headless-cms-fe/.cursor/rules/new-tenant-checklist.mdc` | `knowledge/new-tenant.md` | deleted |
| 10 | `next-headless-cms-fe/.cursor/rules/tenant-context.mdc` | `project-context.md` (tenant table) | deleted |
| 11 | `next-headless-cms-fe/.cursor/rules/tenant-integrations.mdc` | `knowledge/integrations.md` | deleted |
| 12 | `next-headless-cms-fe/.cursor/rules/tenants/vukans-bike/catalog.mdc` | `specs/_catalogs/vukans-bike.md` | deleted |
| 13 | `next-headless-cms-fe/.cursor/rules/tenants/resort-example/catalog.mdc` | `specs/_catalogs/resort-example.md` | deleted |
| 14 | `headless-cms-backend/.cursor/rules/strapi-backend.mdc` | `knowledge/strapi-backend.md` | deleted |
| 15 | `headless-cms-backend/.cursor/rules/content-model.mdc` | `knowledge/content-model.md` | deleted |
| 16 | `headless-cms-backend/.cursor/rules/api-contract.mdc` | `knowledge/api-contract.md` | deleted |
| 17 | `headless-cms-backend/.cursor/rules/rules-sync.mdc` | `project-context.md` (backend sync rows) + `knowledge/api-contract.md` | deleted |

Knowledge base path prefix: `.specify/memory/knowledge/`.

## Parity checklist (per row)

Before marking `verified`:

- [x] All primary headings/sections from source exist in target (or intentional merge noted)
- [x] Critical constraints preserved (`lang` not `locale`, one build = one tenant, single route, layer boundaries)
- [x] File paths in examples still accurate
- [x] “Update this rule” language rewritten to Spec Kit paths
- [x] Sync map updated for this domain

## Cutover gate

```text
ALL 17 rows status == verified
AND quickstart cutover checks pass
AND stale-reference grep clean
→ allow delete of legacy .mdc rule files
→ set rows to deleted
```

**Cutover completed**: 2026-08-10 — deleted `.cursor/rules/`, `next-headless-cms-fe/.cursor/rules/`, `headless-cms-backend/.cursor/rules/`. Retained `.cursor/skills/speckit-*`.
