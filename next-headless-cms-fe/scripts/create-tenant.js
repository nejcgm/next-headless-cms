#!/usr/bin/env node

/**
 * Scaffold a new tenant: folders, config, templates, mock data, Spec Kit catalog stub,
 * package.json scripts, and a printed checklist for CI/deploy.
 *
 * Usage:
 *   node scripts/create-tenant.js --id my-tenant --name "My Site" --short my [--port 3003]
 *   node scripts/create-tenant.js --id my-tenant --name "My Site" --short my --mock-folder my
 */

const fs = require("fs");
const path = require("path");
const {
  repoRoot,
  listTenantIds,
  setMockDataFolder,
} = require("./tenant-registry");

const TENANT_ID_RE = /^[a-z][a-z0-9-]*$/;
const SHORT_RE = /^[a-z][a-z0-9-]*$/;
const HEADER_SOURCE_TENANT = "vukans-bike";

/**
 * @typedef {Object} CreateTenantArgs
 * @property {string} [id]
 * @property {string} [name]
 * @property {string} [short]
 * @property {number} [port]
 * @property {string} [mockFolder]
 * @property {string} [adapter]
 * @property {boolean} [help]
 */

/**
 * @typedef {Object} TenantTemplateVars
 * @property {string} id
 * @property {string} name
 * @property {string} short
 * @property {number} port
 * @property {string} mockFolder
 * @property {"mock" | "strapi"} dataAdapter
 */

/**
 * @param {string[]} argv
 * @returns {CreateTenantArgs}
 */
function parseArgs(argv) {
  /** @type {CreateTenantArgs} */
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    if (key === "--id") args.id = argv[++i];
    else if (key === "--name") args.name = argv[++i];
    else if (key === "--short") args.short = argv[++i];
    else if (key === "--port") args.port = Number(argv[++i]);
    else if (key === "--mock-folder") args.mockFolder = argv[++i];
    else if (key === "--adapter") args.adapter = argv[++i];
    else if (key === "--help" || key === "-h") args.help = true;
  }
  return args;
}

function usage() {
  console.log(`
Usage:
  node scripts/create-tenant.js --id <tenant-id> --name "<display name>" --short <script-key> [options]

Options:
  --port <number>        Dev server port (default: 3099)
  --mock-folder <name>   Mock data folder under src/core/mock-data.ts/ (default: tenant id)
  --adapter mock|strapi  Data source (default: mock). Strapi skips mock JSON scaffold.

Example:
  node scripts/create-tenant.js --id acme-corp --name "Acme Corp" --short acme --port 3003
  node scripts/create-tenant.js --id acme-corp --name "Acme Corp" --short acme --adapter strapi
`);
}

