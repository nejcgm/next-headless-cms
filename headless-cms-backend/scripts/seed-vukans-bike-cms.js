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

const FONT_SIZE_VALUE_MAP = {
  "1.25rem": "cardTitle",
  "clamp(1.75rem, 3.2vw, 2.5rem)": "sectionTitle",
  "clamp(1.25rem, 2.2vw, 1.75rem)": "priceCompact",
  "clamp(2.25rem, 5vw, 3.25rem)": "pageTitle",
  "clamp(1.5rem, 2.5vw, 2rem)": "price",
  "clamp(2.5rem, 6vw, 4rem)": "display",
  "clamp(1.5rem, 2.8vw, 2rem)": "statement",
};

const HERO_MIN_HEIGHT_MAP = {
  "clamp(480px, 72vh, 720px)": "standard",
  "clamp(520px, 82vh, 820px)": "tall",
};

/**
 * Reshape one component's own fields from the pre-migration mock-JSON shape to
 * the redesigned Strapi schema shape. Operates on this node's own keys only —
 * does not recurse into slots/children (prepareForCreate handles that).
 */
function transformFieldsForComponent(obj, component) {
  const out = { ...obj };

  if ("borderTop" in out) {
    delete out.borderTop;
    out.dividerTop = true;
  }
  if ("width" in out) {
    if (out.width !== "100%") {
      throw new Error(`Unexpected width value ${JSON.stringify(out.width)} on ${component}`);
    }
    delete out.width;
    out.fullWidth = true;
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
      out.heroHeight = mapped;
      delete out.minHeight;
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
    const mapped = BORDER_VALUE_MAP[out.border];
    if (!mapped) {
      throw new Error(`Unrecognized border value ${JSON.stringify(out.border)} on ${component}`);
    }
    out.border = mapped;
  }

  if (component === "blocks.product-list" && "category" in out) {
    delete out.category;
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
