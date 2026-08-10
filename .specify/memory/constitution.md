# Headless CMS Constitution

## Core Principles

### I. One Build, One Tenant (NON-NEGOTIABLE)

Every dev, CI, and production build MUST set `TENANT_ID` to exactly one tenant folder (`vukans-bike`, `resort-example`, etc.). Each tenant gets an isolated bundle: `@tenant` alias, tenant blocks/templates, and optional mock data. Cross-tenant imports and bundled code are forbidden. Verify with `pnpm verify:build` after tenant builds.

### II. Strict Layer Boundaries

Dependency direction is fixed: `app/` → `core/` → `shared/` and `app/` → `tenants/` → `shared/`. `core/` MUST NOT import from `tenants/` except documented exceptions (`fetcher`, `mock.adapter`, `resolver`, `init`). `shared/` MUST NOT import from `tenants/`. New cross-boundary imports require refactoring shared types/functions first — never widening exceptions casually.

### III. Single Route, Block Composition

There is ONE page route: `next-headless-cms-fe/src/app/[domain]/[[...slug]]/page.tsx`. All pages render via the block registry and tenant templates. Dynamic URLs (e.g. `/bikes/:slug`, `/rooms/:id`) use slug-pattern matching in the CMS adapter — never new Next.js route files per page.

### IV. Spec Kit Single Source of Truth (NON-NEGOTIABLE)

Agent guidance for this monorepo lives in Spec Kit only:

| Artifact | Path |
|----------|------|
| Constitution | `.specify/memory/constitution.md` |
| Project index & sync map | `.specify/memory/project-context.md` |
| Domain knowledge | `.specify/memory/knowledge/*.md` |
| Tenant catalogs | `specs/_catalogs/{tenant-id}.md` |
| Feature work | `specs/{nnn-feature}/` |

When behavior changes, update the matching Spec Kit artifact **in the same change set** (see sync map in `project-context.md`). Do not maintain parallel Cursor `.mdc` rule trees for agent context.

Human docs (`README.md`, `next-headless-cms-fe/docs/`, `headless-cms-backend/README.md`) remain for people and MUST stay consistent with Spec Kit when they overlap. READMEs may include a short Spec Kit pointer only.

### V. Minimal, Focused Changes

Prefer the smallest correct diff. Reuse existing blocks, adapters, templates, and conventions. Do not over-engineer. Do not add unrelated refactors to feature PRs. Match surrounding code style.

### VI. Data Adapter Contract

Frontend reads content through `CmsAdapter` (`mock` or `strapi` per tenant config). Strapi queries filter by `tenant` + `lang` (custom field — **not** Strapi i18n plugin). REST contract changes require coordinated updates: backend schema, `strapi.adapter.ts`, frontend types, and Spec Kit `knowledge/api-contract.md` + `knowledge/content-model.md` in one change set.

## Monorepo Constraints

| Package | Tooling | Purpose |
|---------|---------|---------|
| `next-headless-cms-fe/` | **pnpm** only | Next.js 15 multi-tenant CMS |
| `headless-cms-backend/` | **npm** | Strapi v5 content API |
| `.github/workflows/` | repo root | CI + manual Vercel deploys per tenant |

Run pnpm only inside `next-headless-cms-fe/`. CI sets `working-directory: next-headless-cms-fe` for frontend jobs.

**Tenants today:** `vukans-bike` is the live **product** tenant (`dataAdapter: "strapi"`). `resort-example` is a **build-isolation fixture** (`dataAdapter: "mock"`) — not a peer product. New tenants should be plug-and-play via scaffold + Spec Kit catalog; pattern off `vukans-bike` (see `knowledge/new-tenant.md`).

## Quality Gates

- **Lint**: matrix per tenant (`pnpm lint:bike`, `pnpm lint:resort`)
- **Type-check**: `pnpm type-check` in frontend
- **Build isolation**: `pnpm verify:build` after `pnpm build:{tenant}`
- **Strapi schema changes**: `npm run types:generate` in backend; re-seed if content shape changes
- **Secrets**: never commit `.env`; production must not use default `REVALIDATE_SECRET`
- **Docs**: Spec Kit knowledge/catalog updated when described behavior changes
- **Backend Spec Kit**: `strapi-backend`, `content-model`, and `api-contract` knowledge docs are first-class (same bar as frontend knowledge)

## Development Workflow

1. **New features**: `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`
2. **Bug fixes / small edits**: follow constitution + relevant knowledge doc and tenant catalog; open a feature spec if the contract changes
3. Before tenant-specific work: read `specs/_catalogs/{tenant-id}.md`
4. Header/footer live in tenant **templates**, not domain layout
5. Do not add route-level `loading.tsx` when templates own chrome (use `NavigationProgressBar` + block-level Suspense)

## Governance

This constitution defines non-negotiable architectural and process constraints. Amendments require updating `.specify/memory/constitution.md` and noting the change in the active feature spec or a dedicated governance spec.

**Version**: 1.2.1 | **Ratified**: 2026-08-10 | **Last Amended**: 2026-08-10
