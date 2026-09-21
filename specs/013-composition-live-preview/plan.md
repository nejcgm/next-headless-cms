# Implementation Plan: Composition Live Preview

**Branch**: `013-composition-live-preview` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/013-composition-live-preview/spec.md`

## Summary

The page composition surface becomes three columns: block tree, a draft preview of the public page, and the field inspector. Unsaved `blocks` are posted into that preview and applied only for the draft render. Save in the preview column uses the content admin's existing Save control.

## Technical Context

**Language/Version**: TypeScript; Node.js 20+; Next.js 15 (frontend); Strapi 5.44 (backend)

**Primary Dependencies**: Next.js 15, React 19, Strapi 5 admin custom field

**Storage**: No new Strapi field. Preview overlay is in-memory on the frontend server (two-minute TTL).

**Testing**: Manual quickstart. `pnpm type-check` in the frontend. Admin `tsc` for the composition surface.

**Target Platform**: Local admin `:1337` and bike frontend `:3002`. Framing allowed from `STRAPI_URL`.

**Project Type**: Monorepo — admin composition surface plus frontend draft render

**Performance Goals**: Preview follows an edit within about a second (debounce under that budget)

**Constraints**: Do not write the page document to refresh the preview. One tenant build. Do not add a second renderer.

**Scale/Scope**: Page edit view only. `vukans-bike` draft pages.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Result |
|-----------|--------|
| I. One build, one tenant | Pass. Overlay is keyed inside the single frontend build. |
| II. Layer boundaries | Pass. Listener and store live in `core/` and `app/`. The admin does not import the frontend. |
| III. Single route | Pass. The preview is the existing page route in draft mode. |
| IV. Spec Kit | Pass. This feature's artifacts plus knowledge/catalog notes in the same change. |
| V. Minimal changes | Pass. Layout of the composition host, a draft-only listener, framing header. No primitive restyles. |
| VI. Adapter contract | Pass. Saved page reads are unchanged. The overlay replaces `blocks` only for a draft render. |
| VII. Clean code | Pass. No new comments inside types. |

Post-design: still pass. No new tenant exception and no new page route.

## Project Structure

### Documentation (this feature)

```text
specs/013-composition-live-preview/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/compose-preview.md
└── tasks.md
```

### Source Code (repository root)

```text
headless-cms-backend/src/admin/page-composition/
├── PageCompositionHost.tsx
└── preview/
    └── CompositionPreview.tsx

next-headless-cms-fe/src/
├── app/[domain]/[[...slug]]/page.tsx
├── app/api/compose-preview/route.ts
├── core/preview/compose-session.ts
├── core/preview/compose-preview-listener.tsx
└── next.config.ts             # frame-ancestors
```

**Structure Decision**: Admin layout and message live in the Strapi custom field. The draft page applies the overlay. No Strapi schema change.

## Complexity Tracking

No constitution violations.
