# Implementation Plan: Vukan's Bike Full Visual Redesign (Content-Only)

**Branch**: `008-bike-site-redesign` | **Date**: 2026-09-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-bike-site-redesign/spec.md`

## Summary

Redesign all nine public Vukan's Bike pages across three locales **without writing component code** — the
work is authored JSON (`mock-data/**`) plus the tenant theme (`config.ts`). Feature 007 already converted the
site to L1/L2 + Keep compounds; what is missing is design quality, and that is entirely expressible in props,
copy, composition and tokens.

Phase 0 turned up four constraints that shape everything (see [research.md](./research.md)): the typeface is
not changeable in scope (R1), the muted text color is not themeable and therefore anchors the palette (R2),
overriding `fontSize` breaks line-height on every variant except `body` (R3), and `clamp()` passes through box
styles so the design can still be genuinely fluid (R4). From those: a **light editorial palette keeping the
brand red** (R5), a **flagship-bike band authored from primitives instead of `product-list`** (R6), and a set
of authoring rules captured as a design-system contract.

Target: **zero component-code diff.** Every spec requirement is reachable through data, and the two candidate
code defects (`product-list`'s no-op `category` prop, its `<a href>` navigation) sit in a block this cycle no
longer references — touching them would be a drive-by edit under Principle V. They are logged as
recommendations instead.

## Technical Context

**Language/Version**: TypeScript; Node.js 20+; Next.js 15 (frontend only — no backend work in this feature)

**Primary Dependencies**: Next.js 15, React 19, Tailwind, Zod (unchanged; nothing added)

**Storage**: Tenant mock JSON (`src/tenants/vukans-bike/mock-data/**`) via `MockAdapter`; no Strapi, no DB

**Testing**: `pnpm type-check`; `pnpm lint:bike` + `pnpm lint:resort`; `pnpm build:bike` + `pnpm verify:build`;
grep sweep V1–V14 and the visual/first-impression review in [quickstart.md](./quickstart.md)

**Target Platform**: Vercel (bike project); local verification at `http://localhost:3002`

**Project Type**: Monorepo — frontend tenant content only

**Performance Goals**: Unchanged; no new assets pipeline. Reused Cloudinary images already carry
`q_auto/f_auto`

**Constraints**: JSON + `config.ts` only; no `shared/` edits; no new primitives, block types, routes or
templates; tenant proprietary components editable only for defects (FR-002) and currently expected to be
untouched; catalog stays at one product; Strapi out of scope

**Scale/Scope**: 9 pages × 3 locales = 27 page files, + 3 navigation files, + `config.ts` = **31 files**

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. One build, one tenant | Pass | Only `tenants/vukans-bike/**` is touched; `lint:resort` and `verify:build` are the guard |
| II. Strict layer boundaries | Pass | No `shared/` or `core/` edits; no cross-tenant imports; theme flows through the existing provider |
| III. Single route, block composition | Pass | No new routes or templates; all nine pages stay `template: "default"` |
| IV. Spec Kit single source of truth | Pass | Same change set must update `knowledge/mock-data.md` + `specs/_catalogs/vukans-bike.md` (sync map) |
| V. Minimal, focused changes / no drive-by edits | Pass | Zero-component-diff target; page look lives in props and tokens. Defects found in unreferenced blocks are reported, not fixed — see [shared-recommendations.md](./contracts/shared-recommendations.md) |
| VI. Data adapter contract | Pass | Mock adapter only; no adapter, REST or content-model change |
| VII. Clean, maintainable code | Pass | JSON authoring: sequential unique ids, no dead fields, identical locale trees |

**Post-design re-check**: Still Pass. Phase 1 introduced no new types, props or registrations — the design
system is expressed entirely in existing box styles and variants. The one file outside `mock-data/` is
`config.ts`, which the spec explicitly puts in scope (FR-016) and which the sync map already routes to the
tenant catalog.

## Project Structure

### Documentation (this feature)

```text
specs/008-bike-site-redesign/
├── plan.md                              # This file
├── research.md                          # Phase 0 — R1–R11 constraint findings + palette decision
├── data-model.md                        # Phase 1 — theme/text/band/page entities + V1–V14
├── quickstart.md                        # Phase 1 — run, gates, validation sweep, visual review
├── contracts/
│   ├── design-system.md                 # Authoring vocabulary: tokens, type roles, patterns
│   ├── page-blueprints.md               # Per-page band order, surfaces, removals
│   ├── shared-recommendations.md        # FR-013 register — owner decides, not implemented
│   └── asset-inventory.md               # Photo → page/band assignment (written during tasks T004)
├── checklists/requirements.md
└── tasks.md                             # /speckit-tasks (not this command)
```

### Source Code (packages touched)

```text
next-headless-cms-fe/
└── src/tenants/vukans-bike/
    ├── config.ts                        # theme palette, radius, honest font stack, drop photo logoUrl
    └── mock-data/
        ├── pages/*.json                 # 9 pages × sl/en/de — full re-author
        └── navigation.json, en--, de--  # header trimmed to 6, footer keeps 8, footerCopy rewritten

.specify/memory/knowledge/mock-data.md   # Spec Kit sync
specs/_catalogs/vukans-bike.md           # Spec Kit sync
```

**Structure Decision**: Frontend only, tenant only. No `shared/`, no `core/`, no `app/`, no backend, no CI.
`collections/products.json` is read but not modified — the catalog stays at one entry (FR-015).

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
| Design system contract | [contracts/design-system.md](./contracts/design-system.md) |
| Page blueprints | [contracts/page-blueprints.md](./contracts/page-blueprints.md) |
| Shared recommendations | [contracts/shared-recommendations.md](./contracts/shared-recommendations.md) |
| Quickstart | [quickstart.md](./quickstart.md) |

## Implementation outline (for `/speckit-tasks`)

1. **Theme** — apply the eight-token palette, `borderRadius: "0rem"`, an honest font stack, and remove the
   photo `logoUrl` in `config.ts`. Everything downstream is authored against these roles, so this lands first.
2. **Chrome** — rewrite `navigation.json` + `en--` / `de--`: header to six items, footer to eight,
   `footerCopy` in the new voice.
3. **Pages, `sl` first** — author each page against [page-blueprints.md](./contracts/page-blueprints.md) using
   the patterns in [design-system.md](./contracts/design-system.md), in this order: Home (sets the bar),
   Shop, Service, About, Contact, Brands, Bike school, Guided tours, Bike detail. Each page: renumber ids,
   delete dead fields, rewrite copy and SEO, curate imagery.
4. **Locale mirrors** — copy each finished `sl` tree to `en--*` / `de--*`, changing strings and `seo` only.
5. **Validation sweep** — V1–V14 greps, then the per-page and site-wide visual review at 375/768/1280.
6. **Spec Kit sync** — update `knowledge/mock-data.md` and `specs/_catalogs/vukans-bike.md` (page → block
   tables, theme note, single-product catalog note) in the same change set.
7. **Gates** — `type-check`, `lint:bike`, `lint:resort`, `build:bike`, `verify:build`.
8. **Hand back the recommendations** — surface
   [shared-recommendations.md](./contracts/shared-recommendations.md) to the owner; implement nothing from it
   without an explicit go-ahead.
