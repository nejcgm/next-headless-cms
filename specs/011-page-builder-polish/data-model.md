# Data Model: Page Builder Editor Experience Upgrade

**Feature**: `011-page-builder-polish`

Per FR-012, this feature introduces **no new persisted entity and no change to any existing one**. `Page`, `Composition block`, and `Nesting rule` are exactly as defined in `specs/010-admin-page-builder/data-model.md` and unchanged here. What follows are the new **config-only / ephemeral** concepts this feature adds — none of them are stored in Strapi's database.

## Block summary rule

**What it represents**: Per component type, which of that type's own fields (if any) supplies the human-meaningful label shown for its tree row (R7), and the fallback chain when that field is empty.

**Shape** (static config, `src/admin/page-composition/block-summary.ts`):

| Field | Type | Notes |
|-------|------|-------|
| `type` | component type string (e.g. `"text"`) | Matches `field-catalog.ts`'s `SCHEMAS` keys |
| `sourceField` | field name or `null` | The attribute to read for the summary; `null` for types with no identifying field (`bike-detail`) |
| `maxLength` | number | Truncation length for long text fields (`text.content`) |
| `recurseIntoChildren` | boolean | `true` for `section`/`stack`/`flex`/`grid` — summary falls through to the first non-empty child summary |

**Validation rules**: Every registered component type in `field-catalog.ts`'s `SCHEMAS` map MUST have an entry here (even if `sourceField: null`) so no type silently falls through to an unlabeled row.

**Relationships**: Reads `CompositionNode` (from `010`'s `types.ts`) — a pure function of a node (and, for layout types, its own `slots.default` children), not a new stored field on it.

## Field group

**What it represents**: Whether a given component attribute belongs in the "Content" or "Appearance" group in the field panel (R8).

**Shape**: A fixed constant list of attribute names considered "Appearance" (`width`, `height`, `maxWidth`, `padding`, `margin`, `backgroundColor`, `color`, `border`, `dividerTop`, `fullWidth`, `borderRadius`, `overflow`, `fontSize`, `fontWeight`, `textAlign` — mirrors the frontend's `boxStyleSchema` key set, not imported from it). Every other attribute on a component's schema is "Content".

**Validation rules**: A field present in both a component's own schema and the appearance list is always grouped as "Appearance," even for a type where it carries special meaning (e.g. `text.fontSize`) — grouping is about visual organization only, not behavior.

## Preview handler mapping

**What it represents**: The pure function Strapi's native preview feature calls to resolve a previewable URL for a document (R2) — not a stored entity, a request/response contract.

**Shape**:

| Field | Type | Notes |
|-------|------|-------|
| `uid` | content-type UID string | Only `"api::page.page"` returns a URL; everything else returns `null` |
| `documentId` | string (input) | Resolved to a `Page` row via `strapi.documents('api::page.page').findOne(...)` |
| `locale` | string (input) | Passed through as the `Page.lang` filter |
| `status` | `"draft" \| "published"` (input) | Informational only — the existing `/api/preview` route always enables draft mode; both statuses resolve to the same URL shape |
| → returns | URL string or `null`/`undefined` | `` `${PREVIEW_BASE_URL}/api/preview?secret=${PREVIEW_SECRET}&slug=${page.slug}` `` |

**Validation rules**: If no `Page` row matches `documentId`/`locale` (e.g. a brand-new, never-saved document), the handler returns `null`/`undefined` — Strapi's own preview panel is expected to handle an absent URL by not rendering the panel, per its documented return type.

## No autosave state

**What it represents**: Nothing — there is deliberately no background/debounced write. The composition surface only ever updates the in-memory form field (`useField('blocks').onChange`); persisting to the `Page` draft happens exclusively through the editor's own explicit Save, the same as any other field on the form (R3).
