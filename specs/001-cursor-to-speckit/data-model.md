# Data Model: Spec Kit Knowledge System

**Feature**: `001-cursor-to-speckit`  
**Date**: 2026-08-10

This feature does not introduce runtime CMS entities. It defines the **documentation / agent-context data model** that replaces Cursor rules.

## Entities

### Constitution

| Field | Description |
|-------|-------------|
| Path | `.specify/memory/constitution.md` |
| Purpose | Non-negotiable principles, monorepo constraints, quality gates, governance |
| Source | Distilled from `project-architecture.mdc`, `monorepo.mdc`, sync/governance fragments |
| Update rule | Amend when invariants change; bump version footer |

### Project Context

| Field | Description |
|-------|-------------|
| Path | `.specify/memory/project-context.md` |
| Purpose | Repo map, knowledge index, tenant table, **sync map** (code path → docs to update) |
| Source | `rules-sync.mdc`, `tenant-context.mdc`, `monorepo.mdc` |
| Update rule | Same change set when knowledge files are added/removed or sync targets change |

### Knowledge Document

| Field | Description |
|-------|-------------|
| Path | `.specify/memory/knowledge/{slug}.md` |
| Purpose | Durable domain guidance for agents |
| Attributes | `slug`, `title`, `legacy_sources[]`, `sections[]` |
| Update rule | Same change set when described code behavior changes |

#### Planned knowledge documents

| Slug | Migrates from |
|------|----------------|
| `architecture.md` | `project-architecture.mdc`, monorepo layout details |
| `block-system.md` | `block-system.mdc` |
| `deployment.md` | `deployment.mdc` |
| `typescript.md` | `typescript-conventions.mdc` |
| `i18n.md` | `i18n.mdc` |
| `mock-data.md` | `mock-data-pages.mdc` |
| `new-tenant.md` | `new-tenant-checklist.mdc` |
| `integrations.md` | `tenant-integrations.mdc` |
| `strapi-backend.md` | `strapi-backend.mdc` |
| `content-model.md` | `content-model.mdc` |
| `api-contract.md` | `api-contract.mdc` + backend `rules-sync.mdc` contract notes |

### Tenant Catalog

| Field | Description |
|-------|-------------|
| Path | `specs/_catalogs/{tenant-id}.md` |
| Purpose | Tenant blocks, templates, pages, data contracts, integrations |
| Attributes | `tenant_id`, `locales`, `dataAdapter`, `blocks[]`, `templates[]`, `pages[]` |
| Source | `tenants/{id}/catalog.mdc` |
| Update rule | Same change set when tenant blocks/templates/pages/integrations change |

### Feature Directory

| Field | Description |
|-------|-------------|
| Path | `specs/{nnn}-{short-name}/` |
| Contents | `spec.md`, `plan.md`, `tasks.md`, checklists, optional research/contracts |
| Purpose | Incremental feature work (unchanged Spec Kit model) |

### Migration Inventory Item

| Field | Description |
|-------|-------------|
| `legacy_path` | Path to `.mdc` file |
| `target_paths` | Spec Kit destination(s) |
| `status` | `pending` \| `migrated` \| `verified` \| `deleted` |
| `parity_notes` | Gaps found during audit |

Stored in: `specs/001-cursor-to-speckit/contracts/migration-inventory.md`

### Cutover Record

| Field | Description |
|-------|-------------|
| `audit_passed` | Boolean |
| `files_deleted` | List of removed `.mdc` paths |
| `retained` | Skills + human docs |
| `stale_ref_grep` | Commands/results proving no required `.mdc` refs remain |

## Relationships

```text
Constitution ──indexes──► Project Context
Project Context ──lists──► Knowledge Document*
Project Context ──lists──► Tenant Catalog*
Project Context ──owns──► Sync Map (path → docs)
Legacy Rule ──migrates_to──► Knowledge Document | Tenant Catalog | Constitution
Feature Directory ──must_respect──► Constitution
Migration Inventory ──tracks──► Legacy Rule → targets
Cutover Record ──requires──► Inventory all verified
```

## Validation Rules

1. Every legacy rule path MUST appear exactly once as a primary inventory row.
2. A knowledge doc MUST NOT be marked `verified` until all major sections from the source `.mdc` exist (or intentional merge is documented).
3. Cutover MUST NOT run while any inventory status is `pending` or `migrated` (must be `verified`).
4. After cutover, sync map MUST NOT reference `.cursor/rules/**/*.mdc`.
5. Tenant catalog `tenant_id` MUST match a folder under `next-headless-cms-fe/src/tenants/`.

## State Transitions (Legacy Rule)

```text
present → inventoried → content_copied → verified → deleted
```

No skip from `inventoried` to `deleted`.
