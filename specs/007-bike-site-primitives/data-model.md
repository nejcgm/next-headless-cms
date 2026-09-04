# Data Model: Vukan's Bike Site Primitives Redesign

**Feature**: `007-bike-site-primitives`  
**Date**: 2026-09-04

Composition runtime entities (`BlockInstance`, `CompositionPolicy`, `slots`, maxDepth) are unchanged from [006 data-model](../006-bike-home-shared-compose/data-model.md) and Spec Kit `knowledge/block-system.md`. This document defines the **post-migration inventory**, allowlists, and page entities.

## Entities

### Page composition (bike)

| Field | Rules |
|-------|--------|
| `blocks[]` | Ordered roots; each node L1, or Keep L3, or L1 tree via `slots` |
| Locales | `sl` (default file), `en--*`, `de--*` — **same structure**, localized strings only |
| Template | `default` (header/footer) unless already `detail`/`bare` |

### Allowed block types (product surface)

#### Level 1 (shared — retain)

| Type | Nesting | Notes |
|------|---------|--------|
| `section` | `default` slot | Page bands; hero via `backgroundImage` + `overlay` + `justify`/`align` |
| `stack` | `default` | Vertical rhythm |
| `flex` | `default` | Row/column arrangement |
| `grid` | `default` | Columns number **or** `{ mobile, tablet?, desktop? }` |
| `text` | leaf | `variant` body\|lead\|caption\|label; titles via `fontSize` + `bold` |
| `image` | leaf | Real visual anchors |
| `iframe` | leaf | Embeds (maps, video) |
| `icon` | leaf | Decorative icons (`map-pin`, `phone`, `mail`) |
| `button` | leaf | CTAs |
| `link` | leaf | Text links (`accent` / `muted`) |

#### Level 3 Keep (bike proprietary — retain)

| Type | Nesting | Used on |
|------|---------|---------|
| `product-list` | leaf (+ dataContract) | Home, shop |
| `bike-detail` | leaf (+ dataContract) | `/bikes/{slug}` |
| `gallery` | leaf | Bike school, guided tours |

Shared interactive L3: `accordion` (single expandable panel; stack several for lists).

#### Chrome (not DZ)

Header, footer templates — unchanged.

### Superseded types (delete after zero bike references)

**Shared**: `cta-banner`, `stats-bar`, `image-text`, `section-header`, `rich-text`, `image-gallery`, `heading`  
**Bike proprietary**: `contact`, `service-faq`, `partners-gallery`, `service-pricing`, `hero`, `about-story`, `about-person`, `about-values`, `bike-school-intro`, `bike-school-program`, `guided-tour-experience`, `service-process`, `service-contact`

### Composition allowlist (update)

Shared layout policies allow **L1 only**. Bike Keep L3 is registered via tenant nest allow:

```text
shared nestAllow = [stack, flex, grid, text, image, iframe, icon, button, link, accordion]
tenant nestAllow extras = [
  product-list, bike-detail, gallery
]
```

Apply to `section` (and to `stack` / `flex` / `grid` as appropriate — `section` must include all; nested layouts may omit `bike-detail` if never nested, but prefer one shared allow constant for consistency).

`section` still MUST NOT nest another `section` (avoid band-in-band). Keep compounds: `maxDepth: 1`, `slots: {}`, `level: 3`.

### Strapi page DZ (target)

After cleanup, `page.blocks` components list:

```text
blocks.section, blocks.stack, blocks.flex, blocks.grid,
blocks.text, blocks.image, blocks.iframe, blocks.icon, blocks.button, blocks.link,
blocks.accordion,
blocks.product-list, blocks.bike-detail,
blocks.gallery
```

Plus any **resort-only Strapi components** only if still required by live Strapi for other tenants — today resort is mock-only, so **do not** retain bike-replaced shared opaques solely for the fixture. Resort FE may still register tenant `hero` for mock JSON.

### Validation rules

- Unknown / superseded types in bike mocks → must be zero before delete (grep gate).
- Illegal nesting → soft-drop + warn (existing adapter).
- Empty optional compound headings → compounds must not render empty chrome (existing / fix if found).
- Design gate is qualitative (FR-012) but checklistable per quickstart.

### State: migration lifecycle

```text
authored with Replace types
  → redesigned mocks (L1/L2 + Keep only)
  → resort drops shared deleted nodes
  → FE unregister/delete
  → Strapi DZ + component delete + types:generate
  → Spec Kit catalog/knowledge sync
  → done (live re-seed optional follow-on)
```
