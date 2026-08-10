# Data Model: Clean Block Request Params

**Feature**: `002-block-request-params`  
**Date**: 2026-08-10

Conceptual entities (runtime / registry — not Strapi collections).

## Entities

### CMS block content

| Attribute | Notes |
|-----------|--------|
| `id` | Block instance id |
| `type` | Registry key |
| `props` | Authoritative content fields from CMS/mock after `toPageData` |
| `visibility` | Optional locale/date gates (unchanged) |

**Rule**: Must not be silently overwritten by undeclared request query.

### Request input

| Attribute | Notes |
|-----------|--------|
| `searchParams` | `Record<string, string \| undefined>` for the current page request |
| Normalization | Multi-value keys → first string; missing → `undefined` |

**Lifetime**: Request-scoped; not persisted.

### Block definition (registry)

| Attribute | Notes |
|-----------|--------|
| `component` | React component |
| `schema` | Optional Zod (dev validation of merged render props) |
| `dataContract` | Optional async loader `(props, ctx) => extraData` |
| `acceptSearchParams` | Optional `string[]` — keys allowed to merge from request into props for this block only |

### Block render context (`ctx`)

| Field | Source |
|-------|--------|
| `tenant` | Tenant id (existing) |
| `locale` | Resolved locale (existing) |
| `slug` | Logical pathname (existing) |
| `searchParams` | **New** — normalized request input |

## Relationships

```text
Page request
  → searchParams (Request input)
  → BlockRenderer
       → per block: CMS props (pure by default)
       → if acceptSearchParams: props' = props ⊕ pick(searchParams, allowlist)
       → if dataContract: extra = dataContract(props', { …, searchParams })
       → component(props' ⊕ extra)
```

## Validation rules

- Default: `props_render ⊆ CMS props ∪ dataContract output` (no query).
- With allowlist: only listed keys may come from `searchParams` into props.
- `dataContract` may read `ctx.searchParams` without putting those keys on CMS props.
- Dev Zod validates final props object as today (may include allowlisted query + contract data).

## State transitions

N/A — per-request composition only; no durable state machine.
