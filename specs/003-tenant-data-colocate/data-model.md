# Data Model: Colocate Tenant Mock Data

**Feature**: `003-tenant-data-colocate`  
**Date**: 2026-08-10

## Entities

### Tenant package

| Attribute | Notes |
|-----------|--------|
| `tenantId` | Folder name under `src/tenants/` |
| `dataAdapter` | `"mock"` \| `"strapi"` from `config.ts` |
| `mock-data/` | Colocated content JSON directory (new home) |

### Tenant content tree (`mock-data/`)

| Path (relative) | Role |
|-----------------|------|
| `pages/*.json` | Page documents (mock runtime and/or seed) |
| `navigation.json` (+ locale variants) | Nav |
| `collections/*.json` | Collection entries (e.g. products, reviews) |
| `sitemap.json` | Sitemap entries for mock adapter |

### Alias binding (build-time)

| When | `@mock-data` target |
|------|---------------------|
| `dataAdapter === "mock"` | `src/tenants/{tenantId}/mock-data` |
| `dataAdapter === "strapi"` | `scripts/mock-data-stub` |

### Isolation relation

A build for tenant A MUST NOT embed filesystem path markers for `tenants/B` (including `tenants/B/mock-data`) in scanned JS output.

## Validation rules

- Exactly one content tree per tenant id under `mock-data/` after migration.
- No remaining tenant trees under `src/core/mock-data.ts/`.
- No reliance on short-folder map (`resort` ≠ `resort-example`).

## State transitions

```text
Before: core/mock-data.ts/{folder}/ + optional map(tenantId → folder)
After:  tenants/{tenantId}/mock-data/     + map removed
```