function writeFileEnsuringDir(/** @type {string} */ filePath, /** @type {string} */ content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

/** @param {TenantTemplateVars} vars */
function configTemplate(vars) {
  return `import type { TenantConfig } from "@core/types/tenant";

const config: TenantConfig = {
  id: "${vars.id}",
  name: "${vars.name}",
  domains: ["${vars.id}.localhost"],
  defaultLocale: "en",
  locales: ["en"],
  features: {
    blog: false,
    booking: false,
    reviews: false,
    search: false,
    newsletter: false,
  },
  theme: {
    colors: {
      primary: "#2563eb",
      secondary: "#64748b",
      accent: "#f59e0b",
      background: "#ffffff",
      foreground: "#0f172a",
      muted: "#f1f5f9",
      border: "#e2e8f0",
      textPrimary: "#0f172a",
    },
    fonts: {
      heading: "var(--font-inter)",
      body: "var(--font-inter)",
    },
    borderRadius: "0.375rem",
  },
  dataAdapter: "${vars.dataAdapter}",
  templates: {
    default: { usesSiteChrome: true },
    bare: { usesSiteChrome: false },
  },
};

export default config;
`;
}

/** @param {TenantTemplateVars} vars */
function blocksIndexTemplate(vars) {
  return `import { registerTenantBlocks } from "@core/blocks/registry";

registerTenantBlocks("${vars.id}", {
  // Register tenant-specific blocks here, e.g.:
  // hero: { component: Hero },
});
`;
}

function defaultTemplate() {
  return `import { localizeNavItems } from "@core/i18n/locale-path";
import type { TemplateProps } from "@core/types/page";
import { Header } from "@tenant/blocks/header/header";
import { Footer } from "@tenant/blocks/footer/footer";

export default async function DefaultTemplate({ page, tenant, children }: TemplateProps) {
  const nav = page.navigation;

  const headerNav = nav?.header
    ? localizeNavItems(nav.header, page.locale, tenant.defaultLocale, tenant.locales)
    : [];
  const footerNav = nav?.footer
    ? localizeNavItems(nav.footer, page.locale, tenant.defaultLocale, tenant.locales)
    : [];

  return (
    <div className="flex flex-col min-h-screen">
      {nav?.header && (
        <Header
          tenantId={tenant.id}
          tenantName={tenant.name}
          navigation={headerNav}
          logoUrl={tenant.logoUrl}
          locales={tenant.locales}
          defaultLocale={tenant.defaultLocale}
        />
      )}
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      {nav?.footer && nav.footerCopy && (
        <Footer
          tenantName={tenant.name}
          navigation={footerNav}
          contact={tenant.contact}
          copy={nav.footerCopy}
        />
      )}
    </div>
  );
}
`;
}

function bareTemplate() {
  return `export { default } from "@shared/components/layout/fallback-template";
`;
}

function footerTemplate() {
  return `export { Footer } from "@shared/components/layout/footer";
`;
}

/** @param {TenantTemplateVars} vars */
function homeJsonTemplate(vars) {
  return JSON.stringify(
    {
      slug: "/",
      locale: "en",
      template: "default",
      seo: {
        title: vars.name,
        description: `Welcome to ${vars.name}.`,
      },
      blocks: [
        {
          id: "hero-1",
          type: "hero",
          props: {
            headline: `Welcome to ${vars.name}`,
            subheadline: "Replace this hero with tenant-specific blocks.",
            backgroundImage:
              "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&h=1080&fit=crop",
            overlay: 0.4,
            cta: { label: "Learn more", href: "/about" },
          },
        },
      ],
    },
    null,
    2
  );
}

function navigationJsonTemplate() {
  return JSON.stringify(
    {
      header: [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
      ],
      footer: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
      footerCopy: {
        tagline: "Update tagline in navigation.json.",
        linksHeading: "Links",
        contactHeading: "Contact",
        contactPlaceholder: "Get in touch.",
        copyrightReserved: "All rights reserved.",
      },
    },
    null,
    2
  );
}

function sitemapJsonTemplate() {
  return JSON.stringify(
    {
      entries: [{ pathname: "/" }, { pathname: "/about" }, { pathname: "/contact" }],
    },
    null,
    2
  );
}

/** @param {TenantTemplateVars} vars */
function catalogTemplate(vars) {
  return `# ${vars.name} (\`${vars.id}\`)

**Maintenance**: Update \`specs/_catalogs/${vars.id}.md\` when blocks, templates, pages, or integrations change. Sync map: \`.specify/memory/project-context.md\`.

Locales: \`en\` (default). Adapter: \`${vars.dataAdapter}\`.

${vars.dataAdapter === "strapi" ? "**No mock data** — content comes from Strapi." : `**Mock data folder**: \`src/core/mock-data.ts/${vars.mockFolder}/\``}

## Render pipeline

\`\`\`
page JSON → MockAdapter.getPage → page.tsx → resolveTemplate → BlockRenderer
\`\`\`

- **Config**: \`src/tenants/${vars.id}/config.ts\`
- **Registration**: \`src/tenants/${vars.id}/blocks/index.ts\`
- **Mock pages**: \`src/core/mock-data.ts/${vars.mockFolder}/pages/*.json\`

## Templates

| Template | Chrome | Use |
|----------|--------|-----|
| \`default\` | Header + footer | Standard pages |
| \`bare\` | None | Landing pages |

## Tenant blocks

| Block type | Component | Notes |
|------------|-----------|-------|
| _(none yet)_ | | Register blocks in \`blocks/index.ts\` |

## Shared blocks used

- \`hero\` — home page placeholder
`;
}

