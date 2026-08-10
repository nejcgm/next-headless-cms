# Quickstart: Validate Block Request Params

**Feature**: `002-block-request-params`  
**Purpose**: Prove CMS props stay pure and request-driven blocks still work via the explicit channel.

## Prerequisites

- Repo root: `headless-cms/`
- Frontend deps installed in `next-headless-cms-fe/`
- Prefer `pnpm dev:bike` for SC-001 (product). Fixture path optional for room dates.

## Phase A — No global merge in source

```bash
cd next-headless-cms-fe
rg -n "\.\.\.query|blocksWithQuery|props: \{[\s\S]*\.\.\.query" src/app/[domain]/[[...slug]]/page.tsx || true
rg -n "searchParams" src/core/blocks/renderer.tsx src/core/blocks/types.ts
```

**Expected**: Page does **not** spread full query into every block props. Renderer/types include `searchParams` / `ctx.searchParams`.

## Phase B — Content immunity (SC-001)

1. Run product tenant: `pnpm dev:bike` (Strapi up if needed).
2. Open a page with a hero (e.g. home).
3. Note CMS headline.
4. Reload with `?headline=hacked` (or another CMS field name).
5. **Expected**: Headline unchanged (still CMS).

## Phase C — Request channel (fixture / any allowlisted consumer)

If validating room-detail dates on the fixture:

1. `pnpm dev:resort` (optional; fixture may still have empty CMS blocks — focus on loader wiring/type-check).
2. Ensure `fetchRoomDetailData` (or successor) reads `ctx.searchParams`, not `props.checkin` from a global merge.
3. `pnpm type-check` with both tenants as used in CI.

**Expected**: Types compile; no remaining comments/docs saying “searchParams merged into props by page”.

## Phase D — Docs (SC-004)

```bash
rg -n "merged into \`props\` by the page|all query|blocksWithQuery" \
  .specify/memory/knowledge/block-system.md \
  next-headless-cms-fe/docs || true
rg -n "searchParams|acceptSearchParams|ctx.searchParams" \
  .specify/memory/knowledge/block-system.md
```

**Expected**: Old merge guidance gone; three channels documented (ctx / acceptSearchParams / client).

## Phase E — Isolation still green

```bash
cd next-headless-cms-fe
pnpm build:bike && TENANT_ID=vukans-bike pnpm verify:build
```

**Expected**: Build isolation still passes (no accidental cross-tenant imports from this change).

## Related

- [contracts/block-request-context.md](./contracts/block-request-context.md)
- [data-model.md](./data-model.md)
- [research.md](./research.md)
