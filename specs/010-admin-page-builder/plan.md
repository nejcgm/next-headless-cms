# Implementation Plan: Admin Page Builder

**Branch**: `010-admin-page-builder` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-admin-page-builder/spec.md`

## Summary

Give Strapi Page editors a **single composition surface** for the whole page body (add / nest / reorder / edit / delete) so they are not stuck on nested JSON or the Section-only native picker. **Storage stays** `page.blocks` (root dynamic zone) plus nested **`slots` JSON** on Section, Stack, Flex, and Grid — the 006 wire. **Revert** the Section `children` dynamic-zone experiment and **auto-convert** existing children into `slots`. Nest pickers and save validation **match** live frontend allowlists and maxDepth (Flex→Flex allowed; Stack↛Grid; Section↛Section; Keep leaves). Identity/SEO stay on the native Page form. A **collapsed, editable JSON fallback** is the same `blocks` tree, not a second field. Public renderer unchanged; write path **hard-fails** illegal nests.

## Technical Context

**Language/Version**: TypeScript; Node.js 20+; Next.js 15 (frontend, compose-validate only); Strapi 5.44 (backend admin + schema)

**Primary Dependencies**: Strapi 5 admin (React 18, Design System, Content Manager form context); existing FE composition policy as the nest-rule template; Zod stays on the public FE, not imported into Strapi

**Storage**: `page.blocks` DZ + layout `slots` JSON `{ default: [...] }`; SQLite/Postgres per env; seed from bike mocks

**Testing**: Manual [quickstart.md](./quickstart.md); FE `pnpm type-check` / `pnpm check:types-style` if `compose-validate.ts` changes; `npm run types:generate` after Strapi schema edits

**Target Platform**: Strapi admin (authors); Vercel bike frontend (render); Railway/self-hosted Strapi

**Project Type**: Monorepo — **backend-primary** (admin + schema + seed + middleware); small FE adapter cleanup

**Performance Goals**: Editing one page tree (tens of nodes, depth ≤ section maxDepth 6); no new public ISR requirements

**Constraints**: One build = one tenant on the FE; do not invent a second page document shape; no nested-DZ product path; no pixel canvas; pnpm FE / npm BE; Spec Kit knowledge updated in the implement change set

**Scale/Scope**: Product tenant `vukans-bike` Page documents (3 locales). `resort-example` is not the authoring target.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|--------|
| I. One build, one tenant | Pass | Admin is Strapi, not a cross-tenant FE bundle. Keep picker extras keyed by `page.tenant`. |
| II. Layer boundaries | Pass | No new `shared/` → tenant imports. FE change is `core/data/strapi/compose-validate.ts` only. |
| III. Single route, block composition | Pass | No new Next routes; public composition pipeline unchanged. |
| IV. Spec Kit SoT | Pass | Implement updates content-model, block-system, api-contract, strapi-backend, vukans-bike catalog. |
| V. Minimal focused changes | Pass | Revert Section experiment; do not roll DZs to Flex/Stack/Grid; no primitive restyles. |
| VI. Data adapter contract | Pass | Unify nest wire on `slots`; coordinated FE fold removal + knowledge/api-contract. |
| VII. Clean maintainable code | Pass | Nest rules as data, not comment essays; field inspector from existing component JSON. |

**Post-design re-check**: Pass. `slots` JSON remains the documented composition exception (006). Hiding the native DZ widget is an admin UX constraint, not a new public schema. Duplicating nest-rules in the backend is required because Strapi cannot import the Next app; contract [nest-rules.md](./contracts/nest-rules.md) states the sync duty.

## Project Structure

### Documentation (this feature)

```text
specs/010-admin-page-builder/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── composition-storage.md
│   ├── nest-rules.md
│   └── page-composition-admin.md
├── checklists/requirements.md
└── tasks.md                 # /speckit-tasks (not this command)
```

### Source Code (packages touched)

```text
headless-cms-backend/
├── src/admin/app.tsx                      # enable admin extension
├── src/admin/page-composition/            # tree, inspector, JSON fallback
├── src/page-composition/                  # nest-rules, convert, validate (server + shared logic)
├── src/index.ts                           # document-service middleware
├── src/components/blocks/section.json     # children DZ → slots JSON
├── src/components/blocks/{stack,flex,grid}.json  # hide native slots in CM
├── src/api/page/content-types/page/schema.json   # unchanged blocks DZ list
├── scripts/convert-section-children-to-slots.js
└── scripts/seed-vukans-bike-cms.js        # keep section slots

next-headless-cms-fe/
└── src/core/data/strapi/compose-validate.ts  # drop children-DZ fold

.specify/memory/knowledge/{content-model,block-system,api-contract,strapi-backend}.md
specs/_catalogs/vukans-bike.md
```

**Structure Decision**: Backend admin + schema/seed/middleware are the feature. Frontend only stops treating Section `children` as a second nest format. No new FE routes, blocks, or tenants.

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
| Contracts | [contracts/composition-storage.md](./contracts/composition-storage.md), [contracts/nest-rules.md](./contracts/nest-rules.md), [contracts/page-composition-admin.md](./contracts/page-composition-admin.md) |
| Quickstart | [quickstart.md](./quickstart.md) |

## Implementation outline (for `/speckit-tasks`)

1. **Convert + schema**: script for existing pages; `section.json` `children` → `slots`; hide native `slots` JSON in CM; seed writes `slots`; `types:generate`.
2. **Server write path**: convert + nest-rule **hard-fail** on `api::page.page` document middleware.
3. **Admin UI**: composition tree bound to `blocks`; hide/replace native DZ; inspector from component schemas; collapsed JSON fallback; picker uses nest-rules (incl. Flex→Flex, tenant Keep extras).
4. **Frontend**: remove `children` fold in `compose-validate.ts`.
5. **Docs**: Spec Kit knowledge + bike catalog per R11.
6. **Verify**: [quickstart.md](./quickstart.md) on a draft page + one published nested page.
