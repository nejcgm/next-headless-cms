# Strapi setup (vukans-bike)

**Status:** vukans-bike runs on Strapi in production and local dev (`dataAdapter: "strapi"` in `src/tenants/vukans-bike/config.ts`). Mock JSON under `src/core/mock-data.ts/vukans-bike/` is kept as the **seed source** and shape reference — it is not loaded at runtime for this tenant.

**resort-example** is a build-isolation fixture on `dataAdapter: "mock"` — not a Strapi product tenant. New product tenants should follow bike + Spec Kit `new-tenant` knowledge.

## Local dev (two terminals)

**Terminal 1 — Strapi**

```bash
cd headless-cms-backend
npm install   # first time
npm run develop
```

Strapi admin: http://localhost:1337/admin

**Terminal 2 — frontend**

```bash
cd next-headless-cms-fe
pnpm install   # first time
pnpm dev:bike
```

Site: http://localhost:3002/

## Frontend env

In `next-headless-cms-fe/.env` or `.env.local`:

```env
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-read-token
REVALIDATE_SECRET=your-local-secret-min-16-chars
# PREVIEW_SECRET=optional-for-draft-preview
```

`STRAPI_URL` and `STRAPI_API_TOKEN` are required when `dataAdapter` is `"strapi"` (enforced in `src/core/data/fetcher.ts`).

## Backend content types

Restart Strapi after pulling schema changes:

```bash
cd headless-cms-backend
npm run develop
```

Types: **`page`**, **`navigation`**, **`product`**. See [`.specify/memory/knowledge/content-model.md`](../../.specify/memory/knowledge/content-model.md).

## Permissions

Use an **API token** (recommended) with find access on `page`, `navigation`, and `product`. For seeding, the token needs create/update/publish on those types.

Optional: enable Public role `find` on the same types if you rely on unauthenticated reads (the frontend uses a token by default).

## Seed from mock JSON

Imports pages, navigation, and products from `next-headless-cms-fe/src/core/mock-data.ts/vukans-bike/`:

```bash
cd headless-cms-backend
STRAPI_API_TOKEN=your-full-access-token npm run seed:vukans-bike
```

Use a **local** database for seeding during development (SQLite is the backend default). Remote Postgres works but is slow for full re-seeds.

## Schema ↔ frontend

Strapi stores the **same field names** as mock JSON (`title` in SEO, `blocks` as a dynamic zone, nav as components).

The adapter (`src/core/data/strapi/`) only:

- Unwraps Strapi’s document envelope (v4 `attributes` compat)
- Filters by `tenant` + `lang` + publication status (`published`, or `draft` when Next.js draft mode is on)
- Passes `blocks`, `header`, `footer` through unchanged

After changing `shared.seo` or content types, run in backend: `npm run types:generate` and re-seed if needed.

## Draft preview

Enable draft reads via `/api/preview?secret=PREVIEW_SECRET&slug=/path`. Requires `PREVIEW_SECRET` in frontend env. Strapi admin preview button is not configured yet — see `src/app/api/preview/route.ts`.

## Cache revalidation

Production edits should trigger `POST /api/webhooks/strapi` with header `x-revalidate-secret: REVALIDATE_SECRET`. Strapi lifecycle webhooks are not wired in the backend yet — configure them when going live.
