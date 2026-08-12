# Contract: Types-style compliance check

**Package**: `next-headless-cms-fe`  
**Command** (planned): `pnpm check:types-style`  
**Entry** (planned): `scripts/check-types-style.cjs` (CommonJS; package is `"type": "module"`)

## Behavior

| Input | Default scan roots |
|-------|-------------------|
| Files | `src/**/*.{ts,tsx}` |
| Exit 0 | No in-scope findings |
| Exit 1 | One or more findings |
| Stdout | One finding per line, machine-readable enough for CI logs |

## Finding kinds

| Kind | Meaning |
|------|---------|
| `positional-arity` | Project-owned function/method definition with ≥3 top-level positional parameters (not a single options object) |
| `colocated-props` | `interface`/`type` for component props declared in a `.tsx` component/route file instead of `types.ts` |

## Allowlist / skip

- Files under `node_modules`, `.next`, generated outputs.
- Calls into platform APIs (not definitions of project wrappers).
- Named allowlist for React `cache` impl functions (explicit list in script, kept short — e.g. `getPageCachedImpl`).

## CI

- Run in GitHub Actions frontend `type-check` job (or adjacent) after/with `pnpm type-check`.
- Must be runnable in **under 2 minutes** on CI (SC-003).

## Non-goals

- Does not replace `tsc`.
- Does not enforce Zod schemas or block registry rules.
