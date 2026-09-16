# Research: Page Builder Editor Experience Upgrade

**Feature**: `011-page-builder-polish`
**Date**: 2026-09-14

Phase 0 decisions. Grounded in the actual shipped `010-admin-page-builder` source (`headless-cms-backend/src/admin/page-composition/*`, `src/page-composition/*`), its spec/research/contracts, and the installed `@strapi/strapi@5.44.0` / `@strapi/content-manager` / `@strapi/admin` package internals (types read directly from `node_modules`, not assumed from memory).

## R1 — Replace the DOM-scraping mount with Strapi's field-type registration API

**Decision**: Register the composition host via `app.addFields({ type: 'dynamiczone', Component: PageCompositionHost })` in `src/admin/app.tsx`'s `register(app)` lifecycle (currently unused — the file only implements `bootstrap`), instead of the current `useHideNativeBlocksField` DOM-text-scanning hook (`hide-native-blocks.ts`) plus manual `document.querySelector('main form')` portal mount in `PageCompositionHost.tsx`.

**Rationale**: `@strapi/admin`'s `StrapiApp.addFields` (`node_modules/@strapi/admin/dist/admin/src/StrapiApp.d.ts`) registers an input `Component` keyed by Strapi attribute **type**, rendered wherever the Content Manager form encounters that type. `010`'s own research (R3) already established that after reverting the Section `children` experiment, `page.blocks` is the **only** `dynamiczone` attribute anywhere in this backend — so binding by type is, in practice, exactly as scoped as binding by `uid + fieldName`, but via a documented extension point instead of matching on CSS class fragments (`[class*="GridItem"]`) and literal English label text (`el.textContent?.trim() !== 'Blocks'`), which breaks silently on an admin UI restyle or a non-English admin locale. This directly answers the "open implementation detail" `010`'s research R12 left unresolved (it only found `injectComponent('editView', 'right-links', ...)`, which adds a *side panel*, not a field replacement — hence the DOM-hiding workaround it shipped with).

**Verify during implementation**: confirm the exact runtime props Strapi passes to a registered field `Component` (expected: `{ name, value, onChange, attribute, ... }`, matching other native field inputs) — the type surface stops at `{ type: string; Component: React.ComponentType }` with no exported props interface, so this needs a quick console-log/read-generated-JS check against the installed version before relying on it, same as `010` R12's own caveat.

**Fallback**: if the registered component does not receive the form field's `onChange`/`value` cleanly (e.g. Strapi validates `dynamiczone` shape before handing it to a custom field and rejects the composition tree's intermediate states), keep today's `injectComponent('editView', 'right-links', ...)` portal approach but replace the label-text/class-fragment matching in `hide-native-blocks.ts` with a scoped, versioned selector (e.g. a `data-*` attribute Strapi's own DZ input already renders, if one exists) and a single retry instead of an indefinite `MutationObserver`.

**Alternatives considered**:

| Option | Rejected because |
|--------|-------------------|
| Keep current DOM-text-scraping hook | Named directly in FR-015/Assumptions as the code-quality debt this feature exists to pay down; breaks on admin restyle or non-English locale |
| Strapi Custom Fields API (`customFields`) | Per `010` R1: cannot wrap `dynamiczone`/`component` attribute types — confirmed again here, unchanged in 5.44 |
| `addEditViewSidePanel` | Same rejection as `010` R1 — a side panel, not the main field; too narrow for the full tree + inspector |

## R2 — Live preview: enable Strapi 5.44's native Content Manager preview, don't build one

**Decision**: Enable `admin.preview` in `headless-cms-backend/config/admin.ts` (`Core.Config.Admin.preview: { enabled: true, config: { handler, allowedOrigins } }` — type already present in the installed `@strapi/types`, currently unset) rather than building a bespoke in-admin iframe/postMessage preview panel from scratch.

**Rationale**: `node_modules/@strapi/content-manager/dist/admin/src/preview/` ships a **complete** first-party preview feature already installed: a routed `Preview` page, `PreviewSidePanel` (a `PanelComponent`, auto-registered once `preview.enabled` is true — no custom React needed for the panel chrome itself), a `GetPreviewUrl` query that calls our `handler`, and an optional `previewScript` injected into the iframe for field-focus highlighting (`strapiFieldFocus`/`strapiFieldChange` postMessage events). This is dramatically less code and more consistent with Strapi's own UX than a hand-built panel, and matches the "reuse existing adapters/patterns" default already used for the composition tree itself.

