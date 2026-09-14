# Implementation Plan: Vukan's Bike Mock-to-Strapi Migration & Editor-Friendly Schema

**Branch**: `009-bike-strapi-migration` | **Date**: 2026-09-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-bike-strapi-migration/spec.md`

## Summary

Cut the vukans-bike tenant over from the mock JSON adapter to a real, running Strapi backend, while
redesigning the Strapi component schemas so a non-technical editor can author content through dropdowns,
number inputs, and toggles instead of hand-typed CSS-flavored strings. The backend cannot start at all today
— Phase 0 traced this to one drifted column (`grid.columns`, `integer` in the live database vs. `json` in the
committed schema) and, per the clarify session, the fix is a full database reset followed by a fresh re-seed,
not a hand migration of stale rows.

Beyond that fix, seven field-level redesigns (R7–R13, each backed by an exact usage count grepped from the
current 27-page corpus, not a guess) close the real "editor can't touch this without coding knowledge" gaps:
color/surface tokens, font sizes, the broken grid-columns field itself, and a small set of border/width/height
patterns that turned out to have only ever held 1–3 distinct values in practice. Two genuinely orphaned shared
components (`cta-link`, `stat-item`) are deleted. One known dead field (`product-list.category`, a no-op) is
removed while its schema is already being touched. A cross-tenant check (R16) confirmed only one place in
`resort-example` touches any field this feature changes — the frontend keeps full backward compatibility for
it, so nothing there breaks.

Everything else stays exactly as it renders today (SC-002) — this is a plumbing-and-editing-experience
migration, not a redesign.

## Technical Context

**Language/Version**: TypeScript; Node.js 20+ (confirmed `v24.15.0` in range); Next.js 15 (frontend); Strapi
5.44.0 (backend, confirmed exact pin)

**Primary Dependencies**: Next.js 15, React 19, Zod, Tailwind (frontend); Strapi core, `pg` (backend) — no new
dependencies added by this feature on either side

**Storage**: **This feature is the cutover itself** — vukans-bike moves from mock JSON (`fs.readFileSync`) to
the already-provisioned Railway Postgres instance named in `headless-cms-backend/.env`. That database is
currently unusable (schema-drifted, crashes on boot) and gets a full reset (drop + recreate `public` schema)
before Strapi's own boot-time sync recreates every table fresh from this feature's schema definitions.
`resort-example` is unaffected — stays on mock JSON, never touches Strapi.

**Testing**: `pnpm type-check`; `pnpm lint:bike` + `pnpm lint:resort` (both, since shared files are touched);
`pnpm build:bike` + `pnpm build:resort` + `verify:build` for both; backend `npm run develop` (clean-boot
check) + `npm run types:generate`; the M1–M14 validation sweep and the two manual walkthroughs (visual parity,
editor experience) in `quickstart.md` — the latter two cannot be fully automated and are explicit gates in
their own right (SC-002–SC-004)

**Target Platform**: Vercel (frontend, unchanged); Strapi application process — **hosting location for
production traffic is explicitly out of scope** (spec Assumptions); the Railway Postgres database is already
provisioned and is what this feature resets and (from then on) actually uses

**Project Type**: Monorepo — this feature spans **both** packages (frontend `shared/` + one tenant, and the
full Strapi backend) — the widest-reaching feature in this repo's Spec Kit history to date, matched by the
widest research/verification pass (R1–R17)

**Performance Goals**: Unchanged from existing CMS norms — Strapi fetch timeout 15s, ISR revalidate 60–300s by
content type (`api-contract.md`); no new performance requirement introduced

**Constraints**: One build = one tenant, unchanged; pnpm only in `next-headless-cms-fe/`, npm only in
`headless-cms-backend/`; every shared-file change verified to have zero content-level footprint in
`resort-example` except one (`grid.columns`'s legacy shorthand), which is kept working via backward
compatibility rather than migrated away (R16); the database reset targets the *existing* configured database,
not a new one, per the clarified answer

**Scale/Scope**: 10 shared L1/L3 components + 2 shared sub-components get schema changes (`section`, `grid`,
`text`, `stack`/`flex`/`image`/`iframe`/`icon`/`button`/`link` get the box-style-level changes, `accordion`
gets a narrower version); 1 tenant Keep component loses a dead field (`product-list`); 2 shared components
deleted (`cta-link`, `stat-item`); 3 content-types get Draft & Publish confirmed/enabled on 2 of them; content
parity target is the existing 27 pages (9 slugs × 3 locales) + 3 navigation files + 1 product × 3 locales,
already fully authored — no new content is written, only reshaped field-by-field at seed time

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. One build, one tenant | Pass | vukans-bike becomes Strapi-backed; resort-example stays mock-only, untouched in content/config. `verify:build` (both tenants) is a required gate in `quickstart.md`. |
| II. Strict layer boundaries | Pass | All component changes stay within `shared/` (primitives) or `tenants/vukans-bike/` (product-list); Strapi backend is its own package, not a frontend layer. No new `core/`↔`tenants/` coupling introduced. |
| III. Single route, block composition | Pass | No new routes, no new templates. Same `[[...slug]]` catch-all, same block registry shape. |
| IV. Spec Kit single source of truth | Pass | `content-model.md`, `api-contract.md`, `strapi-backend.md`, `block-system.md`, and the vukans-bike catalog all get updated in the same change set (`contracts/frontend-changes.md`, final section). |
| V. Minimal, focused changes / no drive-by edits | Pass, with the size explicitly justified | This is a large diff by field count, but every single field change traces to an explicit, empirically-justified reason (R7–R15) — not opportunistic tidying. Deliberately **excluded** as out-of-scope drive-bys: `gallery`'s hardcoded masonry/reveal count, `product-list`'s hardcoded grid/section-wrapper, the theme/font system, any visual page-builder surface — all remain open items in `008-bike-site-redesign`'s shared-recommendations register, untouched here. |
| VI. Data adapter contract | Pass — this principle describes exactly this kind of change | "REST contract changes require coordinated updates: backend schema, `strapi.adapter.ts`, frontend types, and Spec Kit knowledge docs in one change set" is precisely what `contracts/schema-changes.md` + `contracts/frontend-changes.md` together deliver. `strapi.adapter.ts` and `mock.adapter.ts` itself needs **no change** (R5) — the redesign was deliberately shaped so every field lives on the component's own schema, never requiring adapter-level special-casing. |
| VII. Clean, maintainable code | Pass | New enums/booleans get plain, descriptive names (`dividerTop`, `fullWidth`, `surface`, `heroHeight`) with no inline comments needed: the names carry the meaning. Internal step-mapping tables (e.g. `text`'s fontSize→CSS lookup) are the one place a short comment explaining *why* a fixed line-height is forced may be warranted (non-obvious invariant, per Principle VII's own carve-out). |

**Post-design re-check**: Still Pass. Phase 1 design surfaced one real risk (the `resort-example` grid using
legacy `columns` shorthand) and resolved it with backward compatibility rather than either breaking the other
tenant or expanding this feature's stated scope to touch it — exactly the discipline Principle V and FR-012
both ask for.

## Project Structure

### Documentation (this feature)

```text
specs/009-bike-strapi-migration/
├── plan.md
├── research.md                       # R1–R17
├── data-model.md                     # Full before/after schema tables + migration mappings + M1–M14
├── quickstart.md                     # Run, gates, validation sweep, visual + editor walkthroughs
├── contracts/
│   ├── schema-changes.md             # Exact Strapi component/content-type attribute diffs
│   ├── frontend-changes.md           # Exact frontend file-by-file changes + Spec Kit doc sync list
│   └── admin-setup.md                # DB reset runbook + manual Strapi admin one-time setup
└── tasks.md                          # /speckit-tasks (not this command)
```

### Source Code (packages touched — both)

```text
next-headless-cms-fe/
├── src/shared/
│   ├── utils/box-style.ts                                    # color/backgroundColor/border enums; dividerTop/fullWidth; remove borderTop/width/minHeight/lineHeight
│   ├── components/primitives/layout/section/{section.tsx,types.ts,schema.ts}   # surface, heroHeight
│   ├── components/primitives/layout/grid/{grid.tsx,types.ts,schema.ts}         # columnsMobile/Tablet/Desktop (additive)
│   ├── components/primitives/content/text/{text.tsx,types.ts,schema.ts}        # fontSize enum + customFontSize
│   └── components/ui/accordion/{accordion.tsx,types.ts,schema.ts}              # backgroundColor/border enums
├── src/tenants/vukans-bike/
│   ├── config.ts                                              # dataAdapter: "mock" → "strapi"
│   └── blocks/product-list/{types.ts,schema.ts}                # remove dead `category`
└── (mock-data/** — NOT modified; stays the authoring/reference source the seed script reads from)

headless-cms-backend/
├── src/components/blocks/{section,grid,text,product-list,stack,flex,image,iframe,icon,button,link}.json
├── src/components/shared/{seo,nav-item,nav-item-child,footer-copy,image-item,accordion}.json   # narrower changes
├── src/components/shared/{cta-link,stat-item}.json             # DELETE
├── src/api/{page,product}/content-types/*/schema.json           # draftAndPublish: true
└── scripts/seed-vukans-bike-cms.js                              # field-shape transform at seed time

.specify/memory/knowledge/{content-model,api-contract,strapi-backend,block-system}.md
specs/_catalogs/vukans-bike.md
```

**Structure Decision**: Both packages, deliberately. This is the first feature in this repo where that's the
correct shape — `strapi.adapter.ts` needs zero changes (R5), so the "backend + frontend coordinated update"
required by Principle VI is fully satisfied by touching `shared/` component files (schema + rendering logic)
and the backend's own component/content-type JSON, without ever touching the adapter/transform layer itself.

## Complexity Tracking

> No constitution violations requiring justification — see Principle V's row above for why this feature's
> size is itself already the justification, not an exception to it.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Phase 0 & 1 outputs

| Artifact | Path |
|----------|------|
| Research | [research.md](./research.md) |
| Data model | [data-model.md](./data-model.md) |
| Schema changes contract | [contracts/schema-changes.md](./contracts/schema-changes.md) |
| Frontend changes contract | [contracts/frontend-changes.md](./contracts/frontend-changes.md) |
| Admin setup / DB reset contract | [contracts/admin-setup.md](./contracts/admin-setup.md) |
| Quickstart | [quickstart.md](./quickstart.md) |

## Implementation outline (for `/speckit-tasks`)

1. **Frontend schema/component changes first** (`contracts/frontend-changes.md`) — these can be built and
   type-checked/linted against the *existing* mock-data content before Strapi is touched at all, since the
   frontend Zod schemas are additive/backward-compatible everywhere except `text.fontSize` and the
   `section.surface`/`backgroundColor` collapse (both vukans-bike-only in practice — R16). Run `pnpm
   type-check`, `pnpm lint:bike`, `pnpm lint:resort` before moving on.
2. **Backend schema changes** (`contracts/schema-changes.md`) — apply every component/content-type JSON diff.
   Do not attempt to boot yet.
3. **Database reset** (`contracts/admin-setup.md` §1) — with explicit re-confirmation immediately before the
   destructive step, regardless of this spec's prior authorization.
4. **First boot + manual admin setup** (`contracts/admin-setup.md` §2) — confirm clean boot (M1–M2), then
   admin account, Public find permissions, API token, webhook, Draft & Publish spot-check.
5. **Seed script update + run** (`contracts/frontend-changes.md`'s seed-script section, `contracts/admin-setup.md` §3) — apply the R7–R13 field transforms while building payloads from the untouched mock JSON, run against the fresh database.
6. **Cut the frontend over** (`contracts/admin-setup.md` §4) — flip `dataAdapter`, point at the real API
   token, run the full validation sweep (M1–M14) and both manual walkthroughs from `quickstart.md`.
7. **Spec Kit sync** — `content-model.md`, `api-contract.md`, `strapi-backend.md`, `block-system.md`,
   `specs/_catalogs/vukans-bike.md`, in the same change set.
8. **Gates** — `type-check`, `lint:bike`, `lint:resort`, `build:bike` + `verify:build`, `build:resort` +
   `verify:build`, backend `types:generate`.
