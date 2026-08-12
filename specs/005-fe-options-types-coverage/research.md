# Research: FE Options Types Coverage

## Decision: Dual rule (components always / functions at 3+)

**Rationale**: Clarification session locked this. Matches existing good examples (`ProductListProps`, `TenantPageParams`). Components always need a stable props surface for blocks/CMS; functions only need options objects when arity becomes hard to call safely (3+).

**Alternatives considered**:
- Functions always options-object — rejected (noisy for 1–2 arg helpers like `getAdapter()`).
- Components exempt under 3 props — rejected by product owner.

## Decision: Whole FE including Next.js route shells

**Rationale**: Owner chose “always” including `page` / `layout` / `error` / `not-found`. Each route folder owns a `types.ts` (e.g. `src/app/[domain]/[[...slug]]/types.ts` for `PageProps`).

**Alternatives considered**: Local props in route files — rejected.

## Decision: No carve-out for format / logger / cache-tags

**Rationale**: Owner chose convert-all for project-owned 3+ helpers. Keeps the compliance scanner simple (fewer allowlists).

**Alternatives considered**: Primitive-only positional allowlist — rejected (ambiguous, easy to game).

## Decision: Exceptions only platform APIs + React cache primitive keys

**Rationale**: Spec clarifications. Public APIs wrapping `cache` keep options objects; internal `cache(async (a,b,c) => …)` stays positional for `Object.is` memoization (already used by `getPageCached`).

**Alternatives considered**: Exempt all constructors — narrowed to Error-like forwarding only if needed; prefer options when structured context grows.

## Decision: Compliance via Node script + CI (not ESLint-first)

**Rationale**:
- Detecting “3+ positional params” and “interface Props colocated in .tsx” is awkward in stock ESLint without custom plugin work.
- A `scripts/check-types-style.mjs` (or `.ts` under `scripts/`) can walk `src/**/*.{ts,tsx}` with TypeScript compiler API or a disciplined regex/AST pass, print findings, exit non-zero.
- Wire `pnpm check:types-style` into CI next to `pnpm type-check` (same job or dependency).

**Alternatives considered**:
- Custom ESLint rule — better long-term IDE feedback but higher implementation cost for this feature; can follow later.
- Manual checklist only — fails SC-003 / FR-006.

## Decision: Migration order

1. Inventory + compliance script (failing until green).
2. Data path leftovers (`findOne`, `matchPatternPage`, `strapiFetchAll`, `cacheTags`, `logFailure` if 3+).
3. Shared utilities (`formatCurrency`, logger).
4. Renderer / other core helpers.
5. App route `types.ts` extractions props.
6. Tenant/shared component sweep for any remaining colocated props.
7. Spec Kit docs + CI green.

**Rationale**: Unblocks enforcement early; highest-churn CMS path first (user’s motivating example).

## Decision: Types placement

- Module `types.ts` beside the implementation folder (already established).
- Global domain shapes stay in `src/core/types/*`.
- No `export type { X } from "./types"` from implementation files.

**Alternatives considered**: Barrel re-exports — rejected in prior conversation.

## Open items resolved

| Former unknown | Resolution |
|----------------|------------|
| Script vs lint | Script + CI first |
| Route shells | Always `types.ts` |
| format/logger | In scope |
| Allowlist size | Minimal (platform + cache impl) |
