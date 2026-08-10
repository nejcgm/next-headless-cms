# Tenant catalog: `resort-example`

**Maintenance**: Update `specs/_catalogs/resort-example.md` when this tenant's blocks, templates, pages, or integrations change. Sync map: `.specify/memory/project-context.md`.


# Resort Example (`resort-example`)

> **Maintenance**: Keep this file in sync when blocks, templates, mock pages, navigation, or integrations change (`.specify/memory/project-context.md` (sync map)).

Mountain hotel / resort demo (Kope). Locales: `en` (default), `de`, `sl`. Adapter: `mock` → Strapi later.

**Mock data folder** is `src/core/mock-data.ts/resort/` (not `resort-example`).

## Render pipeline

```
page JSON → MockAdapter.getPage → page.tsx
  → resolveTemplate(page.template) → tenant template
  → BlockRenderer → tenant + shared blocks
```

- **Config**: `src/tenants/resort-example/config.ts`
- **Registration**: `src/tenants/resort-example/blocks/index.ts`
- **Mock pages**: `src/core/mock-data.ts/resort/pages/*.json` — **legacy** `{ id, type, props }` blocks + top-level `locale` (not yet migrated to Strapi `__component` shape). `toPageData` drops those blocks today → empty `blocks[]` until pages are converted (see `.specify/memory/knowledge/mock-data.md`).
- **Nav**: loaded in `page.tsx` via `loadPageWithNavigation`; templates use `page.navigation`.

## Templates (`src/tenants/resort-example/templates/`)

| Template | Chrome | Use |
|----------|--------|-----|
| `default` | Header + footer | Home, about, contact, rooms list, room detail (current JSON) |
| `detail` | Header + footer + **main/sidebar grid** | Use when page needs two-column shell (`"template": "detail"`) |
| `bare` | None | Landing / campaign pages |

`room-detail.json` currently sets `"template": "default"`; switch to `detail` if sidebar layout is needed.

## Layout chrome

| Piece | Path | Role |
|-------|------|------|
| Header | `blocks/header/header.tsx` | Same pattern as vukans-bike (client nav + locales) |
| Footer | `blocks/footer/footer.tsx` | Re-export shared footer |

## Tenant blocks

| Block type | Component | Data | Used on / purpose |
|------------|-----------|------|-------------------|
| `hero` | `blocks/hero/hero.tsx` | Props | Page heroes |
| `room-list` | `blocks/room-list/room-list.tsx` | **dataContract** → `getHotel()` rooms; Zod `roomListSchema` | `/rooms` — grid of bookable rooms |
| `room-detail` | `blocks/room-detail/room-detail.tsx` | **dataContract** → `services/roomDetail.service.ts` | `/rooms/:roomId` — gallery, rates, availability; reads `ctx.slug` |
| `hotel-info` | `blocks/hotel-info/hotel-info.tsx` | **dataContract** → `getHotel()` | Home — property overview |
| `about-story` | `blocks/about-story/about-story.tsx` | Props | About page story |
| `location-contact` | `blocks/location-contact/` | Props | Contact — address, directions, map embed |
| `amenities-grid` | `blocks/amenities-grid/` | Props | About, contact — facility icons |
| `team-gallery` | `blocks/team-gallery/` | Props | About — staff photos |
| `booking-widget` | `blocks/booking-widget/` | Props | Home — date/search UI (booking feature flag) |
| `testimonials` | `blocks/testimonials/` | **dataContract** → `getCollection("reviews")` | Home — guest reviews; `limit` from props |

## Shared blocks used

| Block type | Used on |
|------------|---------|
| `section-header` | `/rooms` — list page title |
| `stats-bar` | Home |
| `image-gallery` | Home — property photos |
| `cta-banner` | About, contact |

## Integrations

| Integration | Path | Consumed by |
|-------------|------|-------------|
| Grmovšek hotel API (mock client) | `integrations/grmovsek-hotel/client.ts` | `room-list`, `hotel-info`, `roomDetail.service` |
| Reviews (mock) | `integrations/reviews/mock.ts` | Adapter `reviews` collection → `testimonials` block |

## Services

| Service | Path | Role |
|---------|------|------|
| `roomDetail.service` | `services/roomDetail.service.ts` | Parses `/rooms/{id}` from slug; loads room, hotel, availability, blocked dates; keep heavy logic here |

## Page → blocks

| Page | Template | Blocks |
|------|----------|--------|
| `/` (home) | default | hero → stats-bar → hotel-info → room-list → booking-widget → testimonials → image-gallery → cta-banner |
| `/rooms` | default | section-header → room-list |
| `/rooms/:roomId` | default | room-detail (`slugPattern` in JSON) |
| `/about` | default | hero → about-story → amenities-grid → team-gallery → cta-banner |
| `/contact` | default | hero → location-contact → amenities-grid → cta-banner |

## Strapi notes

- `room-detail` needs dynamic zone or collection type with slug pattern `/rooms/:roomId`.
- `testimonials` / reviews → separate collection, wired like mock `getCollection("reviews")`.
- Hotel data may stay a custom Strapi single type or external sync — preserve `roomDetail.service` boundary.
