# Contract: Live preview

**Feature**: `011-page-builder-polish`
**Date**: 2026-09-14

## Scope

`api::page.page` documents only, in the Strapi admin's native Content Manager preview feature.

## Server: `admin.preview` config (`headless-cms-backend/config/admin.ts`)

```text
preview.enabled: true
preview.config.allowedOrigins: [ PREVIEW_BASE_URL ]   // the bike frontend origin, not a wildcard
preview.config.handler(uid, { documentId, locale, status }):
  if uid !== "api::page.page": return undefined
  page = strapi.documents("api::page.page").findOne({ documentId, locale })
  if !page: return undefined
  return `${PREVIEW_BASE_URL}/api/preview?secret=${PREVIEW_SECRET}&slug=${encodeURIComponent(page.slug)}`
```

New env vars (backend): `PREVIEW_BASE_URL` (frontend origin, e.g. `http://localhost:3002` in dev), `PREVIEW_SECRET` (already exists on the frontend — same value must be available to the backend process).

## Client: reused, unchanged

`next-headless-cms-fe/src/app/api/preview/route.ts` — no change. Accepts `secret` + `slug`, enables Next.js Draft Mode, redirects to the page. Strapi's own `PreviewSidePanel`/`Preview` page (already shipped in `@strapi/content-manager`) render the iframe, refresh button, and panel chrome — no new frontend or admin React component required for the baseline preview view.

## Freshness

Preview reflects the **persisted draft**, not in-memory form state. There is no autosave — the composition surface only updates the in-memory form field; the draft is written by the editor's own explicit Save, same as any other field on the Page form (research R3 — an earlier debounced-autosave approach was reverted after it was found to silently drop edits made while a background write was in flight). A manual refresh in Strapi's own preview panel is always available.

## Out of this contract

- Field-focus click-to-jump highlighting (`previewScript`'s optional enhancement — R5, not required).
- A public/unauthenticated preview link.
- Preview for `resort-example` (no Strapi content type to key off; handler returns `undefined` for any `uid` other than `api::page.page`).

## Failure modes

| Condition | Behavior |
|-----------|----------|
| `documentId` has no matching Page row (new, unsaved document) | Handler returns `undefined`; Strapi's panel does not render a preview until the document is first saved |
| Frontend origin blocked by CSP/X-Frame-Options (either side) | Iframe fails to load; verify per `research.md` R4 during implementation — not silently acceptable, must be caught in quickstart |
| `PREVIEW_SECRET` mismatch | `/api/preview` returns 401 — same behavior as today's manual preview link |
