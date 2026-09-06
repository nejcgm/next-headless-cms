# Feature Specification: Vukan's Bike Full Visual Redesign (Content-Only)

**Feature Branch**: `008-bike-site-redesign`

**Created**: 2026-09-04

**Status**: Draft

**Input**: User description: "Full website redesign of the vukans-bike tenant, delivered only by editing mock JSON content (copy, box-styles, theme, page composition) — no new component code. Goal: the best, most professional, clean-looking bike shop website; it must not look vibecoded. The tenant theme (`config.ts`) may be changed. The only components that may be edited via code are vukans-bike's own proprietary components (header, footer, gallery, bike-detail, product-list), and only to fix bugs — no new features. Changes to `shared/` primitives or new shared components may be recommended but not implemented without explicit owner approval. Strapi integration is out of scope; the site keeps running on the mock data adapter for this feature."

## Clarifications

### Session 2026-09-04

- Q: Should the catalog stay at today's single real product, or should the mock catalog be expanded with additional placeholder bike listings? → A: The catalog stays at exactly one real product (Merida Road Ride). Every trace elsewhere in the site that implies a broader, currently-browsable catalog (category filters/badges, "browse our bikes" plural framing) must be removed or reconciled — the one product should read as an intentional flagship feature, not a sparse grid.
- Q: Should the existing red/black moto-workshop brand identity be preserved and refined, or is a full palette/typography rethink in scope? → A: A full palette and typography rethink is in scope, including changing the primary brand color, as long as the result reads as a professional, cohesive bike-shop identity.
- Q: May the redesign introduce new placeholder/stock image URLs, or must it work only with imagery already referenced in the current mock data? → A: Prioritize the tenant's own real Cloudinary assets over stock images; use stock only where no appropriate real asset exists. The tenant shared a public Cloudinary collection link (`collection.cloudinary.com/dru1crghm/2f91b0289374d55943ca8ca31b0e7a9c`) as the source of truth for available assets. That page is a JavaScript-rendered gallery with no API credentials available in this repo, so it cannot be browsed programmatically — the ~24 real shop/bike/team photos already referenced across the mock data (cloud `dru1crghm`) are the assets usable without further input. If the tenant owner wants specific additional photos from that collection used, they should paste the direct asset URLs during planning/implementation; otherwise stock imagery fills any remaining gap.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - First impression on the homepage (Priority: P1)

A prospective customer (local rider, tourist, or someone searching for bike service/sales in Apače) lands on `/` for the first time. Within seconds they understand what Vukan's Bike sells and does, trust that it's a real, professionally run local shop, and see one clear next action — without encountering clutter, duplicate messaging, or anything that reads as auto-generated filler.

**Why this priority**: The homepage is the highest-traffic entry point and the page most visitors form their opinion of the business from. A weak first impression here costs conversions before any other page is ever seen.

**Independent Test**: Load `/`, `/en`, and `/de` home variants with no other page changed, and evaluate against the acceptance bar below.

**Acceptance Scenarios**:

1. **Given** a first-time visitor on `/`, **When** the page loads, **Then** the hero presents one headline, one supporting line, and a single primary action — using the tenant's theme colors consistently rather than a single overused accent.
2. **Given** the visitor scrolls through the homepage, **When** they reach each section in turn, **Then** every section has one distinct job (workshop/service, sales, community/tours), with no vanity stat strip, no near-duplicate "visit us" band repeated with only the copy swapped, and no section that a reader would flag as unfinished or placeholder.
3. **Given** the visitor views the homepage on a mobile screen, **When** content reflows, **Then** the visual hierarchy (hero → sections → closing action) still reads cleanly, with no orphaned grid items or cramped spacing.

---

### User Story 2 - Evaluating and buying a bike (Priority: P2)

A visitor who wants to buy a bike browses `/shop`, sees the shop's current flagship bike presented as a deliberate feature (not a sparse leftover), and opens its detail page to check price, specs, and availability before contacting the shop.

**Why this priority**: This is the shop's core commercial path. A sparse or broken catalog presentation directly undermines purchase confidence and revenue.

