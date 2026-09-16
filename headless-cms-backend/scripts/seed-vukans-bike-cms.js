/**
 * Seed Strapi pages + navigation for vukans-bike from frontend mock JSON.
 *
 * Mock JSON files are now stored in Strapi API *response* format
 * (`__component` on dynamic zone items, numeric `id` on every component row).
 * This script strips those row IDs before POSTing so Strapi can assign them,
 * and drops fields that exist in mock data but not in the Strapi schema
 * (e.g. `bike` inside a `bike-detail` block — loaded at runtime via dataContract).
 *
 * As of 009-bike-strapi-migration, this script is also the single place that
 * reshapes each component's fields from the pre-migration mock-JSON shape into
 * the redesigned, editor-friendly Strapi schema (see
 * specs/009-bike-strapi-migration/research.md R7-R13 and data-model.md for the
 * exact mappings) — the mock JSON files themselves are left untouched.
 *
 * Usage (from headless-cms-backend/):
 *   STRAPI_API_TOKEN=<full-access-token> node scripts/seed-vukans-bike-cms.js
 *
 * Requires Strapi running (npm run develop) with schemas already applied.
 */

const fs = require("fs");
const path = require("path");

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const TOKEN = process.env.STRAPI_API_TOKEN;
const TENANT = "vukans-bike";
const KEEP_PRODUCT_SLUGS = new Set(["merida"]);
const ORPHAN_BIKE_PAGE_SLUGS = ["/bikes/all-terrain-ebike", "/bikes/trailblazer-x1"];
const MOCK_ROOT = path.resolve(
  __dirname,
  "../../next-headless-cms-fe/src/tenants/vukans-bike/mock-data"
);

