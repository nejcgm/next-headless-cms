#!/usr/bin/env node

/**
 * Verify that a tenant build does not include other tenants' source paths.
 * Scans all JS output under the build directory (not a sample).
 */

const fs = require("fs");
const path = require("path");
const {
  repoRoot,
  listTenantIds,
  getOtherTenants,
  getLeakPatternsForTenant,
  resolveBuildDir,
  detectTenantFromBuild,
} = require("./tenant-registry");

/** @typedef {{ otherTenant: string; pattern: string }} LeakPattern */

/** @typedef {{ ok: true } | { ok: false; message: string }} PresenceResult */

const MAX_REPORTED_ISSUES = 25;
const SCAN_EXTENSIONS = new Set([".js", ".mjs", ".cjs"]);

/** @type {string | undefined} */
let tenantId = process.env.TENANT_ID;

/**
 * @param {string} dir
 * @param {string[]} [files]
 * @returns {string[]}
 */
function findJsFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      findJsFiles(fullPath, files);
      continue;
    }
    if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * @param {string[]} otherTenants
 * @returns {LeakPattern[]}
 */
function collectLeakPatterns(otherTenants) {
  /** @type {LeakPattern[]} */
  const patterns = [];
  for (const other of otherTenants) {
    for (const pattern of getLeakPatternsForTenant(other)) {
      patterns.push({ otherTenant: other, pattern });
    }
  }
  return patterns;
}

/**
 * @param {string} filePath
 * @param {LeakPattern[]} patterns
 */
function scanFile(filePath, patterns) {
  const content = fs.readFileSync(filePath, "utf8");
  /** @type {LeakPattern[]} */
  const hits = [];

  for (const entry of patterns) {
    if (content.includes(entry.pattern)) {
      hits.push(entry);
    }
  }

  return hits;
}

/**
 * @param {string} buildDir
 * @param {string} expectedTenantId
 * @returns {PresenceResult}
 */
function verifyExpectedTenantPresent(buildDir, expectedTenantId) {
  const middlewarePath = path.join(buildDir, "server", "src", "middleware.js");
  if (!fs.existsSync(middlewarePath)) {
    return { ok: false, message: "middleware.js not found — build may be incomplete" };
  }

  const content = fs.readFileSync(middlewarePath, "utf8");
  const hasId =
    content.includes(`id:"${expectedTenantId}"`) ||
    content.includes(`id:'${expectedTenantId}'`);

  if (!hasId) {
    return {
      ok: false,
      message: `middleware.js does not embed tenant id "${expectedTenantId}"`,
    };
  }

  return { ok: true };
}

function main() {
  if (!tenantId) {
    for (const candidate of listTenantIds()) {
      const buildDir = resolveBuildDir(candidate);
      const detected = detectTenantFromBuild(buildDir);
      if (detected === candidate) {
        tenantId = candidate;
        console.log(`   (Auto-detected tenant: ${tenantId})\n`);
        break;
      }
    }
  }

  if (!tenantId) {
    console.error("❌ Could not detect tenant. Set TENANT_ID or run a build first.");
    console.error("   Example: TENANT_ID=vukans-bike pnpm verify:build");
    process.exit(1);
  }

  const otherTenants = getOtherTenants(tenantId);
  if (otherTenants.length === 0) {
    console.log(`\n🔍 Verifying build for tenant: ${tenantId}`);
    console.log("   ℹ️  Only one tenant in repo — skipping cross-tenant leak scan\n");
    process.exit(0);
  }

  const buildDir = resolveBuildDir(tenantId);
  console.log(`\n🔍 Verifying build for tenant: ${tenantId}\n`);
  console.log("=".repeat(60));

  if (!fs.existsSync(buildDir)) {
    console.error(`\n❌ No build found at: ${buildDir}`);
    console.log("\n   Run a build first, e.g.:");
    console.log(`   TENANT_ID=${tenantId} pnpm build:bike   # or matching script`);
    process.exit(1);
  }

  const presence = verifyExpectedTenantPresent(buildDir, tenantId);
  console.log("\n1️⃣  Expected tenant in middleware...");
  if (presence.ok) {
    console.log(`   ✅ Found tenant id "${tenantId}" in middleware.js`);
  } else {
    console.log(`   ❌ ${presence.message}`);
  }

  const patterns = collectLeakPatterns(otherTenants);
  const jsFiles = findJsFiles(buildDir);
  const uniquePatternLabels = Array.from(new Set(patterns.map((p) => p.pattern)));

  console.log(`\n2️⃣  Scanning ${jsFiles.length} JS files for other-tenant paths...`);
  console.log(`   Other tenants: ${otherTenants.join(", ")}`);
  console.log(`   Patterns: ${uniquePatternLabels.join(", ")}`);

  /** @type {string[]} */
  const issues = [];
  if (!presence.ok) {
    issues.push(presence.message);
  }

  for (const file of jsFiles) {
    const hits = scanFile(file, patterns);
    for (const hit of hits) {
      issues.push(
        `Leak "${hit.pattern}" (${hit.otherTenant}) in ${path.relative(repoRoot, file)}`
      );
      if (issues.length >= MAX_REPORTED_ISSUES) break;
    }
    if (issues.length >= MAX_REPORTED_ISSUES) break;
  }

  console.log("\n" + "=".repeat(60));
  console.log("VERIFICATION SUMMARY");
  console.log("=".repeat(60));

  if (issues.length > 0) {
    console.log(`\n❌ FAILED — ${issues.length} issue(s)${issues.length >= MAX_REPORTED_ISSUES ? " (truncated)" : ""}:\n`);
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
    console.log("\n⚠️  Other tenant code may be included in the build.");
    process.exit(1);
  }

  console.log(`\n✅ PASSED — scanned ${jsFiles.length} files; no cross-tenant path leaks`);
  console.log("\n📝 Notes:");
  console.log("   • Checks source-path strings (tenants/*)");
  console.log("   • Run with ANALYZE=true for bundle composition reports");
  process.exit(0);
}

main();