**Independent Test**: Load `/shop` and the `/bikes/{slug}` page independently of other pages' changes.

**Acceptance Scenarios**:

1. **Given** the shop page, **When** it renders, **Then** the single real product is presented as an intentional flagship/featured moment (composition, copy, and layout built for one product), not as a lone card stranded in a grid sized for many.
2. **Given** the shop and home pages, **When** the visitor looks for a category label, filter, or "browse all bikes" style control, **Then** none is shown, since the catalog does not yet support browsing multiple categories — no visible control implies capability the catalog doesn't have.
3. **Given** a visitor opens the bike detail page, **When** it loads, **Then** price, specs, availability, and contact actions are presented cleanly and consistently with the rest of the site's visual language.

---

### User Story 3 - Judging credibility via Service and About (Priority: P2)

A visitor comparing bike shops opens `/service` to check pricing and process, and `/about` to learn who runs the shop, before deciding to reach out.

**Why this priority**: Pricing transparency and a credible, specific "who we are" story are primary trust drivers for a local service business; generic or template-sounding copy erodes exactly the trust this redesign is meant to build.

**Independent Test**: Load `/service` and `/about` independently; verify pricing/process/FAQ clarity and that About copy reads as specific to Vukan's Bike, not generic template filler.

**Acceptance Scenarios**:

1. **Given** the service page, **When** the visitor scans the pricing section, **Then** tiers are visually scannable with a clear hierarchy, and the FAQ accordion answers real, specific questions.
2. **Given** the about page, **When** the visitor reads the story/values sections, **Then** the copy references specifics (place, people, way of working) rather than interchangeable generic claims ("quality, honesty, your trust").
3. **Given** any CTA on either page, **When** the visitor reads its label, **Then** the action promised (e.g. "contact us", "call") matches a capability the shop actually has (no "book" language where no booking system exists).

---

### User Story 4 - Exploring community pages: Brands, Bike School, Guided Tours (Priority: P3)

A visitor browses `/brands`, `/bike-school`, and `/guided-tours` to see who the shop partners with and what community activities it runs.

**Why this priority**: Lower-traffic than the commercial pages, but still shapes overall brand polish; inconsistency here is exactly the kind of thing that makes a site feel unfinished.

**Independent Test**: Load each of the three pages independently; verify grid consistency and that every page offers at least one first-party action.

**Acceptance Scenarios**:

1. **Given** the brands page, **When** the partner grid renders, **Then** every partner card presents the same kind of content (no card silently missing the link the others have) and no breakpoint leaves a single orphaned card on its own row.
2. **Given** the bike-school or guided-tours page, **When** the visitor looks for a next step, **Then** at least one action is first-party (routes to a page or contact method the shop owns), even where a third-party registration link also exists.
3. **Given** either page's supporting imagery, **When** the visitor reads any caption, **Then** no caption admits the content is temporary or unfinished.

---

### User Story 5 - Consistent navigation and locale switching (Priority: P3)

A visitor uses the header to move between pages and switches locale (sl/en/de) from any page, expecting the same navigation structure and a fully localized experience.

**Why this priority**: Header/footer chrome appears on every page; inconsistency or stale content here undermines the redesign everywhere at once.

**Independent Test**: Load the site in each locale and compare header/footer content and structure across pages independently of individual page redesigns.

**Acceptance Scenarios**:

1. **Given** any page in any locale, **When** the header renders, **Then** the nav items match the shop's current information architecture and are identical in structure across sl/en/de (labels localized, order and count identical).
2. **Given** the footer on any page, **When** the visitor scans it, **Then** tagline, nav links, and contact details read as complete and consistent with the rest of the redesigned site.
3. **Given** a visitor switches locale, **When** the new locale loads, **Then** section structure and quality bar match the default (`sl`) version — no locale is left in a pre-redesign state.

---

### Edge Cases

