# Research: Vukan's Bike Mock-to-Strapi Migration & Editor-Friendly Schema

**Feature**: `009-bike-strapi-migration`
**Date**: 2026-09-06

Phase 0 findings. R1–R6 come from a full backend/frontend audit (startup diagnosis, schema inventory,
adapter/seed code, Strapi's field-type vocabulary). R7 onward come from grepping the actual authored content
for every field this feature considers redesigning — every enum/boolean/number decision below is backed by
an exact usage count from the current 27-page corpus, not a guess.

## R1 — Root cause of the startup failure

**Finding**: `grid.json`'s `columns` attribute was changed from `integer` to `json` in commit `31b97c8`
("introducing primitives"), matching the frontend's `{mobile, tablet, desktop}` shape — but the live
database (a shared Railway Postgres instance, the only DB this project is configured against; `.env` has no
SQLite fallback in play) still has that column typed `integer` from before. Strapi's boot-time schema sync
tries `ALTER TABLE ... ALTER COLUMN "columns" TYPE jsonb USING ("columns"::jsonb)`, Postgres refuses the
`integer → jsonb` cast, and the process dies before binding to a port. Confirmed via full error trace; ruled
out: credentials, network reachability, Node version, dependency/lockfile drift (all checked, all fine).

**Decision**: Per the clarified answer, reset the schema in place — drop and let Strapi's own boot-time sync
recreate every table fresh from the current component/content-type definitions, then re-seed. On an empty
schema this is a plain `CREATE`, not an `ALTER ... USING`, so the cast problem cannot recur for this field.
Combined with R9's redesign of `columns` itself (see below), the field that caused this won't exist in its
current form afterward anyway.

**Rationale**: User-authorized (clarify session); low realistic data loss (the CMS only ever stored
pages/navigation/products, all of which are about to be fully re-seeded from mock content regardless).

**Mechanics** (for the plan): connect to the database named in the current `.env` (`DATABASE_HOST` /
`DATABASE_PORT` / `DATABASE_NAME` — the same Railway Postgres already configured, not a new local database),
`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`, then start Strapi and let it create tables fresh. **This
is a genuinely irreversible, shared-database-affecting action** — per an operator's own safety practice, it
must be re-confirmed explicitly at the moment of execution (not just because the spec authorized it in
principle), and a plain `pg_dump` taken first as a cheap, optional safety net.

## R2 — The component/content-type inventory is already clean

**Finding**: Every block this project's prior redesign (`007-bike-site-primitives`) declared deleted —
`service-pricing`, `partners-gallery`, `service-faq`, `contact`, `hero`, `about-*`, `bike-school-*`,
`guided-tour-experience`, `service-process`, `service-contact`, plus shared opaques `cta-banner`, `stats-bar`,
`image-text`, `section-header`, `rich-text`, `image-gallery`, `heading` — is **already absent** from
`headless-cms-backend/src/components/**` and from `page.schema.json`'s dynamic-zone list. That cleanup
already reached the backend; there is nothing left to delete from that list.

**Decision**: The only genuinely orphaned components today are `shared.cta-link` and `shared.stat-item` —
present on disk, referenced by nothing (zero hits anywhere in `page.schema.json` or any other component).
Delete both. No other component deletions are needed.

**Rationale**: Confirms the request's "fully remove the removed ones" is nearly already done; this feature's
real component-side work is the schema *redesign* (R7–R13), not more deletion.

## R3 — `lang`, not `locale`; i18n plugin genuinely off

**Finding**: `@strapi/plugin-i18n` is not installed; every content type's `pluginOptions` is `{}`; `lang` is a
plain string field everywhere, confirmed in the actual schema files (not just the docs). No conflict exists.

**Decision**: No change needed — this constraint already holds correctly. Kept as an explicit constraint
below so the redesign doesn't accidentally reintroduce `locale` anywhere.

## R4 — Seed script is already in sync; content parity has a clear source of truth

**Finding**: `scripts/seed-vukans-bike-cms.js` builds its Strapi payloads field-for-field from the *current*
`schema.json` attribute sets (verified: zero drift today) and reads directly from
`next-headless-cms-fe/src/tenants/vukans-bike/mock-data/` — the exact 27 page files + 3 navigation files + 1
product (× 3 locales each) already authored in `008-bike-site-redesign`. It upserts by `tenant+lang+slug`
(safe to re-run) and already hard-deletes stale demo products/pages that no longer belong.

**Decision**: The mock JSON already on disk **is** the content-parity target — no new content needs to be
authored. The seed script needs updating only where this feature's schema redesign changes a field's shape
(R7–R13), not for content itself. Every mock JSON page needs a **matching mechanical transform** (e.g.
`fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)"` → `fontSize: "sectionTitle"`) applied before/at seed time, not a
rewrite of any copy, structure, or images.

**Rationale**: Bounds this feature's "content" work to a schema-shape transform, not a second redesign.

## R5 — `strapi.adapter.ts` and `mock.adapter.ts` already share one transform pipeline

**Finding**: Both funnel raw JSON through the identical `toPageData()` / `toNavigationData()` →
`toValidatedBlockInstance()` pipeline (`strapi-document.ts`, `compose-validate.ts`); they differ only in how
the raw JSON is obtained (HTTP+cache-tags vs. `fs.readFileSync`). Whatever a Strapi component returns after
`__component`/`id` stripping becomes `BlockInstance.props` generically — there is no per-component special
casing in the transform layer today.

**Decision**: Preserve that genericity. Every schema redesign in this feature (R7–R13) is designed so the
**shape a component's props take, after Strapi's own `__component`/`id` stripping, is exactly the shape the
frontend prop type already expects** — i.e. reshape the *component's own fields*, never add adapter-level
special-casing for one block type. (This is why `grid.columns` becomes three flat fields on `grid` itself,
not a nested component needing custom reassembly — see R9.)

**Rationale**: Keeps the "adding a block only touches the block's own files" property (`content-model.md`,
step-by-step "Adding a new block") true after this migration, not just before it.

## R6 — Field-type vocabulary available, and what's already good

**Finding**: Confirmed `@strapi/strapi@5.44.0`. Field types available: `enumeration` (dropdown), `integer` /
`decimal` / `float` (number input), `boolean` (toggle), `string` / `text`, `component` (including nested
inside another component — three examples already exist: `page.seo`, `bike-detail.labels`,
`nav-item.children`). **`justify`, `align`, `gap`, `direction`, `variant`, `fit`, `aspect`, `overflow`,
`textAlign` are already `enumeration` today** — the exact "flex-start / flex-end, a couple of named options"
pattern the request specifically called out is already correctly a dropdown everywhere it currently applies.

**Decision**: The real gaps are the *less obvious* fields — ones that read as "just text" but have, in
practice, only ever held a small closed set of values: color/surface tokens, font sizes, a handful of
border/width/height patterns, and the one field that's actually broken (`grid.columns`). R7–R13 target
exactly those, backed by an exact count of every distinct value in current use (below).

## R7 — Color and surface fields: tighten to the theme's own token set

**Finding** (grepped across all 27 pages): every `color` / `backgroundColor` ever authored is one of exactly
5 literal values (`background`, `foreground`, `primary`, `secondary`, `text-primary`) — always a theme token
name, never a raw hex (this project's own authoring convention already forbids raw hex; see
`008-bike-site-redesign`'s `V-hex` validation rule). `section.surface` is used with exactly 4 values
(`background`, `muted`, `accent`, `foreground`) — always a bare token, and **never co-occurs with
`backgroundColor` on the same node** (checked: zero instances) — the two fields do the same job on `section`
today, just under two different names.

**Decision**: `color` and `backgroundColor` (shared box-style, every primitive) become `enumeration` of all
**8** theme tokens (`primary`, `secondary`, `accent`, `background`, `foreground`, `muted`, `border`,
`text-primary`) — all 8, not just the 5 seen so far, so an editor can reach the full current palette, not
only what happened to be used already. On `section` specifically, collapse `surface` and `backgroundColor`
into one field — keep the name `surface` (reads better to a non-technical editor: "which surface treatment"
vs. "background color"), same 8-token enum, `backgroundColor` removed from `section`'s own schema (every
other primitive keeps generic `backgroundColor`, unaffected).

**Rationale**: Zero real content is lost (every existing value fits the enum); this directly satisfies "no
free-text field where a bounded set exists," and it's the single biggest defect-prevention win here — an
editor literally cannot type a color that breaks the design system anymore.

**Runtime impact**: none. `resolveColor()` already maps any bare token name to `var(--color-<name>)`
correctly; only the authoring-time type gets stricter (Strapi dropdown + a matching Zod `z.enum`), the
resolution function is unchanged.

## R8 — `text.fontSize`: exactly 7 sizes are in real use — a named scale, with one escape hatch

**Finding** (grepped): every `fontSize` ever authored on a `text` node is one of exactly 7 distinct values:

| Value | Count | Role |
|-------|-------|------|
| `1.25rem` | 132 | Card / sub title |
| `clamp(1.75rem, 3.2vw, 2.5rem)` | 54 | Section title |
| `clamp(1.25rem, 2.2vw, 1.75rem)` | 27 | Compact price (service page tiers) |
| `clamp(2.25rem, 5vw, 3.25rem)` | 15 | Page title (compact headers) |
| `clamp(1.5rem, 2.5vw, 2rem)` | 15 | Price / figure |
| `clamp(2.5rem, 6vw, 4rem)` | 9 | Display (hero headline) |
| `clamp(1.5rem, 2.8vw, 2rem)` | 6 | Statement (closing bands) |

`lineHeight` (added in `008-bike-site-redesign`'s Recommendation 2 as a generic escape hatch) has **zero**
real uses anywhere — it was never actually needed once every `fontSize` override was known to be one of these
7 values.

**Decision**: `text.fontSize` becomes an `enumeration` of 7 named steps — `cardTitle`, `sectionTitle`,
`priceCompact`, `pageTitle`, `price`, `display`, `statement` — plus an 8th value, `custom`, which defers to a
new companion field `customFontSize` (string, unchanged shape from today's free-text field). Each named step
maps, inside the `text` component itself, to both its exact CSS size **and** a fixed `line-height: 1.625`
(the same ratio `body`'s `leading-relaxed` already uses) — applied **regardless of `variant`**. This directly
retires the R3-class bug from `008-bike-site-redesign` (only `body` safely scaled with a resized `fontSize`)
by construction: once `fontSize` is one of these named steps, the component no longer relies on the variant's
own Tailwind line-height class at all.

**Rationale**: Typography is the highest-frequency, most visually-sensitive field in the whole system (258
combined uses) — worth the one deliberate escape hatch (`custom`) this redesign keeps, per the request's own
"don't force a field into a dropdown where a legitimate free-form need exists" instruction. Every other field
below has no such hedge because the evidence doesn't call for one.

**Migration**: mechanical — each of the 7 raw strings maps 1:1 to its named step; zero ambiguous cases.

## R9 — `grid.columns`: the broken field becomes three flat dropdowns, not a nested component

**Finding**: Every `columns` value ever authored is already the `{mobile, tablet, desktop}` object form —
**zero** instances of the legacy bare-number shorthand (`columns: 2`) exist anywhere in current content. The
field is used by exactly one component (`grid`) — no reuse case for a shared nested component.

**Decision**: On the **Strapi side** (vukans-bike only), replace the single broken `columns: json` attribute
with three flat attributes directly on `grid`: `columnsMobile` (`enumeration` 1–4, default `1`),
`columnsTablet` (`enumeration` 1–4, optional), `columnsDesktop` (`enumeration` 1–4, optional).

On the **frontend** `Grid` component (shared code — see R16), this is **additive, not a replacement**: add
the three flat optional props, and have the component prefer them when present; **keep** the existing
`columns` (bare number | `{mobile,tablet,desktop}` object) prop and its `resolveColumns()` legacy-mapping
logic fully intact as a fallback. Strapi's schema for vukans-bike simply never offers `columns` anymore (so
new Strapi content always uses the flat fields), but the shared component still understands it.

**Rationale**: Three flat, always-visible dropdowns are simpler to author than expanding a nested component
just to set three numbers, and there's no reuse benefit to a nested component here (R5's rule: reshape the
component's own fields, not introduce cross-cutting adapter special-casing). This also happens to be the
root-cause field (R1) — fixing it for editor-friendliness and fixing the startup crash are the same change.
Keeping the legacy prop supported in the shared component (rather than deleting it) is what keeps this
change safe for the other tenant — see R16.

## R10 — `borderTop`: always one value, everywhere — a toggle, not a string

**Finding**: Every `borderTop` ever authored is the single value `"1px solid var(--color-border)"` — a
top-hairline divider. No other value exists anywhere.

**Decision**: Retire the free-text `borderTop` field; replace with `dividerTop` (`boolean`, default `false`)
on the shared box-style bag. `toBoxStyle()` maps `dividerTop: true` → the same hairline CSS internally.

**Rationale**: A hairline divider is binary (there or not); the color/width are themed, not authored per
instance, so there's nothing a free-text field was ever really offering here.

## R11 — `border`: three values, everywhere — a small named enum

**Finding**: Every `border` ever authored is one of exactly 3 values: `"1px solid var(--color-border)"`
(hairline card outline), `"2px solid var(--color-background)"` (inverted outline, used once per locale on an
inverse-band secondary button), `"none"` (explicit removal on an inverse-band primary button).

**Decision**: `border` (shared box-style) becomes `enumeration`: `none` | `hairline` | `invertedOutline`.
`toBoxStyle()` maps each to its exact CSS string internally.

**Rationale**: A stable 3-value set observed across the entire corpus; tightening removes free-text risk with
zero loss of anything actually used.

## R12 — `width`: 66 uses, all identical — a toggle

**Finding**: Every `width` ever authored is exactly `"100%"` (66 occurrences, always on a `flex` hairline
row). No other value exists anywhere.

**Decision**: Retire the free-text `width` field; replace with `fullWidth` (`boolean`, default `false`) on
the shared box-style bag. `toBoxStyle()` maps `fullWidth: true` → `width: "100%"`.

**Rationale**: Same reasoning as R10 — a genuinely binary concept in actual use, not a continuous one.

## R13 — Hero `minHeight`: two values, only ever on a hero — a section-only enum

**Finding**: `minHeight` is used in exactly 4 places, all four are the photographic-hero band on
Home/Service/Bike school/Guided tours, and only 2 distinct values exist: `clamp(520px, 82vh, 820px)` (Home
only) and `clamp(480px, 72vh, 720px)` (the other three). **Zero** non-hero uses of `minHeight` exist anywhere
— it is not a generally-needed box-style field today.

**Decision**: Remove `minHeight` from the shared box-style bag entirely (nothing else uses it) and add
`heroHeight` directly on `section`: `enumeration` `standard` | `tall`, meaningful only when `backgroundImage`
is set. `standard` → `clamp(480px, 72vh, 720px)`, `tall` → `clamp(520px, 82vh, 820px)`.

**Rationale**: A field with zero non-hero uses doesn't need to stay generic; scoping it to `section` and
naming it for what it actually controls ("how tall is this hero") is both simpler and friendlier than a
raw CSS length.

## R14 — What stays free text, deliberately (FR-009)

Confirmed genuinely varied/continuous, kept unchanged as text fields — forcing these into a bounded control
would remove real, currently-exercised flexibility:

| Field | Why it stays text |
|-------|---------------------|
| `padding` / `margin` (box-style) | 9–17 distinct shorthand combinations in real use (asymmetric spacing, the `margin: "auto 0 0 0"` bottom-pin trick) — not reducible to one number without losing shorthand power. |
| `maxWidth` (box-style) | Reading-measure tuning (`46ch`…`68ch`), deliberately varied per band; a `ch`-based measure isn't a pixel dropdown candidate. |
| `height` (non-hero) | Image heights mix `clamp()` responsive expressions and plain px; collapsing to one number would break responsive imagery. |
| `product.category` | Exactly one value exists today (`"Cestna kolesa"`) — no real fixed set to enumerate yet; revisit once the catalog has more than one category (tracked as a follow-on, not in this feature). |
| `border` sibling fields not covered above (e.g. no per-corner radius, no shadow) | Not present anywhere in current content — no evidence to act on. |

`borderRadius` needs no decision at all: **zero** current authored uses exist anywhere (the theme's own
`borderRadius: "0rem"` already covers every page) — left exactly as-is.

## R15 — Known defect fixed as part of the rebuild: `product-list.category`

**Finding**: `product-list.category` is declared in both the Strapi schema and the frontend Zod schema, but
`load-products.ts` never reads or applies it — a pure no-op, previously logged in `008-bike-site-redesign`'s
shared-recommendations as a known defect. `product-list` itself remains unreferenced by any current page (the
flagship-bike-as-primitives pattern from `008-bike-site-redesign` replaced it, and stays the content-parity
target here — R4).

**Decision**: Remove the dead `category` field from `product-list`'s schema (Strapi + Zod) rather than wire
up real filtering logic for a block with a one-item catalog and zero current call sites. This satisfies
FR-010 (fix a known defect while rebuilding this component's schema) without building unused behavior.

**Out of scope, deliberately**: `product-list`'s hardcoded 4-column grid / self-imposed section wrapper /
`<a href>` instead of `next/link`, and `gallery`'s hardcoded masonry pattern and 10-item reveal — both remain
open items in `008-bike-site-redesign`'s shared-recommendations register. Neither is a schema/field-type
concern, and neither is exercised by any current page; fixing them here would be unrelated scope creep on a
component this feature only touches for its schema shape.

## R16 — Cross-tenant safety check: does resort-example use any field this feature tightens?

**Finding**: Box-style is `shared/` code — Zod/component changes here apply to **both** tenants, regardless
of which one's Strapi schema changes. Grepped `resort-example`'s entire mock-data tree for every field this
feature touches: `color`/`backgroundColor` (zero non-token or hex values — in fact zero uses of `color` or
`backgroundColor` on any L1 primitive at all), `borderTop` (zero), `border` (zero), `width` (zero),
`minHeight` (zero), `lineHeight` (zero), `text.fontSize` (zero — resort's mock pages don't use `blocks.text`
at all; it's built almost entirely from its own proprietary tenant blocks, consistent with `block-system.md`:
"Bike is SoT for shared L1 types"). **One real exception**: `resort-example/mock-data/pages/home.json` has
exactly one `blocks.grid` node using the legacy bare-number shorthand `"columns": 3`.

**Decision**: R9 revised — the frontend `Grid` component keeps full backward-compatible support for the
legacy `columns` prop (number or `{mobile,tablet,desktop}` object) alongside the new flat fields; nothing in
`resort-example`'s mock data is touched. Every other box-style tightening in this feature (R7, R10–R13) is
confirmed to have **zero** footprint in `resort-example` today, so no further cross-tenant fallback is needed
for those.

**Rationale**: FR-012 ("MUST NOT... modify any content, component, or configuration belonging to
`resort-example`") is satisfied by construction — verified, not assumed.

## R18 — `null` vs. missing: root-level Strapi blocks needed `.nullish()`, not `.optional()`

**Finding**: Discovered during the live cutover (US2's own acceptance test), not anticipated in the original
design — this tenant had never successfully connected to a running Strapi before, so this gap was never
exercised. Strapi's REST API always serializes **every** schema-defined attribute on a structured component,
using `null` for anything unset; mock JSON, by contrast, simply omits the key. Zod's `.optional()` accepts a
*missing* key but rejects an explicit `null`, so every root-level dynamic-zone block (`section` and `gallery`
in this tenant's actual content — anything sitting directly in `page.blocks[]`) failed `compose-validate`'s
schema check and had its optional fields silently dropped, taking real content down with it (a `section`'s own
props failing validation cascaded to its children not rendering). Nodes nested inside a `slots` field were
unaffected, because `slots` is a plain `json`-typed field in Strapi — an opaque blob with no per-attribute
schema enforcement, so it round-trips exactly as the seed script wrote it.

**Decision**: Changed every optional field, across `boxStyleSchema` and every primitive/component schema
(`section`, `stack`, `flex`, `grid`, `text`, `image`, `iframe`, `icon`, `button`, `link`, `accordion`,
`gallery`, `product-list`), from `.optional()` to `.nullish()` (accepts `undefined` *or* `null`). Applied
universally rather than only to the two component types that happened to fail today, since any of them could
become a page root in future content. No runtime/component-logic changes were needed — every consuming
component already used truthy checks (`if (props.color)`), which treat `null` and `undefined` identically.

**Rationale**: This is exactly the kind of integration defect Principle VI anticipates coordinated schema
work catching — the fix belongs in this feature specifically because this is the first time this contract was
ever exercised end-to-end.

## R19 — Grid's new columns fields are Strapi strings, not numbers

**Finding**: Also discovered live — `columnsMobile`/`columnsTablet`/`columnsDesktop` were typed as numeric
literals (`1|2|3|4`) in R9's original design, matching the legacy `columns` object's number values. But Strapi
`enumeration` attributes always serialize as strings — the seed script correctly writes `"1"`-`"4"` (matching
the Strapi schema in `contracts/schema-changes.md`, which was always string-enum), but the frontend Zod schema
expected numbers, so every `grid` node using the new fields failed validation.

**Decision**: Typed the three new fields as `"1"|"2"|"3"|"4"` (a new `GridColumnCount` string type), matching
what Strapi actually returns; the `Grid` component `Number()`-converts them when building its resolved
`{mobile, tablet, desktop}` object. The legacy `columns` prop (still numeric, still used by `resort-example`)
is untouched.

**Rationale**: The Strapi-side design in R9 was correct from the start; this was purely a frontend-side typing
mismatch, caught immediately by the same live-content validation pass that caught R18.

## R17 — Draft & Publish, permissions, and revalidation are configuration, not schema

**Finding**: Draft & Publish is a per-content-type toggle in `schema.json` (`options.draftAndPublish`).
Verified directly at implementation time: `page` and `product` **already** have `draftAndPublish: true` — no
schema change was actually needed there (this correction supersedes this research entry's original
"not yet confirmed" phrasing, written before that direct check). Public-role `find` permissions and the first
admin account are Strapi-admin-UI actions with no schema representation at all. No `lifecycles.ts` exists on
any content type — the frontend's `/api/webhooks/strapi` route is fully coded and ready but nothing in Strapi
calls it yet (confirmed: this is a Strapi Admin → Settings → Webhooks configuration step, not code).

**Decision**: No schema change needed for Draft & Publish (already correct on both content types). Document,
as a manual one-time setup checklist (not automated code), the steps an operator must complete once the reset
backend is running: create the first admin account, grant Public-role `find` on `page`/`navigation`/`product`,
generate an API token for the seed script and the frontend, and register the webhook (Settings → Webhooks →
URL = the frontend's `/api/webhooks/strapi`, header `x-revalidate-secret` = `REVALIDATE_SECRET`) so
publish-driven revalidation actually fires end-to-end.

**Rationale**: These steps are inherently manual/administrative in Strapi (no content-type or component file
represents them) — FR-016 asks that they be documented, not that they be made unnecessary.
