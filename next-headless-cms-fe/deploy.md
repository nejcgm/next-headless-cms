# Deployment Guide

## Building Individual Tenants

This multi-tenant CMS supports building and deploying each tenant independently.

### Build Commands

Use the npm scripts — they run `prepare-tenant.js` first to set `@tenant` and `@mock-data` paths, and clean the analyze folder:

```bash
# Build resort-example tenant
npm run build:resort

# Build vukans-bike tenant
npm run build:bike

# Build with bundle analysis (for verification)
npm run build:resort:analyze
npm run build:bike:analyze

# Verify build isolation (auto-detects tenant)
npm run verify:build
```

### Dev Commands

```bash
npm run dev:resort   # Port 3001
npm run dev:bike     # Port 3002
```

### Output Directory

By default, Next.js builds to `.next/`. For separate tenant deployments, use `distDir`:

```javascript
// next.config.ts
const nextConfig = {
  distDir: process.env.TENANT_ID 
    ? `.next-${process.env.TENANT_ID}` 
    : '.next',
}
```

Or set it per build:

```bash
# Build resort to separate directory
TENANT_ID=resort-example node scripts/prepare-tenant.js && TENANT_ID=resort-example next build --dist-dir dist/resort-example

# Build bike to separate directory
TENANT_ID=vukans-bike node scripts/prepare-tenant.js && TENANT_ID=vukans-bike next build --dist-dir dist/vukans-bike
```

### Deployment Strategies

#### Strategy 1: Single Server, Multiple Subdomains

Use hostname-based routing with a single build:

```bash
# Per-tenant builds only (one tenant per build)
npm run build:resort
# or
npm run build:bike

# Configure nginx/vercel to route by hostname:
# resort.example.com → serves resort-example
# bike.example.com → serves vukans-bike
```

#### Strategy 2: Separate Builds per Tenant

Build each tenant independently and deploy to separate servers:

```bash
#!/bin/bash
# build-all.sh

TENANTS=("resort-example" "vukans-bike")

for tenant in "${TENANTS[@]}"; do
  echo "Building $tenant..."
  case "$tenant" in
    resort-example) npm run build:resort ;;
    vukans-bike) npm run build:bike ;;
    *) echo "Unknown tenant: $tenant"; exit 1 ;;
  esac
  mv .next "dist/$tenant" 2>/dev/null || true
done
```

Deploy each `dist/$tenant` to its own server/container.

#### Strategy 3: Docker Multi-Tenant Build

```dockerfile
# Dockerfile - build one image per tenant
ARG TENANT=resort-example
ENV TENANT_ID=${TENANT}

RUN npm ci
# Use the matching npm script for the tenant
RUN if [ "$TENANT" = "resort-example" ]; then npm run build:resort; else npm run build:bike; fi
```

Build with:

```bash
docker build --build-arg TENANT=resort-example -t cms:resort .
docker build --build-arg TENANT=vukans-bike -t cms:bike .
```

### Vercel Deployment

#### Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy specific tenant
vercel --build-env TENANT_ID=resort-example
```

#### Using Git Branches (Recommended)

Create separate branches for each tenant:

```bash
# Main branch
git checkout main

# Resort branch
git checkout -b deploy/resort
echo "TENANT_ID=resort-example" > .env.production
git add .env.production && git commit -m "Add resort tenant config"

# Bike branch
git checkout -b deploy/bike
echo "TENANT_ID=vukans-bike" > .env.production
git add .env.production && git commit -m "Add bike tenant config"
```

Connect each branch to a separate Vercel project.

### Static Export (Optional)

For static hosting, add to `next.config.ts`:

```typescript
const nextConfig = {
  output: 'export',
  distDir: process.env.TENANT_ID 
    ? `dist-${process.env.TENANT_ID}` 
    : 'dist',
}
```

Build:

```bash
npm run build:resort
# Output: dist-resort-example/
```

### Environment Variables by Tenant

Create tenant-specific env files:

```bash
# .env.resort-example
TENANT_ID=resort-example
LITEAPI_KEY=sand_xxx
LITEAPI_HOTEL_ID=lp65866c0e

# .env.vukans-bike
TENANT_ID=vukans-bike
STRAPI_URL=https://cms.bike.com
```

Load per build:

```bash
# Resort build with its env
env $(cat .env.resort-example | xargs) npm run build:resort

# Bike build with its env
env $(cat .env.vukans-bike | xargs) npm run build:bike
```

### Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run dev:resort` | Dev server for resort (port 3001) |
| `npm run dev:bike` | Dev server for bike (port 3002) |
| `npm run build:resort` | Build resort tenant |
| `npm run build:bike` | Build bike tenant |
| `npm run build:resort:analyze` | Build resort with bundle analysis |
| `npm run build:bike:analyze` | Build bike with bundle analysis |
| `npm run verify:build` | Verify tenant isolation (auto-detects) |

### Troubleshooting

**Issue**: Middleware not resolving tenant
- Build uses `TENANT_ID` from prepare-tenant; only one tenant per build
- Verify tenant exists in `src/tenants/`

**Issue**: Blocks not loading
- Ensure `registerTenantBlocks()` is called for the tenant
- Check block imports use correct paths

**Issue**: Images missing in static export
- Add `images.unoptimized = true` to `next.config.ts` for static builds
