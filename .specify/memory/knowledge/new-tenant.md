# Adding a New Tenant

**Maintenance**: Update this Spec Kit knowledge doc in the same change set when related code changes. Sync map: `.specify/memory/project-context.md`.

## Quick start (scaffold)

From `next-headless-cms-fe/`:

```bash
pnpm create:tenant -- --id my-tenant --name "My Site" --short my --port 3003
```

This creates:

- `src/tenants/{tenant-id}/` — config, blocks index, header (from `vukans-bike`), footer, templates
- `src/core/mock-data.ts/{folder}/` — `pages/home.json`, `navigation.json`, `sitemap.json`
- `specs/_catalogs/{tenant-id}.md` — stub catalog
- `pnpm` scripts: `dev:{short}`, `build:{short}`, `lint:{short}`, `start:{short}`

Optional: `--mock-folder resort` when the mock folder name differs from tenant id (updates `scripts/tenant-mock-map.json`).

Then validate:

```bash
pnpm check:tenant
# or: TENANT_ID=my-tenant node scripts/check-tenant-setup.js
```

The scaffold prints a **manual checklist** for CI, deploy, and catalog updates.

## Required steps (manual after scaffold)

1. Customize `src/tenants/{tenant-id}/config.ts` — domains, locales, theme, **`dataAdapter`** (`"mock"` or `"strapi"`)
2. Register blocks in `src/tenants/{tenant-id}/blocks/index.ts`
3. Add mock pages under `src/core/mock-data.ts/{folder}/pages/` as needed (skip if `dataAdapter: "strapi"` — use Strapi + seed instead)
4. Update **`specs/_catalogs/{tenant-id}.md`**
5. Add tenant to **`.specify/memory/project-context.md`** catalog table
6. Add CI matrix entry in **`.github/workflows/ci.yml`** (`lint` + `build-tenants`)
7. Create **`deploy-{short}.yml`** + Vercel project + secrets — see `.specify/memory/knowledge/deployment.md`

Block registration is automatic: root `app/layout.tsx` imports `@core/init`, which imports `@tenant/blocks`.

If `mock-data` folder name ≠ tenant id, set mapping in `scripts/tenant-mock-map.json` (or pass `--mock-folder` to `create:tenant`).

## Tenant config shape

```typescript
import type { TenantConfig } from "@core/types/tenant";

const config: TenantConfig = {
  id: "my-tenant",
  name: "My Site",
  domains: ["my-site.localhost"],
  defaultLocale: "en",
  locales: ["en"],
  features: {
    blog: false,
    booking: false,
    reviews: false,
    search: false,
    newsletter: false,
  },
  theme: {
    colors: {
      primary: "#000000",
      secondary: "#666666",
      accent: "#0066cc",
      background: "#ffffff",
      foreground: "#111111",
      muted: "#f4f4f5",
      border: "#e4e4e7",
      textPrimary: "#111111",
    },
    fonts: {
      heading: "var(--font-inter)",
      body: "var(--font-inter)",
    },
    borderRadius: "0.375rem",
  },
  dataAdapter: "mock", // or "strapi" — see docs/STRAPI-MIGRATION.md; scaffold defaults to mock
};

export default config;
```

## Build isolation

After `pnpm build:{short}`:

```bash
TENANT_ID={tenant-id} pnpm verify:build
```

`scripts/verify-build.js` scans **all** JS output for other tenants' source paths (`tenants/*`, `mock-data.ts/*`). Tenant discovery is dynamic via `scripts/tenant-registry.js`.

## After any later change

Update affected docs per `.specify/memory/project-context.md` (sync map), including the tenant catalog (`specs/_catalogs/{id}.md`).

## Testing

```bash
pnpm dev:{short}
pnpm lint:{short}
TENANT_ID={tenant-id} pnpm type-check
pnpm check:tenant
```
