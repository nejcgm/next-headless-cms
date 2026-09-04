# Project Context — Headless CMS Monorepo

**Agent start here.** Spec Kit is the single source of truth for agent guidance.

**Humans:** root `README.md`, `next-headless-cms-fe/README.md`, `headless-cms-backend/README.md`.

## Agent load order

**REQUIRED** at the start of Spec Kit commands and before domain coding in this repo:

1. `.specify/memory/constitution.md` — non-negotiable principles  
2. **This file** — find the right knowledge doc / catalog  
3. `.specify/memory/knowledge/{domain}.md` and/or `specs/_catalogs/{tenant-id}.md`  
4. Active feature under `specs/{nnn-feature}/` when implementing a feature  

Do not treat constitution-only context as enough for design or implementation.

## Repository layout

```text
headless-cms/
├── .specify/
│   ├── memory/
│   │   ├── constitution.md
│   │   ├── project-context.md   # This file
│   │   └── knowledge/           # Domain guides (FE + BE)
│   ├── templates/
│   └── feature.json
├── specs/
│   ├── _catalogs/               # Per-tenant catalogs
│   └── {nnn-feature}/
├── next-headless-cms-fe/        # Next.js 15 — pnpm
├── headless-cms-backend/        # Strapi v5 — npm
├── .cursor/skills/speckit-*     # Spec Kit skills (Cursor)
├── .claude/skills/speckit-*     # Spec Kit skills (Claude Code)
├── CLAUDE.md                    # thin Claude bootstrap → Spec Kit
└── .github/workflows/
```

## Knowledge index

| Domain | Path |
|--------|------|
| Architecture / layers / routing | `.specify/memory/knowledge/architecture.md` |
| Blocks & templates | `.specify/memory/knowledge/block-system.md` |
| Deploy / CI / env | `.specify/memory/knowledge/deployment.md` |
| TypeScript / ESLint | `.specify/memory/knowledge/typescript.md` |
| i18n / locales | `.specify/memory/knowledge/i18n.md` |
| Mock JSON pages | `.specify/memory/knowledge/mock-data.md` |
| New tenant checklist | `.specify/memory/knowledge/new-tenant.md` |
| Tenant integrations | `.specify/memory/knowledge/integrations.md` |
| Strapi overview (**backend first-class**) | `.specify/memory/knowledge/strapi-backend.md` |
| Strapi content model (**backend**) | `.specify/memory/knowledge/content-model.md` |
| Strapi REST / cache (**backend**) | `.specify/memory/knowledge/api-contract.md` |

## Tenant catalogs

| Tenant ID | Role | Catalog | `dataAdapter` |
|-----------|------|---------|---------------|
| `vukans-bike` | **Product** (reference for new tenants) | `specs/_catalogs/vukans-bike.md` | `"strapi"` |
| `resort-example` | **Build-isolation fixture** only (not a product twin) | `specs/_catalogs/resort-example.md` | `"mock"` |

New product tenants: follow `.specify/memory/knowledge/new-tenant.md` — aim for plug-and-play (scaffold + Spec Kit catalog + CI/deploy). Use **`vukans-bike`** as the pattern, not `resort-example`.

## Sync map (same change set)

When code behavior changes, update matching Spec Kit docs **in the same change set**. Incomplete = not done.

| If you edit | Update |
|-------------|--------|
| `next-headless-cms-fe/src/app/**`, `middleware.ts` | `knowledge/architecture.md` (+ constitution if invariant) |
| `src/core/blocks/**`, `shared/components/primitives/**`, `shared/components/{index,composition-allow}.ts` | `knowledge/block-system.md` |
| `src/tenants/*/blocks/**`, `templates/**` | `knowledge/block-system.md` + `specs/_catalogs/{tenant}.md` |
| `src/tenants/{id}/mock-data/**` | `knowledge/mock-data.md` + catalog |
| `src/core/data/adapters/**`, `strapi/**` | `knowledge/api-contract.md`, `architecture.md` |
| `src/core/i18n/**` | `knowledge/i18n.md` + catalog |
| `src/tenants/*/integrations/**`, `services/**` | `knowledge/integrations.md` + catalog |
| New `src/tenants/*/config.ts` | `knowledge/new-tenant.md`, this file, `specs/_catalogs/{id}.md` |
| CI / deploy / `next.config.ts` / prepare scripts | `knowledge/deployment.md` |
| ESLint / TS / `env.ts` conventions | `knowledge/typescript.md` |
| `headless-cms-backend/src/api/**`, `components/**` | `knowledge/content-model.md`, `api-contract.md` |
| Strapi REST / cache tags | `api-contract.md` + frontend adapter/types |
| Spec Kit memory layout | `constitution.md`, this file |
| Feature behavior | Active `specs/{nnn-feature}/` |
| How humans run apps | Root / FE / BE `README.md` (human audience) |

## Human documentation

| Doc | Purpose |
|-----|---------|
| `README.md` | Monorepo overview, scripts; short Spec Kit pointer |
| `next-headless-cms-fe/README.md` | Frontend human setup, routing, data, verify:build |
| `headless-cms-backend/README.md` | Backend human setup/run/seed |

## Key runtime facts

- **Middleware** rewrites visible paths → `/{tenantId}/...`; `[domain]` segment is tenant id  
- **Strapi i18n plugin**: not used; locale field is `lang` on each document  
- **Preview**: `/api/preview` + `PREVIEW_SECRET`; draft mode → `status=draft`  
- **Revalidation**: `/api/webhooks/strapi` + `REVALIDATE_SECRET`; also `/api/revalidate` for on-demand tag revalidation  
- **Dev ports**: bike `:3002`, resort `:3001`, Strapi `:1337`  
