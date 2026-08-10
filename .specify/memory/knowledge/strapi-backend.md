# Strapi Backend (v5)

**Maintenance**: Update this Spec Kit knowledge doc in the same change set when related code changes. Sync map: `.specify/memory/project-context.md`.


# Strapi backend (v5)

Stack: **Strapi 5.44** (`headless-cms-backend/`). Serves the Next.js app in `next-headless-cms-fe/` via REST.

## Goal

Model **pages** (block composition + SEO + template), **navigation** (header/footer), and **products** (bike catalog) for the Next.js `StrapiAdapter`. **vukans-bike** is the live product on Strapi. **resort-example** is a frontend build-isolation fixture (mock), not a Strapi product tenant. Filter every query by `tenant` + `lang`.

## Project layout (Strapi 5)

| Path | Purpose |
|------|---------|
| `src/api/{name}/content-types/{name}/schema.json` | Collection / single types |
| `src/components/{category}/{name}.json` | Reusable components |
| `src/api/{name}/controllers|services|routes/` | API layer — prefer `factories.createCore*` unless custom transform needed |
| `config/` | `database.ts`, `plugins.ts`, `middlewares.ts`, `api.ts` |
| `types/generated/` | Auto-generated — do not hand-edit |
| `scripts/seed-vukans-bike-cms.js` | Seed vukans-bike pages, navigation, products from frontend mock JSON (`npm run seed:vukans-bike`) |

## Strapi 5 conventions

- Use **documentId** in APIs (Strapi 5); REST returns flat fields on `data[]` items (not v3 `attributes` wrapper) — confirm shape against `StrapiAdapter` before shipping.
- Enable **Draft & Publish** on page content; keep navigation published-only or draft as needed.
- **Do NOT** use `@strapi/plugin-i18n` for locale management on these content types. The i18n plugin reserves `locale` as a query param — our schemas use `lang` instead (plain string field). See `.specify/memory/knowledge/content-model.md`.
- **Do not** use `populate=deep` plugins — use explicit `populate` (see `.specify/memory/knowledge/api-contract.md`).
- Attribute names: **camelCase** in schema JSON (`slug`, `seo`, `blocks`, `lang`) — matches frontend `PageData`.
- After schema changes: run `npm run types:generate` (updates `types/generated/`), then `npm run build`. Update Public role **find** permissions for new types in Strapi admin.
- Publish content by passing `?status=published` to `POST` (create) or `PUT` (update) requests — do **not** call the deprecated `/actions/publish` endpoint.

## Content types in this repo

Only three collection APIs exist under `src/api/`: **`page`**, **`navigation`**, **`product`**. Do not reintroduce Strapi blog starter types (`about`, `home`, `article`, etc.). Schema details: `.specify/memory/knowledge/content-model.md`.

## Coordination

- Frontend contract: `next-headless-cms-fe/src/core/types/page.ts`, `navigation.ts`
- Frontend consumer: `src/core/data/adapters/strapi.adapter.ts`
- When API shape changes: update Spec Kit knowledge (`content-model.md`, `api-contract.md`) + frontend adapter/types in the same change set (`.specify/memory/project-context.md` sync map).

## Frontend local pairing (vukans-bike)

Two terminals: Strapi (`npm run develop` here) + `pnpm dev:bike` in `next-headless-cms-fe/`.

Frontend env: `STRAPI_URL`, `STRAPI_API_TOKEN` (required for `dataAdapter: "strapi"`), optional `REVALIDATE_SECRET` / `PREVIEW_SECRET`.

**API token:** grant find on `page`, `navigation`, `product`. Seed needs create/update/publish. Prefer a token over relying on Public `find` alone (Public find is optional; see `api-contract.md`).

**Seed source:** `next-headless-cms-fe/src/tenants/vukans-bike/mock-data/` — not loaded at FE runtime for Strapi tenants (`@mock-data` → stub).

```bash
STRAPI_API_TOKEN=your-full-access-token npm run seed:vukans-bike
```

Prefer a **local** DB for re-seeds (SQLite default). After schema changes: `npm run types:generate`, restart develop, re-seed if needed.

**Draft preview / revalidation (frontend routes):** `/api/preview?secret=PREVIEW_SECRET&slug=/path`; production edits should `POST /api/webhooks/strapi` with `x-revalidate-secret`. Details: `api-contract.md`. Strapi admin preview button and lifecycle webhooks are not fully wired yet — configure when going live.
