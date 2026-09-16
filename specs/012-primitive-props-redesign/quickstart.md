# Quickstart: Primitive Props Redesign

**Feature**: `012-primitive-props-redesign`
**Date**: 2026-09-15

Manual validation against [spec.md](./spec.md). Details: [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/).

## Prerequisites

- Strapi: `headless-cms-backend/` (`npm run develop`, port **1337**)
- Frontend bike: `next-headless-cms-fe/` (`pnpm dev:bike`, port **3002**)
- Before starting: capture a "before" reference — screenshot or note the visible content of every Vukan's Bike page (all 3 locales), since SC-004's "identical visual output" claim is only checkable against a real before/after comparison
- `npm run types:generate` in the backend after every schema.json edit; restart `develop`
- Run `node scripts/migrate-012-primitive-props.js` against any Strapi DB that already has content from before this feature (idempotent, matches `010`'s `convert-section-children-to-slots.js` pattern)
- Re-seed (`npm run seed:vukans-bike`) to get a clean corpus if preferred over migrating in place

## 1. Sizing convention (SC-001)

1. On any primitive with a sizing field (try Flex's `width`, Image's `height`), enter `320` — confirm it renders as `320px`.
2. On the same field, enter `50%` — confirm it renders as a percentage.
3. Clear the field — confirm no constraint is applied (same as an untouched field today).
4. Enter `2rem` — confirm it's ignored (not applied), not mis-rendered as literal `2rem` unitless breakage.

## 2. Per-primitive field sets (SC-002)

For each of Flex, Section, Text, Link, Image, Iframe, Button, Grid: open its field panel in the composition surface and confirm every field named in `data-model.md`'s table for that primitive is present, labeled in plain language, and grouped Content/Appearance as `011` already established. Confirm no removed field (e.g. Text's old `variant`, Section's old `heroHeight`/`justify`/`align`) is still shown.

## 3. Accordion, Gallery, Link, Button as containers (SC-005)

1. Add an Accordion; nest a Text block and a Button inside it; save; confirm both render inside the expanded panel on the public page.
2. Add a Gallery; nest three Image blocks; confirm they lay out per the chosen `layout`/columns. Attempt to add a Text block to the Gallery — confirm it's not offered.
3. Add a Button; nest an Icon then a Text child (in that order); confirm the public button renders icon-then-text. Reorder to Text-then-Icon; confirm the render order flips.
4. Add a Button with only an Icon child, no `accessibleLabel` set — confirm the composition surface blocks the save (or clearly flags it) per FR-012, rather than silently shipping an unlabeled control.
5. Add a Button with only an Icon child and a valid `accessibleLabel` — confirm it saves and the rendered control has a real accessible name (inspect the DOM `aria-label`).

## 4. Stack retirement (SC-006)

1. Confirm Stack no longer appears in any "add block" picker (root or nested).
2. Open a pre-existing page that used to have a Stack block (or run the migration script against one) — confirm it now shows as a Flex with `direction: column` in the tree, and the public page renders identically to before.
3. Search the Strapi database (or the migrated seed output) for any remaining `blocks.stack` reference — expect zero.

## 5. Icon library (SC-003)

1. Open the Icon field's picker; type a search term (e.g. "arrow"); confirm matching icons from the full library appear, filtered live, without a noticeable lag despite ~1,847 total options.
2. Select an icon; confirm it renders correctly and at the expected size on the public page.
3. Open a page with a pre-existing `map-pin`/`phone`/`mail` icon; confirm it still renders the same icon without any manual re-selection.

## 6. Vukan's Bike full rebuild (SC-004)

1. Compare every live page (`sl`/`en`/`de`) against the "before" reference captured in Prerequisites — visually and structurally identical.
2. Spot-check the two pages that used Gallery (`bike-school`, `guided-tours`) and any page using Accordion, Link, or Button with an icon — these are the highest-risk migrations (fixed-field → nested-children).
3. Confirm `pnpm verify:build` passes for both `bike` and `resort` — `resort-example`'s mechanically-migrated mock content must still compile and render, even though its design isn't a target of this feature.

## Quality gates (after implement)

- Backend: `npm run types:generate` after every schema.json edit; `npx tsc --noEmit -p src/admin/tsconfig.json` and `-p tsconfig.json` (per `011` convention)
- Frontend: `pnpm type-check`, `pnpm check:types-style`, `pnpm lint:bike`, `pnpm lint:resort`, `pnpm verify:build`
- Spec Kit knowledge (`content-model.md`, `block-system.md`, `api-contract.md`) and `specs/_catalogs/vukans-bike.md` updated in the same change set
