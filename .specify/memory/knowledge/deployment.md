# Deployment & CI

**Maintenance**: Update this Spec Kit knowledge doc in the same change set when related code changes. Sync map: `.specify/memory/project-context.md`.


# Deployment & CI

> **Maintenance**: Update when workflows, Vercel setup, or build scripts change (`.specify/memory/project-context.md` (sync map)).

## Monorepo layout

| Path | Role |
|------|------|
| `headless-cms/` | Git root |
| `next-headless-cms-fe/` | Next app — **set Vercel Root Directory here** if using Vercel Git UI |
| `headless-cms-backend/` | Strapi (separate deploy) |
| `.github/workflows/` | CI + manual deploy workflows (repo root) |

## One build = one tenant

Every dev/build/deploy must set `TENANT_ID` to the tenant folder name (`vukans-bike` product, or `resort-example` isolation fixture, or a new product tenant id).

1. `scripts/prepare-tenant.js` — sets `@tenant` and `@mock-data` paths in `tsconfig.json` (mock aliases: `scripts/tenant-mock-map.json`)
2. `next.config.ts` — fails without `TENANT_ID`; uses `.next-{tenantId}` locally, `.next` when `NEXT_USE_VERCEL_DIST=1`
3. `pnpm verify:build` — scans all build JS for cross-tenant source paths (resort exists so leakage against a second tree stays testable)
4. `pnpm create:tenant` — scaffolds a new **product** tenant (plug-and-play); `pnpm check:tenant` validates required files — pattern off `vukans-bike`, not resort

Mock data folder can differ: `resort-example` → `src/core/mock-data.ts/resort/` (see `tenant-mock-map.json`).

## Local commands

```bash
pnpm dev:bike      # vukans-bike, port 3002
pnpm dev:resort    # resort-example, port 3001
pnpm build:bike | pnpm build:resort
pnpm lint          # both tenants (matrix-style scripts)
pnpm type-check    # uses current tsconfig @tenant paths
```

## CI (`.github/workflows/ci.yml`)

- Runs in `next-headless-cms-fe/`
- **Lint**: matrix `tenant_id` × `TENANT_ID` (required for `next lint` / `next.config`)
- **Type-check**: single job after prepare step

## Production deploy (manual)

Deploy workflows are **`workflow_dispatch`** — not auto-deploy on push:

| Workflow | Tenant | Build | Vercel secrets |
|----------|--------|-------|----------------|
| `deploy-bike.yml` | `vukans-bike` | `pnpm build:bike` | `BIKE_VERCEL_*` |
| `deploy-resort.yml` | `resort-example` | `pnpm build:resort` | `RESORT_VERCEL_*` |

Flow: install → type-check → tenant build → `verify:build` → `vercel pull` → `vercel build --prod` (with `NEXT_USE_VERCEL_DIST=1`) → `vercel deploy --prebuilt --prod`.

Each tenant has its **own Vercel project** (separate `VERCEL_PROJECT_ID`).

## Vercel Git integration (optional)

If connecting the repo in Vercel UI:

- **Root Directory**: `next-headless-cms-fe`
- **Build command**: must run `prepare-tenant` with the correct `TENANT_ID` for that project (or use `vercel-build` + env var `TENANT_ID` on the project)
- Prefer matching the GitHub Actions pattern: one Vercel project per tenant, each with its own `TENANT_ID` env

## Environment variables

Add new vars to `src/env.ts` (Zod). Deploy secrets go in GitHub Actions and/or Vercel project settings.

**vukans-bike** (`dataAdapter: "strapi"`) requires on Vercel (and in `deploy-bike.yml`):

| Variable | Purpose |
|----------|---------|
| `STRAPI_URL` | Strapi REST base URL |
| `STRAPI_API_TOKEN` | Authenticated reads (including draft when preview is enabled) |
| `REVALIDATE_SECRET` | Webhook + manual revalidation (min 16 chars; do not use the default in production) |
| `PREVIEW_SECRET` | Optional — `/api/preview` draft mode entry |

**resort-example** is a build-isolation fixture on mock data — no Strapi env required. Product tenants on Strapi need `STRAPI_*` like bike.

## New tenant deploy checklist

1. `pnpm` scripts: `dev:{short}`, `build:{short}`
2. CI lint matrix entry
3. New `deploy-{short}.yml` + Vercel project + secrets
4. Document in this file and `.specify/memory/knowledge/new-tenant.md`
