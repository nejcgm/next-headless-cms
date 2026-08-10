const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const tenantsDir = path.join(repoRoot, "src", "tenants");
const mockDataStubRel = "scripts/mock-data-stub";

/**
 * @param {string} tenantId
 * @returns {"mock" | "strapi"}
 */
function getDataAdapter(tenantId) {
  const configPath = path.join(tenantsDir, tenantId, "config.ts");
  if (!fs.existsSync(configPath)) return "mock";

  const content = fs.readFileSync(configPath, "utf8");
  const match = content.match(/dataAdapter:\s*["'](mock|strapi)["']/);
  return match ? /** @type {"mock" | "strapi"} */ (match[1]) : "mock";
}

/** @param {string} tenantId */
function usesMockData(tenantId) {
  return getDataAdapter(tenantId) === "mock";
}

/** Content dir is always tenants/{tenantId}/mock-data
 * @param {string} tenantId
 */
function getMockDataFolder(tenantId) {
  return tenantId;
}

/** @param {string} tenantId */
function getTenantDataRel(tenantId) {
  return `src/tenants/${tenantId}/mock-data`;
}

/** @param {string} tenantId */
function getMockDataTsconfigPaths(tenantId) {
  if (!usesMockData(tenantId)) {
    return {
      base: `./${mockDataStubRel}`,
      glob: `./${mockDataStubRel}/*`,
    };
  }

  const rel = getTenantDataRel(tenantId);
  return {
    base: `./${rel}`,
    glob: `./${rel}/*`,
  };
}

/** @param {string} tenantId @returns {string | null} */
function getMockDataWebpackAlias(tenantId) {
  if (!usesMockData(tenantId)) return null;
  return path.join(repoRoot, "src", "tenants", tenantId, "mock-data");
}

module.exports = {
  repoRoot,
  tenantsDir,
  mockDataStubRel,
  getDataAdapter,
  usesMockData,
  getMockDataFolder,
  getTenantDataRel,
  getMockDataTsconfigPaths,
  getMockDataWebpackAlias,
};
