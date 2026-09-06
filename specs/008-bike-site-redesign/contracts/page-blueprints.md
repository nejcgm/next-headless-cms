# Contract: Page Blueprints

**Feature**: `008-bike-site-redesign`

Target band order per page, authored with the patterns in [design-system.md](./design-system.md). Surfaces are
assigned here so the site alternates predictably and no two pages close the same way (SC-003). Every `sl` page
is mirrored to `en--*` / `de--*` with identical structure and ids.

**Site-wide budget**: photographic heroes on **Home, Service, Bike school, Guided tours**. Inverse
(`foreground`) closing bands on **Home** and **Bike school**. Sand (`accent`) closing bands on **Shop** and
**Guided tours**. **Service** closes on a compact hairline band, **About** and **Brands** close without a CTA
band, **Contact** needs none.

## `/` — Home (`home.json`)

| # | Band | Surface | Content |
|---|------|---------|---------|
| 1 | Photographic hero | photo + `overlay: 0.5` | Brand + place display (≤28 chars), one lead line, one `button` → `/contact` |
| 2 | Positioning | `background` | Section header at `68ch` — what the shop is, in the owner's voice |
| 3 | Service | `muted` | Section header + 3-up `grid` of service cards → `/service` |
| 4 | Flagship bike | `background` | Pattern 5.5 — image + specs + price + `button` → `/bikes/merida` |
| 5 | School & tours | `accent` | 2-up `grid`, one card each → `/bike-school`, `/guided-tours` |
| 6 | Closing | `foreground` (inverse) | "Come to the workshop" — address line + `button` → `/contact` |

**Remove**: the embedded `navigation` key; the `product-list` node (`id 13`, `limit: 3`); the "Kolesa,
pripravljena na vožnjo" plural framing.

## `/service` — Service (`service.json`)

| # | Band | Surface | Content |
|---|------|---------|---------|
| 1 | Photographic hero | photo + `overlay: 0.5` | Eyebrow + display + lead + 2 buttons (call, jump to price list) |
| 2 | Price list | `background` | Pattern 5.7 rows — the existing nine tiers, aligned prices, hairline rules |
| 3 | How it works | `muted` | 4-up `grid`, numeral + step title + one line each |
| 4 | FAQ | `background` | `stack` of `accordion` (never on a tinted band) |
| 5 | Closing | `background` + `borderTop` hairline | Compact: one line + phone `link`, no button — deliberately quieter than other pages |

**Remove**: the embedded `navigation` key. **Fix**: renumber the duplicated ids (298–330, 401–404) so every id
is unique in the file.

## `/shop` — Shop (`shop.json`)

| # | Band | Surface | Content |
|---|------|---------|---------|
| 1 | Compact header | `background` | Eyebrow + display + lead — honest framing: what the shop stocks and orders |
| 2 | Flagship bike | `muted` | Pattern 5.5, fuller than Home: more spec rows, second image if one exists |
| 3 | Ordering / service cross-link | `background` | Section header + body at `68ch` + `link` → `/service` |
| 4 | Closing | `accent` | "Looking for something else? Write to us" + `link` → `/contact` |

**Remove**: the `product-list` node (`id 300`), and any category or "browse all bikes" affordance (V7).

## `/about` — About (`about.json`)

| # | Band | Surface | Content |
|---|------|---------|---------|
| 1 | Compact header | `muted` | Eyebrow + display + lead |
| 2 | Story | `background` | 2-up `grid` — copy at `68ch` beside a real workshop photo |
| 3 | Owner | `muted` | 2-up `grid` — portrait + specific bio (Gregor Vukan), no generic claims |
| 4 | Values | `background` | 4-up `grid`, one line each, rewritten to specifics (place, workshop practice, turnaround) |

Closes without a CTA band — the values grid ends the page, and the header/footer carry contact.
**Rewrite**: replace the interchangeable "kakovost, iskrenost in vaše zaupanje" values copy (FR-003).

## `/contact` — Contact (`contact.json`)

| # | Band | Surface | Content |
|---|------|---------|---------|
| 1 | Compact header | `background` | Eyebrow + display + one lead line |
| 2 | Details + map | `background` | 2-up `grid` — `icon`+`text`+`link` rows (address, phone, email) beside the map `iframe` |

Structure is already sound (spec assumption); this is a restyle to the token system, not a rebuild. Do not
invent opening hours or any business fact that is not already in `config.ts`.

## `/brands` — Partners (`brands.json`)

| # | Band | Surface | Content |
|---|------|---------|---------|
| 1 | Compact header | `muted` | Eyebrow + display + lead |
| 2 | Partner grid | `background` | `{ mobile: 1, tablet: 2, desktop: 4 }` — **8 cards**: the 7 partners + a "work with us" card → `/contact` |

**Fix**: give "Apače mlinarji" the same `link` its siblings have (V8 / FR-003); logos use `fit: "contain"` at a
fixed `height` so mismatched source images align. **Remove**: the embedded `navigation` key. Closes on the
grid — the 8th card is the call to action.

## `/bike-school` — Bike school (`bike-school.json`)

| # | Band | Surface | Content |
|---|------|---------|---------|
| 1 | Photographic hero | photo + `overlay: 0.5` | Display + lead + `button` |
| 2 | What it is | `background` | Section header at `68ch` |
| 3 | Programs | `muted` | 2-up `grid` — Basic / Advanced, consistent card roles |
| 4 | Gallery | `background` | `gallery`, curated count/order (5.9) |
| 5 | Closing | `foreground` (inverse) | Dual action: external Flat Out Days link **and** a first-party `button` → `/contact` (FR-012) |

## `/guided-tours` — Guided tours (`guided-tours.json`)

| # | Band | Surface | Content |
|---|------|---------|---------|
| 1 | Photographic hero | photo + `overlay: 0.5` | Display + lead + `button` |
| 2 | What you get | `muted` | 4-up `grid`, one line each |
| 3 | Gallery | `background` (forced by the component) | `gallery`, curated to 5 images |
| 4 | How it works | `muted` | 4-up `grid`, numeral + step |
| 5 | Closing | `accent` | Contact + phone `link` |

`gallery` paints its own white band (design-system 5.9), so bands 2 and 4 are `muted` to keep the
alternation reading.

**Remove**: the gallery `subheading` admitting the photos are temporary (V12 / SC-002).

## `/bikes/:slug` — Bike detail (`bikes--merida.json`)

Single `blocks.bike-detail` node, unchanged in structure. **Remove**: the dead inline `bike` object (V6).
Polish the 17 `labels` strings to the redesigned voice and make sure the contact CTAs match FR-008 verbs.

## Navigation (`navigation.json`, `en--`, `de--`)

`header`: Servis, Vodene ture, Kolesarska šola, Trgovina, O nas, Partnerji, Kontakt (logo is Home).
`footer`: Domov + those seven.
`footerCopy`: rewrite `tagline` (the current one says only "gorskih koles" though the shop serves all types),
`linksHeading`, `contactHeading`, `contactPlaceholder`, `copyrightReserved`.

## SEO

Per page: rewrite `seo.title` / `seo.description` in the page's own voice, and point every `ogImage` at a real
tenant photo — three pages currently use Unsplash stock for `ogImage` (FR-017 ordering).
