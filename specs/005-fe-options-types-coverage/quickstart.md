# Quickstart: FE Options Types Coverage

Validate that the dual typing convention is complete and enforced.

## Prerequisites

- Repo root / `next-headless-cms-fe` with pnpm
- Node 20+
- Feature artifacts: [spec.md](./spec.md), [contracts/typing-conventions.md](./contracts/typing-conventions.md), [contracts/types-style-check.md](./contracts/types-style-check.md)

## 1. Typecheck

```bash
cd next-headless-cms-fe
pnpm type-check
```

**Expect**: exit 0.

## 2. Types-style compliance

```bash
cd next-headless-cms-fe
pnpm check:types-style
```

**Expect**: exit 0, no `positional-arity` or `colocated-props` findings.

### Negative check (optional)

Temporarily add a dummy `function bad(a: string, b: string, c: string) {}` under `src/` and re-run — **Expect**: exit 1 mentioning that symbol. Revert before commit.

## 3. Spot-check canonical patterns

- Component: tenant/shared block imports props from `./types` (e.g. product-list).
- Function: `loadPageWithNavigation({ tenantId, slug, locale })` in `page.tsx`.
- Leftover motivator: Strapi adapter internal single-row helper uses one options object from module types.
- Route shell: `src/app/[domain]/[[...slug]]/types.ts` exports page props; `page.tsx` imports them.

## 4. Spec Kit

Confirm `.specify/memory/knowledge/typescript.md` states:

- Whole FE scope
- Components always / functions at 3+
- Exception list (cache primitives + platform only)
- `pnpm check:types-style` as the compliance command

## 5. Lint matrix (smoke)

```bash
pnpm lint:bike
# and/or
pnpm lint:resort
```

**Expect**: no new errors from the refactor.

## Done when

- Steps 1–2 green
- Spot-checks in step 3 pass
- Spec Kit updated (step 4)
- SC-001 / SC-001b / SC-003 satisfied
