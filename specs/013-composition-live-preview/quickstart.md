# Quickstart: Composition Live Preview

**Feature**: `013-composition-live-preview`  
**Date**: 2026-09-21

## Prerequisites

- Strapi on port 1337 (`npm run develop` in `headless-cms-backend`)
- Bike frontend on port 3002 (`pnpm dev:bike` in `next-headless-cms-fe`)
- Backend `PREVIEW_BASE_URL` and `PREVIEW_SECRET` match the frontend preview secret
- Frontend `STRAPI_URL` is the Strapi origin (`http://localhost:1337`)

## Check

1. Open a saved Page on a wide window. Confirm tree, preview, fields from left to right.
2. Change a heading. Within about a second the center page shows it. Do not save. Reload the published site: the heading is unchanged.
3. Click Save in the preview column. Reopen the page: the heading remains.
4. Open a brand-new unsaved Page: the center explains that the preview needs a save, and the tree still works.
5. Narrow the window: tree, then preview, then fields, still stacked in that order.
