# Implementation Plan: Primitive Props Redesign

**Branch**: `012-primitive-props-redesign` | **Date**: 2026-09-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-primitive-props-redesign/spec.md`

## Summary

Redesign the field set of every L1/L3 primitive (Flex, Section, Text, Link, Image, Iframe, Button, Grid, Icon, Accordion, Gallery), retire Stack in favor of Flex `direction`, promote Accordion and Gallery to real nested-children containers (Gallery restricted to Image only; Link/Button restricted to Icon/Text only), give Icon a full ~1,850-icon library (lucide-react, ISC license) via a virtualized searchable picker, and rebuild every Vukan's Bike page onto the new shapes with identical visual output. The shared `boxStyleSchema` stays the underlying architecture (extended with `minWidth`/`minHeight`/`maxHeight` and a normalized px/% sizing rule) rather than being replaced with per-primitive one-offs — every primitive still `.omit()`s/`.extend()`s from it exactly as today.

## Technical Context

**Language/Version**: TypeScript; Node.js 20+; Next.js 15 (frontend); Strapi 5.44 (backend) — same stack as `009`–`011`

**Primary Dependencies**: `lucide-react` (new, frontend — static icon export map for server-rendered `Icon`); `@strapi/design-system`'s `Combobox` (already installed via `011`, virtualized — for the icon picker in the custom page-composition `FieldInspector`); Zod (existing); no other new runtime dependencies

**Storage**: Strapi component schemas for 11 `blocks/*.json` files change shape; `page.blocks` dynamic zone's allowed-components list drops `blocks.stack`; `product-list`/`bike-detail` schemas untouched. SQLite/Postgres per env, unchanged.

**Testing**: `pnpm type-check` / `pnpm check:types-style` (frontend); `npx tsc --noEmit` (backend admin + server, per `011` convention); `npm run types:generate` after every Strapi schema change; manual [quickstart.md](./quickstart.md) (page-by-page visual diff against pre-migration content, screenshotted or eyeballed — no visual-regression tooling exists in this repo today, so this is a deliberate manual gate, not an automated one)

**Target Platform**: Vercel (bike frontend); Railway-hosted Strapi (per `strapi-backend.md`) — same as always

**Project Type**: Monorepo — **both packages**, roughly evenly: backend schema/seed changes and frontend primitive/registry/render changes are each substantial and load-bearing

**Performance Goals**: No new performance requirement beyond today's; lucide's static import keeps the *server* render cost to one object-property lookup per icon (no lazy-loading needed server-side — see research R2). The *admin* icon picker (client-side, ~1,850 options) needs virtualization to stay responsive — `Combobox`'s `VirtualizedList` already provides this.

**Constraints**: One build = one tenant; pnpm in `next-headless-cms-fe/`, npm in `headless-cms-backend/`; no cross-tenant bundles; every closed-set field stays a dropdown (FR-018); the shared box-style bag is extended, not replaced (spec Assumption); Stack's removal is the one explicit primitive-removal exception (spec Out-of-Scope)

**Scale/Scope**: Every shared L1/L3 primitive + composition/nest-rule registries on both `next-headless-cms-fe` and `headless-cms-backend`; all 27 Vukan's Bike pages × 3 locales rebuilt; `resort-example` mock content mechanically migrated only far enough to keep building (per spec Assumption) — not redesigned

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|--------|
| I. One build, one tenant | Pass | Shared-primitive changes are tenant-agnostic code; per-tenant content migration is scoped and sequential (bike first, then the minimum needed on the fixture tenant). |
| II. Layer boundaries | Pass | Changes stay within `shared/` (primitives, registry, composition-allow), `core/blocks` (policy types, unchanged shape), and `tenants/vukans-bike` (content only, plus removing its now-shared Gallery registration). No new tenant→core or shared→tenant imports. |
| III. Single route, block composition | Pass | No new Next.js routes; same single-page-route rendering pipeline, same block registry mechanism — only the registered set of fields/policies changes. |
| IV. Spec Kit SoT | Pass | `content-model.md`, `block-system.md`, `api-contract.md`, and the `vukans-bike` catalog all get updated in the implement change set — every field-shape and nest-rule change is exactly what those docs exist to track. |
| V. Minimal, focused changes | Pass (large but bounded) | Large surface area is inherent to the ask (redesign the core primitives), not scope creep — no unrelated primitives, no new tenants, no unrelated refactors bundled in. Stack's removal is the one explicit, spec-approved exception to "don't remove things." |
| VI. Data adapter contract | Pass | REST *shape* (`__component`, `slots`, dynamic zone) is unchanged; only the *fields inside* each component and the dynamic zone's allowed-components list change — both already coordinated changes under this principle's normal process (schema + `strapi.adapter.ts`/types + knowledge docs together). |
| VII. Clean, maintainable code | Pass | Reuses the existing shared box-style-bag pattern and the existing per-primitive `schema.ts`/`types.ts`/`{name}.tsx` folder convention rather than inventing a parallel structure; the icon name→component map is a small generated module, not hand-maintained. |

**Post-design re-check**: Pass — see [research.md](./research.md) R1 (sizing helper is additive to the existing bag), R5 (nest-rule changes mirror the existing two-registry pattern from `010`/`011`, no new mechanism).

## Project Structure

### Documentation (this feature)

```text
specs/012-primitive-props-redesign/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── sizing-convention.md
    ├── nest-rules.md
    └── icon-library.md
```

### Source Code (packages touched)

```text
next-headless-cms-fe/
├── src/shared/utils/box-style.ts                        # +minWidth/minHeight/maxHeight, toCssSize() px/% helper
├── src/shared/components/composition-allow.ts            # remove STACK_NEST_ALLOW; add ACCORDION/GALLERY/LINK_BUTTON allow-lists
├── src/shared/components/primitives/layout/flex/         # schema.ts, types.ts, flex.tsx — new field set
├── src/shared/components/primitives/layout/grid/         # sizing convention only; fields otherwise stable
├── src/shared/components/primitives/layout/section/      # schema.ts, types.ts, section.tsx — new field set
├── src/shared/components/primitives/layout/stack/        # REMOVED
├── src/shared/components/primitives/content/text/        # schema.ts, types.ts, text.tsx — new field set
├── src/shared/components/primitives/content/image/       # schema.ts, types.ts, image.tsx — new field set
├── src/shared/components/primitives/content/iframe/      # schema.ts, types.ts, iframe.tsx — new field set
├── src/shared/components/primitives/content/icon/        # schema.ts, types.ts, icon.tsx — lucide-backed
│   └── icon-map.ts                                       # NEW — generated kebab-name → lucide component map
├── src/shared/components/primitives/actions/button/        # schema.ts, types.ts, button.tsx — container (Icon/Text children)
├── src/shared/components/primitives/actions/link/          # schema.ts, types.ts, link.tsx — container (Icon/Text children)
├── src/shared/components/ui/accordion/                    # schema.ts, types.ts, accordion.tsx — container
├── src/shared/components/ui/gallery/                      # NEW — promoted from tenants/vukans-bike/blocks/gallery/
├── src/shared/components/index.ts                         # registry: -stack, +gallery (moved), updated policies
├── src/tenants/vukans-bike/blocks/gallery/                # REMOVED (promoted to shared/ui/gallery)
├── src/tenants/vukans-bike/blocks/index.ts                # -gallery registration (now shared)
├── src/tenants/vukans-bike/mock-data/**                   # every page/collection migrated to new prop shapes
└── src/tenants/resort-example/mock-data/**                # minimum mechanical migration to keep building (per Assumption)

headless-cms-backend/
├── src/components/blocks/{flex,section,text,image,iframe,button,link,grid,icon,accordion,gallery}.json  # new field sets
├── src/components/blocks/stack.json                       # REMOVED
├── src/api/page/content-types/page/schema.json             # blocks DZ: remove blocks.stack
├── src/page-composition/nest-rules.ts                      # mirror composition-allow.ts changes (010/011 pattern)
├── src/admin/page-composition/field-catalog.ts             # icon field → Combobox path; drop stack from SCHEMAS
├── src/admin/page-composition/FieldInspector.tsx            # add a Combobox-based control for the icon name field
├── scripts/seed-vukans-bike-cms.js                          # reshape mock JSON → new schema on the way into Strapi
├── scripts/migrate-012-primitive-props.js                  # NEW — one-time convert for already-seeded Strapi content
└── types/generated/**                                       # regenerated (`npm run types:generate`)

.specify/memory/knowledge/{content-model,block-system,api-contract}.md
specs/_catalogs/vukans-bike.md
```

**Structure Decision**: Both packages, roughly evenly. Frontend owns the primitive definitions, registry, and nest-allow policy (source of truth per Constitution VI); backend mirrors the nest rules (established `010`/`011` pattern — Strapi can't import the Next app) and owns the component schemas + a one-time content-migration script for anything already seeded into Strapi before this change lands.

## Complexity Tracking

> No constitution violations requiring justification beyond the explicitly spec-approved Stack removal (see Principle V above).

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
