# Frontend development guide

Human-oriented notes for working in `next-headless-cms-fe/`. Agent rules live in [`.cursor/rules/`](../.cursor/rules/).

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

- Pages: `getAdapter(tenantId).getPage(...)` in `page.tsx`
- Nav in templates: `getNavigationCached(tenant.id, page.locale)` — dedupes within one RSC request, not across navigations
- Always pass nav through `localizeNavItems` before `Header` / `Footer`

## Mock data

- Paths: `src/core/mock-data.ts/{vukans-bike|resort}/`
- Page files: `{slug}.json` or `{locale}--{slug}.json`
- Set `"template": "default" | "detail" | "bare"` per page

## Related docs

- [Build verification](./BUILD-VERIFICATION.md) — tenant isolation checks
- [Deployment](../.cursor/rules/deployment.mdc) — CI, Vercel, env vars (agent-oriented)
