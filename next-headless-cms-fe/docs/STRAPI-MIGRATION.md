# Strapi migration (vukans-bike)

## 1. Backend schema

Restart Strapi after pulling schema changes:

```bash
cd headless-cms-backend
npm run develop
```

Content types: **`page`**, **`navigation`**. See `headless-cms-backend/.cursor/rules/content-model.mdc`.

## 2. Permissions

In **Settings → Users & Permissions → Roles → Public** (or use API token only):

- `page`: find
- `navigation`: find

For seeding, use an **API token** with create/update/publish on both types.

## 3. Seed from mock JSON

```bash
cd headless-cms-backend
STRAPI_API_TOKEN=your-token npm run seed:vukans-bike
```

Imports `next-headless-cms-fe/src/core/mock-data.ts/vukans-bike/pages/*.json` and navigation files.

## 4. Frontend env

In `next-headless-cms-fe/.env.local`:

```env
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-read-token
```

## 5. Switch adapter

In `src/tenants/vukans-bike/config.ts`:

```ts
dataAdapter: "strapi",
```

Restart `pnpm dev:bike` and verify pages + nav load.

## Schema ↔ frontend (minimal adapter)

Strapi stores the **same field names** as mock JSON (`title` not `metaTitle`, `blocks` as JSON, nav as JSON).

The adapter (`src/core/data/strapi/`) only:

- Unwraps Strapi’s document envelope (v4 `attributes` compat)
- Filters by `tenant` + `locale` + `published`
- Passes `blocks`, `header`, `footer` through unchanged

After changing `shared.seo` or content types, run in backend: `npm run types:generate` and re-seed if needed.
