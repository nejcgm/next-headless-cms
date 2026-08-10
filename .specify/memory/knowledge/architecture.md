# Architecture

**Maintenance**: Update `.specify/memory/knowledge/architecture.md` when layers, routing, or tenant isolation change. Sync map: `.specify/memory/project-context.md`.


# Multi-Tenant CMS Architecture

Canonical agent instructions live in Spec Kit (`.specify/memory/`). When you change code this file describes, update `.specify/memory/knowledge/architecture.md` in the same change set — see `.specify/memory/project-context.md`.

## Dependency Direction (STRICT)

- `app/` → `core/` → `shared/` (allowed)
- `app/` → `tenants/` → `shared/` (allowed)
- `core/` → `tenants/` (FORBIDDEN — except the exceptions below)
- `shared/` → `core/` (FORBIDDEN — except shared block registration)
- `shared/` → `tenants/` (FORBIDDEN)

### Allowed Exceptions

These cross-boundary imports exist by architectural necessity:

- `core/init.ts` is imported from root `app/layout.tsx`; it loads shared blocks and `@tenant/blocks` (build-time alias)
- `core/routing/resolver.tsx` dynamically imports `@tenant/templates/{name}`
- `core/data/fetcher.ts` and `core/data/adapters/mock.adapter.ts` import `@tenant/config` and `@mock-data` (per `TENANT_ID` build)
- `shared/components/blocks/index.ts` imports `registerSharedBlocks` from `core/blocks/registry`
- `shared/components/layout/footer.tsx` imports `NavItem` from `@core/types/navigation`

Do NOT add new cross-boundary imports. If you need one, refactor the shared type or function into the correct layer first.

## Folder Responsibilities

- `src/app/` — Routing only. Thin shells that delegate to `core/`. No business logic.
- `src/core/` — CMS engine. Tenant-agnostic. Defines interfaces tenants implement.
- `src/tenants/` — Per-tenant isolated code: blocks, integrations, services.
- `src/shared/` — Reusable UI components and utilities. Both `core/` and `tenants/` may import from here.

## Single Page Route

There is only ONE page route: `src/app/[domain]/[[...slug]]/page.tsx`. NEVER create additional page routes. All pages are rendered through this catch-all using the block system. Dynamic pages like `/rooms/123` or `/bikes/merida` use slug pattern matching in the CMS adapter, NOT new route files.

## Tenant Isolation

Each tenant lives in `src/tenants/{tenant-id}/` with `blocks/`, `templates/`, `integrations/`, `services/`, `config.ts`, and (when needed) `mock-data/` for mock/seed JSON. Tenants must never import from other tenants.

## Tenant resolution

- **Build-time**: `TENANT_ID` + `scripts/prepare-tenant.js` set `@tenant` → `src/tenants/{tenant-id}/` and `@mock-data` → `src/tenants/{id}/mock-data` (mock) or `scripts/mock-data-stub` (Strapi). New tenants: `pnpm create:tenant`; validate with `pnpm check:tenant`.
- **Runtime**: `middleware.ts` rewrites URLs with `/{tenantId}` prefix; sets `x-pathname` for visible path.
- **Config**: `import tenantConfig from "@tenant/config"` in app and adapters.

## Layout vs templates

- `app/[domain]/layout.tsx` — `ThemeProvider` + analytics only.
- **Header/footer** — tenant **templates** (`default`, `detail`, `bare`), not the domain layout.

## Per-tenant documentation

Catalogs: `specs/_catalogs/{tenant-id}.md`. See `.specify/memory/project-context.md` — update every affected Spec Kit knowledge/catalog file in the same change when code behavior changes.

## Monorepo

Repo root: `headless-cms/`. Human docs: root `README.md`, `next-headless-cms-fe/README.md`, `headless-cms-backend/README.md`. Frontend: `next-headless-cms-fe/`. Backend (Strapi): `headless-cms-backend/`. CI workflows run from repo root with `working-directory: next-headless-cms-fe`. See `.specify/memory/knowledge/deployment.md` and `.specify/memory/constitution.md`.
