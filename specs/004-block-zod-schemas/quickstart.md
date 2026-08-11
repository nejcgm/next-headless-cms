# Quickstart: Validate Block Zod Schemas

## Prerequisites

- Repo root: `headless-cms/`
- Frontend: `next-headless-cms-fe/` with pnpm
- Feature artifacts: [spec.md](./spec.md), [contracts/block-schema-registry.md](./contracts/block-schema-registry.md)

## 1. Coverage check (registration)

After implementation, every content-block entry in these files must pass `schema:`:

- `src/shared/components/blocks/index.ts`
- `src/tenants/vukans-bike/blocks/index.ts`
- `src/tenants/resort-example/blocks/index.ts`

Quick grep (expect no registration objects that lack `schema` for content blocks):

```bash
cd next-headless-cms-fe
rg -n 'schema:' src/shared/components/blocks/index.ts src/tenants/vukans-bike/blocks/index.ts src/tenants/resort-example/blocks/index.ts
```

Compare counts to the checklist in the contract (shared 6 + bike 16 + resort 10).

## 2. Type-check / lint

```bash
cd next-headless-cms-fe
pnpm type-check
TENANT_ID=vukans-bike node scripts/prepare-tenant.js && pnpm lint:bike
TENANT_ID=resort-example node scripts/prepare-tenant.js && pnpm lint:resort
```

## 3. Development warning smoke (bike)

```bash
cd next-headless-cms-fe
pnpm dev:bike
```

1. Open a page that uses a previously unvalidated block (e.g. home `stats-bar` / `image-text`, or `/service` pricing).
2. Temporarily break a required prop in the corresponding mock or CMS content (e.g. remove `heading` from a `cta-banner`).
3. Reload — expect a **dev** warning naming the block type and failing path(s); page still renders.
4. Revert the break.

## 4. Development warning smoke (resort)

```bash
cd next-headless-cms-fe
pnpm dev:resort
```

Note: resort mock pages may still use legacy `{ type, props }` and render empty blocks until that fixture is migrated. Prefer validating schemas by:

- Confirming registration wiring + type-check, and/or
- Temporarily calling `safeParse` in a one-off script against a fixture props object, or
- Using a page path that successfully renders a shared/tenant block if available

If resort pages are empty due to legacy mock shape, do **not** block this feature on full visual QA for resort; registration + type-check + bike smoke satisfy SC for fixture schemas.

## 5. Production no-op check

```bash
cd next-headless-cms-fe
NODE_ENV=production pnpm build:bike
```

Confirm build succeeds. Validation path is gated on development; no requirement to assert absence of warnings in production logs for this feature beyond code review of `validateBlockProps`.

## 6. Docs

Confirm:

- `.specify/memory/knowledge/block-system.md` requires schemas for new content blocks
- Both tenant catalogs no longer treat schemas as optional/rare

## Done when

- [ ] Contract coverage checklist all Yes  
- [ ] Type-check + lint pass for both tenants  
- [ ] Bike dev smoke shows warn-on-invalid for ≥1 newly schemated block  
- [ ] Spec Kit docs updated in the same change set  
