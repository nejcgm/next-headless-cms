#!/usr/bin/env node

/**
 * Validate that a tenant has the required scaffold files and wiring.
 *
 * Usage:
 *   TENANT_ID=my-tenant node scripts/check-tenant-setup.js
 *   node scripts/check-tenant-setup.js --all
 *   node scripts/check-tenant-setup.js --id my-tenant
 */

const fs = require("fs");
const path = require("path");
const {
  repoRoot,
  listTenantIds,
  getDataAdapter,
  usesMockData,
} = require("./tenant-registry");

/**
 * @typedef {Object} CheckArgs
 * @property {boolean} [all]
 * @property {string} [id]
 * @property {boolean} [help]
 */

/**
 * @typedef {Object} TenantCheckResult
 * @property {string} tenantId
 * @property {string[]} errors
 * @property {string[]} warnings
 */

/**
 * @param {string[]} argv
 * @returns {CheckArgs}
 */
function parseArgs(argv) {
  /** @type {CheckArgs} */
  const args = { all: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--all") args.all = true;
    else if (argv[i] === "--id") args.id = argv[++i];
    else if (argv[i] === "--help" || argv[i] === "-h") args.help = true;
  }
  return args;
}

/** @param {string} relativePath */
function fileExists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

/** @param {string} relativePath */
function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

/** @param {string} tenantId @returns {TenantCheckResult} */
function checkTenant(tenantId) {
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const warnings = [];
  const dataAdapter = getDataAdapter(tenantId);

  const requiredFiles = [
    `src/tenants/${tenantId}/config.ts`,
    `src/tenants/${tenantId}/blocks/index.ts`,
    `src/tenants/${tenantId}/templates/default.tsx`,
    `src/tenants/${tenantId}/blocks/header/header.tsx`,
    `src/tenants/${tenantId}/blocks/footer/footer.tsx`,
  ];

  const monorepoRoot = path.join(repoRoot, "..");
  const catalogPath = path.join(monorepoRoot, "specs", "_catalogs", `${tenantId}.md`);
  if (!fs.existsSync(catalogPath)) {
    errors.push(`Missing required file: specs/_catalogs/${tenantId}.md`);
  }

  if (usesMockData(tenantId)) {
    requiredFiles.push(
      `src/tenants/${tenantId}/mock-data/pages/home.json`,
      `src/tenants/${tenantId}/mock-data/navigation.json`,
      `src/tenants/${tenantId}/mock-data/sitemap.json`
    );
  }

  for (const file of requiredFiles) {
    if (!fileExists(file)) errors.push(`Missing required file: ${file}`);
  }

  const configPath = `src/tenants/${tenantId}/config.ts`;
  if (fileExists(configPath)) {
    const configSource = fs.readFileSync(path.join(repoRoot, configPath), "utf8");
    if (!configSource.includes(`id: "${tenantId}"`) && !configSource.includes(`id: '${tenantId}'`)) {
      errors.push(`config.ts id does not match tenant folder: ${tenantId}`);
    }
    const adapterMatch = configSource.match(/dataAdapter:\s*["'](mock|strapi)["']/);
    if (adapterMatch && adapterMatch[1] !== dataAdapter) {
      errors.push(`config.ts dataAdapter mismatch for ${tenantId}`);
    }
  }

  const pkg = readJson("package.json");
  const scriptValues = Object.values(pkg.scripts ?? {}).join("\n");
  if (!scriptValues.includes(`TENANT_ID=${tenantId}`)) {
    warnings.push(`No package.json script sets TENANT_ID=${tenantId} (add dev/build/lint scripts)`);
  }

  const ciPath = path.join(repoRoot, "..", ".github", "workflows", "ci.yml");
  if (fs.existsSync(ciPath)) {
    const ci = fs.readFileSync(ciPath, "utf8");
    if (!ci.includes(tenantId)) {
      warnings.push(`Tenant not referenced in .github/workflows/ci.yml`);
    }
  }

  const projectContextPath = path.join(monorepoRoot, ".specify", "memory", "project-context.md");
  if (fs.existsSync(projectContextPath)) {
    const projectContext = fs.readFileSync(projectContextPath, "utf8");
    if (!projectContext.includes(tenantId)) {
      warnings.push(`Tenant not listed in .specify/memory/project-context.md`);
    }
  } else {
    warnings.push(`Missing .specify/memory/project-context.md (Spec Kit index)`);
  }

  return { tenantId, errors, warnings };
}

function usage() {
  console.log(`
Usage:
  TENANT_ID=<tenant-id> node scripts/check-tenant-setup.js
  node scripts/check-tenant-setup.js --id <tenant-id>
  node scripts/check-tenant-setup.js --all
`);
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    usage();
    process.exit(0);
  }

  const tenantIds = args.all
    ? listTenantIds()
    : [args.id || process.env.TENANT_ID].filter((id) => typeof id === "string");

  if (tenantIds.length === 0) {
    usage();
    process.exit(1);
  }

  console.log("\n🔎 Checking tenant setup\n");
  console.log("=".repeat(60));

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const tenantId of tenantIds) {
    const result = checkTenant(tenantId);
    console.log(`\n${result.tenantId}`);

    if (result.errors.length === 0 && result.warnings.length === 0) {
      console.log("   ✅ All required files and wiring present");
      continue;
    }

    for (const error of result.errors) {
      console.log(`   ❌ ${error}`);
      totalErrors++;
    }
    for (const warning of result.warnings) {
      console.log(`   ⚠️  ${warning}`);
      totalWarnings++;
    }
  }

  console.log("\n" + "=".repeat(60));
  if (totalErrors > 0) {
    console.log(`❌ FAILED — ${totalErrors} error(s), ${totalWarnings} warning(s)`);
    process.exit(1);
  }
  if (totalWarnings > 0) {
    console.log(`⚠️  PASSED WITH WARNINGS — ${totalWarnings} warning(s)`);
    process.exit(0);
  }
  console.log("✅ PASSED — all tenants look correctly scaffolded");
}

main();
