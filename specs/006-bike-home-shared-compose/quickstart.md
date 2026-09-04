# Quickstart: Bike Home Shared Composition

**Feature**: `006-bike-home-shared-compose`  
**Date**: 2026-08-13

Validate that Vukan's Bike home renders from a shared composition tree (Level 1 + `product-list` only as Level 3).

## Prerequisites

- Node 20+, pnpm (frontend), npm (backend)
- Repo at feature branch `006-bike-home-shared-compose`
- See [data-model.md](./data-model.md) and [contracts/composition-tree.md](./contracts/composition-tree.md)

## Setup

```bash
# Frontend
cd next-headless-cms-fe
pnpm install

# Backend (when verifying Strapi/seed path)
cd ../headless-cms-backend
npm install
```

Copy/env as per FE/BE READMEs (`TENANT_ID=vukans-bike`, Strapi URL, secrets).

After schema changes: regenerate Strapi types and re-seed bike CMS from updated home mocks.

## Validation scenarios

### 1. Typecheck & lint (bike)

```bash
cd next-headless-cms-fe
pnpm type-check
pnpm lint:bike
```

**Expect**: Pass after new primitives + recursive renderer land.

### 2. Home tree structure (seed/reference JSON)

Inspect `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/home.json` (+ `en--home`, `de--home`):

- Roots are `section` / layout trees and one `blocks.product-list`
- No `blocks.hero`, `blocks.stats-bar`, `blocks.image-text`, `blocks.cta-banner` on home
- Nested nodes live under `slots` per [composition-tree](./contracts/composition-tree.md)

### 3. Dev render (bike)

```bash
cd next-headless-cms-fe
TENANT_ID=vukans-bike pnpm dev
# open http://localhost:3002/ (or configured bike port)
```

**Expect**:
- Hero messaging + CTAs, stats, service promo, featured products, closing CTA (same roles as today)
- Products still load via `product-list` dataContract
- Theme tokens apply (brand colors via CSS variables)

### 4. Locales

Open `/en` and `/de` home equivalents.

**Expect**: Same block roles/order; localized copy; no blank main from missing types.

### 5. Illegal nest (dev signal)

Temporarily put a nested `image` with a child `text` in mock (or over-depth `stack` subtree), load home.

**Expect**: Adapter drops illegal nodes before render; page does not crash; development warning logged. Renderer never receives the illegal branch.

### 6. Isolation

```bash
cd next-headless-cms-fe
pnpm build:bike && pnpm verify:build
# optionally build:resort as well if shared renderer changes worry isolation
```

**Expect**: `verify:build` passes (shared must not import tenants).

### 7. Other pages still work

Spot-check `/service` or `/about` still using legacy `hero` + opaque shared blocks.

**Expect**: Unchanged behavior (home-only migration).

## Done when

- [ ] SC-001–SC-008 from spec satisfied on home  
- [ ] Catalog + `block-system` / content-model / mock-data knowledge updated  
- [ ] Seed script loads new home trees into Strapi  
