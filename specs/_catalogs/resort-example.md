# Tenant catalog: `resort-example`

**Maintenance**: Update only when this fixture’s folders, blocks, or CI/build scripts change. Sync map: `.specify/memory/project-context.md`.

# Resort Example (`resort-example`) — build-isolation fixture

**Role:** Not a product site. Exists to validate **cross-tenant build leakage** against `vukans-bike` (`pnpm verify:build`, CI matrix, separate `dev:resort` / `build:resort`). Keep enough distinct source under `src/tenants/resort-example/` and `src/core/mock-data.ts/resort/` that a bike build would fail isolation checks if it accidentally bundled resort code (and vice versa).

**Do not** treat this catalog as the template for new tenants. For plug-and-play product tenants, follow `.specify/memory/knowledge/new-tenant.md` and mirror **`vukans-bike`** (Strapi or canonical mock JSON).

| | |
|--|--|
| Locales | `en` (default), `de`, `sl` |
| `dataAdapter` | `"mock"` |
| Mock folder | `src/core/mock-data.ts/resort/` (mapped in `tenant-mock-map.json`) |
| Port | `:3001` (`pnpm dev:resort`) |

## Why mock pages look “broken”

Fixture pages may still use legacy `{ id, type, props }` + `locale`. That is **acceptable for this fixture** — runtime page fidelity is not the goal. Product/mock tenants must use the canonical Strapi dynamic-zone shape (see `knowledge/mock-data.md`).

## Inventory (for isolation / edits)

| Area | Path |
|------|------|
| Config | `src/tenants/resort-example/config.ts` |
| Blocks registry | `src/tenants/resort-example/blocks/index.ts` |
| Templates | `templates/default.tsx`, `detail.tsx`, `bare.tsx` |
| Header / footer | `blocks/header/`, `blocks/footer/` |
| Mock data | `src/core/mock-data.ts/resort/` |
| Integrations (fixture) | `integrations/grmovsek-hotel/`, `integrations/reviews/` |
| Deploy | `.github/workflows/deploy-resort.yml` |

### Registered tenant blocks

`hero`, `room-list`, `room-detail`, `hotel-info`, `about-story`, `location-contact`, `amenities-grid`, `team-gallery`, `booking-widget`, `testimonials`

Keep these **distinct** from bike block trees so leakage scans stay meaningful. Prefer minimal changes unless isolation tooling or CI requires updates.
