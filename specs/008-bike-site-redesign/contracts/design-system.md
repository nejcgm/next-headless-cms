# Contract: Authoring Design System

**Feature**: `008-bike-site-redesign`

The vocabulary every redesigned page must be authored in. If a page needs something this contract does not
cover, the answer is a composition of what is here — not a new prop, not a component edit. Values are copied
verbatim into page JSON so nine pages stay one site.

## 1. Nesting matrix (verified against the registry)

| Container | May contain | Depth |
|-----------|-------------|-------|
| `section` | `stack`, `flex`, `grid`, `text`, `image`, `iframe`, `icon`, `button`, `link`, `accordion`, + Keep (`gallery`, `product-list`, `bike-detail`) | 6 |
| `flex` | same as `section` | 4 |
| `stack` | `stack`, `flex`, `text`, `image`, `iframe`, `icon`, `button`, `link`, `accordion`, + Keep | 4 |
| `grid` | `stack`, `flex`, `text`, `image`, `iframe`, `icon`, `button`, `link`, `accordion`, + Keep | 5 |

Consequences to author around: **no `section` inside a `section`**, **no `grid` inside a `stack` or a `grid`**
(a grid must sit directly under a `section` or a `flex`), and Keep blocks are leaves.

## 2. Color roles

Set as bare token names — `resolveColor` maps them to `var(--color-*)`.

| Purpose | Value |
|---------|-------|
| Page ground | `background` |
| Alternating band | `muted` |
| Sand band (≤1 per page) | `accent` |
| Inverse band (≤1 per page) | `foreground` |
| Display / primary copy | `foreground` — on inverse or hero bands: `background` |
| Supporting / meta copy | `secondary` |
| Eyebrow, price | `text-primary` |
| Hairline | `border`, used as `"1px solid var(--color-border)"` |

Never author a raw hex in a page file; if a value is not in this table it does not belong on the page.

## 3. Type roles

Copy these exactly. **`fontSize` is only ever set with `variant: "body"`** — other variants carry fixed
line-heights and break when resized.

| Role | JSON |
|------|------|
| Display | `"variant": "body", "fontSize": "clamp(2.5rem, 6vw, 4rem)", "bold": true` |
| Section title | `"variant": "body", "fontSize": "clamp(1.75rem, 3.2vw, 2.5rem)", "bold": true` |
| Card title | `"variant": "body", "fontSize": "1.25rem", "bold": true` |
| Price / figure | `"variant": "body", "fontSize": "clamp(1.5rem, 2.5vw, 2rem)", "bold": true` |
| Lead | `"variant": "lead"` |
| Body | `"variant": "body"` |
| Eyebrow | `"variant": "label"` |
| Caption | `"variant": "caption"` |

Display copy stays **≤ ~28 characters** so it holds one line on desktop (leading is a loose 1.625 and cannot
be tightened from JSON).

## 4. Band sizes and separation

| Band | JSON |
|------|------|
| Compact | `"padding": "sm"` |
| Standard | `"padding": "lg"` |
| Statement | `"padding": "lg"` + inner `stack` with `"padding": "clamp(16px, 4vw, 40px) 0"` |

Adjacent root bands never share a surface. Separate with a surface change or
`"borderTop": "1px solid var(--color-border)"`. No shadows anywhere. Text-bearing stacks set
`"maxWidth": "68ch"`; the full 1152px is reserved for grids and imagery. Layout `gap` is `lg` (32px) by
default, `md` (16px) inside cards, `sm` (8px) for tight label/value pairs.

## 5. Patterns

### 5.1 Band shell

```json
{
  "__component": "blocks.section",
  "id": 10,
  "padding": "lg",
  "surface": "muted",
  "slots": { "default": [] }
}
```

### 5.2 Section header (eyebrow → title → lead)

