# Build verification — tenant isolation

Each production build must contain **only** the selected tenant’s code. Run all commands from **`next-headless-cms-fe/`** (see [repo README](../../README.md)).

## Quick verification

```bash
cd next-headless-cms-fe

# Build with bundle analysis
pnpm build:bike:analyze
pnpm build:resort:analyze

# Verify the current build (auto-detects tenant from artifacts)
pnpm verify:build
```

## Build process

1. **`scripts/prepare-tenant.js`** — Runs before every dev/build. Updates `tsconfig.json` paths (`@tenant`, `@mock-data`) from `TENANT_ID`. Cleans old analyze output when `BUILD_CLEAN_ANALYZE=1` (set by build scripts).

2. **`scripts/clean-analyze.js`** — Removes `analyze/`, `.next/analyze/`, `.next/server/analyze/` so each build starts fresh and cross-tenant reports do not linger.

3. **`next.config.ts`** — Requires `TENANT_ID`. Webpack aliases `@tenant`, `@tenant/config`, `@mock-data` to the active tenant. Output directory:
   - Local / CI: `.next-{tenantId}` (e.g. `.next-vukans-bike`)
   - Vercel production build: `.next` when `NEXT_USE_VERCEL_DIST=1`

4. **`mock.adapter.ts`** — Uses `@mock-data` with dynamic imports so only the current tenant’s JSON is bundled.

## Verification checklist

### Vukans-bike (`pnpm build:bike:analyze`)

- [ ] Open `analyze/client-vukans-bike.html` — only vukans-bike blocks
- [ ] Open `.next-vukans-bike/server/analyze/server-vukans-bike.html` — middleware references `vukans-bike/config.ts`
- [ ] `grep -r "resort-example" .next-vukans-bike/static/chunks/` — **no matches**
- [ ] `grep -r "vukans-bike" .next-vukans-bike/static/chunks/` — matches expected

### Resort (`pnpm build:resort:analyze`)

- [ ] Open `analyze/client-resort-example.html` — only resort blocks
- [ ] Open `.next-resort-example/server/analyze/server-resort-example.html` — middleware references `resort-example/config.ts`
- [ ] `grep -r "vukans-bike" .next-resort-example/static/chunks/` — **no matches**
- [ ] `grep -r "resort-example" .next-resort-example/static/chunks/` — matches expected

> **Note:** Replace `.next-vukans-bike` / `.next-resort-example` with `.next` if you built with `NEXT_USE_VERCEL_DIST=1`.

## Automated verification

```bash
pnpm verify:build
```

`scripts/verify-build.js` auto-detects the tenant from middleware or analyze artifacts, checks server bundles and chunks for cross-tenant leakage, and prints pass/fail. No manual `TENANT_ID` needed when a build already exists.

## Clean builds (recommended)

Build scripts clean the analyze folder automatically. For a full reset:

```bash
# Vukans-bike
rm -rf .next-vukans-bike analyze
pnpm build:bike:analyze
pnpm verify:build

# Resort
rm -rf .next-resort-example analyze
pnpm build:resort:analyze
pnpm verify:build
```

## Analysis output locations

| Build | Client | Server |
|-------|--------|--------|
| vukans-bike | `analyze/client-vukans-bike.{html,json}` | `.next-vukans-bike/server/analyze/server-vukans-bike.{html,json}` |
| resort-example | `analyze/client-resort-example.{html,json}` | `.next-resort-example/server/analyze/server-resort-example.{html,json}` |
