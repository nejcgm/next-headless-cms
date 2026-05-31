const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const tenantsDir = path.join(repoRoot, "src", "tenants");
const mockMapPath = path.join(__dirname, "tenant-mock-map.json");
const mockDataStubRel = "scripts/mock-data-stub";

/** @returns {Record<string, string>} */
function readMockMap() {
  if (!fs.existsSync(mockMapPath)) return {};
  return JSON.parse(fs.readFileSync(mockMapPath, "utf8"));
}

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

/** @param {string} tenantId */
function getMockDataFolder(tenantId) {
  const map = readMockMap();
  return map[tenantId] ?? tenantId;
}

/** @param {string} tenantId */
function getMockDataTsconfigPaths(tenantId) {
  if (!usesMockData(tenantId)) {
    return {
      base: `./${mockDataStubRel}`,
      glob: `./${mockDataStubRel}/*`,
    };
  }

  const folder = getMockDataFolder(tenantId);
  return {
    base: `./src/core/mock-data.ts/${folder}`,
    glob: `./src/core/mock-data.ts/${folder}/*`,
  };
}

/** @param {string} tenantId @returns {string | null} */
function getMockDataWebpackAlias(tenantId) {
  if (!usesMockData(tenantId)) return null;
  return path.join(repoRoot, "src", "core", "mock-data.ts", getMockDataFolder(tenantId));
}

module.exports = {
  repoRoot,
  tenantsDir,
  mockMapPath,
  mockDataStubRel,
  readMockMap,
  getDataAdapter,
  usesMockData,
  getMockDataFolder,
  getMockDataTsconfigPaths,
  getMockDataWebpackAlias,
};
