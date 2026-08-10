# Headless CMS (monorepo)

Multi-tenant headless CMS: a **Next.js** frontend (one tenant per build) and a **Strapi v5** backend. Each frontend build includes exactly one tenant, selected with `TENANT_ID`.

**AI agents:** start at [`.specify/memory/project-context.md`](.specify/memory/project-context.md).

## Repository layout

| Path | Description |
|------|-------------|
| [`next-headless-cms-fe/`](next-headless-cms-fe/) | Next.js 15 app — blocks, templates, mock data, Strapi adapter |
| [`headless-cms-backend/`](headless-cms-backend/) | Strapi CMS (separate deploy) |
| [`.github/workflows/`](.github/workflows/) | CI and manual production deploys |
| [`.specify/`](.specify/) | Spec Kit (agent constitution, knowledge, templates) |
| [`specs/`](specs/) | Feature specs + tenant catalogs |

**Tenants today:** `vukans-bike`, `resort-example`

## Requirements

- Node.js 20+
- pnpm 10+ (frontend)
- npm (backend)

## Frontend — quick start

Run **pnpm only inside** `next-headless-cms-fe/` (there is no root `package.json`). Running pnpm from the repo root can create a stray `.pnpm-store/` folder — delete it if that happens; it is listed in the root `.gitignore`.

```bash
cd next-headless-cms-fe
pnpm install
pnpm dev:bike      # vukans-bike — http://localhost:3002
pnpm dev:resort    # resort-example — http://localhost:3001
```

### Build

```bash
pnpm build:bike
pnpm build:resort
pnpm verify:build
```

**Docs:** [next-headless-cms-fe/docs/](next-headless-cms-fe/docs/) — [development](next-headless-cms-fe/docs/DEVELOPMENT.md), [build verification](next-headless-cms-fe/docs/BUILD-VERIFICATION.md), [Strapi setup](next-headless-cms-fe/docs/STRAPI-MIGRATION.md).

## Frontend — how it works

- **Single page route:** `next-headless-cms-fe/src/app/[domain]/[[...slug]]/page.tsx`
- **Templates** own header/footer; pages pick a template via mock/Strapi data
- **Build-time isolation:** `@tenant`, `@tenant/config`, `@mock-data` aliases — one tenant per build
- **Data:** per-tenant `dataAdapter` — `vukans-bike` uses **Strapi**; `resort-example` uses **mock JSON**

## Environment variables

```bash
cd next-headless-cms-fe
cp .env.example .env.local
```

| Variable | When |
|----------|------|
| `TENANT_ID` | Set automatically by dev/build scripts |
| `STRAPI_URL` | Required when `dataAdapter` is `"strapi"` |
| `STRAPI_API_TOKEN` | Required for Strapi tenants |
| `REVALIDATE_SECRET` | Cache revalidation webhooks |
| `PREVIEW_SECRET` | Optional draft preview |

## Scripts (frontend)

| Script | Purpose |
|--------|---------|
| `pnpm dev:bike` / `dev:resort` | Dev servers |
| `pnpm build:bike` / `build:resort` | Production builds |
| `pnpm verify:build` | Tenant isolation check |
| `pnpm lint` / `pnpm type-check` | Quality |

## CI & deployment

- **CI** (`.github/workflows/ci.yml`): lint matrix per tenant + type-check
- **Production:** manual `workflow_dispatch` — `deploy-bike.yml`, `deploy-resort.yml`
- One tenant per Vercel project (`TENANT_ID`)

## Backend (Strapi)

```bash
cd headless-cms-backend
npm install
npm run develop
```

See [`headless-cms-backend/README.md`](headless-cms-backend/README.md). Seed: `npm run seed:vukans-bike`.
