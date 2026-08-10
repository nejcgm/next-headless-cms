# Research: Clean Block Request Params

**Feature**: `002-block-request-params`  
**Date**: 2026-08-10

## R1 — How should blocks receive URL query?

**Decision**: Three explicit channels; **no** global merge of all query into all CMS props.

1. **`dataContract` request context** (preferred for server): `ctx.searchParams` on the existing data-contract callback.
2. **Registry opt-in** (when the React component itself needs selected keys on props): `acceptSearchParams: string[]` on `BlockDefinition`; renderer merges **only those keys** into props (CMS props still win on key collision — request keys overlay only the declared allowlist, or CMS wins: see R3).
3. **Client `useSearchParams` / URL APIs** for interactive UI (already valid; no server merge required).

**Rationale**: Matches constitution III (block composition) and keeps CMS content authoritative (FR-001/002) while preserving request-driven blocks (FR-003/004).

**Alternatives considered**:

| Alternative | Why rejected |
|-------------|--------------|
| Keep global `...query` into every block | Spec defect; content spoofing via query |
| React context only (no ctx change) | Extra indirection; dataContracts already have `ctx` |
| Pass entire `searchParams` as a reserved prop (`__searchParams`) on every component | Still pollutes every block surface; worse typing |
| Only client hooks, no server channel | Breaks server `dataContract` availability checks (e.g. room dates) |

## R2 — Normalize query shape once

**Decision**: Page passes `Record<string, string | undefined>` into `BlockRenderer`. If Next gives `string | string[]`, normalize to **first string value** (ignore empty). Document in contract.

**Rationale**: Spec edge case “single defined resolution”; matches current page typing (`Record<string, string | undefined>`).

**Alternatives considered**: Join arrays with comma — less predictable for dates/ids; first value is enough for current consumers (`checkin` / `checkout`).

## R3 — Collision: CMS field vs allowlisted query key

**Decision**: For `acceptSearchParams` merge: **query overlays CMS only for allowlisted keys** (declared request input intentionally wins for those keys). Content-only blocks never merge query, so CMS always wins there.

**Rationale**: Opt-in means the block author chose request input for that key (e.g. `checkin`). Content-only purity is the main SC-001 guarantee.

**Alternatives considered**: CMS always wins even on allowlist — would force all request-driven logic through `ctx.searchParams` only (also fine). Choosing overlay-on-allowlist keeps simple presentational opt-in without requiring a dataContract.

## R4 — Product vs fixture consumers

**Decision**: Audit both tenants for props that only existed via global merge. Known: `resort-example` `fetchRoomDetailData` reads `props.checkin` / `props.checkout`. Migrate to `ctx.searchParams`. Product `vukans-bike` has no known server query consumers today — verify during implement; SC-002 vacuously OK if none.

**Rationale**: Spec prioritizes product; fixture updated only as needed (compile + correct channel).

## R5 — Docs sync

**Decision**: Update `.specify/memory/knowledge/block-system.md` (remove “URL search params are merged into props by the page renderer”; document the three channels). Touch `DEVELOPMENT.md` / resort catalog only if they still imply the old merge.

**Rationale**: Constitution IV / FR-006 / SC-004.

## R6 — Backend / adapters

**Decision**: Out of scope. No Strapi or `CmsAdapter` changes.

**Rationale**: Spec out of scope; query is an HTTP request concern at the page/renderer boundary.
