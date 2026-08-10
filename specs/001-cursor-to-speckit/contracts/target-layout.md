# Contract: Target Spec Kit Layout

**Feature**: `001-cursor-to-speckit`

## Directory tree (post-migration)

```text
.specify/
├── memory/
│   ├── constitution.md
│   ├── project-context.md
│   └── knowledge/
│       ├── architecture.md
│       ├── block-system.md
│       ├── deployment.md
│       ├── typescript.md
│       ├── i18n.md
│       ├── mock-data.md
│       ├── new-tenant.md
│       ├── integrations.md
│       ├── strapi-backend.md
│       ├── content-model.md
│       └── api-contract.md
├── templates/          # Spec Kit templates (plan/tasks/spec) — monorepo-aware
├── feature.json
└── ...

specs/
├── _catalogs/
│   ├── vukans-bike.md
│   └── resort-example.md
├── 001-cursor-to-speckit/
│   ├── spec.md
│   ├── plan.md
│   ├── research.md
│   ├── data-model.md
│   ├── quickstart.md
│   ├── contracts/
│   └── checklists/
└── {nnn-feature}/      # future features

.cursor/
└── skills/speckit-*    # KEEP — Spec Kit commands

# REMOVED after cutover:
# .cursor/rules/**/*.mdc
# next-headless-cms-fe/.cursor/rules/**/*.mdc
# headless-cms-backend/.cursor/rules/**/*.mdc
```

## Agent load order (recommended)

1. `.specify/memory/constitution.md`
2. `.specify/memory/project-context.md` (find domain + catalog)
3. Relevant `knowledge/*.md` and/or `specs/_catalogs/{tenant}.md`
4. Active feature under `specs/{nnn}/` when implementing a feature

## Naming rules

- Knowledge slugs: kebab-case, one domain per file
- Catalogs: exact `tenant-id` matching `src/tenants/{id}/`
- Feature dirs: sequential `NNN-short-name` per `init-options.json`
