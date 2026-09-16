# Contract: Unified composition storage

**Feature**: `010-admin-page-builder`  
**Date**: 2026-09-14  
**Supersedes (for Section nest storage)**: mixed `children` DZ vs `slots` JSON described in `006` / current knowledge docs. Root DZ + nested `slots` JSON from [006 composition-tree](../../006-bike-home-shared-compose/contracts/composition-tree.md) remains the wire.

## Wire (Strapi REST / seed / mock)

- **Root**: `page.blocks[]` dynamic zone (unchanged field).
- **Nest**: layout components `section` \| `stack` \| `flex` \| `grid` use:

```json
"slots": { "default": [ /* same node shape as a DZ item, recursively */ ] }
```

- **Forbidden after this feature**: `section.children` as a dynamic zone (or any layout `children` array as storage).

Example (Section → Flex → Flex → Text):

```json
{
  "__component": "blocks.section",
  "id": 1,
  "padding": "lg",
  "slots": {
    "default": [
      {
        "__component": "blocks.flex",
        "id": 2,
        "direction": "row",
        "slots": {
          "default": [
            {
              "__component": "blocks.flex",
              "id": 3,
              "direction": "column",
              "slots": {
                "default": [
                  {
                    "__component": "blocks.text",
                    "id": 4,
                    "content": "Hello",
                    "variant": "body"
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  }
}
```

## Frontend mapping

Unchanged target: `toValidatedBlockInstance` → `BlockInstance` with `slots.default`. **Remove** the branch that treats `children` as a DZ. Public pipeline otherwise unchanged (`StrapiAdapter` → `toPageData` → renderer).

## Populate

`GET /api/pages?...&populate[blocks][populate]=*` remains required for **root** embedded components (`shared.image-item` on gallery, `blocks.bike-detail-labels`, etc.). Nested `slots` JSON is opaque and does not use populate.

## Seed

`scripts/seed-vukans-bike-cms.js` must persist section **`slots`**, not copy them into `children`.
