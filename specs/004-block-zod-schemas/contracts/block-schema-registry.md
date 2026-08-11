# Contract: Block Schema Registry Coverage

**Feature**: `004-block-zod-schemas`  
**Consumers**: `BlockRenderer` (`core/blocks/renderer.tsx`), tenant/shared `register*Blocks`  
**Library**: Zod via `BlockDefinition.schema`

## Registration contract

Every content-block entry MUST look like:

```ts
"{type}": {
  component: Component,
  schema: {type}Schema,  // required after this feature
  dataContract?: ...,
  acceptSearchParams?: ...,
}
```

Export name: camelCase block id + `Schema` (e.g. `ctaBannerSchema`, `aboutStorySchema`).

File locations:

| Registry | Path pattern |
|----------|----------------|
| Shared | `src/shared/components/blocks/{block}.schema.ts` |
| Tenant | `src/tenants/{tenantId}/blocks/{block}/schema.ts` |

## Coverage checklist (implement → all Yes)

### Shared (`shared/components/blocks/index.ts`)

| Type | Schema today | Target |
|------|--------------|--------|
| `cta-banner` | No | Yes |
| `section-header` | No | Yes |
| `stats-bar` | No | Yes |
| `image-text` | No | Yes |
| `rich-text` | No | Yes |
| `image-gallery` | No | Yes |

### Product tenant `vukans-bike`

| Type | Schema today | Target |
|------|--------------|--------|
| `hero` | Yes | Yes (keep) |
| `contact` | No | Yes |
| `about-story` | No | Yes |
| `about-values` | No | Yes |
| `about-person` | No | Yes |
| `bike-detail` | No | Yes (authored: `labels`) |
| `bike-school-intro` | No | Yes |
| `bike-school-program` | No | Yes |
| `gallery` | No | Yes |
| `guided-tour-experience` | No | Yes |
| `partners-gallery` | No | Yes |
| `product-list` | No | Yes (omit injected `products`) |
| `service-pricing` | No | Yes |
| `service-process` | No | Yes |
| `service-faq` | No | Yes |
| `service-contact` | No | Yes |

### Fixture tenant `resort-example`

| Type | Schema today | Target |
|------|--------------|--------|
| `hero` | No | Yes |
| `room-list` | Yes | Yes (keep) |
| `room-detail` | No | Yes (authored empty/minimal; omit injected room/hotel/…) |
| `hotel-info` | No | Yes (empty authored object; omit `hotel`) |
| `about-story` | No | Yes |
| `location-contact` | No | Yes |
| `amenities-grid` | No | Yes |
| `team-gallery` | No | Yes |
| `booking-widget` | No | Yes |
| `testimonials` | No | Yes (omit `reviews`) |

### Out of scope

| Piece | Reason |
|-------|--------|
| `header` / `footer` | Template chrome, not content-block registry |
| Backend Strapi component JSON | No API contract change |

## Runtime contract (unchanged)

1. If `definition.schema` is set and `NODE_ENV === "development"`, `safeParse(mergedProps)`.
2. On failure: `logger.warn` with block type + issue paths; still render.
3. Unknown keys do not fail validation when using plain `z.object`.

## Doc sync contract

Same PR MUST update:

- `.specify/memory/knowledge/block-system.md` — schemas required for registered content blocks
- `specs/_catalogs/vukans-bike.md` — reflect schema coverage
- `specs/_catalogs/resort-example.md` — reflect schema coverage
