#!/usr/bin/env node
/**
 * Updates tsconfig.json paths for the selected tenant.
 * Run before build/dev so TypeScript and tooling resolve @tenant correctly.
 * Cleans old analyze output before build.
 */
const fs = require("fs");
const path = require("path");
const {
  getMockDataTsconfigPaths,
  getDataAdapter,
  usesMockData,
} = require("./tenant-registry");

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
const mockPaths = getMockDataTsconfigPaths(tenantId);

tsconfig.compilerOptions.paths["@tenant"] = [`./src/tenants/${tenantId}`];
tsconfig.compilerOptions.paths["@tenant/*"] = [`./src/tenants/${tenantId}/*`];
tsconfig.compilerOptions.paths["@mock-data"] = [mockPaths.base];
tsconfig.compilerOptions.paths["@mock-data/*"] = [mockPaths.glob];

fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + "\n");

const adapter = getDataAdapter(tenantId);
if (usesMockData(tenantId)) {
  console.log(`tsconfig paths updated for tenant: ${tenantId} (adapter: ${adapter})`);
} else {
  console.log(
    `tsconfig paths updated for tenant: ${tenantId} (adapter: ${adapter}, @mock-data → stub)`
  );
}
