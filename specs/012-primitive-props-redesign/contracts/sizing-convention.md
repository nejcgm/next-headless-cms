# Contract: Sizing convention

**Feature**: `012-primitive-props-redesign`

## Scope

Every primitive field of a "sizing" kind: `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight`, and each primitive's own `gap` where the redesigned shape makes `gap` a sizing field (Flex, Grid, Gallery).

## Rule

```text
toCssSize(value: string | null | undefined): string | undefined

"320"    → "320px"
"50%"    → "50%"
"0"      → "0px"
""       → undefined (no constraint)
null     → undefined
"2rem"   → undefined + dev warning (not a supported unit — see Edge Cases)
"auto"   → undefined + dev warning
```

Applied at render time, in `toBoxStyle()` and each primitive's own inline-style computation — not at authoring/save time. An editor can type an unsupported value and it will be soft-ignored (rendered as if unset) rather than blocking a save, matching this project's existing soft-fail posture for other authored-but-invalid data (`compose-validate.ts`).

## Where it does NOT apply

- Enum-based fields that look like sizing but aren't (`columnsMobile` etc. — closed sets, unaffected).
- `padding`/`margin` — these stay free CSS shorthand strings as today (`"0 0 40px"` etc.), not single-dimension sizing values; `toCssSize` is not applied to them.
- `fontSize`/`letterSpacing`/`lineHeight` on Text — these are plain numbers (px), not px/%-ambiguous strings; no `%` case exists for them per the reviewed shape.

## Consumers

- `next-headless-cms-fe/src/shared/utils/box-style.ts` (`toBoxStyle`) — the shared box-style bag's own sizing fields.
- Each primitive component that has sizing fields **outside** the shared bag (none currently expected — every sizing field lives in the shared bag after this feature; primitive-specific sizing like Grid's `gap` is added to the bag's shape via that primitive's own schema, not a parallel implementation).
