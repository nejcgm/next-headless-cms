/**
 * Seed Strapi pages + navigation for vukans-bike from frontend mock JSON.
 *
 * Mock JSON files are now stored in Strapi API *response* format
 * (`__component` on dynamic zone items, numeric `id` on every component row).
 * This script strips those row IDs before POSTing so Strapi can assign them,
 * and drops fields that exist in mock data but not in the Strapi schema
 * (e.g. `bike` inside a `bike-detail` block — loaded at runtime via dataContract).
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
const MOCK_ROOT = path.resolve(
  __dirname,
  "../../next-headless-cms-fe/src/core/mock-data.ts/vukans-bike"
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

    for (const [k, v] of Object.entries(value)) {
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
    { file: "products.json",    locale: "sl" },
    { file: "en--products.json", locale: "en" },
    { file: "de--products.json", locale: "de" },
  ];

  // Also extract product data from sl bike-detail page blocks as the source of truth
  const bikePages = fs.readdirSync(path.join(MOCK_ROOT, "pages"))
    .filter((f) => f.startsWith("bikes--") && !f.startsWith("de--") && !f.startsWith("en--"));

  const slProducts = [];
  for (const file of bikePages) {
    const page = JSON.parse(fs.readFileSync(path.join(MOCK_ROOT, "pages", file), "utf8"));
    for (const block of page.blocks || []) {
      if (block.__component === "blocks.bike-detail" && block.bike) {
        slProducts.push(block.bike);
      }
    }
  }

  // Merge with collection file (collection file may have additional products)
  const collFile = path.join(collDir, "products.json");
  if (fs.existsSync(collFile)) {
    const collProducts = JSON.parse(fs.readFileSync(collFile, "utf8"));
    for (const p of collProducts) {
      if (!slProducts.find((existing) => existing.slug === p.slug)) {
        slProducts.push(p);
      }
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
