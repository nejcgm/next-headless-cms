# Quickstart: Page Builder Editor Experience Upgrade

**Feature**: `011-page-builder-polish`
**Date**: 2026-09-14

Manual validation against [spec.md](./spec.md). Details: [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/).

## Prerequisites

- Strapi: `headless-cms-backend/` (`npm run develop`, port **1337**)
- Frontend bike: `next-headless-cms-fe/` (`pnpm dev:bike`, port **3002**)
- Admin user who can edit Pages
- Backend env: `PREVIEW_BASE_URL` (`http://localhost:3002` in dev) and `PREVIEW_SECRET` (same value the frontend already uses) set before `npm run develop`
- A page with 15+ blocks including several of the same type (e.g. multiple `Text` blocks) — seed data or build one via the composition surface

## 1. Tree usability (SC-001, SC-002)

1. Open a page with several same-type blocks (e.g. three or more `Text` blocks in different branches).
2. Confirm each tree row shows a content-derived summary (its own text/label/heading), not just "Text" repeated.
3. Drag a block to a new position among its siblings in one motion; confirm the order is reflected immediately and persists after save.
4. Collapse a branch with children, confirm they hide; re-expand, confirm the previously selected node (if still visible) is still selected.

Expected: an editor can find and reorder a specific block without opening each same-labeled row to check which is which.

## 2. Visual and interaction consistency (SC-003)

1. Open the field panel for a block with both content and appearance fields (e.g. `text`).
2. Confirm fields are grouped (Content, then Appearance) with plain-language labels, not raw attribute names like `backgroundColor`.
3. Delete a block; confirm the confirmation dialog matches the CMS admin's own dialog style, not a browser popup.
4. Scan the whole surface (tree, panel, JSON fallback): confirm no bare unstyled `<select>`/`<input>` remain.

## 3. Live preview (SC-004)

1. Open a draft (or create one) and open Strapi's native **Preview** panel/tab for that Page.
2. Confirm the preview renders the current draft content.
3. Change a block's field (e.g. text content or a color) in the composition surface and click **Save** (draft, not publish).
4. Confirm the preview reflects that change without a manual publish and without leaving the page editor (refresh the preview panel if it doesn't update automatically).

Expected: no separate tab and no publish was needed to validate a visual change — just the normal Save.

## 4. Robustness (SC-005, SC-006)

1. Navigate between at least three different pages in the admin, back and forth.
2. Confirm the composition surface is present every time — never a flash of the raw technical dynamic-zone view as the resting state.
3. Open the technical JSON fallback; paste invalid JSON; confirm a clear, specific error and that the editor stays usable.
4. Paste a JSON tree with a disallowed nest (e.g. Stack containing Grid); confirm it is rejected the same way `010`'s contract already specifies.

## 5. No regression (SC-005 continued)

1. Open a page that worked correctly before this feature (e.g. `/service`, `sl`).
2. Confirm the tree, fields, and public rendering are unchanged in substance — only presentation/interaction and the addition of preview should differ.

## 6. CSP / embedding check (research R4)

1. With the preview panel open, check the browser console for any blocked-frame or CSP errors.
2. If present, scope `strapi::security`'s CSP directives and/or `admin.preview.config.allowedOrigins` narrowly to resolve — do not disable CSP wholesale.

## Quality gates (after implement)

- Backend: `npm run types:generate` only if `config/admin.ts` type changes require it (schema itself is unchanged)
- Frontend: `pnpm type-check` / `pnpm check:types-style` only if a frontend file changed (expected: none required for the baseline preview)
- `.specify/memory/knowledge/strapi-backend.md` updated with the `admin.preview` config note in the same change set (per `research.md` R11) — no other knowledge doc should need edits unless implementation finds otherwise
