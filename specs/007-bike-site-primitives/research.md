# Research: Vukan's Bike Site Primitives Redesign

**Feature**: `007-bike-site-primitives`  
**Date**: 2026-09-04

## R1 — Reuse 006 composition engine; no new primitives

**Decision**: Author all redesigned pages with the existing L1 set (`section`, `stack`, `flex`, `grid`, `heading`, `text`, `image`, `button`) and existing Keep L3 compounds. Do **not** add new block types for this feature. Prefer composition when a layout gap appears.

**Rationale**: Spec assumption; home already proves the vocabulary; Component Pokémon is the anti-goal.

**Alternatives considered**: New `card` / `stat` primitives — rejected (vibecode risk; express with stack+text). Nesting editor — out of scope.

## R2 — Migration scope: shared + bike proprietary

**Decision**: Replace-and-remove inventory covers:

| Ownership | Replace (then remove) | Keep |
|-----------|----------------------|------|
| Shared | `cta-banner`, `stats-bar`, `image-text`, `section-header`, `rich-text`, `image-gallery` | L1 primitives only |
| Bike proprietary | `hero`, `about-story`, `about-person`, `about-values`, `bike-school-intro`, `bike-school-program`, `guided-tour-experience`, `service-process`, `service-contact` | `product-list`, `bike-detail`, `contact`, `gallery`, `partners-gallery`, `service-pricing`, `service-faq` + header/footer |

**Rationale**: Spec FR-011 + clarify session.

**Alternatives considered**: Shared-only cleanup — rejected; leaves bike one-offs. Decompose Keep compounds — rejected (lossy).

## R3 — Resort fixture: drop shared nodes; bike is SOT

**Decision**: When shared opaques are deleted from FE/Strapi product surface, **delete those `__component` nodes** from `resort-example` mock pages. Do **not** rebuild resort with primitives. Resort **tenant** blocks (`hero`, `room-list`, etc.) remain for build isolation even if Strapi no longer lists `blocks.hero` (resort is mock-only).

**Rationale**: Clarify: bike SOT; fixture not a second product.

**Alternatives considered**: Migrate resort to L1 trees — rejected. Keep shared opaques alive for fixture — rejected (Component Pokémon).

## R4 — Nest Keep L3 under layout primitives

**Decision**: Extend composition `allow` lists on `section`, `stack`, `flex`, and `grid` to include Keep L3 types used as framed leaves: `product-list`, `bike-detail`, `contact`, `gallery`, `partners-gallery`, `service-pricing`, `service-faq`. Keep compounds remain leaves (`maxDepth: 1`, empty slots). Root-level Keep siblings remain valid.

**Rationale**: Home already nests `product-list` under `section`. Service/about/contact need the same framing pattern without opaque wrappers.

**Alternatives considered**: Keep compounds only as page roots — workable but weaker band framing. Separate “band” compound — rejected (new type).

## R5 — Mock-first delivery; Strapi schema parity

**Decision**: Visitor verification uses bike **mock** adapter and redesigned mock JSON. In the same change set, update Strapi page DZ + delete superseded component files + regenerate types. Live DB re-seed / content migration is **ops follow-on**, not a gate for FE acceptance.

**Rationale**: Spec FR-010; product currently points at Strapi in catalog but feature explicitly mock-first for redesign velocity.

**Alternatives considered**: Redesign only after live Strapi seed — slower, blocks design iteration. Skip Strapi schema cleanup — fails FR-006 and drifts models.

## R6 — Professional design bar (anti-vibecode)

**Decision**: Treat FR-012 / SC-005–SC-006 as a hard review gate. Page authoring rules:

1. **Brand-first first viewport** — place/brand dominant; one headline, one support line, one CTA group; full-bleed imagery when a hero band is needed.
2. **One job per section** — no stacked promo clutter.
3. **No vanity stats strips**, decorative non-interactive card grids, chip/pill badge clutter, or competing full-bleed bands.
4. **Typography** — `heading` (`display`/`title`/`section`) + `text` (`body`/`lead`/`caption`/`label`); prefer theme tokens; box style overrides in **px**.
5. **Copy** — specific to Vukan's Bike / Apače / workshop-trail craft; avoid generic SaaS filler.
6. **Locales** — identical tree structure across `sl` / `en` / `de`; only strings differ.

**Rationale**: User clarify: must look professional, not vibecoded. Home direction is the reference.

**Alternatives considered**: “Good enough if types migrate” — rejected by clarify.

## R7 — Page IA targets (post-migration)

**Decision**: Target root composition per page (illustrative; exact trees authored in implement):

| Page | Roots (concept) |
|------|-----------------|
| Home | Already L1/L2 + `product-list` — polish to FR-012 if needed |
| Shop | Hero band (L1) + framed `product-list` + optional closing CTA band |
| Service | Hero band + process as ordered stacks + `service-pricing` + `service-faq` + closing CTA (replace `service-contact`/`service-process`) |
| About | Hero band + story/person/values as L1 grids/stacks + closing CTA |
| Contact | Quiet hero or direct `contact` compound; optional intro stack |
| Brands | Hero band + `partners-gallery` + closing CTA |
| Bike school | Hero band + intro/program as L1 + `gallery` + closing CTA |
| Guided tours | Hero band + experience as L1 + `gallery` + closing CTA (no `service-process`) |
| Bike detail | Keep `bike-detail` (optional thin framing sections only if needed without competing with product UX) |

**Rationale**: Inventory of current mocks; Keep vs Replace map.

## R8 — Deletion order

**Decision**: (1) Redesign all bike mocks so Replace types have zero references → (2) drop shared deleted nodes from resort mocks → (3) delete FE registrations/folders → (4) trim Strapi DZ + delete components → (5) docs. Never delete a type while mocks still reference it.

**Rationale**: Soft-fail adapter would blank pages; ordered cleanup avoids broken verifies.

## R9 — `hero` ownership nuance

**Decision**: Bike **tenant** `hero` is Replace/delete. Strapi `blocks.hero` is removed from product DZ. Resort **tenant** `hero` may remain registered for fixture mocks that still use `blocks.hero` in JSON (mock adapter only). Do not invent a shared hero primitive type.

**Rationale**: Bike SOT for Strapi; resort fixture proprietary chrome can stay without forcing a shared opaque back into the product model.

**Alternatives considered**: Force resort to drop all heroes — optional later; not required if Strapi deletion doesn’t break mock FE. Keep Strapi `blocks.hero` for resort — rejected (dead product surface).
