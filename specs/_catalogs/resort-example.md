# Tenant catalog: `resort-example`

**Maintenance**: Update only when this fixture’s folders, blocks, or CI/build scripts change. Sync map: `.specify/memory/project-context.md`.

# Resort Example (`resort-example`) — build-isolation fixture

**Role:** Not a product site. Exists to validate **cross-tenant build leakage** against `vukans-bike` (`pnpm verify:build`, CI matrix, separate `dev:resort` / `build:resort`). Keep enough distinct source under `src/tenants/resort-example/` (including `mock-data/`) that a bike build would fail isolation checks if it accidentally bundled resort code (and vice versa).

**Do not** treat this catalog as the template for new tenants. For plug-and-play product tenants, follow `.specify/memory/knowledge/new-tenant.md` and mirror **`vukans-bike`** (Strapi or canonical mock JSON). **Bike is SoT for shared L1 types** (`section`, `stack`, `flex`, `grid`, `heading`, `text`, `image`, `button`).

| | |
|--|--|
| Locales | `en` (default), `de`, `sl` |
| `dataAdapter` | `"mock"` |
| Mock data | `src/tenants/resort-example/mock-data/` (home includes `grid` + nested L1 composition proof) |
| Port | `:3001` (`pnpm dev:resort`) |

## Mock pages

Use the canonical Strapi dynamic-zone shape (`__component` + `lang`) — see `knowledge/mock-data.md`. Shared opaque nodes (`cta-banner`, `stats-bar`, `section-header`) were dropped from mocks. Resort proprietary blocks remain. Home includes a `blocks.grid` with nested L1 `image` / layout children for composition playground testing.

## Inventory (for isolation / edits)

| Area | Path |
|------|------|
| Config | `src/tenants/resort-example/config.ts` |
| Blocks registry | `src/tenants/resort-example/blocks/index.ts` |
| Templates | `templates/default.tsx`, `detail.tsx`, `bare.tsx` |
| Header / footer | `blocks/header/`, `blocks/footer/` |
| Mock data | `src/tenants/resort-example/mock-data/` |
| Integrations (fixture) | `integrations/grmovsek-hotel/`, `integrations/reviews/` |
| Deploy | `.github/workflows/deploy-resort.yml` |

### Registered tenant blocks

`hero`, `room-list`, `room-detail`, `hotel-info`, `about-story`, `location-contact`, `amenities-grid`, `team-gallery`, `booking-widget`, `testimonials`

Each has a Zod `schema` in `blocks/{name}/schema.ts` wired in `blocks/index.ts` (dev-only prop validation). Authored CMS props only; omit `dataContract`-injected fields.

Keep these **distinct** from bike block trees so leakage scans stay meaningful. Prefer minimal changes unless isolation tooling or CI requires updates.
