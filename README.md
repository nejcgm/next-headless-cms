# Headless CMS (monorepo)

Multi-tenant headless CMS: a **Next.js** frontend (one tenant per build) and a **Strapi v5** backend. Each frontend build includes exactly one tenant, selected with `TENANT_ID`.

## Repository layout

| Path | Description |
|------|-------------|
| [`next-headless-cms-fe/`](next-headless-cms-fe/) | Next.js 15 app — blocks, templates, mock data, Strapi adapter |
| [`headless-cms-backend/`](headless-cms-backend/) | Strapi CMS (separate deploy) |
| [`.github/workflows/`](.github/workflows/) | CI and manual production deploys |
| [`next-headless-cms-fe/.cursor/rules/`](next-headless-cms-fe/.cursor/rules/) | Cursor agent rules (architecture, deploy, per-tenant catalogs) |

**Tenants today:** `vukans-bike`, `resort-example`

## Requirements

- Node.js 20+
- pnpm 10+ (frontend)

## Frontend — quick start

Run **pnpm only inside** `next-headless-cms-fe/` (there is no root `package.json`). Running pnpm from the repo root can create a stray `.pnpm-store/` folder — delete it if that happens; it is listed in the root `.gitignore`.

All commands below:

```bash
cd next-headless-cms-fe
pnpm install
```

### Dev servers

```bash
pnpm dev:bike      # vukans-bike — http://localhost:3002
pnpm dev:resort    # resort-example — http://localhost:3001
```

Each script runs `scripts/prepare-tenant.js` (sets `@tenant` / `@mock-data` aliases) then `next dev`.

### Build

```bash
pnpm build:bike
pnpm build:resort
```

Verify only the selected tenant’s code is in the bundle:

```bash
pnpm verify:build
```

Bundle analysis:

```bash
pnpm build:bike:analyze
pnpm build:resort:analyze
```

**Docs:** [next-headless-cms-fe/docs/](next-headless-cms-fe/docs/) — [development guide](next-headless-cms-fe/docs/DEVELOPMENT.md), [build verification](next-headless-cms-fe/docs/BUILD-VERIFICATION.md).

## Frontend — how it works

- **Single page route:** `next-headless-cms-fe/src/app/[domain]/[[...slug]]/page.tsx` (catch-all; no per-page route files)
- **Templates** own header/footer; pages pick a template via mock/Strapi data
- **Build-time isolation:** `@tenant`, `@tenant/config`, `@mock-data` aliases — one tenant per build
- **Data:** mock adapter by default; Strapi adapter available (`dataAdapter` in tenant config)

## Environment variables

Copy env files in the frontend app:

```bash
cd next-headless-cms-fe
cp .env.example .env.local
```

Common variables:

| Variable | When |
|----------|------|
| `TENANT_ID` | Set automatically by dev/build scripts; required for `next.config.ts` |
| `STRAPI_URL` | Strapi adapter |
| `STRAPI_API_TOKEN` | Strapi adapter |

## Scripts (frontend)

Run from `next-headless-cms-fe/`:

| Script | Purpose |
|--------|---------|
| `pnpm dev:bike` | Dev server for `vukans-bike` |
| `pnpm dev:resort` | Dev server for `resort-example` |
| `pnpm build:bike` | Production build for `vukans-bike` |
| `pnpm build:resort` | Production build for `resort-example` |
| `pnpm build:bike:analyze` / `pnpm build:resort:analyze` | Build + bundle analysis |
| `pnpm verify:build` | Check tenant isolation in `.next` output |
| `pnpm lint` | ESLint (both tenants) |
| `pnpm type-check` | TypeScript |

## CI & deployment

- **CI** (`.github/workflows/ci.yml`): lint (matrix per tenant) and type-check in `next-headless-cms-fe/`
- **Production:** manual `workflow_dispatch` only
  - `deploy-bike.yml` → `vukans-bike` (Vercel secrets `BIKE_VERCEL_*`, optional `BIKE_STRAPI_*`)
  - `deploy-resort.yml` → `resort-example` (Vercel secrets `RESORT_VERCEL_*`)

Deploy **one tenant per Vercel project / artifact**. Set `TENANT_ID` for that project. Details for agents: `next-headless-cms-fe/.cursor/rules/deployment.mdc`.

## Backend (Strapi)

```bash
cd headless-cms-backend
npm install
npm run develop
```

See [`headless-cms-backend/README.md`](headless-cms-backend/README.md). Frontend Strapi integration is not fully wired yet; tenant configs still use `dataAdapter: "mock"` until migration.

## Cursor / agent rules

Frontend conventions live in **`next-headless-cms-fe/.cursor/rules/`** — start with `rules-sync.mdc`. Monorepo-wide notes: [`.cursor/rules/monorepo.mdc`](.cursor/rules/monorepo.mdc).
