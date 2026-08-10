# Strapi backend (`headless-cms-backend`)

Headless CMS content API for the monorepo. Serves the Next.js app in `next-headless-cms-fe/` via REST (Strapi v5).

**AI agents:** use Spec Kit — start at [`.specify/memory/project-context.md`](../.specify/memory/project-context.md) (backend knowledge: `strapi-backend`, `content-model`, `api-contract`).

## Requirements

- Node.js 20+
- **npm** (not pnpm) in this package

## Quick start

```bash
cd headless-cms-backend
npm install
npm run develop
```

- Admin: http://localhost:1337/admin  
- API: http://localhost:1337/api  

## Useful scripts

| Command | Purpose |
|---------|---------|
| `npm run develop` | Strapi with auto-reload |
| `npm run start` | Production-mode Strapi |
| `npm run build` | Build admin panel |
| `npm run types:generate` | Regenerate `types/generated/` after schema changes |
| `npm run seed:vukans-bike` | Seed pages/nav/products from frontend mock JSON |

Seed example:

```bash
STRAPI_API_TOKEN=your-full-access-token npm run seed:vukans-bike
```

## Environment

Configure DB and secrets via `.env` (see Strapi docs). Local default is often SQLite; production typically uses Postgres (`DATABASE_URL`).

Frontend needs:

```env
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-read-token
```

Frontend human guide: [`next-headless-cms-fe/README.md`](../next-headless-cms-fe/README.md).

## Content types

Primary collections: **page**, **navigation**, **product**. Locale field is **`lang`** (not `locale` — reserved by Strapi i18n). Filter by `tenant` + `lang` on every query.

## Monorepo

| Package | Role |
|---------|------|
| `next-headless-cms-fe/` | Next.js multi-tenant frontend (pnpm) |
| `headless-cms-backend/` | This Strapi API (npm) |

Repo overview: [`../README.md`](../README.md).
