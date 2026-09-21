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
- **Draft & Publish** is enabled (`draftAndPublish: true`) on `page` and `product`; `navigation` stays publish-only (no draft state).
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

**Page composition (admin):** Page body is edited with the composition surface in `src/admin/`. On a wide screen that surface is three columns: block tree, a draft preview of the public page, and the field inspector (`PageCompositionHost.tsx`). An expand control in the top-right of that surface opens it full-viewport over the Content Manager (Escape or the collapse control exits). The Page edit view's right-hand Entry column is hidden while this surface is mounted so the editor uses the full content width; Save and Publish in the preview header trigger the same admin actions. Unsaved `blocks` are posted into that preview and applied only for that draft view (`POST /api/compose-preview`); they are not written to Strapi until the editor uses Save. The preview column's Save control clicks the content admin's own Save button. Below 900px the three regions stack in the same order. Shared nest rules, Section `children` → `slots` convert, and hard-fail validation live in `src/page-composition/` and run on Page document write (`src/index.ts`). New root bands are persisted without a composition `id` (`__temp_key__` only); nested `slots` nodes keep numeric composition ids. The tree supports drag-and-drop reorder, collapsible branches, and content-derived row labels (`block-summary.ts`). **Layout and stickiness** (`PageCompositionHost.tsx`): the tree column itself renders at its natural full height (a page-height-capped, independently-scrolling, drag-resizable tree box was tried and reverted — the tree just grows with its content, same as a normal page). Two things stay pinned in view as the page scrolls: (1) the widget's own header — "Page composition" title, the error message, and the "Page body" / "Add block" row — all live in one shared `position: sticky, top: 0` `Box` at the top of `PageCompositionHost` (this is why the "Add block" button and its target-resolution logic (`AddBlockMenu`, `resolveAddTarget`) live in the *host*, not in `CompositionTree.tsx` — they needed to sit in the same sticky wrapper as the outer title, and stacking two independently-sticky elements with hand-guessed pixel offsets would have been fragile); (2) the field-inspector column, which is height-capped (`maxHeight: 700`, `overflowY: auto`, `overscrollBehavior: 'contain'`) and separately `position: sticky` (`top: 16`) so it stays beside the tree regardless of the tree's own height, and its own "Fields" title is *also* sticky (`top: 0`) relative to that column's internal scroll — but the `FieldGroup` titles underneath it (Content/Appearance/etc.) are deliberately **not** sticky, scrolling normally with their fields. Row/field density: tree rows use `padding={1}` (was `2`) with a `26px` icon gutter (was `32px`) and `variant="pi"` row text (was `omega`/`pi`); every Design System input in `FieldInspector.tsx` that supports it (`SingleSelect`, `Combobox`, `TextInput`, `NumberInput`) is rendered `size="S"`; `FieldGroup` spacing was tightened to match (`gap={2}`/`paddingBottom={2}`, was `3`/`4`).

**Add block button**: a **single** button (in the sticky `Page body` header, not one per row) whose target is the current tree selection: `tree-ops.ts`'s `resolveAddTarget` returns the page root when nothing is selected, or the selected node itself when something is — it does **not** walk up to a nestable ancestor. If the selected node can't accept any children (a leaf, or already at its type's max nesting depth), the button disables itself (label: `"{Type} can't nest"`) rather than silently retargeting elsewhere. Otherwise the label reads `"Add to {Type}"` (or plain `"Add block"` for the root case). The field panel groups fields into Content/Behavior/Layout/Typography/Spacing/Appearance (in that order, empty groups hidden) with plain-language labels, assigned by field **name** via fixed sets in `field-catalog.ts`'s `groupFor()` — not by Strapi field type, since e.g. `color`/`backgroundColor`/`borderColor` are plain `string` attributes (to allow custom hex) that still need a dedicated, non-generic control (`ColorFieldControl` in `FieldInspector.tsx`: a single `Combobox` listing the theme tokens with `allowCustomValue` for typed hex codes, forcing the popover closed via a controlled `open` prop whenever the typed text starts with `#` so token-search UI doesn't show while entering a hex — typed values commit on blur). After pulling the schema change, convert existing DBs:

```bash
STRAPI_API_TOKEN=your-full-access-token npm run convert:section-children
```

Then `npm run types:generate` and restart `develop` so the admin panel rebuilds.

**Draft preview / revalidation (frontend routes):** `/api/preview?secret=PREVIEW_SECRET&slug=/path`; production edits should `POST /api/webhooks/strapi` with `x-revalidate-secret`. Details: `api-contract.md`. A Strapi webhook (Settings → Webhooks → "Frontend revalidate (vukans-bike)") is registered against `entry.publish` / `entry.unpublish` / `entry.update`, pointed at the frontend's `/api/webhooks/strapi` — publishing in the admin reaches the live site without a redeploy.

**Admin live preview:** The composition surface embeds the draft page (tree on the left, preview in the center, fields on the right). The preview frame fills its column until the right edge is dragged; a label on the frame shows the live width in pixels, and double-clicking the edge restores full width (minimum 320px). Unsaved composition edits are stored only in the frontend process (`POST /api/compose-preview`) and shown when the draft page is opened with `compose=1`. That does not update Strapi. Strapi's separate Content Manager preview remains enabled for `page` (`config/admin.ts` → `admin.preview`) and still opens the saved draft through `/api/preview`. Requires backend env `PREVIEW_BASE_URL` and `PREVIEW_SECRET`. The frontend must allow the Strapi origin to frame pages (`STRAPI_URL`). See `specs/013-composition-live-preview/contracts/compose-preview.md`.