**`handler(uid, { documentId, locale, status })`** (server-side, `config/admin.ts`): for `uid === 'api::page.page'`, look up `slug` via `strapi.documents('api::page.page').findOne({ documentId, locale })`, then return `` `${PREVIEW_BASE_URL}/api/preview?secret=${PREVIEW_SECRET}&slug=${slug}` `` — reusing the **existing, unchanged** `next-headless-cms-fe/src/app/api/preview/route.ts` (enables Next.js Draft Mode, redirects to the page). `PREVIEW_BASE_URL` is a new backend env var (the bike frontend's origin — `http://localhost:3002` in dev); `PREVIEW_SECRET` already exists as a frontend env var and must be shared with the backend the same way `STRAPI_API_TOKEN` already crosses that boundary today (both env files, not committed).

**`allowedOrigins`**: the bike frontend origin only (dev + prod), not a wildcard.

**Rationale for `resort-example` exclusion**: it has no Strapi content type to key `uid` off of (`dataAdapter: "mock"`), so the handler only branches on `api::page.page` and returns `null`/`undefined` for anything else (per `PreviewConfig.handler`'s typed return of `string | null | undefined`).

**Alternatives considered**:

| Option | Rejected because |
|--------|-------------------|
| Custom iframe + `postMessage` panel built into `PageCompositionHost.tsx` | Strapi already ships this; duplicates first-party functionality the installed version provides for free |
| A dedicated Next.js "preview mode" route separate from `/api/preview` | `/api/preview` already does exactly what's needed (draft mode + redirect); a second route would be a second, parallel preview path (spec Assumption explicitly rules this out) |
| Public, unauthenticated shareable preview link | Out of scope (spec) — Strapi's native preview is admin-authenticated only, matching that boundary for free |

## R3 — Preview freshness: rely on the normal Save button, not a background autosave

**Decision**: No autosave. The preview reflects whatever was last written by the editor's own explicit Save (Strapi's native document-save flow) — the composition surface itself never calls a document-write action on a timer.

**Rationale**: An earlier version of this feature called `unstable_useDocumentActions().update()` on a debounce timer to keep the preview fresh without a manual save. In practice this caused real data loss: if the editor kept editing while a debounced write was in flight, the in-progress edit could be silently overwritten once that write's response landed. Strapi's own Save button doesn't have this problem because it's the CM's own tested, first-party submit path; a bespoke background write triggered from inside a custom field, racing against `useField`'s live value, is not the same thing and isn't safe to route around. Given the choice the spec's Assumptions already flagged (accept a manual save as the freshness trigger vs. build a from-scratch parallel sync channel), losing edits is worse than an extra Save click — this is a correctness fix, not a preference.

**Alternatives considered**: Debounced autosave (reverted — see above); per-keystroke save (same class of problem, worse); a from-scratch in-memory preview channel bypassing persistence entirely (the bigger, explicitly out-of-scope alternative the spec's Assumptions already declined).

## R4 — CSP / frame-embedding check (residual verification, not a blocker)

**Decision**: Treat cross-origin iframe embedding (Strapi admin origin embedding the Next.js frontend origin) as needing a **narrow, explicit** allowance on both sides, verified empirically during implementation rather than assumed:

- Frontend: `next.config.ts` / `middleware.ts` currently set **no** `X-Frame-Options` or `Content-Security-Policy: frame-ancestors` (confirmed by grep) — nothing blocks embedding today, but if either is added later for unrelated hardening it must scope `frame-ancestors` to the Strapi admin origin, not omit the previewing origin.
- Backend: `strapi::security` (the default middleware in `config/middlewares.ts`, unmodified) sets a CSP via `koa-helmet`; whether its default directives already permit `frame-src`/`child-src` to the frontend origin, or need an explicit override, is confirmed by loading the preview panel in a dev build — not assumed here.

**Rationale**: Getting this wrong fails silently (a blank iframe, no console-visible product error) — worth one explicit quickstart verification step rather than a confident guess either way.

## R5 — Optional enhancement: field-focus highlighting (not required for SC-004)

**Decision**: Out of the required scope for this feature. Strapi's `previewScript` supports click-to-highlight/jump between the preview iframe and the edit form, but it is `shouldRun`-gated and needs the previewed page to cooperate (load a small listener). Baseline "see the current draft rendered, refreshed after a save" (R2–R3) satisfies FR-007/SC-004 without it. Revisit as a follow-on only if `010`/`011` telemetry or editor feedback says plain visual refresh isn't enough.

## R6 — Reorder: `@dnd-kit`, already resident, declare it explicitly

**Decision**: Use `@dnd-kit/core` + `@dnd-kit/sortable` for `CompositionTree`'s sibling reorder (root list and every `slots.default` array), replacing the Up/Down button pair. Add both as **explicit** `dependencies` in `headless-cms-backend/package.json` rather than relying on them undeclared.

**Rationale**: `@dnd-kit` is already present in `node_modules` (confirmed) as a transitive dependency of `@strapi/content-manager`, which uses it for the Content Manager's own repeatable-field drag handles — using it keeps the interaction model consistent with the rest of the admin and avoids adding a second drag library. Declaring it explicitly (rather than silently depending on Strapi's internal transitive graph) avoids a future Strapi upgrade silently breaking the build if that internal dependency is ever dropped or bumped — a direct, low-cost fix for FR-015/code-quality.

**Alternatives considered**: `react-dnd` (also transitively present, older API, no reason to prefer it over `@dnd-kit`, which Strapi's own newer UI already standardized on); keep Up/Down buttons (rejected — this is the literal ask in US1/FR-003).

## R7 — Block summary derivation (per-node label, not just type)

**Decision**: A small, explicit per-type mapping (`src/admin/page-composition/block-summary.ts`) from component type → which of its own fields to show, truncated, as the tree-row summary:

| Type | Summary source | Fallback |
|------|-----------------|----------|
| `text` | `content` (truncated ~40 chars) | type name |
| `button`, `link` | `label` | type name |
| `icon` | `name` | type name |
| `accordion` | `title` | type name |
| `image` | `alt`, else the last path segment of `src` | type name |
| `iframe` | `title` | type name |
| `gallery`, `product-list` | `heading` | type name |
| `bike-detail` | — | type name ("Bike detail") |
| `section`, `stack`, `flex`, `grid` | first non-empty summary among its own direct children, prefixed by type (e.g. "Stack: Cenik") | type name + child count (e.g. "Stack (3)") |

**Rationale**: Directly answers FR-002/SC-001 — the concrete, observed problem in the current MVP (`CompositionTree.tsx` `TreeRow` renders only `displayNameForType(type)`, so five `Text` blocks in one tree are indistinguishable). Layout types recursing into their first child's summary (rather than showing nothing) mirrors how an editor actually scans a page — "the section that starts with 'Cenik'" — without requiring a full text-rendering engine in the tree.

## R8 — Field grouping: reuse the box-style field set as the "Appearance" group

**Decision**: `field-catalog.ts`'s `fieldsFor(type)` gains a `group: 'content' | 'appearance'` per field, keyed off a fixed constant list matching the frontend's `boxStyleSchema` keys (`width`, `height`, `maxWidth`, `padding`, `margin`, `backgroundColor`, `color`, `border`, `dividerTop`, `fullWidth`, `borderRadius`, `overflow`, `fontSize`, `fontWeight`, `textAlign`) — any of those present on a component's schema is "Appearance"; everything else is "Content". `FieldInspector` renders content fields first, appearance fields in a visually separated second group.

**Rationale**: Directly answers FR-005. The list is not imported from the frontend package (cross-package import across `next-headless-cms-fe` ↔ `headless-cms-backend` is not how this repo shares policy — `010` R5 already established the "mirror, don't cross-import" pattern for `nest-rules.ts` vs. `composition-allow.ts`); this mirrors that same established pattern for the same reason (separate npm workspaces, Strapi cannot import the Next app).

**Rationale for plain-language labels**: derive a label by splitting `camelCase` into words and capitalizing (`columnsMobile` → "Columns (mobile)" via a small suffix map for the three grid/column fields specifically, since generic camel-splitting alone gives "Columns Mobile" which is close enough but the parenthetical reads clearer) rather than hand-maintaining a full field-name → label dictionary; low-effort, covers every current and future field without new maintenance burden per field addition.

## R9 — Delete confirmation and error surfacing: Design System `Dialog`, not `window.confirm` / ad hoc `Typography`

**Decision**: Replace `window.confirm(...)` in `CompositionTree.tsx` with `@strapi/design-system`'s `Dialog` (already the pattern Strapi's own Content Manager uses for delete confirmations elsewhere in the admin). Replace the JSON fallback's plain `<div>Invalid JSON...</div>` / ad hoc `Typography textColor="danger600"` with the Design System's `Field.Error`/`Alert` pattern consistently across the tree, inspector, and JSON fallback, so every error in the surface looks the same.

**Rationale**: Directly answers FR-001/FR-006/FR-011/SC-003/SC-006 with the least invasive change — swap components, no new state machine.

**Alternatives considered**: A custom modal — rejected, `Dialog` already exists in the dependency tree and matches the rest of the admin for free.

## R10 — What this feature does not touch

**Decision** (unchanged boundary from `010`, restated for this feature): No changes to `page.blocks`/`slots` storage, nest-rule allowlists/depth caps, the public rendering pipeline, navigation/product admin, or `resort-example`. No new Page document field. No pixel-perfect canvas. No multi-user real-time collaboration.

## R11 — Knowledge sync (implement change set)

**Decision**: `strapi-backend.md` gets a short note that `config/admin.ts` now configures `admin.preview` and what env vars that requires (`PREVIEW_BASE_URL` alongside the existing `PREVIEW_SECRET`). No other knowledge doc's documented contract changes — storage, nest rules, and the public REST shape are all unchanged by this feature, so `content-model.md`, `api-contract.md`, and `block-system.md` need no edits unless implementation finds otherwise.
