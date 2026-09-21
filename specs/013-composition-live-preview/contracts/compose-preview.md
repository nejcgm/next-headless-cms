# Contract: Composition preview

**Feature**: `013-composition-live-preview`  
**Date**: 2026-09-21

## Layout

Wide composition surface, left to right: block tree, preview, property fields. Narrow: the same three, stacked. Identity and SEO stay on the native page form.

## Frame address

The center frame uses the existing content-manager preview URL for `api::page.page` with `status=draft`, plus `compose=1`. The preview route keeps `compose=1` on the page address after enabling draft mode. No second page route.

## Editor → frame

`postMessage` to the frame:

```json
{ "type": "cms-compose-preview", "blocks": [], "secret": "<preview secret>" }
```

The secret is the one already present on the preview URL. The frame ignores messages whose origin is not the Strapi origin, then forwards the payload to `POST /api/compose-preview`. The handler rejects a wrong secret and does not call Strapi.

## Frame → draft render

`POST /api/compose-preview` from the framed draft page. Body:

```json
{ "slug": "/service", "locale": "sl", "blocks": [], "secret": "<preview secret>" }
```

`blocks` is the composition array. The handler stores it for that slug and locale only when `secret` matches `PREVIEW_SECRET`. The page applies it when its address has `compose=1`. Visitors without that flag are unchanged.

## Save

The preview column save control activates the content admin Save control. It does not publish.

## Failure

No document yet: empty state, no frame. Preview URL missing or the site refuses to be framed: tree and fields stay usable, the center says the preview is unavailable.
