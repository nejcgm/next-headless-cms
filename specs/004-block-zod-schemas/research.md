# Research: Block Prop Validation Schemas

## Decision: Extend existing Zod + registry pattern (no new validation framework)

**Rationale**: `BlockDefinition.schema` and `validateBlockProps` already run `schema.safeParse` in development only and warn without blocking. Product `hero` and fixture `room-list` are the reference implementations. Adding schemas + registration wiring is the smallest change that meets SC-001–SC-005.

**Alternatives considered**:
- Runtime TypeScript-only / no Zod — rejected; Zod already chosen and used.
- Production hard-fail or CI gate on mismatch — rejected; spec Assumptions keep warn-only, zero prod cost.
- Single mega-schema map in core — rejected; violates tenant isolation and layering (shared vs tenant props).

## Decision: Schema validates authored CMS props; strip unknown keys

**Rationale**: Renderer validates **merged** props (`block.props` + `dataContract` + allowlisted search params). Existing `z.object({...})` strips unknown keys by default, so injected `products`, `rooms`, `bike`, `hotel`, `reviews`, `blockId`, etc. do not false-fail if omitted from the schema. Mirror `room-list`: schema covers CMS fields only.

**Per dataContract block guidance**:

| Block | Authored fields in schema | Omit (injected) |
|-------|---------------------------|-----------------|
| `product-list` | heading, subheading, outOfStockLabel, limit, category, layout, anchorId | `products`, `locale` (loader-injected) |
| `bike-detail` | `labels` | `bike` |
| `room-list` | existing schema | `rooms` (already) |
| `hotel-info` | empty object (no CMS props today) | `hotel` |
| `room-detail` | empty object or minimal if any static props appear | `room`, `hotel`, `availability`, dates |
| `testimonials` | heading, subheading, limit, layout | `reviews` |

**Alternatives considered**:
- Deep-validate injected entities — rejected for this feature (large surface, unstable external shapes); unknown-key strip is enough.
- `.strict()` schemas — rejected; would break merged props.

## Decision: File layout — one `schema.ts` beside each block

**Rationale**: Matches `hero/schema.ts` and `room-list/schema.ts`. Shared blocks live as single files today (`cta-banner.tsx`); add sibling `cta-banner.schema.ts` **or** a thin folder — prefer **sibling `*.schema.ts` next to the component file** to avoid relocating components (minimal diff). Export named `{block}Schema` (camelCase + Schema), e.g. `ctaBannerSchema`.

Tenant blocks: `{block}/schema.ts` exporting `{name}Schema`.

**Alternatives considered**:
- Move shared blocks into folders — rejected as drive-by refactor (Principle V).
- Barrel `shared/components/blocks/schemas.ts` — rejected; harder to find/own per block.

## Decision: Coverage inventory (all must have schema after feature)

### Already have

| Registry | Type |
|----------|------|
| vukans-bike | `hero` |
| resort-example | `room-list` |

### Shared (all missing)

`cta-banner`, `section-header`, `stats-bar`, `image-text`, `rich-text`, `image-gallery`

### vukans-bike (missing)

`contact`, `about-story`, `about-values`, `about-person`, `bike-detail`, `bike-school-intro`, `bike-school-program`, `gallery`, `guided-tour-experience`, `partners-gallery`, `product-list`, `service-pricing`, `service-process`, `service-faq`, `service-contact`

### resort-example (missing)

`hero`, `room-detail`, `hotel-info`, `about-story`, `location-contact`, `amenities-grid`, `team-gallery`, `booking-widget`, `testimonials`

Header/footer: **out of scope** (not registry content blocks).

## Decision: Docs — schemas required going forward

**Rationale**: FR-008 / User Story 3. Update `.specify/memory/knowledge/block-system.md` (“optional” → required for registered content blocks) and both `specs/_catalogs/*.md` so catalogs do not imply schemas are rare.

**Alternatives considered**: Code-only without docs — rejected by constitution IV and FR-008.

## Decision: No renderer changes unless a bug is found

**Rationale**: Current `validateBlockProps` already matches FR-006/FR-007. Implementation should not rewrite core; only add schemas + registration + docs.

## Open items resolved

| Topic | Resolution |
|-------|------------|
| Unused `rich-text` | In scope (registered) |
| Resort `hero` (inline props, no types.ts) | Add `schema.ts` from inline `HeroProps`; types.ts optional, not required by this feature |
| Shared prop interfaces inline in `.tsx` | Derive Zod from those interfaces; no need to extract types.ts unless useful |
| Defaults in Zod (room-list uses `.default()`) | Allowed; prefer matching component defaults where they exist; keep required/optional aligned with TS props |
