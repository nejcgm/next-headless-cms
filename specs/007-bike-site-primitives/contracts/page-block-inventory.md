# Contract: Page block inventory (post-migration)

**Feature**: `007-bike-site-primitives`  
**Date**: 2026-09-04

## Purpose

Define which block types may appear on Vukan's Bike pages after this feature, what must be deleted, and how the resort fixture must behave when shared types are removed. Wire shape for trees remains [006 composition-tree](../../006-bike-home-shared-compose/contracts/composition-tree.md) (`__component` + flat fields + `slots`).

## Allowed on bike pages

### Roots and nested nodes

| `__component` | Role |
|---------------|------|
| `blocks.section` | L1 band |
| `blocks.stack` | L1 layout |
| `blocks.flex` | L1 layout |
| `blocks.grid` | L1 layout |
| `blocks.text` | L1 leaf |
| `blocks.image` | L1 leaf |
| `blocks.iframe` | L1 leaf |
| `blocks.icon` | L1 leaf |
| `blocks.button` | L1 leaf |
| `blocks.link` | L1 leaf |
| `blocks.accordion` | L3 shared |
| `blocks.product-list` | L3 Keep |
| `blocks.bike-detail` | L3 Keep |
| `blocks.gallery` | L3 Keep |

No other `__component` values may remain in `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages/**`.

### Nesting

Nested children use the same `__component` + numeric `id` inside `slots` (see 006 contract). Keep L3 nodes are leaves (no `slots`). Layout allowlists MUST include Keep types listed above so framing bands are valid.

## Forbidden after migration (bike)

These MUST have **0** hits in bike mock pages, bike `blocks/index.ts`, and Strapi page DZ:

| `__component` / type | Ownership |
|----------------------|-----------|
| `blocks.cta-banner` | Shared |
| `blocks.stats-bar` | Shared |
| `blocks.image-text` | Shared |
| `blocks.section-header` | Shared |
| `blocks.rich-text` | Shared |
| `blocks.image-gallery` | Shared |
| `blocks.hero` | Bike proprietary (Strapi + bike FE) |
| `blocks.about-story` | Bike proprietary |
| `blocks.about-person` | Bike proprietary |
| `blocks.about-values` | Bike proprietary |
| `blocks.bike-school-intro` | Bike proprietary |
| `blocks.bike-school-program` | Bike proprietary |
| `blocks.guided-tour-experience` | Bike proprietary |
| `blocks.service-process` | Bike proprietary |
| `blocks.service-contact` | Bike proprietary |
| `blocks.contact` | Bike proprietary (replaced by L1 + `iframe`) |
| `blocks.heading` | Shared (replaced by `text` + `fontSize` / `bold`) |
| `blocks.service-faq` | Bike proprietary (replaced by L1 + shared `accordion`) |
| `blocks.partners-gallery` | Bike proprietary (replaced by L1 `grid` of stacks) |
| `blocks.service-pricing` | Bike proprietary (replaced by L1 pricing stacks) |
| `blocks.service-package` | Bike proprietary (sub-component of service-pricing) |

## Resort fixture contract

When a **shared** type from the Forbidden table is deleted from shared FE registration / Strapi:

1. Remove every matching node from `resort-example` mock page JSON (**drop**, do not rewrite as primitives).
2. Do **not** redesign resort as a product site.
3. Resort **tenant** types (e.g. `hero`, `room-list`, `booking-widget`) may remain in resort mocks and resort registry even if Strapi no longer exposes `blocks.hero` for the product DZ.

## Locale parity

For each logical page (`home`, `shop`, `service`, `about`, `contact`, `brands`, `bike-school`, `guided-tours`, `bikes--*`):

- `*.json`, `en--*.json`, `de--*.json` share the same block tree shape and ids strategy.
- Only human-readable strings (and locale field) differ.

## Grep acceptance (implement gate)

```bash
# Expect zero matches in bike mocks for forbidden types, e.g.:
rg 'blocks\.(cta-banner|stats-bar|hero|about-story|service-process)' \
  next-headless-cms-fe/src/tenants/vukans-bike/mock-data/pages
```

Allowed-only inventory must match this contract before FE/Strapi deletion commits.
