# Build verification — tenant isolation

Each production build must contain **only** the selected tenant’s code. Run all commands from **`next-headless-cms-fe/`** (see [repo README](../../README.md)).

## Quick verification

```bash
cd next-headless-cms-fe

# Build
pnpm build:bike
pnpm build:resort

# Verify isolation (scans all JS in the build output)
TENANT_ID=vukans-bike pnpm verify:build
TENANT_ID=resort-example pnpm verify:build
```

With bundle analysis:

```bash
pnpm build:bike:analyze
TENANT_ID=vukans-bike pnpm verify:build
```

## What `verify:build` checks

`scripts/verify-build.js`:

1. Confirms the built **middleware** embeds the expected tenant id
2. Scans **every** `.js` file under the build directory (server + static chunks)
3. Fails if any file contains another tenant’s source path:
   - `tenants/{other-id}` or `src/tenants/{other-id}`
   - `mock-data.ts/{other-folder}` (uses `scripts/tenant-mock-map.json` for aliases like `resort-example` → `resort`)

Tenant lists are discovered dynamically from `src/tenants/` via `scripts/tenant-registry.js` — no hardcoded tenant list in the verifier.

## Build process

1. **`scripts/prepare-tenant.js`** — Sets `tsconfig.json` paths (`@tenant`, `@mock-data`) from `TENANT_ID`. Mock folder aliases come from `scripts/tenant-mock-map.json`.

2. **`scripts/clean-analyze.js`** — Removes stale analyze output when `BUILD_CLEAN_ANALYZE=1`.

3. **`next.config.ts`** — Requires `TENANT_ID`. Output directory:
   - Local / CI: `.next-{tenantId}`
   - Vercel: `.next` when `NEXT_USE_VERCEL_DIST=1`

4. **`mock.adapter.ts`** — Dynamic `@mock-data` imports so only the active tenant’s JSON is bundled.

## CI

`.github/workflows/ci.yml` runs `pnpm verify:build` after each tenant build in the `build-tenants` job.

## New tenant onboarding

Scaffold + validate setup before first build:

```bash
pnpm create:tenant -- --id my-tenant --name "My Site" --short my --port 3003
pnpm check:tenant
pnpm build:my
TENANT_ID=my-tenant pnpm verify:build
```

See [new-tenant checklist](../.cursor/rules/new-tenant-checklist.mdc) for CI/deploy steps.

## Manual spot checks (optional)

```bash
# Should return no matches for the *other* tenant
grep -r "tenants/resort-example" .next-vukans-bike/ || echo "OK"
grep -r "tenants/vukans-bike" .next-resort-example/ || echo "OK"
```

For visual bundle inspection, open `analyze/client-{tenant-id}.html` after `pnpm build:{short}:analyze`.

## Clean builds

Build scripts clean analyze output automatically. Full reset:

```bash
rm -rf .next-vukans-bike analyze
pnpm build:bike
TENANT_ID=vukans-bike pnpm verify:build
```
