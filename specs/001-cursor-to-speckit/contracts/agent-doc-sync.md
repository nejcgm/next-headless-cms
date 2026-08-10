# Contract: Agent Documentation Sync

**Feature**: `001-cursor-to-speckit`  
**Replaces**: `next-headless-cms-fe/.cursor/rules/rules-sync.mdc` + backend `rules-sync.mdc` (after migration)

## Obligation

When code behavior changes, update matching Spec Kit docs **in the same change set**. Incomplete = not done.

## Sync map (target state after migration)

| If you edit | Update these Spec Kit artifacts |
|-------------|-------------------------------|
| `next-headless-cms-fe/src/app/**`, `middleware.ts` | `knowledge/architecture.md`, constitution if invariants change |
| `src/core/blocks/**`, `src/shared/components/blocks/**` | `knowledge/block-system.md` |
| `src/tenants/*/blocks/**`, `templates/**` | `knowledge/block-system.md` + `specs/_catalogs/{tenant}.md` |
| `src/core/mock-data.ts/**` | `knowledge/mock-data.md` + tenant catalog |
| `src/core/data/adapters/**`, `src/core/data/strapi/**` | `knowledge/api-contract.md`, `knowledge/architecture.md` |
| `src/core/i18n/**` | `knowledge/i18n.md` + tenant catalog |
| `src/tenants/*/integrations/**`, `services/**` | `knowledge/integrations.md` + tenant catalog |
| `src/tenants/*/config.ts` (new tenant) | `knowledge/new-tenant.md`, `project-context.md`, `specs/_catalogs/{id}.md` |
| Frontend CI/deploy/scripts/`next.config.ts` | `knowledge/deployment.md` |
| ESLint/TS/env conventions | `knowledge/typescript.md` |
| `headless-cms-backend/src/api/**`, `components/**` | `knowledge/content-model.md`, `knowledge/api-contract.md` |
| Strapi REST shape / cache tags | `knowledge/api-contract.md` + frontend adapter/types in same PR |
| Monorepo layout / Spec Kit memory layout | `constitution.md`, `project-context.md` |
| Feature behavior | Active `specs/{nnn-feature}/` artifacts |

## Forbidden after cutover

- Creating or updating `.cursor/rules/**/*.mdc` as agent guidance
- Sync map entries that point at deleted `.mdc` paths

## Allowed after cutover

- `.cursor/skills/speckit-*` (workflow skills)
- Human docs under `next-headless-cms-fe/docs/` and root `README.md` (keep aligned with Spec Kit)

## Completion check

If the diff changes how the system works and **no** related Spec Kit knowledge/catalog/constitution/feature doc was updated when that area is documented, the change is incomplete.
