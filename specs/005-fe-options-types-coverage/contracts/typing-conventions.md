# Contract: Frontend typing conventions

**Audience**: Contributors and agents working in `next-headless-cms-fe/`  
**Normative Spec Kit home after implement**: `.specify/memory/knowledge/typescript.md`

## Dual rule

| Kind | Rule | Canonical example |
|------|------|-------------------|
| Component | Always: one props object typed from module `types.ts` | `ProductList({…}: ProductListProps)` |
| Function / method | If **3+** parameters: one options object typed from module `types.ts` | `loadPageWithNavigation({…}: TenantPageParams)` |

Applies to `src/app`, `src/core`, `src/shared`, `src/tenants` (public **and** private methods).

## Types placement

- Put owned types in `{folder}/types.ts`.
- Import into implementation files; **do not** re-export types from implementation files.
- Shared domain contracts stay in `src/core/types/` (`page`, `navigation`, `tenant`).

## Exceptions (functions only)

1. **React memoization primitives** — internal `cache(async (a, b, c) => …)` may stay positional; public wrapper still uses an options object when arity ≥ 3.
2. **Platform / third-party APIs** — direct DOM/framework calls (`addEventListener`, etc.) are out of scope.

**Not exceptions**: `formatCurrency`, logger helpers, `cacheTags.*` builders with 3+ args, adapter helpers (`findOne`, etc.).

## Components including routes

Next.js route shells (`page`, `layout`, `error`, `not-found`) MUST use props types from a `types.ts` in the same route folder.

## Compliance

Violations are reported by the types-style check CLI — see [types-style-check.md](./types-style-check.md).
