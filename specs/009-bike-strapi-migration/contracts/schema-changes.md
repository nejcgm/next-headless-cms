# Contract: Strapi Schema Changes

**Feature**: `009-bike-strapi-migration`

Exact per-file attribute changes. Apply against `headless-cms-backend/src/`. Every enum/boolean here is
justified in `research.md` R7–R13 with an exact usage count from current content — none are speculative.

## `components/blocks/section.json`

- Add `surface`: `{ "type": "enumeration", "enum": ["background", "muted", "accent", "foreground"] }`
- Remove `backgroundColor` (was inherited generically; `section` now uses `surface` only)
- Remove `minHeight`
- Add `heroHeight`: `{ "type": "enumeration", "enum": ["standard", "tall"] }`
- Add shared box-style changes below (`color`, `border`, `dividerTop`, `fullWidth`; `fontSize`/`lineHeight`
  unaffected — `section` never authors font sizing)

## `components/blocks/grid.json`

- Remove `columns` (the broken `json` field)
- Add `columnsMobile`: `{ "type": "enumeration", "enum": ["1", "2", "3", "4"], "default": "1", "required": true }`
- Add `columnsTablet`: `{ "type": "enumeration", "enum": ["1", "2", "3", "4"] }`
- Add `columnsDesktop`: `{ "type": "enumeration", "enum": ["1", "2", "3", "4"] }`
- Apply shared box-style changes below

## `components/blocks/text.json`

- Change `fontSize` from `string` to:
  `{ "type": "enumeration", "enum": ["cardTitle", "sectionTitle", "priceCompact", "pageTitle", "price", "display", "statement", "custom"] }`
- Add `customFontSize`: `{ "type": "string" }`
- Remove `lineHeight`
- Apply shared box-style changes below (`color`, `border`, `dividerTop`, `fullWidth` — `text` never authors
  `width`/`minHeight` today, but the fields are removed from the shared bag regardless per the box-style
  contract)

## `components/blocks/product-list.json`

- Remove `category` (no-op field, R15)

## Shared box-style changes — apply identically to every component below

Components: `blocks.section`, `blocks.stack`, `blocks.flex`, `blocks.grid`, `blocks.text`, `blocks.image`,
`blocks.iframe`, `blocks.icon`, `blocks.button`, `blocks.link`.

- Change `color` from `string` to:
  `{ "type": "enumeration", "enum": ["primary", "secondary", "accent", "background", "foreground", "muted", "border", "text-primary"] }`
- Change `backgroundColor` the same way (all components **except** `section`, which uses `surface` instead —
  see above)
- Change `border` from `string` to:
  `{ "type": "enumeration", "enum": ["none", "hairline", "invertedOutline"] }`
- Remove `borderTop`; add `dividerTop`: `{ "type": "boolean", "default": false }`
- Remove `width`; add `fullWidth`: `{ "type": "boolean", "default": false }`
- Remove `minHeight` (moves to `section.heroHeight` only — no other component used it)
- Remove `lineHeight` (zero real uses; superseded by `text`'s per-step line-height, R8)
- `padding`, `margin`, `maxWidth`, `height`, `fontWeight`, `fontSize` (outside `text`), `borderRadius`,
  `overflow`, `textAlign` — **unchanged**

**Note**: `blocks.accordion` is not a full box-style consumer (it only ever exposed `padding`, `margin`,
`backgroundColor`, `border`, `borderRadius`) — apply only the `backgroundColor`→enum and `border`→enum changes
there; it has no `borderTop`/`width`/`minHeight`/`lineHeight` fields to remove.

## `components/shared/*.json`

- Delete `cta-link.json`
- Delete `stat-item.json`
- No other shared component changes

## `api/page/content-types/page/schema.json`

- `options.draftAndPublish`: **already `true`** — verified directly, no change needed (research R17, corrected from an earlier "unconfirmed" note)
- `blocks` dynamic-zone component list: **unchanged** (already correct — R2)

## `api/product/content-types/product/schema.json`

- `options.draftAndPublish`: **already `true`** — verified directly, no change needed (research R17)
- No field changes

## `api/navigation/content-types/navigation/schema.json`

- No changes (stays publish-only, per existing guidance)

## After schema changes (standard Strapi workflow, per `strapi-backend.md`)

Run `npm run types:generate` once the backend boots successfully post-reset, to regenerate
`types/generated/**` from these definitions — do not hand-edit the generated file for this feature (unlike
the smaller `008-bike-site-redesign` variant renames, this is a full schema pass; let the generator produce
the authoritative types).
