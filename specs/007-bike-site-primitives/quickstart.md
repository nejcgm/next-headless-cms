# Quickstart: Vukan's Bike Site Primitives Redesign

**Feature**: `007-bike-site-primitives`  
**Date**: 2026-09-04

Validate that the full Vukan's Bike site renders from L1/L2 primitives + Keep L3 only, with superseded types removed, and that design quality meets FR-012.

## Prerequisites

- Node 20+, pnpm (frontend), npm (backend)
- Feature branch `007-bike-site-primitives`
- See [data-model.md](./data-model.md), [contracts/page-block-inventory.md](./contracts/page-block-inventory.md)

## Setup

```bash
cd next-headless-cms-fe
pnpm install

# For Strapi schema verification
cd ../headless-cms-backend
npm install
```

Set bike tenant to mock adapter for visitor verification (`config.ts` / env as used in this feature). Restore product Strapi adapter per catalog after verify if needed.

## Validation scenarios

### 1. Typecheck & lint

```bash
cd next-headless-cms-fe
pnpm type-check
pnpm lint:bike
pnpm lint:resort
```

**Expect**: Pass after deletions and allowlist updates.

### 2. Inventory grep (contract)

```bash
cd next-headless-cms-fe
rg 'blocks\.(cta-banner|stats-bar|image-text|section-header|rich-text|image-gallery|hero|about-story|about-person|about-values|bike-school-intro|bike-school-program|guided-tour-experience|service-process|service-contact|contact)' \
  src/tenants/vukans-bike/mock-data/pages
```

**Expect**: Zero matches.

Confirm Keep types still present where needed (`product-list`, `gallery`, `bike-detail`). Shared `accordion` on FAQ. Contact / brands / service pricing are L1 (+ `iframe` on contact).

### 3. Dev render (all public pages)

```bash
cd next-headless-cms-fe
TENANT_ID=vukans-bike pnpm dev
# http://localhost:3002/
```

Smoke routes: `/`, `/shop`, `/service`, `/about`, `/contact`, `/brands`, `/bike-school`, `/guided-tours`, `/bikes/merida` (+ `/en`, `/de` equivalents).

**Expect**: Pages load; nav chrome intact; no blank main from missing types; products/detail still resolve via Keep compounds.

### 4. Design review gate (FR-012 / SC-005–SC-006)

For each marketing page (home, shop, service, about, contact, brands, bike school, guided tours), on mobile and desktop:

| Check | Pass criteria |
|-------|----------------|
| Brand / place first viewport | Brand or Apače/place remains dominant if nav ignored |
| Hero budget | One headline, one support line, one CTA group — not a module dashboard |
| One job per section | No stacked unrelated promos |
| Anti-vibecode | No vanity stats strips; no decorative card grids as the main idea; no chip/pill clutter; no competing full-bleed bands |
| Copy | Feels specific to Vukan's Bike — not generic template filler |
| Hierarchy | Clear heading vs body; purposeful spacing |

**Expect**: Reviewer can mark SC-005/SC-006 pass.

### 5. Locale structure parity

Diff structure of `shop.json` vs `en--shop.json` vs `de--shop.json` (and other triples): same `__component` sequence / nesting; strings differ.

### 6. Resort fixture still builds

```bash
cd next-headless-cms-fe
pnpm build:resort && pnpm verify:build
```

Confirm resort mocks no longer reference deleted **shared** opaques (`cta-banner`, `stats-bar`, `section-header`, …). Resort proprietary blocks may remain.

### 7. Bike isolation build

```bash
cd next-headless-cms-fe
pnpm build:bike && pnpm verify:build
```

### 8. Strapi schema

```bash
cd headless-cms-backend
# After DZ/component edits:
npm run types:generate
```

Confirm `page` DZ lists only L1 + Keep components per data-model.

## Done when

- [ ] SC-001–SC-006 satisfied  
- [ ] Inventory contract grep clean  
- [ ] Shared + bike proprietary Replace types deleted from FE + Strapi  
- [ ] Spec Kit knowledge + catalogs updated  
- [ ] `verify:build` passes for bike and resort  
