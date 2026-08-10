# Frontend development guide

Human-oriented notes for working in `next-headless-cms-fe/`. **AI agents:** [`.specify/memory/project-context.md`](../../.specify/memory/project-context.md).

## Monorepo layout

| Location | Purpose |
|----------|---------|
| Repo root [`README.md`](../../README.md) | Overview, scripts, deploy |
| `next-headless-cms-fe/` | Next.js app — **run pnpm here** |
| `headless-cms-backend/` | Strapi (separate `npm` workflow) |
| `.github/workflows/` | CI + manual Vercel deploys |

## Package manager

Use **pnpm** only in the frontend app:

```bash
cd next-headless-cms-fe
pnpm install
pnpm dev:bike   # or dev:resort
```

Do **not** run `pnpm install` from the repo root — there is no root `package.json`. That can create an accidental `.pnpm-store/` at the monorepo root (safe to delete; it is gitignored via the root `.gitignore`).

## Routing and layouts

| File | Role |
|------|------|
| `src/app/layout.tsx` | Root document shell: `<html>`, `<body>`, global CSS, `@core/init` |
| `src/app/[domain]/layout.tsx` | Tenant shell: `ThemeProvider`, favicon metadata, analytics |
| `src/app/[domain]/[[...slug]]/page.tsx` | **Only** page route — resolves page data, template, blocks |

The `[domain]` segment is the **tenant id** (from middleware rewrite), not a hostname.

**Header and footer** live in tenant **templates** (`default`, `detail`, `bare`), not in `layout.tsx`.

## Client navigation loading

- **Do not** add `src/app/[domain]/[[...slug]]/loading.tsx` when templates render header/footer. Route-level loading replaces the entire segment and makes chrome flash on every navigation.
- Use [`NavigationProgressBar`](../src/shared/components/navigation-progress-bar.tsx) in tenant headers — a slim bar under the menu during in-app navigations.
- For slow **page content** only, wrap `<BlockRenderer />` in `<Suspense fallback={...}>` inside `page.tsx`, keeping chrome outside the boundary.

## Data and navigation

- Pages + nav: `loadPageWithNavigation` in `page.tsx` (uses `getPageCached` + `getNavigationCached`)
- Templates read `page.navigation` (merged in `page.tsx`) — do not fetch nav again in templates
- Always pass nav through `localizeNavItems` before `Header` / `Footer`

### Data adapters (per tenant)

Set `dataAdapter` in `src/tenants/{id}/config.ts`:

| Tenant | Adapter | Notes |
|--------|---------|-------|
| `vukans-bike` | `"strapi"` | Requires `STRAPI_URL` + `STRAPI_API_TOKEN`. Start Strapi before `pnpm dev:bike`. |
| `resort-example` | `"mock"` | Reads JSON from `src/core/mock-data.ts/resort/` |

See [STRAPI-MIGRATION.md](./STRAPI-MIGRATION.md) for Strapi local setup, seed, preview, and revalidation.

## Mock data

Used when `dataAdapter: "mock"` (and as the **seed source** for vukans-bike Strapi content):

- Paths: `src/core/mock-data.ts/{vukans-bike|resort}/` (aliases in `scripts/tenant-mock-map.json`)
- Page files: `{slug}.json` or `{locale}--{slug}.json`
- Set `"template": "default" | "detail" | "bare"` per page

## New tenant

```bash
pnpm create:tenant -- --id my-tenant --name "My Site" --short my --port 3003
pnpm check:tenant
```

See [new-tenant knowledge](../../.specify/memory/knowledge/new-tenant.md).

## Related docs

- [Build verification](./BUILD-VERIFICATION.md) — tenant isolation checks
- [Strapi setup (vukans-bike)](./STRAPI-MIGRATION.md) — local Strapi, env, seed, preview
- [Deployment knowledge](../../.specify/memory/knowledge/deployment.md) — CI, Vercel, env vars (agent-oriented)
