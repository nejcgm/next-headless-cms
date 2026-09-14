# Contract: Database Reset & Manual Admin Setup

**Feature**: `009-bike-strapi-migration`

Everything in this document is either irreversible (the reset) or has no schema/code representation at all
(admin-UI steps) — it cannot be captured as a normal code change, so it's captured here instead, to be
followed exactly and in order.

## 1. Database reset (irreversible — confirm before running)

Target: the database already configured in `headless-cms-backend/.env` (`DATABASE_CLIENT=postgres`,
`DATABASE_HOST`/`PORT`/`NAME` — the shared Railway Postgres instance; not a new database).

1. **Stop** any running Strapi process against this database.
2. **Optional, cheap safety net**: `pg_dump` the database to a local file before touching anything (per the
   clarified decision, this is not required — prior content is superseded regardless — but it costs little
   and is the only way back if that assumption turns out to be wrong).
3. **The reset itself** — connect with `psql` (or an equivalent client) using the credentials already in
   `.env`, and run:
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   ```
   This is a full, unscoped wipe of every table in that database, not just the ones this feature touches.
   **Re-confirm with the operator immediately before running this specific command, every time** — spec-level
   authorization (this feature's clarify session) does not substitute for that.
4. Start Strapi (`npm run develop`). On first boot against the now-empty schema, it creates every table fresh
   from the current (post-redesign) component/content-type definitions — a plain `CREATE`, not the `ALTER ...
   USING` that was crashing it before (R1). Confirm it reaches a ready state with no errors (validation M2).

## 2. First-run admin setup (manual, one-time, in the Strapi admin UI)

Do these in order, after the reset boot succeeds:

1. **Create the first admin account** — Strapi's standard first-browser-visit flow at `/admin`. No seed
   script or API call does this; it must be a real login.
2. **Grant Public role `find` permission** — Settings → Users & Permissions → Roles → Public → enable `find`
   for `Page`, `Navigation`, `Product`. Required for the frontend's unauthenticated reads to succeed
   (validation M11).
3. **Generate an API token** — Settings → API Tokens → create a full-access (or scoped read/write) token.
   Used by (a) the seed script (needs create/update/publish) and (b) the frontend's `STRAPI_API_TOKEN` env var
   for authenticated/draft reads. `next-headless-cms-fe/.env` already has the right key present — just needs
   this token's actual value once generated.
4. **Register the revalidation webhook** — Settings → Webhooks → add one pointed at the frontend's
   `/api/webhooks/strapi` route, with header `x-revalidate-secret` set to the value already in
   `REVALIDATE_SECRET`. Without this, publish-driven revalidation (FR-014) doesn't fire — the site would only
   catch up via its normal timed ISR window, not immediately (see `api-contract.md`'s revalidate table for
   those windows).
5. **Confirm Draft & Publish is active** on `Page` and `Product` (should already show as enabled once the
   schema change in `contracts/schema-changes.md` is applied and the reset boot completes) — spot-check by
   saving a page as a draft and confirming it does not appear in an unauthenticated `find` request.

## 3. Seed

With steps 1–3 above complete (admin account + Public find + API token):

```bash
cd headless-cms-backend
STRAPI_API_TOKEN=<the token from step 2.3> npm run seed:vukans-bike
```

Confirm it completes without error and reports the expected counts (9 slugs × 3 locales = 27 pages, 3
navigation entries, 1 product × 3 locales).

## 4. Cut the frontend over

1. Set `next-headless-cms-fe/.env`'s `STRAPI_API_TOKEN` to the real token from step 2.3 (if not already the
   same one used for seeding).
2. Flip `src/tenants/vukans-bike/config.ts`'s `dataAdapter` to `"strapi"` (per
   `contracts/frontend-changes.md`).
3. Run `pnpm dev:bike` and walk every page/locale against `quickstart.md`'s validation sweep.

## Who does this

These steps assume whoever operates the Strapi instance (today: the tenant owner or a developer with
database credentials) performs them once. This document is what FR-016 asks to exist — the steps themselves
stay manual; only their existence and order needed to be captured.
