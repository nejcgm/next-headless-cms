#!/usr/bin/env node
/**
 * Updates tsconfig.json paths for the selected tenant.
 * Run before build/dev so TypeScript and tooling resolve @tenant correctly.
 * Cleans old analyze output before build.
 */
const fs = require("fs");
const path = require("path");

const tenantId = process.env.TENANT_ID;
if (!tenantId) {
  console.error("TENANT_ID env var is required");
  process.exit(1);
}

// Remove old analyze output before build (avoids stale data from other tenants)
if (process.env.BUILD_CLEAN_ANALYZE) {
  require("./clean-analyze.js");
}

const tsconfigPath = path.join(__dirname, "..", "tsconfig.json");
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));

// Mock data folder may differ from tenantId (resort-example → resort)
const mockDataFolder = tenantId === "resort-example" ? "resort" : tenantId;

tsconfig.compilerOptions.paths["@tenant"] = [`./src/tenants/${tenantId}`];
tsconfig.compilerOptions.paths["@tenant/*"] = [`./src/tenants/${tenantId}/*`];
tsconfig.compilerOptions.paths["@mock-data"] = [`./src/core/mock-data.ts/${mockDataFolder}`];
tsconfig.compilerOptions.paths["@mock-data/*"] = [`./src/core/mock-data.ts/${mockDataFolder}/*`];

fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + "\n");
console.log(`tsconfig paths updated for tenant: ${tenantId}`);
