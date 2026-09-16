# Quickstart: Admin Page Builder

**Feature**: `010-admin-page-builder`  
**Date**: 2026-09-14

Manual validation against [spec.md](./spec.md). Details: [data-model.md](./data-model.md), [contracts/](./contracts/).

## Prerequisites

- Strapi: `headless-cms-backend/` (`npm run develop`, port **1337**)
- Frontend bike: `next-headless-cms-fe/` (`pnpm dev:bike`, port **3002**)
- Admin user who can edit Pages
- For existing DBs that used the Section `children` experiment: run  
  `node scripts/convert-section-children-to-slots.js`  
  from the backend **before** relying on the new `section.slots` schema (idempotent)

After schema change: `npm run types:generate` in the backend; restart `develop`. Re-seed only if you need a clean corpus (`npm run seed:vukans-bike`).

## 1. Identity vs body

1. Open Content Manager → Page → any draft (or create one).
2. Confirm **tenant / lang / slug / template / SEO** are still the native fields.
3. Confirm the **default** nested control is the composition tree, not a JSON blob and not a Section-only component picker.
4. Confirm there is **no** second native list for adding root bands.

Expected: one tree for the whole page body.

## 2. Nested authoring without JSON (SC-001, SC-002, SC-007)

1. Add a root **Section**.
2. Inside it, add **Flex**, then inside that Flex add another **Flex**, then **Text**.
3. Fill ordinary fields (padding, direction, content). Reorder two siblings.
4. Save as **draft** (must not publish).
5. Open the public bike site for that slug (draft preview if unpublished; published path if you publish).

Expected: public page shows Section → Flex → Flex → Text. You did not type nested JSON for this path.

## 3. Nest rules in the editor (SC-003)

Attempt each; all must fail **before** a successful valid save:

| Attempt | Expected |
|---------|----------|
| Stack → add Grid | Grid not offered or rejected |
| Section → add Section | Not allowed |
| Gallery / product-list / bike-detail → add child | Nesting not available |
| Nest one level past that layout’s maxDepth | Blocked in the editor |

Positive: Flex → Flex (within cap) still works.

## 4. JSON fallback (SC-005, SC-008)

1. Open the collapsed **technical JSON** control (not the first nested UI).
2. Change a text `content` value; save once; reopen: tree matches.
3. Paste invalid JSON; save: error; previous tree still there.
4. Paste a Stack with a nested Grid; save: rejected.

## 5. Existing pages (SC-004, SC-006)

1. Open a previously published Vukan’s Bike page that had nested Section content.
2. Tree shows children; no Section-only picker.
3. Public URL still matches prior layout (spot-check home + one inner page, `sl` at minimum).

## 6. Frontend safety net

With Strapi up, load `/` on the bike app. No new renderer. Illegal nodes would still be omitted by `compose-validate` if they existed; they should not exist after a valid admin save.

## Quality gates (after implement)

From repo conventions:

- Backend: `npm run types:generate` after component schema edits
- Frontend (if `compose-validate.ts` changed): `pnpm type-check` and `pnpm check:types-style` in `next-headless-cms-fe/`
- Spec Kit knowledge + `specs/_catalogs/vukans-bike.md` updated in the same change set
