# Build Verification — Tenant Isolation

This document describes how to verify that each tenant build contains **only** that tenant's code.

## Quick Verification

```bash
# Build for vukans-bike (with bundle analysis)
npm run build:bike:analyze

# Build for resort-example (with bundle analysis)
npm run build:resort:analyze

# Verify the current build (auto-detects tenant from .next artifacts)
npm run verify:build
```

## Build Process

1. **`scripts/prepare-tenant.js`** — Runs before every build/dev. Updates `tsconfig.json` paths (`@tenant`, `@mock-data`) based on `TENANT_ID`. Cleans old analyze output when `BUILD_CLEAN_ANALYZE=1` (set by all build scripts).

2. **`scripts/clean-analyze.js`** — Removes `analyze/`, `.next/analyze/`, `.next/server/analyze/` so each build starts fresh. Prevents stale cross-tenant reports.

3. **`next.config.ts`** — Webpack aliases `@tenant`, `@tenant/config`, `@mock-data` resolve to the selected tenant at build time.

4. **`mock.adapter.ts`** — Uses `@mock-data` alias with dynamic imports so only the current tenant's JSON files are bundled.

## Verification Checklist

### Vukans-bike build (`npm run build:bike:analyze`)

- [ ] Open `analyze/client-vukans-bike.html` — should show only vukans-bike blocks
- [ ] Open `.next/server/analyze/server-vukans-bike.html` — middleware should reference `vukans-bike/config.ts`
- [ ] Grep: `grep -r "resort-example" .next/static/chunks/` — should return **no matches**
- [ ] Grep: `grep -r "vukans-bike" .next/static/chunks/` — should find matches

### Resort build (`npm run build:resort:analyze`)

- [ ] Open `analyze/client-resort-example.html` — should show only resort blocks
- [ ] Open `.next/server/analyze/server-resort-example.html` — middleware should reference `resort-example/config.ts`
- [ ] Grep: `grep -r "vukans-bike" .next/static/chunks/` — should return **no matches**
- [ ] Grep: `grep -r "resort-example" .next/static/chunks/` — should find matches

## Automated Verification

```bash
npm run verify:build
```

The verify script auto-detects the tenant from the build (middleware or analyze files), checks for cross-tenant leakage in server bundles and chunks, and reports pass/fail. No `TENANT_ID` required when a build exists.

## Clean Builds (Recommended for Verification)

The build scripts automatically clean the analyze folder. For a full clean build:

```bash
# Verify vukans-bike in isolation
rm -rf .next && npm run build:bike:analyze
npm run verify:build

# Verify resort in isolation
rm -rf .next && npm run build:resort:analyze
npm run verify:build
```

## Analysis Output Locations

| Build | Client | Server |
|-------|--------|--------|
| vukans-bike | `analyze/client-vukans-bike.{html,json}` | `.next/server/analyze/server-vukans-bike.{html,json}` |
| resort-example | `analyze/client-resort-example.{html,json}` | `.next/server/analyze/server-resort-example.{html,json}` |