```json
{
  "__component": "blocks.stack",
  "id": 11,
  "gap": "md",
  "maxWidth": "68ch",
  "slots": {
    "default": [
      { "__component": "blocks.text", "id": 12, "variant": "label", "content": "Servis", "color": "text-primary" },
      { "__component": "blocks.text", "id": 13, "variant": "body", "fontSize": "clamp(1.75rem, 3.2vw, 2.5rem)", "bold": true, "content": "…", "color": "foreground" },
      { "__component": "blocks.text", "id": 14, "variant": "lead", "content": "…", "color": "secondary" }
    ]
  }
}
```

### 5.3 Photographic hero (≤ 1 per page)

Hero mode centers its content in a `max-w-4xl` column at `min-h-[70vh]` and forces white text; `justify` and
`align` have no effect there. Keep it to display + lead + one `button`.

```json
{
  "__component": "blocks.section",
  "id": 1,
  "padding": "lg",
  "backgroundImage": "https://res.cloudinary.com/dru1crghm/…",
  "overlay": 0.5,
  "slots": {
    "default": [
      { "__component": "blocks.text", "id": 2, "variant": "body", "fontSize": "clamp(2.5rem, 6vw, 4rem)", "bold": true, "content": "Vukan's Bike", "color": "background" },
      { "__component": "blocks.text", "id": 3, "variant": "lead", "content": "…", "color": "background" },
      { "__component": "blocks.button", "id": 4, "label": "…", "href": "/contact" }
    ]
  }
}
```

### 5.4 Inverse statement band (≤ 1 per page — the closing band on pages that use one)

```json
{
  "__component": "blocks.section",
  "id": 60,
  "padding": "lg",
  "surface": "foreground",
  "slots": {
    "default": [
      {
        "__component": "blocks.stack",
        "id": 61,
        "gap": "lg",
        "maxWidth": "68ch",
        "padding": "clamp(16px, 4vw, 40px) 0",
        "slots": {
          "default": [
            { "__component": "blocks.text", "id": 62, "variant": "body", "fontSize": "clamp(1.75rem, 3.2vw, 2.5rem)", "bold": true, "content": "…", "color": "background" },
            { "__component": "blocks.text", "id": 63, "variant": "lead", "content": "…", "color": "background" },
            { "__component": "blocks.button", "id": 64, "label": "…", "href": "/contact" }
          ]
        }
      }
    ]
  }
}
```

### 5.5 Flagship bike feature (Home and Shop — replaces `product-list`)

Grid sits directly under the band. Spec rows are `flex` with `justify: "between"` and a hairline top.

```json
{
  "__component": "blocks.grid",
  "id": 30,
  "columns": { "mobile": 1, "tablet": 2 },
  "gap": "lg",
  "slots": {
    "default": [
      { "__component": "blocks.image", "id": 31, "src": "…", "alt": "…", "height": "clamp(320px, 45vw, 560px)" },
      {
        "__component": "blocks.stack",
        "id": 32,
        "gap": "md",
        "align": "start",
        "slots": {
          "default": [
            { "__component": "blocks.text", "id": 33, "variant": "label", "content": "…", "color": "text-primary" },
            { "__component": "blocks.text", "id": 34, "variant": "body", "fontSize": "clamp(1.75rem, 3.2vw, 2.5rem)", "bold": true, "content": "Merida Road Ride 903-27", "color": "foreground" },
            { "__component": "blocks.text", "id": 35, "variant": "body", "content": "…", "color": "secondary" },
            {
              "__component": "blocks.flex",
              "id": 36,
              "justify": "between",
              "borderTop": "1px solid var(--color-border)",
              "padding": "12px 0 0",
              "slots": {
                "default": [
                  { "__component": "blocks.text", "id": 37, "variant": "caption", "content": "Okvir", "color": "secondary" },
                  { "__component": "blocks.text", "id": 38, "variant": "caption", "content": "…", "color": "foreground" }
                ]
              }
            },
            { "__component": "blocks.text", "id": 39, "variant": "body", "fontSize": "clamp(1.5rem, 2.5vw, 2rem)", "bold": true, "content": "350 €", "color": "text-primary" },
            { "__component": "blocks.button", "id": 40, "label": "…", "href": "/bikes/merida" }
          ]
        }
      }
    ]
  }
}
```

