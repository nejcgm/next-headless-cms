# Contract: Asset Inventory

**Feature**: `008-bike-site-redesign`

Every image referenced by this tenant, and the band it is assigned to in the redesign. Descriptions come from
the `alt` text and current usage — the images themselves were not viewed, so if an assignment is visually
wrong, swapping the `src` is a one-line change.

**Cloud**: `res.cloudinary.com/dru1crghm`. **Totals**: 22 real photos + 7 partner logos + 3 bike photos in the
product collection. Three Unsplash stock URLs are in use today (all as `ogImage`) and are **replaced** by real
photos in this redesign, so the finished site references **zero** stock imagery.

## Photo assignments

| Asset | Shows | Assigned to |
|-------|-------|-------------|
| `IMG_0035_fsvhgt.jpg` | Trail / riding | Home — hero background |
| `IMG_0053_hiw6cd.jpg` | Workshop, service bench | Home — service band image |
| `1000006941_zpluxx.jpg` | Bike school session | Home — school card |
| `IMG_0028_gzpale.jpg` | Guided tour riding | Home — tours card |
| `1000004333_bged3h.jpg` | Shop / brand shot (was the header "logo") | Home — `ogImage` |
| `9c4caa91-…_pezutz.jpg` | Workshop interior | About — story band |
| `1000024272_almr2a.jpg` | Gregor Vukan (owner) | About — owner band + About `ogImage` |
| `IMG_4568_xculvx.heic` | Service work | Service — `ogImage` (replaces Unsplash) |
| `1000005460_wnwxdc.jpg` | Bike school group | Bike school — hero background |
| `1000025520_kspaqn.jpg` | Tour group / landscape | Guided tours — hero background + `ogImage` |
| `IMG_3164_c1xp3f.heic` | Shop exterior / location | Contact — `ogImage` |
| `IMG_4484_p1jqkq.heic` | Merida road bike | Shop + Home flagship band, bike detail `ogImage` |
| `IMG_4485_tll175.heic` | Merida, second angle | Shop — flagship secondary image |
| `IMG_4488_gtri5z.heic` | Merida, third angle | Product collection only (`bike-detail` gallery) |

### Gallery split

The two galleries currently share six of their photos. They are split into disjoint sets so each page has its
own material:

| Page | Gallery images |
|------|----------------|
| Bike school | `IMG_2608_cbh0u1.heic`, `IMG_2611_wxpwqs.heic`, `1000026613_nfxcr7.jpg`, `3f37be51-…_xcwuc8.jpg`, `89f512ad-…_v4zabz.jpg` |
| Guided tours | `1000004580_hrsyxv.jpg`, `1000006042_tivdyq.jpg`, `1000005467_ovxiqg.jpg`, `1000004389_mpu6mu.jpg`, `0f080a97-…_tlipod.jpg` |

Five images per gallery also sits under the component's hardcoded 10-item initial reveal, so no "show more"
control appears with a half-empty second page.

## Partner logos (`/brands`)

`images_1_gd8ohz.png` (Reverse Components) · `images_wbppdf.jpg` (Flat Out Days) ·
`goodyear-logo-01_zlhnbl.jpg` (Goodyear Bike) · `images_1_lbvhfo.jpg` (BATT Crew) ·
`images_2_xviu4o.jpg` (Loose Riders) · `1718357843307_LOGO_ŠKTD_MLINARJI_APAČE.png_fvumlz.png`
(Apače mlinarji) · `images_3_fg2dgh.jpg` (427 Savage Squad)

Rendered with `fit: "contain"` at a fixed height so the mismatched source crops align on a row.

## Retired

| Asset | Why |
|-------|-----|
| `photo-1541625602330-…` (Unsplash) | Was About `ogImage` — replaced with the owner photo |
| `photo-1558618666-…` (Unsplash) | Was Service `ogImage` — replaced with `IMG_4568` |
| `photo-1571068316344-…` (Unsplash) | Was Brands `ogImage` — replaced with `1000004333` |
| `1000004333_bged3h.jpg` moved from `logoUrl` to `faviconUrl` | Was the header logo (squashed to 40px); now only the favicon, once `faviconUrl` was split out from `logoUrl` as its own `TenantConfig` field (research R8) — the header renders its text wordmark instead |

## Notes

- `ogImage` URLs gain a `c_fill,w_1200,h_630` transform so social cards crop predictably instead of serving
  a portrait original.
- `.heic` sources are fine — the delivery URLs carry `f_auto`/`f_jpg`, so Cloudinary converts on the fly.
- **Gaps**: none. Every band in [page-blueprints.md](./page-blueprints.md) has a real photo assigned, so
  FR-017's stock-image fallback is never needed. If the owner supplies more photos from their Cloudinary
  collection, the obvious upgrades are a dedicated Service band photo and a second workshop shot for About.
