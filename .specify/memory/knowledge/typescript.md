# TypeScript Conventions

**Maintenance**: Update this Spec Kit knowledge doc in the same change set when related code changes. Sync map: `.specify/memory/project-context.md`.


# TypeScript Conventions

**Maintenance**: Update `.specify/memory/knowledge/` (this file) when ESLint/TS/CI conventions or path aliases change (`.specify/memory/project-context.md` (sync map)).

## Strict Mode

TypeScript strict mode is enabled. Never use `any` unless absolutely necessary. Prefer `unknown` and narrow with type guards.

## Path Aliases (Static Imports Only)

Use path aliases for static imports:
- `@/` → `src/`
- `@core/` → `src/core/`
- `@shared/` → `src/shared/`
- `@tenant` → `src/tenants/{TENANT_ID}` (build-time, from prepare-tenant.js)
- `@mock-data` → `src/core/mock-data.ts/{tenant}` (vukans-bike or resort)

For dynamic `import()` statements, use RELATIVE PATHS only. Next.js cannot resolve aliases in dynamic imports.

## Component Patterns

- Server Components by default (no directive needed)
- Add `"use client"` only when using hooks, event handlers, or browser APIs
- Keep client components small and leaf-level

## Interface vs Type

- `interface` for component props and object shapes
- `type` for unions, intersections, and utility types
- Service return types that need `Record<string, unknown>` compatibility: use `extends Record<string, unknown>`

## Type assertions — minimize casting

Avoid type assertions (`as Type`, `as const`) unless there is no type-safe alternative. Assertions hide mistakes; prefer types that infer correctly from the start.

### Do not use `as const` on config objects

Do **not** suffix config/constants objects with `as const` (e.g. `strapiConfig`, `STRAPI_COLLECTIONS`, `POPULATE`). Plain object literals are enough.

When you need a union of keys or values, derive it explicitly instead:

```ts
export const STRAPI_COLLECTIONS = {
  pages: "pages",
  navigations: "navigations",
  products: "products",
};

export type StrapiCollection = (typeof STRAPI_COLLECTIONS)[keyof typeof STRAPI_COLLECTIONS];
```

Use `satisfies SomeType` when you want to check shape without widening or freezing literals.

### Prefer alternatives to `as`

| Instead of | Prefer |
|---|---|
| `value as Foo` | Typed function return, generic parameter, or Zod parse |
| `(await res.json()) as T` | Validate/narrow from `unknown` at the boundary |
| `mod.default as PageData` | Typed dynamic-import helper or runtime check |
| `as const` on objects | Explicit `type` / `interface` + plain literals |

### When casting is acceptable

- DOM APIs after a narrow check (e.g. `event.target` after `instanceof Element`)
- Documented adapter boundaries where external JSON is normalized immediately (Strapi/mock adapters) — keep casts localized and pair with runtime checks where feasible
- Block registry `ComponentType<any>` (see ESLint exceptions below)

## Environment Variables

All env vars must be added to the Zod schema in `src/env.ts`. Access via `import { env } from "@/env"`, never `process.env` directly.

### Allowed Exceptions

- `process.env.NODE_ENV` — Standard Node.js convention, safe to use directly in any file

## Error Boundaries

- `error.tsx` must be a client component (`"use client"`)
- `not-found.tsx` can be a server component
- Avoid route-level `loading.tsx` under `[[...slug]]` when templates render header/footer — see `docs/DEVELOPMENT.md`

## ESLint / Next.js (CI-enforced)

These rules are enforced by `next lint` in CI. Violations fail the build.

### Internal navigation

- Use `Link` from `next/link` for in-app routes (`/`, `/rooms`, breadcrumbs, CTAs).
- `<a href="...">` is only for external URLs, `mailto:`, and `tel:`.

### Imports

- Use ESM `import` — never `require()` (use `import "server-only"` + static imports for server modules like `next/cache`).

### Types

- Never use `any` — use `unknown`, generics, or `Record<string, unknown>`.
- Block registry components use `ComponentType<any>` with `// eslint-disable-next-line @typescript-eslint/no-explicit-any` (Zod validates props at runtime).
- Templates use `TemplateComponent` from `@core/routing/resolver` — not `ComponentType<any>`.

### Template components

Templates are async server components typed as `TemplateComponent` (`(props: TemplateProps) => React.ReactNode`).
- Import `TemplateProps` from `@core/types/page`.
- Use `page.navigation` (attached in `page.tsx` by `loadPageWithNavigation` / `getNavigationCached`). Do not call `getAdapter().getNavigation` or `getNavigationCached` from templates.
- Import `localizeNavItems` from `@core/i18n/locale-path` — never inline the localize loop.

### Catch blocks

- If the error is unused, use `catch {` (no binding) instead of `catch (error)`.

### Unused code

- Remove unused imports and variables; use `void value` only when a parameter must stay for API compatibility.

## Tenant work

- Read and keep current: Spec Kit knowledge docs and tenant catalogs per `.specify/memory/project-context.md` (including `specs/_catalogs/{tenant}.md` when editing tenant code).
- CI runs `pnpm lint` per tenant via matrix (`TENANT_ID=vukans-bike` / `resort-example`); local `pnpm lint` runs both.
