# Contract: Icon library

**Feature**: `012-primitive-props-redesign`

## Library

`lucide-react` (ISC license, ~1,847 icons at time of writing). Icon names are kebab-case, matching the library's own canonical naming (`lucide-react`'s `dynamicIconImports` keys) — e.g. `"arrow-right"`, `"calendar"`, `"map-pin"`.

## Server render (public site)

`icon.tsx` resolves its SVG via a **synchronous, static lookup** on a generated map (`icon-map.ts`: kebab-case name → the corresponding `lucide-react` component, built from the library's full static export) — not `lucide-react/dynamic`'s `DynamicIcon`. No client-side code, no lazy-loading, no Suspense boundary; this is a plain Server Component concern.

```text
icon-map.ts:
  export const ICON_MAP: Record<string, LucideIcon> = { "arrow-right": ArrowRight, "calendar": Calendar, ... }
  // generated from lucide-react's exports; treated as a build artifact like types/generated/
```

## Admin picker (Strapi custom `FieldInspector`)

The `icon.name` field's control (`FieldInspector.tsx`, from `011`) becomes `@strapi/design-system`'s `Combobox` (not `SingleSelect`) — it already ships a `VirtualizedList` for large option counts and `filterValue`/`onFilterValueChange` for live search. The full ~1,847-name list is the option source; each option's visible label may show a small live icon preview (optional nice-to-have, itself fine to lazy-load per-visible-row since this **is** a genuinely interactive client surface where `DynamicIcon`'s tradeoffs make sense, unlike the server render).

## Strapi schema

`icon.json`'s `name` attribute stays a real `enumeration` (closed set, per FR-018) — generated from the same source list as `icon-map.ts`, not hand-typed. `label` (accessible label) and `color` (token enum) are unchanged; `size` changes from a `sm|md|lg` enum to a plain number (px), per the reviewed shape.

## Migration

`"map-pin"`, `"phone"`, `"mail"` already match `lucide-react`'s canonical names exactly — no data transform needed for existing Icon usages (FR-014 satisfied without a migration step for this specific field).

## Out of this contract

A media-library-style icon *upload* system (not requested — this is a fixed, code-shipped icon set, not user-uploaded assets); using `DynamicIcon` anywhere in the server render path (see research R2 for why).
