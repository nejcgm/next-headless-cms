# Integration Rules

**Maintenance**: Update this Spec Kit knowledge doc in the same change set when related code changes. Sync map: `.specify/memory/project-context.md`.


# Integration Rules

**Maintenance**: Update `.specify/memory/knowledge/` (this file) when integration client patterns change (`.specify/memory/project-context.md` (sync map)). Also update the tenant catalog (`specs/_catalogs/{id}.md`).

## Folder Structure

Each integration lives in `src/tenants/{tenant}/integrations/{name}/` with:
- `client.ts` — API client functions (fetch calls, auth, error handling)
- `types.ts` — Raw API types AND normalized types exposed to components

## Type Normalization

Always define TWO layers of types:
1. Raw API response types (prefixed with integration name, e.g. `GrmovsekHotelDetail`)
2. Normalized types for components (`Hotel`, `Room`) — clean, frontend-friendly

Normalize in the client, not in components.

## Error Handling

API clients must NEVER throw to callers. Return `null` on failure and log the error:

```typescript
export async function getHotel(): Promise<Hotel | null> {
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    return normalise(json.data);
  } catch (error) {
    console.error("getHotel failed", error);
    return null;
  }
}
```

## Caching

Use Next.js fetch `next` option for caching:
- Static data (hotel info): `{ next: { revalidate: 3600 } }` (1 hour)
- Dynamic data (availability): `{ next: { revalidate: 60 } }` (1 minute)

## Environment Variables

API keys and URLs come from `src/env.ts` (Zod-validated). Add new env vars to the Zod schema in `env.ts` and to `.env.local`.

## Dynamic Imports

Use relative paths in dynamic `import()` statements, NOT path aliases (`@tenant/...`). Next.js does not resolve aliases in dynamic imports.

## Catalog

When an integration is added or a block starts/stops using it, update `.specify/memory/knowledge/integrations.md` and the tenant catalog (`specs/_catalogs/{id}.md`) (`.specify/memory/project-context.md` (sync map)).