- What happens on pages/sections whose current grid item count produces an orphaned single-item row (e.g. 7 partner cards in a 3-column grid) — column counts and/or item counts must be reconciled so no breakpoint leaves a lonely row.
- How does the redesign handle German copy, which typically runs longer than Slovene/English — sections must be checked for overflow/cramping once localized copy is substituted.
- What happens to content sections that reference the product catalog (home, shop) given exactly one real product exists — those sections must be composed as a deliberate single-product feature, not a grid that merely happens to have one card.
- How does the redesign handle currently-dead JSON fields discovered in the existing pages (a per-page `navigation` block that is never read by the app, a duplicate inline `bike` object on the bike detail page, reused block `id`s within a single page) — these must be cleaned up in any page file touched, so future content authors aren't misled by data that looks authorable but silently has no effect.
- What happens to theme color tokens that are defined in `config.ts` but never actually rendered anywhere today (`secondary`, `accent`) — the redesign must decide, page by page, where each token is intentionally used, rather than leaving them dead.
- What happens when a visitor's CTA click promises a capability the business doesn't have (e.g. "book" language with no booking feature) — copy must be reconciled to actions the shop can actually fulfill.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The redesign MUST be delivered entirely through edits to the vukans-bike tenant's mock content (`src/tenants/vukans-bike/mock-data/**`) and tenant theme configuration (`src/tenants/vukans-bike/config.ts`) — no new primitives, no new block types, no new page routes, and no changes to `shared/` components.
- **FR-002**: The vukans-bike proprietary components (`header`, `footer`, `gallery`, `bike-detail`, `product-list`) MAY be edited in code, but only to fix defects that block correct or professional presentation (for example: a category field that has no visible effect, dead/duplicate data fields, hardcoded visual states that ignore the tenant theme). Such fixes MUST NOT add new props, options, or visual patterns beyond correcting the identified defect.
- **FR-003**: Every current public page (home, service, shop, about, contact, brands, bike-school, guided-tours, bike detail) MUST be reworked so each section serves one clear purpose, with no near-duplicate closing sections repeating the same layout and near-identical copy across multiple pages, no vanity stat strips, and no placeholder or self-referential "unfinished" copy.
- **FR-004**: The redesign MUST apply one coherent visual theme (color palette, typography pairing, spacing/corner-radius rhythm) consistently across every page and locale.
- **FR-005**: Every color value authored in page content MUST resolve to an intentional theme token or a deliberate one-off value — no page may rely on a component default that silently ignores the tenant's palette.
- **FR-006**: Grid-based sections (partners, values, programs, specs, catalog) MUST be authored with item/column counts that avoid an orphaned single-item row at mobile, tablet, and desktop widths.
- **FR-007**: Any visible category label, filter, or badge shown to visitors MUST reflect real, functioning data — no visible control or claim may be a no-op. Since the catalog currently holds exactly one product, no category filter, category badge, or "browse all bikes" style control MUST be shown anywhere (home, shop, bike detail) until the catalog genuinely supports more than one entry.
- **FR-008**: CTA copy across the site MUST match real shop capabilities — no wording that implies a feature (e.g. online booking) the business doesn't currently offer.
- **FR-009**: Dead or stale JSON fields identified in a page during this redesign (fields the rendering pipeline does not read) MUST be removed from any page file that is otherwise being edited, so the authored JSON accurately reflects what's actually rendered.
- **FR-010**: All three locale variants (`sl` default, `en`, `de`) of every page and of site navigation MUST receive equivalent structure and the same quality bar — not just the default locale.
- **FR-011**: Header navigation and footer content MUST be edited only through the shared navigation data files and header/footer props — never through a page-level field the rendering pipeline ignores.
- **FR-012**: Any page whose primary calls-to-action route off-site (e.g. bike-school registration) MUST also offer at least one first-party action the shop itself owns (contact, phone, or an owned page).
- **FR-013**: Any change to `shared/` primitives or new shared component that would meaningfully improve the redesign but requires code MUST be written up as a recommendation (not implemented) in the same change set, for the tenant owner to approve separately.
- **FR-014**: This feature MUST NOT change the data adapter, add or wire a Strapi integration, or otherwise touch backend content modeling — the tenant continues to run on the mock adapter.
- **FR-015**: Product catalog scope: the redesign MUST keep the catalog at exactly the one real product (Merida Road Ride) and MUST remove or reconcile every other trace in the site's content that implies a broader, currently-browsable catalog — including the dead inline `bike` object duplicated in the bike detail page JSON, and any category/browse affordance covered by FR-007. General service/sales-capability copy describing the *types* of bikes the shop works with (e.g. city, road, gravel, e-bike, MTB) MAY remain where it describes the business's capability rather than implying live, multi-item inventory.
- **FR-016**: Brand identity scope: the redesign MAY change the tenant's full theme (`config.ts`) — palette, typography, spacing/radius rhythm — including the primary brand color, and is not required to preserve the current red/near-black identity, provided the result is applied cohesively per FR-004/FR-005.
- **FR-017**: Imagery scope: the redesign MUST prioritize the tenant's own real photos over stock imagery, in this order: (1) reuse any of the ~24 real photos already referenced across the current mock data (cloud `dru1crghm`), (2) use additional real asset URLs the tenant owner supplies directly (e.g. from their Cloudinary collection), (3) only fall back to stock/placeholder imagery for a section where no suitable real asset exists in (1) or (2).

