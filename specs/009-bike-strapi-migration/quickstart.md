# Quickstart: Vukan's Bike Mock-to-Strapi Migration & Editor-Friendly Schema

**Feature**: `009-bike-strapi-migration`

This feature has two acceptance bars that matter equally: **nothing visibly changed** for a site visitor
(SC-002), and **an editor with no coding background can do real work** in the admin panel (SC-003/SC-004).
Both need a hands-on pass — neither is fully provable by an automated gate alone.

## Prerequisites

Follow `contracts/admin-setup.md` in full and in order first (database reset → admin account → permissions →
API token → webhook → seed → cut the frontend over). Everything below assumes that's done.

## Run

```bash
cd headless-cms-backend && npm run develop     # admin at :1337/admin
cd next-headless-cms-fe && pnpm dev:bike       # site at :3002, now reading from Strapi
```

## Gates

```bash
cd next-headless-cms-fe
pnpm type-check
pnpm lint:bike
pnpm lint:resort      # must stay green — R16 confirmed zero cross-tenant footprint except the one grid case
pnpm build:bike && pnpm verify:build
pnpm build:resort && TENANT_ID=resort-example pnpm verify:build   # M14 — resort must be completely unaffected

cd ../headless-cms-backend
npm run develop        # confirm clean boot, no schema-sync errors (M2)
npm run types:generate  # after schema.json changes are applied and Strapi has booted once successfully
```

## Backend validation sweep (M1–M12, from `data-model.md`)

- **M1–M2**: reset ran, Strapi boots with zero errors.
- **M3**: `find headless-cms-backend/src/components -iname "cta-link.json" -o -iname "stat-item.json"` returns nothing.
- **M4–M8**: spot-check a handful of seeded entries in the Strapi admin — a `text` node shows its `fontSize`
  as a dropdown already set to one of the 7 named steps (never blank/custom unless intentionally so), a
  `grid` node shows three separate column dropdowns (no leftover `columns` field visible anywhere), a
  `section` node shows `surface` as a dropdown (no separate `backgroundColor` field on `section` specifically).
- **M9**: covered by the visual walkthrough below.
- **M10–M11**: try an unauthenticated `GET` to `/api/pages`, `/api/navigations`, `/api/products` — all
  succeed; a page saved as draft-only does not appear in that same unauthenticated response.
- **M12**: publish a small text change to a page in the Strapi admin, confirm it appears on the live site
  without redeploying, within the documented window (`api-contract.md`'s revalidate table).
- **M13–M14**: `resort-example` gates above are green, and its one grid (home page) still renders 3 columns.
- **M15**: `grep -i "warn\|fail" /tmp/<dev-server-log>` after loading every page/locale returns nothing —
  zero `compose-validate` warnings anywhere. (This is the gate that actually caught R18/R19 — Strapi returns
  `null` for every unset attribute on a root-level block, which `.optional()` rejects; `.nullish()` fixes it.)
- **M16**: `resort-example`'s legacy `columns: 3` grid still resolves to `grid-cols-1 md:grid-cols-3` — same
  classes as before this feature, confirming the string/number split between the new Strapi-sourced
  `columnsMobile` and the legacy numeric `columns` prop didn't cross-contaminate.

## Visual parity walkthrough (SC-002) — the part that can't be automated

Load every page, in every locale, on the now-Strapi-backed site, side by side with what you remember (or a
screenshot) of the pre-migration mock-data site:

```text
/            /shop          /service        /about       /contact
/brands      /bike-school   /guided-tours   /bikes/merida
```
— then `/en/...` and `/de/...` for all eight. Confirm: same copy, same images, same band order and surfaces,
same navigation (7 header items, 8 footer items, same order), same flagship-bike content on Home/Shop, same
price list on Service, same partner grid on Brands. Nothing here should look different from before this
feature — if it does, that's this feature's own regression, not a content decision to revisit.

## Editor-experience walkthrough (SC-003/SC-004) — give this to someone who didn't build it

Hand the Strapi admin URL to someone with no coding background (or role-play it yourself as literally as
possible) and ask them to, using only the admin UI:

1. Change the homepage hero's headline text.
2. Change one section's `surface` to a different value from the dropdown.
3. Change a `grid` block's desktop column count using its dropdown.
4. Reorder two items in the navigation's header list.
5. Publish the page and confirm the change appears on the live site (pairs with M12).

If completing any of these required typing a color name, a CSS keyword, or a raw number-with-unit into a
plain text box where a dropdown or number field could have existed instead, that's a gap this feature was
supposed to close (SC-003) — note exactly which field, and whether it's covered by `research.md`'s R7–R13 or
is a new gap this pass missed.

## Reverting

If the Strapi cutover needs to be rolled back after cutting over, `src/tenants/vukans-bike/config.ts`'s
`dataAdapter` is the single switch — flipping it back to `"mock"` returns the site to the pre-migration mock
JSON immediately (still present on disk, untouched — R4/`contracts/frontend-changes.md`). The schema
redesign and database reset are not reversible in the same one-line way; that's why the reset in
`contracts/admin-setup.md` is called out as needing explicit re-confirmation at execution time.