Name, price and specs here must match `mock-data/collections/products.json`.

### 5.6 Card (grid child)

`image` → eyebrow → card title → body → `link`. Every card in a grid carries the **same** child roles; a card
missing the link its siblings have is a defect.

When the visual anchor is a logo/icon rendered with `fit: "contain"` (so it letterboxes and reads as
centered), center the title and body under it too (`"textAlign": "center"` on those two `text` nodes only —
never on the `link`, which stays left-aligned via the stack's own `align: "start"`). Give the `link` (and a
lone `icon` anchor, via `"margin": "0 auto"`) `"margin": "auto 0 0 0"` so it pins to the bottom of the card:
CSS Grid stretches every card in a row to the tallest sibling's height by default, and a flex-column child
with `margin-top: auto` consumes that slack — so every card's link lands on the same baseline regardless of
how long its body copy runs. See `brands.json`'s partner grid for the reference implementation.

```json
{
  "__component": "blocks.stack",
  "id": 50,
  "gap": "md",
  "slots": {
    "default": [
      { "__component": "blocks.image", "id": 51, "src": "…", "alt": "…", "fit": "contain", "height": "140px" },
      { "__component": "blocks.text", "id": 52, "variant": "body", "fontSize": "1.25rem", "bold": true, "content": "…", "color": "foreground" },
      { "__component": "blocks.text", "id": 53, "variant": "body", "content": "…", "color": "secondary" },
      { "__component": "blocks.link", "id": 54, "label": "…", "href": "…", "showArrow": true }
    ]
  }
}
```

### 5.7 Price list row (Service)

```json
{
  "__component": "blocks.flex",
  "id": 70,
  "justify": "between",
  "align": "start",
  "gap": "md",
  "padding": "14px 0",
  "borderTop": "1px solid var(--color-border)",
  "slots": {
    "default": [
      {
        "__component": "blocks.stack",
        "id": 71,
        "gap": "sm",
        "slots": {
          "default": [
            { "__component": "blocks.text", "id": 72, "variant": "body", "fontSize": "1.25rem", "bold": true, "content": "…", "color": "foreground" },
            { "__component": "blocks.text", "id": 73, "variant": "caption", "content": "…", "color": "secondary" }
          ]
        }
      },
      { "__component": "blocks.text", "id": 74, "variant": "body", "bold": true, "content": "45 €", "color": "text-primary" }
    ]
  }
}
```

### 5.8 FAQ

A `stack` of `accordion` leaves. `accordion` accepts only `padding`, `margin`, `backgroundColor`, `border`,
`borderRadius` — its text color is not authorable, so do not place it on a `foreground` or `accent` band.

### 5.9 Gallery (Bike school, Guided tours)

`gallery` renders its own `heading` / `subheading`. Either use those **or** frame it under a band with a
section header — never both.

Two hardcoded behaviours the page tree has to work around:

- **It paints its own band.** The component wraps itself in `<section class="py-16 md:py-24 bg-[var(--color-background)]">`, so it is always a white band at full width and cannot be framed by a parent surface. Treat a gallery as a `background` band when planning alternation — the bands either side of it must not also be `background`.
- **Five images is the right count.** The tile pattern gives index 0 a 2×2 cell and the rest 1×1; at four columns that fills exactly two rows with no gaps, and at two columns exactly three rows. Five is also under the hardcoded 10-item reveal, so no half-empty "show more" appears.

## 6. Forbidden

- A `text` node without `color`.
- `fontSize` on `lead`, `caption` or `label`.
- Raw hex in page JSON.
- A `navigation` key in a page file.
- `blocks.product-list` (this cycle) and any category label, filter or "browse all bikes" control.
- Two adjacent bands with the same surface; more than one hero, inverse or accent band per page.
- Vanity stat strips, decorative icon-card grids for non-interactive content, chip/pill clutter.
- "Book"/"reserve" CTA verbs — there is no booking system.
- Placeholder, "coming soon" or apologetic copy.
