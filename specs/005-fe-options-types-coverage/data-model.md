# Data Model: FE Options Types Coverage

This feature does not introduce persisted entities. It formalizes **typing artifacts** and **compliance findings** as the working model.

## Entities

### Module types file

| Attribute | Rules |
|-----------|--------|
| Path | `{module-folder}/types.ts` (e.g. block folder, route folder, `core/data/`, `shared/utils/`) |
| Owns | Component props interfaces, function options interfaces, nested helper types for that module |
| Must not | Re-export from implementation files; duplicate global domain types from `core/types/` |

### Component props type

| Attribute | Rules |
|-----------|--------|
| Name | Typically `{ComponentName}Props` |
| Used by | Exactly one primary component (or tightly coupled siblings in the same folder) |
| Required | Always for project-owned React components including route shells |
| Location | Module `types.ts` only |

### Options object type

| Attribute | Rules |
|-----------|--------|
| Name | Descriptive (`GetPageArgs`, `FindOneArgs`, `FormatCurrencyArgs`, …) |
| Trigger | Function/method has **3+** parameters (before refactor) |
| Location | Module `types.ts` (or `core/types` if truly cross-module domain) |
| Call shape | Single object argument; destructure in signature |

### Exception record

| Attribute | Rules |
|-----------|--------|
| Category | `react-cache-primitives` \| `platform-api` |
| Applies to | Functions/methods only |
| Does not apply | Components, format/logger, cache-tag builders, adapter helpers |

### Compliance finding

| Attribute | Rules |
|-----------|--------|
| Kind | `positional-arity` \| `colocated-props` |
| Path | Source file path |
| Symbol | Function/component name when detectable |
| Detail | Short reason (e.g. “3 positional params”, “interface Props in .tsx”) |
| Resolution | Migrate to options/props in `types.ts` or document as exception (rare) |

## Relationships

```text
Module types file
  ├── owns → Component props type(s)
  └── owns → Options object type(s)

Compliance finding
  └── references → file/symbol violating dual rule
```

## Validation rules (from spec)

- Zero in-scope `positional-arity` findings after migration (SC-001).
- Zero in-scope `colocated-props` findings after migration (SC-001b).
- Implementation files import types; do not re-export them (FR-003).
