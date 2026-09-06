# Quickstart: Vukan's Bike Full Visual Redesign

**Feature**: `008-bike-site-redesign`

How to run the redesigned site and how to decide whether it actually meets the bar. The design gate here is
not "does it compile" — it is "does a stranger read this as a professional small business site" (SC-008), so
the visual review below is a required step, not a nicety.

## Run

```bash
cd next-headless-cms-fe
pnpm install          # first time only
pnpm dev:bike         # → http://localhost:3002
```

The tenant is on the **mock adapter**, so pages come straight from
`src/tenants/vukans-bike/mock-data/` — no Strapi needed. Edited JSON is picked up on reload.

Pages to open, in this order (the order a visitor is most likely to arrive in):

```text
/            /shop          /service        /about       /contact
/brands      /bike-school   /guided-tours   /bikes/merida
```

Then repeat for `/en/...` and `/de/...`.

## Gates

```bash
pnpm type-check          # unchanged types, but config.ts is edited
pnpm lint:bike
pnpm lint:resort         # must stay green — this feature must not touch resort
pnpm build:bike && pnpm verify:build
```

Content-only changes should leave `lint:resort` and `verify:build` untouched; if either moves, something
outside the tenant was edited.

## Data validation sweep (V1–V14 from [data-model.md](./data-model.md))

Run from `next-headless-cms-fe/`. These are greps, not tests — each should return **nothing**.

```bash
cd src/tenants/vukans-bike/mock-data

# V3 — no page carries a dead navigation key
grep -l '"navigation"' pages/*.json

# V5 — product-list is unused this cycle
grep -l 'blocks.product-list' pages/*.json

# V6 — no dead inline bike object on the detail page
grep -l '"bike"' pages/*bikes--merida.json

# V4 — duplicate block ids within a file (expect no output)
for f in pages/*.json; do
  dupes=$(grep -o '"id": [0-9]*' "$f" | sort | uniq -d)
  [ -n "$dupes" ] && echo "$f: $dupes"
done
```

`V1` (every `text` node sets `color`) and `V2` (`fontSize` only on `variant: "body"`) are best checked with a
quick read of each file's `blocks.text` nodes as it is authored — they are authoring habits more than
after-the-fact greps.

## Visual review — per page

Walk each page at three widths (**375px**, **768px**, **1280px**) and check:

1. **Hierarchy** — eyebrow → title → lead → body reads in that order; no headline collides with its next line
   (the R3 trap); no paragraph runs the full page width.
2. **Bands** — no two adjacent bands share a surface; at most one hero, one inverse band, one accent band.
3. **Grids** — no row ends with a single stranded item at any of the three widths (SC-004).
4. **Cards** — every card in a grid has the same roles present (image, title, body, link).
5. **Copy** — specific to this shop and place; no placeholder or apologetic lines; no "book"/"reserve" verbs.
6. **Actions** — at least one first-party action per page; every CTA goes somewhere real.
7. **Imagery** — real tenant photography; stock only where nothing suitable exists.

## Visual review — site-wide

- **Palette**: all eight tokens visibly in play (SC-007) — red actions, sand band, inverse band, hairlines,
  eyebrow/price ink, muted alternation, foreground copy, white ground.
- **Repetition**: no closing band repeated with the same layout *and* near-identical copy (SC-003). Compare
  the closing band of Home, Service, Shop, Bike school and Guided tours side by side.
- **Chrome**: header shows six items plus the locale pill without wrapping at 1024px; the wordmark reads
  cleanly; the footer carries all eight links.
- **Locales**: open `/`, `/en`, `/de` side by side — the structure must be identical and only the words
  different (SC-005). German runs longest; check it does not break any band.
- **Contrast**: body copy on white, and any text on the inverse and hero bands, must stay legible; supporting
  gray (`secondary`) is for meta text, not long paragraphs.

## First-impression check (SC-001, SC-008)

Show the homepage cold to three people who have not seen the project:

1. Give them 5 seconds on `/`, then ask what the business does. If they cannot say "bike shop — service and
   sales", SC-001 fails.
2. Let them browse freely, then ask how the site looks. If anyone says "AI-generated", "template" or
   "unfinished" unprompted, SC-008 fails and the specific page they reacted to gets reworked.

## Reverting the palette

The whole visual direction lives in `src/tenants/vukans-bike/config.ts`. If the owner prefers the previous
dark identity, reverting that one file restores it — the page JSON references tokens by role, not by color, so
it keeps working either way (research R5).
