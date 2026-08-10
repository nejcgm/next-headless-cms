# Contract: Block Request Context

**Feature**: `002-block-request-params`  
**Audience**: Frontend block authors / agents  
**Package**: `next-headless-cms-fe`

## Forbidden (removed)

```text
page.tsx MUST NOT do:
  blocks.map(b => ({ ...b, props: { ...b.props, ...allSearchParams } }))
```

## Page → BlockRenderer

`BlockRenderer` accepts (in addition to existing `blocks`, `tenant`, `locale`, `slug`):

| Prop | Type | Required |
|------|------|----------|
| `searchParams` | `Record<string, string \| undefined>` | Yes (may be `{}`) |

Page normalizes Next.js `searchParams` before pass (first string if array).

## DataContract context

```ts
ctx: {
  tenant: string;
  locale: string;
  slug?: string;
  searchParams: Record<string, string | undefined>;
}
```

Loaders that need dates/filters/ids from the query MUST read `ctx.searchParams`, not assume those keys exist on CMS `props`.

## BlockDefinition opt-in

```ts
interface BlockDefinition {
  component: ComponentType<…>;
  schema?: ZodSchema;
  dataContract?: DataContractFn;
  /** If set, only these query keys may be merged into props for this block. */
  acceptSearchParams?: string[];
}
```

Merge order when `acceptSearchParams` is set:

1. CMS `block.props`
2. Allowlisted `searchParams` keys (overlay)
3. `dataContract` return (overlay) — unchanged relative order vs today after step 2

If `acceptSearchParams` is omitted/empty: **no** query keys enter props; contracts still see `ctx.searchParams`.

## Client components

Interactive blocks MAY call `useSearchParams()` (or equivalent) themselves. That path does not require `acceptSearchParams` or `ctx.searchParams`.

## Compatibility checklist for implement

| Consumer | Action |
|----------|--------|
| `page.tsx` | Remove global merge; pass `searchParams` into `BlockRenderer` |
| `core/blocks/types.ts` | Extend `ctx`; add optional `acceptSearchParams` |
| `core/blocks/renderer.tsx` | Thread context; apply allowlist merge |
| `resort-example` `fetchRoomDetailData` | Use `ctx.searchParams.checkin` / `checkout` |
| Spec Kit `block-system.md` | Document this contract; delete old merge sentence |