if (!TOKEN) {
  console.error("Set STRAPI_API_TOKEN (Strapi API token with create/update on page + navigation).");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Fields that exist in mock JSON but NOT in the Strapi schema.
// These are loaded at runtime via dataContract and must be dropped before seeding.
// ---------------------------------------------------------------------------
const BLOCK_SCHEMA_EXCLUDE = {
  "blocks.bike-detail": ["bike"],
  "blocks.product-list": ["products", "locale"],
};

// ---------------------------------------------------------------------------
// 009-bike-strapi-migration field-shape mappings (research.md R7-R13).
// Every map below is total against current mock content — an unmapped value
// throws rather than seeding a silently-wrong shape.
// ---------------------------------------------------------------------------
const BORDER_VALUE_MAP = {
  "1px solid var(--color-border)": "hairline",
  "2px solid var(--color-background)": "invertedOutline",
  none: "none",
};

// 012.1 border-system revisit: the old 3-value border enum (hairline/invertedOutline/none)
// is retired in favor of a normal width+style+color triple — these are the concrete values
// each old step rendered as.
const BORDER_STEP_TO_TRIPLE = {
  none: null,
  hairline: { borderWidth: 1, borderStyle: "solid", borderColor: "border" },
  invertedOutline: { borderWidth: 2, borderStyle: "solid", borderColor: "background" },
};

// 012.1: Section's `padding` reverts from a sm/md/lg dropdown back to a free
// px sizing value — these match the old Tailwind py-8/py-12/py-20 classes.
const SECTION_PADDING_VALUE_MAP = { sm: "32", md: "48", lg: "80" };

// 012-primitive-props-redesign: Text.fontSize is now a plain px number (no
// more named steps) — each value below is the representative px size roughly
// midway across the old responsive clamp() range (data-model.md's migration
// mapping table). This necessarily drops the old viewport-responsive scaling
// down to one fixed size — see specs/012-primitive-props-redesign for why.
const FONT_SIZE_VALUE_MAP = {
  "1.25rem": 20,
  "clamp(1.75rem, 3.2vw, 2.5rem)": 34,
  "clamp(1.25rem, 2.2vw, 1.75rem)": 24,
  "clamp(2.25rem, 5vw, 3.25rem)": 44,
  "clamp(1.5rem, 2.5vw, 2rem)": 28,
  "clamp(2.5rem, 6vw, 4rem)": 52,
  "clamp(1.5rem, 2.8vw, 2rem)": 28,
};

const HERO_MIN_HEIGHT_MAP = {
  "clamp(480px, 72vh, 720px)": "standard",
  "clamp(520px, 82vh, 820px)": "tall",
};

// 012-primitive-props-redesign: Flex/Grid/Stack `gap` is now a plain px
// string instead of a named sm/md/lg step (matches the old Tailwind
// gap-2/gap-4/gap-8 values these steps rendered as).
const GAP_VALUE_MAP = { sm: "8", md: "16", lg: "32" };

// 012-primitive-props-redesign: Icon `size` is now a plain px number instead
// of a named sm/md/lg step — values below match the old glyph's own px size
// (the icon's outer container previously padded that glyph up to a larger
// box; that container-vs-glyph distinction is gone, see data-model.md).
const ICON_SIZE_VALUE_MAP = { sm: 16, md: 18, lg: 22 };

// 012.1: sizing fields (width/height/minWidth/maxWidth/maxHeight) now only
// accept a bare px number or a %-suffixed number (toCssSize) — anything else
// is silently ignored at render time. Pre-migration content authored these as
// arbitrary CSS: a plain px-suffixed value, a `ch` measure (readable text
// column widths), or a responsive `clamp(min, preferred, max)`. Convert each
// to a single representative px number rather than dropping it:
//  - "120px" -> "120" (strip the unit, already a fixed value)
//  - "68ch"  -> round(68 * 8.5) (~8.5px per "ch" character unit at this
//    corpus's font sizes; loses nothing meaningful — it was always an
//    approximation of a readable line length, not a pixel-exact spec)
//  - "clamp(320px, 45vw, 560px)" -> round((320 + 560) / 2) (midpoint of the
//    old responsive range, same "representative value" approach already used
//    for FONT_SIZE_VALUE_MAP/HERO_MIN_HEIGHT_MAP)
const SIZING_FIELDS = ["width", "height", "minWidth", "maxWidth", "maxHeight"];
const CH_TO_PX = 8.5;

function normalizeLegacySizingValue(value) {
  if (typeof value !== "string") return value;

  const pxMatch = /^(\d+(?:\.\d+)?)px$/.exec(value);
  if (pxMatch) return pxMatch[1];

  const chMatch = /^(\d+(?:\.\d+)?)ch$/.exec(value);
  if (chMatch) return String(Math.round(parseFloat(chMatch[1]) * CH_TO_PX));

  const clampMatch = /^clamp\(\s*([\d.]+)px\s*,[^,]+,\s*([\d.]+)px\s*\)$/.exec(value);
  if (clampMatch) {
    const min = parseFloat(clampMatch[1]);
    const max = parseFloat(clampMatch[2]);
    return String(Math.round((min + max) / 2));
  }

  return value;
}

// 012.1: there is no `dividerTop` box-style flag — a single top hairline rule
// can't be expressed by the normal border box (CSS `border` always applies to
// all four sides), and the user explicitly does not want a dedicated boolean
// prop for it. Pre-migration content used a raw `borderTop` CSS string for
// exactly this (a thin rule above some spaced-out content, e.g. a stat row).
// The workaround: synthesize an actual 1px-tall Flex child with a background
// color, prepended into the node's own children, and move the "gap after the
// line" from this node's own top padding onto that synthetic child's bottom
// margin — reproducing the original visual (line, then gap, then content)
// without any schema-level divider concept outside Section's own `divider`.
function parsePaddingBox(padding) {
  const parts = String(padding)
    .trim()
    .split(/\s+/)
    .map((part) => {
      if (part === "0") return 0;
      const match = /^(\d+(?:\.\d+)?)px$/.exec(part);
      return match ? parseFloat(match[1]) : null;
    });
  let top, right, bottom, left;
  if (parts.length === 1) [top, right, bottom, left] = [parts[0], parts[0], parts[0], parts[0]];
  else if (parts.length === 2) [top, right, bottom, left] = [parts[0], parts[1], parts[0], parts[1]];
  else if (parts.length === 3) [top, right, bottom, left] = [parts[0], parts[1], parts[2], parts[1]];
  else if (parts.length === 4) [top, right, bottom, left] = parts;
  if ([top, right, bottom, left].some((v) => v == null)) {
    throw new Error(`Unrecognized padding shorthand for borderTop migration: ${JSON.stringify(padding)}`);
  }
  return { top, right, bottom, left };
}

/**
 * Reshape one component's own fields from the pre-migration mock-JSON shape to
 * the redesigned Strapi schema shape. Operates on this node's own keys only —
 * does not recurse into slots (prepareForCreate handles that).
 */
function transformFieldsForComponent(obj, component) {
  const out = { ...obj };

  for (const field of SIZING_FIELDS) {
    if (field in out) out[field] = normalizeLegacySizingValue(out[field]);
  }

  if ("borderTop" in out) {
    delete out.borderTop;
    const { top, right, bottom, left } = parsePaddingBox(out.padding ?? "0px");
    out.padding = `0px ${right}px ${bottom}px ${left}px`;
    const divider = {
      __component: "blocks.flex",
      height: "1",
      backgroundColor: "border",
      margin: `0px 0px ${top}px 0px`,
    };
    const existingDefault = (out.slots && out.slots.default) || [];
    out.slots = { ...out.slots, default: [divider, ...existingDefault] };
  }
  if ("lineHeight" in out) {
    delete out.lineHeight;
  }

  if (component === "blocks.section") {
    if ("backgroundColor" in out) {
      throw new Error(
        `blocks.section unexpectedly sets backgroundColor (expected surface only): ${JSON.stringify(out)}`
      );
    }
    if ("minHeight" in out) {
      const mapped = HERO_MIN_HEIGHT_MAP[out.minHeight];
      if (!mapped) {
        throw new Error(`Unrecognized hero minHeight ${JSON.stringify(out.minHeight)}`);
      }
      // 012: section's own hero-height field is (again) named `minHeight`.
      delete out.minHeight;
      out.minHeight = mapped;
    }
    // 012.1: section's own `padding` reverts to a free px sizing value.
    if ("padding" in out) {
      const mapped = SECTION_PADDING_VALUE_MAP[out.padding];
      if (!mapped) {
        throw new Error(`Unrecognized section padding ${JSON.stringify(out.padding)}`);
      }
      out.padding = mapped;
    }
    if ("slots" in out) {
      const slotKeys = Object.keys(out.slots || {});
      const unexpected = slotKeys.filter((k) => k !== "default");
      if (unexpected.length > 0) {
        throw new Error(
          `blocks.section has unexpected slot(s) ${unexpected.join(", ")} (only "default" is supported)`
        );
      }
    }
  } else if ("minHeight" in out) {
    // No non-section component ever authored minHeight (research R13) — drop defensively.
    delete out.minHeight;
  }

  if (component === "blocks.grid" && out.columns) {
    const { mobile, tablet, desktop } = out.columns;
    out.columnsMobile = String(mobile);
    if (tablet != null) out.columnsTablet = String(tablet);
    if (desktop != null) out.columnsDesktop = String(desktop);
    delete out.columns;
  }

  if (component === "blocks.text" && "fontSize" in out) {
    const mapped = FONT_SIZE_VALUE_MAP[out.fontSize];
    if (!mapped) {
      throw new Error(`Unrecognized text fontSize ${JSON.stringify(out.fontSize)}`);
    }
    out.fontSize = mapped;
  }

  if ("border" in out) {
    const step = BORDER_VALUE_MAP[out.border];
    if (!step) {
      throw new Error(`Unrecognized border value ${JSON.stringify(out.border)} on ${component}`);
    }
    delete out.border;
    const triple = BORDER_STEP_TO_TRIPLE[step];
    if (triple) Object.assign(out, triple);
  }

  if (component === "blocks.product-list" && "category" in out) {
    delete out.category;
  }

  // ---------------------------------------------------------------------
  // 012-primitive-props-redesign transforms (data-model.md migration table)
  // ---------------------------------------------------------------------

  if (
    (component === "blocks.flex" || component === "blocks.grid" || component === "blocks.stack") &&
    "gap" in out
  ) {
    const mapped = GAP_VALUE_MAP[out.gap];
    if (!mapped) {
      throw new Error(`Unrecognized gap ${JSON.stringify(out.gap)} on ${component}`);
    }
    out.gap = mapped;
  }

  if (component === "blocks.stack") {
    // Stack is retired — every Stack becomes a column Flex (research R8/FR-011).
    out.__component = "blocks.flex";
    out.direction = "column";
  }

  if (component === "blocks.text" && "variant" in out) {
    const variant = out.variant;
    delete out.variant;
    if (variant === "lead") {
      out.fontSize = out.fontSize ?? 22;
      out.color = out.color ?? "muted";
    } else if (variant === "caption") {
      out.fontSize = out.fontSize ?? 14;
      out.color = out.color ?? "muted";
    } else if (variant === "label") {
      out.fontSize = out.fontSize ?? 12;
      out.uppercase = true;
      out.bold = out.bold ?? true;
      out.color = out.color ?? "muted";
    } else if (variant !== "body") {
      throw new Error(`Unrecognized text variant ${JSON.stringify(variant)}`);
    }
  }

  if (component === "blocks.link" && out.variant === "muted") {
    out.variant = "secondary";
  }

  if ((component === "blocks.button" || component === "blocks.link") && "label" in out) {
    const label = out.label;
    delete out.label;
    out.slots = { default: [{ __component: "blocks.text", content: label }] };
  }

  if (component === "blocks.accordion" && "content" in out) {
    const content = out.content;
    delete out.content;
    out.slots = { default: [{ __component: "blocks.text", content }] };
  }

  if (component === "blocks.icon" && "size" in out) {
    const mapped = ICON_SIZE_VALUE_MAP[out.size];
    if (!mapped) {
      throw new Error(`Unrecognized icon size ${JSON.stringify(out.size)}`);
    }
    out.size = mapped;
  }

  if (component === "blocks.gallery" && "images" in out) {
    const images = Array.isArray(out.images) ? out.images : [];
    out.slots = {
      default: images.map((image) => ({
        __component: "blocks.image",
        src: image.src,
        alt: image.alt ?? out.defaultImageAlt,
      })),
    };
    out.layout = "grid";
    out.columnsMobile = "2";
    out.columnsTablet = "4";
    out.columnsDesktop = "4";
    out.gap = "16";
    delete out.images;
    delete out.defaultImageAlt;
    delete out.showLessLabel;
    delete out.showMorePrefix;
    delete out.showMoreSuffix;
    delete out.lightboxAltPrefix;
  }

  return out;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Recursively strip `id` from component objects so Strapi can assign its own.
 * Also removes fields listed in BLOCK_SCHEMA_EXCLUDE for specific block types.
 * Keeps data `id` values only at the very top level (page/navigation document).
 */
function prepareForCreate(value, blockComponent = null) {
  if (Array.isArray(value)) {
    return value.map((item) => prepareForCreate(item));
  }

  if (value !== null && typeof value === "object") {
    const result = {};
    const component = value.__component || blockComponent;
    const exclude = (component && BLOCK_SCHEMA_EXCLUDE[component]) || [];
    const shaped = component ? transformFieldsForComponent(value, component) : value;

    for (const [k, v] of Object.entries(shaped)) {
      if (k === "id") continue;              // strip Strapi row ID
      if (exclude.includes(k)) continue;    // strip schema-excluded fields

      // Pass the current __component down so nested loops can use it
      result[k] = prepareForCreate(v, k === "__component" ? null : component);
    }
    return result;
  }

  return value;
}

/**
 * Pick only the fields Strapi's shared.seo component accepts.
 * (Mock seo object now has an extra `id` from mock format — strip it.)
 */
function cleanSeo(seo) {
  if (!seo) return { title: "Untitled", description: "" };
  return {
    title: seo.title || "Untitled",
    description: seo.description || "",
    ...(seo.ogImage ? { ogImage: seo.ogImage } : {}),
    ...(seo.canonical ? { canonical: seo.canonical } : {}),
    noIndex: Boolean(seo.noIndex),
    ...(seo.jsonLd ? { jsonLd: seo.jsonLd } : {}),
  };
}

// ---------------------------------------------------------------------------
// Strapi API client
// ---------------------------------------------------------------------------

async function strapiFetch(method, apiPath, body) {
  const res = await fetch(`${STRAPI_URL}${apiPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${method} ${apiPath} → ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

async function upsertByFilter(collection, filters, data) {
  const qs = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    qs.set(`filters[${k}][$eq]`, String(v));
  });
  qs.set("pagination[pageSize]", "1");
  // Fetch the draft version (status=draft finds it regardless of publish state)
  qs.set("status", "draft");

  const existing = await strapiFetch("GET", `/api/${collection}?${qs.toString()}`);
  const row = existing?.data?.[0];

  if (row?.documentId) {
    // Update and publish in one call (Strapi 5: ?status=published on PUT)
    await strapiFetch("PUT", `/api/${collection}/${row.documentId}?status=published`, { data });
    return "updated";
  }

  // Create and publish in one call (Strapi 5: ?status=published on POST)
  await strapiFetch("POST", `/api/${collection}?status=published`, { data });
  return "created";
}

async function listAll(collection, filters = {}) {
  const items = [];
  let page = 1;

  while (true) {
    const qs = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      qs.set(`filters[${k}][$eq]`, String(v));
    });
    qs.set("pagination[page]", String(page));
    qs.set("pagination[pageSize]", "100");
    qs.set("status", "draft");

    const res = await strapiFetch("GET", `/api/${collection}?${qs.toString()}`);
    const batch = res?.data || [];
    items.push(...batch);
    if (batch.length < 100) break;
    page++;
  }

  return items;
}

async function deleteByDocumentId(collection, documentId) {
  await strapiFetch("DELETE", `/api/${collection}/${documentId}`);
}

async function pruneProducts() {
  const rows = await listAll("products", { tenant: TENANT });
  let deleted = 0;

  for (const row of rows) {
    const slug = row.slug;
    if (KEEP_PRODUCT_SLUGS.has(slug)) continue;

    await deleteByDocumentId("products", row.documentId);
    console.log(`  ✓ deleted product [${row.lang}] ${slug}`);
    deleted++;
  }

  return deleted;
}

async function pruneOrphanBikePages() {
  let deleted = 0;

  for (const slug of ORPHAN_BIKE_PAGE_SLUGS) {
    for (const lang of ["sl", "en", "de"]) {
      const qs = new URLSearchParams();
      qs.set("filters[tenant][$eq]", TENANT);
      qs.set("filters[lang][$eq]", lang);
      qs.set("filters[slug][$eq]", slug);
      qs.set("pagination[pageSize]", "1");
      qs.set("status", "draft");

      const existing = await strapiFetch("GET", `/api/pages?${qs.toString()}`);
      const row = existing?.data?.[0];
      if (!row?.documentId) continue;

      await deleteByDocumentId("pages", row.documentId);
      console.log(`  ✓ deleted page [${lang}] ${slug}`);
      deleted++;
    }
  }

  return deleted;
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

function parsePageFile(filename) {
  const match = filename.match(/^(?:(sl|en|de)--)?(.+)\.json$/);
  if (!match) return null;
  const [, localeFromName] = match;
  const filePath = path.join(MOCK_ROOT, "pages", filename);
  const page = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const locale = localeFromName || page.locale || "sl";
  return { locale, page };
}

function buildPagePayload(page, locale) {
  // blocks is already in Strapi dynamic zone format (__component + flat fields).
  // prepareForCreate strips row IDs and schema-excluded fields (e.g. bike.bike).
  const blocks = prepareForCreate(page.blocks || []);

  return {
    tenant: TENANT,
    lang: locale,            // named `lang` to avoid Strapi i18n reserved `locale` param
    slug: page.slug,
    slugPattern: page.slugPattern || null,
    template: page.template || "default",
    blocks,
    seo: cleanSeo(page.seo),
  };
}

async function seedPages() {
  const dir = path.join(MOCK_ROOT, "pages");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  let count = 0;

  for (const file of files) {
    const parsed = parsePageFile(file);
    if (!parsed) continue;
    const { locale, page } = parsed;

    // Slug pattern pages (e.g. /bikes/:slug) — ensure slugPattern is set
    if (page.slug?.includes(":") && !page.slugPattern) {
      page.slugPattern = page.slug;
    }

    const data = buildPagePayload(page, locale);
    try {
      const action = await upsertByFilter(
        "pages",
        { tenant: TENANT, lang: locale, slug: data.slug },
        data
      );
      console.log(`  ✓ ${action} page  [${locale}] ${data.slug}  (${file})`);
    } catch (err) {
      console.error(`  ✗ FAILED page  [${locale}] ${data.slug}  (${file})\n    ${err.message}`);
    }
    count++;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

function buildNavPayload(nav, locale) {
  // Strip row IDs from nav items (same as page blocks — Strapi assigns them).
  return {
    tenant: TENANT,
    lang: locale,          // named `lang` to avoid Strapi i18n reserved `locale` param
    header: prepareForCreate(nav.header || []),
    footer: prepareForCreate(nav.footer || []),
    footerCopy: nav.footerCopy ? prepareForCreate(nav.footerCopy) : null,
  };
}

async function seedNavigation() {
  const navFiles = [
    { file: "navigation.json",    locale: "sl" },
    { file: "en--navigation.json", locale: "en" },
    { file: "de--navigation.json", locale: "de" },
  ];
  let count = 0;

  for (const { file, locale } of navFiles) {
    const filePath = path.join(MOCK_ROOT, file);
    if (!fs.existsSync(filePath)) continue;
    const nav = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const data = buildNavPayload(nav, locale);
    try {
      const action = await upsertByFilter(
        "navigations",
        { tenant: TENANT, lang: locale },
        data
      );
      console.log(`  ✓ ${action} navigation [${locale}]`);
    } catch (err) {
      console.error(`  ✗ FAILED navigation [${locale}]\n    ${err.message}`);
    }
    count++;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

function buildProductPayload(product, locale) {
  return {
    tenant: TENANT,
    lang: locale,
    slug: product.slug,
    name: product.name,
    description: product.description || null,
    shortDescription: product.shortDescription || null,
    price: product.price,
    compareAtPrice: product.compareAtPrice || null,
    image: product.image || null,
    images: product.images || null,
    category: product.category || null,
    inStock: product.inStock !== false,
    tags: product.tags || null,
    specs: product.specs || null,
  };
}

async function seedProducts() {
  const collDir = path.join(MOCK_ROOT, "collections");
  const localeFiles = [
    { file: "products.json", locale: "sl" },
    { file: "en--products.json", locale: "en" },
    { file: "de--products.json", locale: "de" },
  ];

  console.log("  Pruning removed products…");
  const pruned = await pruneProducts();
  if (pruned === 0) console.log("  (no stray products)");

  console.log("  Pruning removed bike detail pages…");
  const pagesRemoved = await pruneOrphanBikePages();
  if (pagesRemoved === 0) console.log("  (no stray bike pages)");

  const slProducts = [];
  const collFile = path.join(collDir, "products.json");
  if (fs.existsSync(collFile)) {
    const collProducts = JSON.parse(fs.readFileSync(collFile, "utf8"));
    for (const p of collProducts) {
      if (KEEP_PRODUCT_SLUGS.has(p.slug)) slProducts.push(p);
    }
  }

  let count = 0;

  // Seed sl products
  for (const product of slProducts) {
    const data = buildProductPayload(product, "sl");
    try {
      const action = await upsertByFilter(
        "products",
        { tenant: TENANT, lang: "sl", slug: product.slug },
        data
      );
      console.log(`  ✓ ${action} product [sl] ${product.slug}`);
    } catch (err) {
      console.error(`  ✗ FAILED product [sl] ${product.slug}\n    ${err.message}`);
    }
    count++;
  }

  // Seed en/de products from collection files
  for (const { file, locale } of localeFiles.filter((l) => l.locale !== "sl")) {
    const filePath = path.join(collDir, file);
    if (!fs.existsSync(filePath)) continue;
    const products = JSON.parse(fs.readFileSync(filePath, "utf8"));
    for (const product of products) {
      if (!KEEP_PRODUCT_SLUGS.has(product.slug)) continue;
      const data = buildProductPayload(product, locale);
      try {
        const action = await upsertByFilter(
          "products",
          { tenant: TENANT, lang: locale, slug: product.slug },
          data
        );
        console.log(`  ✓ ${action} product [${locale}] ${product.slug}`);
      } catch (err) {
        console.error(`  ✗ FAILED product [${locale}] ${product.slug}\n    ${err.message}`);
      }
      count++;
    }
  }

  return count;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\nSeeding vukans-bike → ${STRAPI_URL}\n`);

  console.log("── Pages ─────────────────────────────────────────────");
  const pages = await seedPages();

  console.log("\n── Navigation ────────────────────────────────────────");
  const navs = await seedNavigation();

  console.log("\n── Products ──────────────────────────────────────────");
  const products = await seedProducts();

  console.log(`\nDone: ${pages} pages, ${navs} navigation records, ${products} products.`);
  console.log(
    "\nReminder: grant Public role find on page + navigation + product in Strapi Admin\n" +
    "(Settings → Users & Permissions → Roles → Public)."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
