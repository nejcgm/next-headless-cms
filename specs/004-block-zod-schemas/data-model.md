# Data Model: Block Prop Validation Schemas

This feature does not introduce persisted entities. It formalizes **runtime prop contracts** already implied by TypeScript props and CMS content.

## Entities

### Content block registration

| Field | Meaning |
|-------|---------|
| `type` | Registry key (e.g. `cta-banner`, `hero`) |
| `component` | React component |
| `schema` | Zod schema (required after this feature for all content blocks) |
| `dataContract` | Optional async loader merging extra props |
| `acceptSearchParams` | Optional allowlist merged into props |

### Prop validation schema

| Rule | Detail |
|------|--------|
| Shape | `z.object({ ... })` describing authored props |
| Unknown keys | Stripped (Zod object default) — injected/runtime keys ignored |
| Required vs optional | Match existing TS prop interfaces / component destructuring |
| Nested objects | e.g. `cta: z.object({ label, href })`, repeatable arrays of items |
| Enums | Match existing unions (`layout`, `background`, `backgroundFit`, icons where constrained) |
| Dev behavior | `safeParse` → warn with issue paths; never throw |
| Prod behavior | Schema present but not executed (`NODE_ENV !== "development"`) |

### Authored vs injected props

| Kind | Source | In schema? |
|------|--------|------------|
| Authored | CMS / mock block fields | Yes |
| Injected | `dataContract` return | No (unless a field is also authored) |
| Request | Allowlisted search params | No (stripped as unknown if not in schema) |
| Meta | `blockId` / renderer keys | No |

## Relationships

```text
Page.blocks[] → BlockInstance { type, props }
                 → resolveBlock(tenant, type) → BlockDefinition { schema, dataContract, ... }
                 → mergedProps = props + dataContract + searchParams
                 → schema.safeParse(mergedProps)  [dev only]
                 → Component(mergedProps)
```

## Validation coverage target

After implementation, every row in [contracts/block-schema-registry.md](./contracts/block-schema-registry.md) has `schema` = yes.