### Key Entities *(include if feature involves data)*

- **Page**: A localized public page (home, service, shop, about, contact, brands, bike-school, guided-tours, bike detail) made up of an ordered set of content sections.
- **Theme**: The shop's brand visual identity (color palette, typography, spacing/radius rhythm) applied uniformly across all pages.
- **Product (bike listing)**: A catalog entry — name, price, category, images, specs, availability — shown on the homepage, shop page, and its own detail page.
- **Navigation**: The shared set of header and footer links shown on every page, per locale.
- **Locale variant**: The `sl` (default), `en`, and `de` version of a page or of navigation, expected to share structure while carrying localized copy.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can state what Vukan's Bike sells and does within 5 seconds of viewing the homepage (one headline, one supporting line, one primary action, all visible without scrolling).
- **SC-002**: Zero pages contain placeholder or "unfinished" copy after the redesign (down from at least one page today).
- **SC-003**: No page section's layout-and-copy pattern is repeated near-verbatim more than once across the whole site (down from six or more near-identical closing sections today).
- **SC-004**: 100% of grid-based sections render without an orphaned single-item row at mobile, tablet, and desktop widths.
- **SC-005**: All three locale versions of every page share the same section structure and visual quality bar (zero structural drift between `sl`, `en`, and `de`).
- **SC-006**: Zero visible category filters, badges, or "browse all bikes" controls appear anywhere on the site while the catalog holds a single product (down from at least one no-op category field today).
- **SC-007**: Every theme color token the redesigned theme defines is visibly used somewhere on the live site (zero defined-but-unrendered tokens, down from at least two — `secondary` and `accent` — today).
- **SC-008**: In an informal review by three people unfamiliar with the project, shown the site cold, all three describe it as a professionally designed small-business website, and none describes it as "AI-generated," "templated," or "unfinished" without being prompted.

## Assumptions

- The tenant continues to run on the mock data adapter for this feature; Strapi wiring, schema, and seed scripts are untouched and out of scope.
- Real business facts (address, phone, email, locales served) stay as currently configured in `config.ts` — this redesign changes visual presentation and content structure, not the shop's actual contact details or service offering.
- No new pages, routes, templates, or block types are introduced; the existing page set and template assignments (`default` / `bare`) are sufficient — the product catalog stays at one entry, so no additional bike detail pages are needed.
- "Vukans-bike proprietary components" means everything under `src/tenants/vukans-bike/blocks/**` (header, footer, gallery, bike-detail, product-list) — the tenant-specific components, as distinct from cross-tenant `shared/` primitives and UI.
- Recommendations for `shared/` changes are a documentation deliverable of this feature (e.g. captured in the plan or a follow-up note), not a decision — implementation requires a separate, explicit go-ahead from the tenant owner.
- Contact page (`/contact`) needs at most light consistency polish, since it was not found to have structural issues in the current audit.
- Image sourcing follows the priority order in FR-017: real photos already referenced in mock data first, then any additional real asset URLs the tenant owner supplies (e.g. picked from their shared Cloudinary collection), then stock imagery only for remaining gaps.
