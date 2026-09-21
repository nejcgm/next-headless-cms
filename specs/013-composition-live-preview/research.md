# Research: Composition Live Preview

**Feature**: `013-composition-live-preview`  
**Date**: 2026-09-21

## R1 — Three columns inside the existing composition surface

**Decision**: Rearrange `PageCompositionHost` into tree (left), preview (center), fields (right). Below about 900px of content width, stack in that same order.

**Rationale**: The editor already mounts this surface for `page.blocks`. The wide layout in the request is empty space beside the fields, not a second admin screen. Strapi's native preview page stays available and is not the layout this feature changes.

## R2 — Unsaved preview does not write the page

**Decision**: The admin posts the current `blocks` value into the preview frame. The frame stores that payload in the frontend server process and re-renders the draft page with it. Strapi is not updated until the editor saves.

**Rationale**: A previous debounced write of the page document dropped edits that were still being typed. A side copy of the tree, used only by the draft render, cannot race the form.

**Alternatives considered**: Autosave into Strapi (rejected, data loss). A second renderer inside the admin bundle (rejected, would not match theme, header, footer, or catalog loading).

## R3 — The frame is the existing draft page

**Decision**: The center frame loads the URL already returned by `GET /content-manager/preview/url/api::page.page` (`/api/preview?secret&slug`, draft mode, redirect to the page). The page listens for composition messages only while draft mode is on.

**Rationale**: Reuses draft publication, navigation, and `BlockRenderer`, including catalog data for bike detail and product list.

## R4 — Save in the preview column

**Decision**: The preview column's save control clicks the content admin's existing Save control. It does not call a second document update and it does not publish.

**Rationale**: One save path. The header Save already persists the form, including `blocks`.

## R5 — Framing

**Decision**: The frontend sends `Content-Security-Policy: frame-ancestors` that includes the Strapi origin (`STRAPI_URL`). The listener accepts messages only from that origin.

## R6 — Out of scope

Click-to-select from the preview, navigation editing, product editing, and a pixel canvas stay out. A page with no document id yet shows an empty state instead of a frame.
