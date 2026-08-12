# next-headless-cms-fe

Next.js 15 multi-tenant frontend. **One build = one tenant** (`TENANT_ID`).

**AI agents:** [`.specify/memory/project-context.md`](../.specify/memory/project-context.md).

## Requirements

- Node.js 20+
- **pnpm** 10+ (only — do not use npm here)

Run all commands from this directory. There is no monorepo-root `package.json`; running `pnpm install` from the repo root can create a stray `.pnpm-store/` (safe to delete; gitignored).

## Quick start

```bash
pnpm install
cp .env.example .env.local   # first time — fill Strapi vars for bike
pnpm dev:bike                # vukans-bike → http://localhost:3002
# or
pnpm dev:resort              # resort-example → http://localhost:3001
```

| Tenant | Port | Data | Role |
|--------|------|------|------|
| `vukans-bike` | 3002 | Strapi | Product site — start `headless-cms-backend` first |
| `resort-example` | 3001 | Mock JSON | Build-isolation fixture (not a product twin) |

### Strapi (bike) — two terminals

```bash
# Terminal 1
cd ../headless-cms-backend && npm run develop   # http://localhost:1337/admin

# Terminal 2 (this app)
pnpm dev:bike
```

Frontend env (`.env` / `.env.local`):

```env
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-read-token
REVALIDATE_SECRET=your-local-secret-min-16-chars
# PREVIEW_SECRET=optional-for-draft-preview
```

Seed CMS from colocated mock JSON (backend):

```bash
cd ../headless-cms-backend
STRAPI_API_TOKEN=your-full-access-token npm run seed:vukans-bike
```

More backend detail: [`../headless-cms-backend/README.md`](../headless-cms-backend/README.md).

## Common scripts

| Script | Purpose |
|--------|---------|
| `pnpm dev:bike` / `dev:resort` | Dev servers |
| `pnpm build:bike` / `build:resort` | Production builds (`.next-{tenantId}`) |
| `TENANT_ID=… pnpm verify:build` | Fail if another tenant’s paths appear in the build |
| `pnpm create:tenant` / `check:tenant` | Scaffold / validate a tenant |
| `pnpm lint` / `type-check` / `check:types-style` | Quality (`check:types-style` enforces options-object + colocated `types.ts` props; see Spec Kit `typescript.md`) |

Analyze bundles: `pnpm build:bike:analyze` then open `analyze/client-*.html`.

## How routing works

| File | Role |
|------|------|
| `src/app/layout.tsx` | Root shell: HTML, global CSS, `@core/init` |
| `src/app/[domain]/layout.tsx` | Theme + analytics (`[domain]` = **tenant id**, not hostname) |
| `src/app/[domain]/[[...slug]]/page.tsx` | **Only** page route — loads page + nav, picks template, renders blocks |

Header/footer live in tenant **templates** (`default`, `detail`, `bare`), not in layouts.

**Navigation UX:** do not add `[[...slug]]/loading.tsx` (it flashes chrome). Use `NavigationProgressBar` in tenant headers. Optional: wrap only `<BlockRenderer />` in `<Suspense>` for slow content.

## Data

Set `dataAdapter` in `src/tenants/{id}/config.ts`:

- **`mock`** — JSON under `src/tenants/{id}/mock-data/` (`@mock-data` points there)
- **`strapi`** — live CMS; `@mock-data` is a stub; `mock-data/` is seed/reference only

Pages + navigation are loaded once in `page.tsx` (`loadPageWithNavigation`). Templates receive `page.navigation` — localize with `localizeNavItems` before Header/Footer.

## Build isolation

```bash
pnpm build:bike
TENANT_ID=vukans-bike pnpm verify:build

pnpm build:resort
TENANT_ID=resort-example pnpm verify:build
```

`verify:build` checks middleware embeds the expected tenant and scans build JS for other tenants’ `tenants/{id}` paths. CI runs this after each tenant build.

Clean reset example:

```bash
rm -rf .next-vukans-bike analyze
pnpm build:bike && TENANT_ID=vukans-bike pnpm verify:build
```

## New tenant

```bash
pnpm create:tenant -- --id my-tenant --name "My Site" --short my --port 3003
pnpm check:tenant
pnpm build:my
TENANT_ID=my-tenant pnpm verify:build
```

Then CI matrix + deploy workflow — see repo [README](../README.md) and Spec Kit `new-tenant` knowledge.

## Monorepo

| Path | Role |
|------|------|
| [`../README.md`](../README.md) | Monorepo overview |
| [`../headless-cms-backend/`](../headless-cms-backend/) | Strapi |
| [`../.github/workflows/`](../.github/workflows/) | CI + manual Vercel deploys |
