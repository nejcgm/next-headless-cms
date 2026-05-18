# Next Headless CMS (Multi-Tenant)

A Next.js multi-tenant headless CMS where each build includes exactly one tenant selected via `TENANT_ID`.

## Highlights

- Single catch-all page route: `src/app/[domain]/[[...slug]]/page.tsx`
- Build-time tenant isolation through aliases (`@tenant`, `@tenant/config`, `@mock-data`)
- Tenant-specific dev/build commands for `vukans-bike` and `resort-example`
- Optional Strapi adapter support with mock-data fallback during development

## Requirements

- Node.js 20+
- pnpm 10+

## Getting Started

```bash
pnpm install
```

### Run Locally

```bash
# vukans-bike (port 3002)
pnpm dev:bike

# resort-example (port 3001)
pnpm dev:resort
```

## Build

Each build is tenant-specific and uses `scripts/prepare-tenant.js` before `next build`.

```bash
pnpm build:bike
pnpm build:resort
```

### Build Verification

Verify that only the selected tenant code is present in the built output:

```bash
pnpm verify:build
```

For bundle analysis:

```bash
pnpm build:bike:analyze
pnpm build:resort:analyze
```

## Environment Variables

Copy `.env.example` to `.env.local` and set values for your local environment.

Core variables:

- `TENANT_ID` (required at build/dev time)
- `STRAPI_URL` (required when using Strapi adapter)
- `STRAPI_API_TOKEN` (required when using Strapi adapter)

## Scripts

- `pnpm dev:bike` - Start dev server for `vukans-bike`
- `pnpm dev:resort` - Start dev server for `resort-example`
- `pnpm build:bike` - Build `vukans-bike`
- `pnpm build:resort` - Build `resort-example`
- `pnpm build:bike:analyze` - Build bike tenant with bundle analysis
- `pnpm build:resort:analyze` - Build resort tenant with bundle analysis
- `pnpm verify:build` - Verify tenant isolation in build artifacts
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type check

## Deployment Notes

- Deploy one tenant per build artifact/image.
- Set `TENANT_ID` in the deployment environment.
- Keep tenant-specific secrets separate per environment/project.

### Bike Production Deploy (GitHub Actions + Vercel)

This repository includes `.github/workflows/deploy-bike.yml` for production deploys of `vukans-bike`.

Required GitHub repository secrets:

- `BIKE_VERCEL_TOKEN`
- `BIKE_VERCEL_ORG_ID`
- `BIKE_VERCEL_PROJECT_ID`
- `BIKE_STRAPI_URL` (if Strapi adapter is used in production)
- `BIKE_STRAPI_API_TOKEN` (if Strapi adapter is used in production)

How to run:

- Run the workflow manually from the Actions tab (`workflow_dispatch`)

### Resort Production Deploy (GitHub Actions + Vercel)

This repository includes `.github/workflows/deploy-resort.yml` for production deploys of `resort-example`.

Required GitHub repository secrets:

- `RESORT_VERCEL_TOKEN`
- `RESORT_VERCEL_ORG_ID`
- `RESORT_VERCEL_PROJECT_ID`

How to run:

- Run the workflow manually from the Actions tab (`workflow_dispatch`)

