# Implementation Plan: Vukan's Bike Site Primitives Redesign

**Branch**: `007-bike-site-primitives` | **Date**: 2026-09-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-bike-site-primitives/spec.md`

## Summary

Redesign **all** public Vukan's Bike pages as **L1/L2 composition trees** (existing shared primitives: `section`, `stack`, `flex`, `grid`, `heading`, `text`, `image`, `button`) plus the **Keep** L3 compounds (`product-list`, `bike-detail`, `contact`, `gallery`, `partners-gallery`, `service-pricing`, `service-faq`). Replace then **delete** expressible shared opaques and bike proprietary sections from FE + Strapi. **Vukan's Bike is SOT**: when a shared opaque is deleted, **drop** those nodes from `resort-example` mocks (no fixture redesign). **Design quality is an acceptance gate** (FR-012) — craft-led Apače brand, not vibecoded template stacks. Delivery is **mock-first** (`dataAdapter: "mock"` for verify); Strapi schema cleanup matches the same model (live re-seed ops follow-on).

Home (sl/en/de) already proves the composition language — extend that bar to every other public page, then remove dead types.

## Technical Context

**Language/Version**: TypeScript; Node.js 20+; Next.js 15 (frontend); Strapi 5.44 (backend)

**Primary Dependencies**: Next.js 15, React 19, Strapi 5, Zod, Tailwind (frontend); Strapi core (backend)

**Storage**: Bike mock JSON (authoring/verify); Strapi page DZ + component schemas (cleanup); SQLite/Postgres per env for live CMS later

**Testing**: `pnpm type-check`; `pnpm lint:bike` / `pnpm lint:resort`; `pnpm verify:build` (bike + resort); manual page + locale review per [quickstart.md](./quickstart.md); design checklist SC-005/SC-006

**Target Platform**: Vercel (frontend per tenant); Railway/self-hosted Strapi

**Project Type**: Monorepo — frontend + headless CMS backend

**Performance Goals**: Marketing-site norms; existing composition maxDepth policies (section ≤4, layouts ≤3)

**Constraints**: One build = one tenant; shared ↛ tenants; pnpm FE / npm BE; no new primitives unless composition fails; no visual editor; resort is fixture-only (drop shared nodes, keep resort proprietary)

**Scale/Scope**: ~9 public bike page types × 3 locales; delete ~6 shared opaques + ~10 bike proprietary expressible blocks; keep 7 L3 compounds + header/footer chrome; policy allowlist updates for nesting Keep L3 beside L1

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|--------|
| I. One build, one tenant | Pass | Bike content/registry cleanup; resort fixture drops only shared deleted nodes; no cross-tenant imports |
| II. Layer boundaries | Pass | Primitives stay `shared/`; Keep compounds stay `tenants/vukans-bike/`; core renderer/adapters unchanged unless allowlists need policy edits in shared schemas |
| III. Single route, block composition | Pass | Still one `[[...slug]]` route; richer trees in mocks |
| IV. Spec Kit SoT | Pass | Implement must update `block-system`, `content-model`, `mock-data`, catalogs in same change set |
| V. Minimal focused changes | Pass | No new engine; content + delete dead blocks + small policy allowlist extension |
| VI. Data adapter contract | Pass | Mock-first verify; Strapi DZ/components aligned; no REST shape change beyond DZ component list |
| VII. Clean maintainable code | Pass | Delete superseded folders; no comment essays; match existing block/schema patterns |

**Post-design re-check**: Still Pass — composition contract reused from 006; this feature is content + inventory cleanup + allowlist for Keep L3 nesting. Resort tenant `hero` may remain as fixture-only FE (mock) while Strapi `blocks.hero` is removed from the product DZ (bike SOT).

## Project Structure

### Documentation (this feature)

```text
specs/007-bike-site-primitives/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── page-block-inventory.md
└── tasks.md                 # /speckit-tasks (not this command)
```

### Source Code (packages touched)

```text
next-headless-cms-fe/
├── src/shared/components/blocks/
│   ├── {section,stack,flex,grid}/schema.ts   # extend allowlists for Keep L3
│   ├── index.ts                              # unregister deleted shared opaques
│   └── {cta-banner,stats-bar,image-text,section-header,rich-text,image-gallery}/  # DELETE
├── src/tenants/vukans-bike/
│   ├── config.ts                             # mock adapter for verify (revert/document for prod)
│   ├── blocks/index.ts                       # Keep-only tenant registrations
│   ├── blocks/{hero,about-*,bike-school-*,guided-tour-experience,service-process,service-contact}/  # DELETE
│   └── mock-data/pages/*.json                # full site redesign (all locales)
├── src/tenants/resort-example/mock-data/pages/*.json  # DROP deleted shared nodes only

headless-cms-backend/
├── src/api/page/content-types/page/schema.json   # DZ: L1 + Keep only
├── src/components/blocks/{superseded}.json       # DELETE
└── types/generated/*                             # regenerate

.specify/memory/knowledge/{block-system,content-model,mock-data}.md
specs/_catalogs/{vukans-bike,resort-example}.md
```

**Structure Decision**: Both FE and BE. Primary work is bike mock redesign + registry/Strapi deletion. Core composition engine from 006 is reused. No new Next routes.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Phase 0 & 1 outputs

| Artifact | Path |
|----------|------|
| Research | [research.md](./research.md) |
| Data model | [data-model.md](./data-model.md) |
| Contract | [contracts/page-block-inventory.md](./contracts/page-block-inventory.md) |
| Quickstart | [quickstart.md](./quickstart.md) |

## Implementation outline (for `/speckit-tasks`)

1. **Allowlists**: Extend L1 layout policies so Keep L3 types may nest under `section`/`stack`/`flex`/`grid` (same pattern as `product-list`).
2. **Page redesign (mock JSON)**: For each public page (shop, service, about, contact, brands, bike-school, guided-tours, bike-detail framing if needed), author L1/L2 + Keep trees in sl → mirror structure to en/de with localized copy. Raise home to FR-012 bar if gaps remain. Prefer **px** box styles; `heading` for titles; brand-first first viewport.
3. **Resort fixture**: Remove `cta-banner`, `stats-bar`, `section-header` (and any other deleted shared) nodes from resort mocks — do not rebuild with primitives.
4. **FE delete**: Unregister + delete shared opaque folders; unregister + delete bike proprietary Replace types; leave Keep + resort proprietary (including resort `hero`).
5. **Strapi delete**: Trim page DZ to L1 + Keep; delete superseded component JSON; `npm run types:generate`.
6. **Spec Kit sync**: `block-system`, `content-model`, `mock-data`, `vukans-bike` + `resort-example` catalogs.
7. **Verify**: type-check, lint both tenants, `verify:build`, quickstart design review checklist.