/** @param {string} short @param {string} id @param {number} port */
function patchPackageJson(short, id, port) {
  const pkgPath = path.join(repoRoot, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const scripts = pkg.scripts ?? {};

  const devKey = `dev:${short}`;
  const buildKey = `build:${short}`;
  const lintKey = `lint:${short}`;
  const startKey = `start:${short}`;

  if (scripts[devKey]) {
    console.log(`   ℹ️  package.json already has ${devKey} — skipped script patch`);
    return false;
  }

  scripts[devKey] =
    `TENANT_ID=${id} node scripts/prepare-tenant.js && TENANT_ID=${id} next dev -p ${port}`;
  scripts[buildKey] =
    `BUILD_CLEAN_ANALYZE=1 TENANT_ID=${id} node scripts/prepare-tenant.js && TENANT_ID=${id} next build`;
  scripts[lintKey] = `TENANT_ID=${id} next lint`;
  scripts[startKey] = `TENANT_ID=${id} next start -p ${port}`;

  pkg.scripts = scripts;
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  return true;
}

/** @param {TenantTemplateVars} vars */
function printChecklist(vars) {
  console.log("\n📋 Manual follow-up checklist");
  console.log("=".repeat(60));
  console.log(`
1. Customize theme, domains, and locales in:
   src/tenants/${vars.id}/config.ts

2. Register tenant blocks in:
   src/tenants/${vars.id}/blocks/index.ts

3. Add mock pages under:
   src/core/mock-data.ts/${vars.mockFolder}/pages/

4. Update tenant catalog:
   specs/_catalogs/${vars.id}.md
   (monorepo root — sibling of next-headless-cms-fe/)

5. Add tenant to Spec Kit project context table:
   .specify/memory/project-context.md

6. Add CI matrix entry in:
   .github/workflows/ci.yml
   - lint matrix: tenant_id: ${vars.id}
   - build-tenants include: tenant_script: build:${vars.short}, tenant_id: ${vars.id}

7. Create deploy workflow + Vercel project (see .specify/memory/knowledge/deployment.md):
   .github/workflows/deploy-${vars.short}.yml

8. Validate scaffold:
   TENANT_ID=${vars.id} node scripts/check-tenant-setup.js

9. Run locally:
   pnpm dev:${vars.short}
`);
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.id || !args.name || !args.short) {
    usage();
    process.exit(args.help ? 0 : 1);
  }

  const id = args.id.trim();
  const name = args.name.trim();
  const short = args.short.trim();
  const port = args.port || 3099;
  const mockFolder = args.mockFolder?.trim() || id;
  const dataAdapter = args.adapter === "strapi" ? "strapi" : "mock";

  if (args.adapter && dataAdapter !== "strapi" && args.adapter !== "mock") {
    console.error('❌ --adapter must be "mock" or "strapi"');
    process.exit(1);
  }

  if (!TENANT_ID_RE.test(id)) {
    console.error("❌ --id must be kebab-case (e.g. my-tenant)");
    process.exit(1);
  }
  if (!SHORT_RE.test(short)) {
    console.error("❌ --short must be lowercase alphanumeric/hyphens (e.g. acme)");
    process.exit(1);
  }
  if (listTenantIds().includes(id)) {
    console.error(`❌ Tenant already exists: src/tenants/${id}`);
    process.exit(1);
  }

  const vars = /** @type {TenantTemplateVars} */ ({
    id,
    name,
    short,
    port,
    mockFolder,
    dataAdapter,
  });
  const tenantRoot = path.join(repoRoot, "src", "tenants", id);
  const mockRoot = path.join(repoRoot, "src", "core", "mock-data.ts", mockFolder);
  const headerSource = path.join(
    repoRoot,
    "src",
    "tenants",
    HEADER_SOURCE_TENANT,
    "blocks",
    "header",
    "header.tsx"
  );

  console.log(`\n🏗️  Scaffolding tenant: ${id} (${name})\n`);

  writeFileEnsuringDir(path.join(tenantRoot, "config.ts"), configTemplate(vars));
  writeFileEnsuringDir(path.join(tenantRoot, "blocks", "index.ts"), blocksIndexTemplate(vars));
  writeFileEnsuringDir(path.join(tenantRoot, "blocks", "footer", "footer.tsx"), footerTemplate());
  writeFileEnsuringDir(path.join(tenantRoot, "templates", "default.tsx"), defaultTemplate());
  writeFileEnsuringDir(path.join(tenantRoot, "templates", "bare.tsx"), bareTemplate());

  if (fs.existsSync(headerSource)) {
    fs.mkdirSync(path.join(tenantRoot, "blocks", "header"), { recursive: true });
    fs.copyFileSync(headerSource, path.join(tenantRoot, "blocks", "header", "header.tsx"));
  } else {
    console.warn(`   ⚠️  Could not copy header.tsx — ${HEADER_SOURCE_TENANT} header missing`);
  }

  if (dataAdapter === "mock") {
    writeFileEnsuringDir(path.join(mockRoot, "pages", "home.json"), `${homeJsonTemplate(vars)}\n`);
    writeFileEnsuringDir(path.join(mockRoot, "navigation.json"), `${navigationJsonTemplate()}\n`);
    writeFileEnsuringDir(path.join(mockRoot, "sitemap.json"), `${sitemapJsonTemplate()}\n`);

    if (mockFolder !== id) {
      setMockDataFolder(id, mockFolder);
      console.log(`   ✅ Mock folder map: ${id} → ${mockFolder} (scripts/tenant-mock-map.json)`);
    }
  }

  writeFileEnsuringDir(
    path.join(repoRoot, "..", "specs", "_catalogs", `${id}.md`),
    catalogTemplate(vars)
  );

  const scriptsPatched = patchPackageJson(short, id, port);
  if (scriptsPatched) {
    console.log(`   ✅ Added pnpm scripts: dev:${short}, build:${short}, lint:${short}, start:${short}`);
  }

  console.log("\n✅ Tenant scaffold created:");
  console.log(`   • src/tenants/${id}/`);
  if (dataAdapter === "mock") {
    console.log(`   • src/core/mock-data.ts/${mockFolder}/`);
  } else {
    console.log(`   • dataAdapter: strapi (no mock data folder)`);
  }
  console.log(`   • specs/_catalogs/${id}.md`);

  printChecklist(vars);
}

main();
