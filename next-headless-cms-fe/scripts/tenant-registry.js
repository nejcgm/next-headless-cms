#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
/** @type {typeof import("./tenant-build-utils.cjs")} */
const buildUtils = require("./tenant-build-utils.cjs");

/** @typedef {"mock" | "strapi"} DataAdapter */

const {
  repoRoot,
  tenantsDir,
  getDataAdapter,
  usesMockData,
  getMockDataFolder,
  getMockDataTsconfigPaths,
  getMockDataWebpackAlias,
} = buildUtils;

/** @returns {string[]} */
function listTenantIds() {
  if (!fs.existsSync(tenantsDir)) return [];
  return fs
    .readdirSync(tenantsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

/** @param {string} tenantId @returns {string[]} */
function getOtherTenants(tenantId) {
  return listTenantIds().filter((id) => id !== tenantId);
}

/** @param {string} otherTenantId @returns {string[]} */
function getLeakPatternsForTenant(otherTenantId) {
  return Array.from(
    new Set([`tenants/${otherTenantId}`, `src/tenants/${otherTenantId}`])
  );
}

/** @param {string | undefined} tenantId @returns {string} */
function resolveBuildDir(tenantId) {
  if (tenantId) {
    const tenantBuildDir = path.join(repoRoot, `.next-${tenantId}`);
    if (fs.existsSync(tenantBuildDir)) return tenantBuildDir;
  }
  return path.join(repoRoot, ".next");
}

/** @param {string} buildDir @returns {string | null} */
function detectTenantFromBuild(buildDir) {
  const middlewarePath = path.join(buildDir, "server", "src", "middleware.js");
  if (!fs.existsSync(middlewarePath)) return null;

  const content = fs.readFileSync(middlewarePath, "utf8");
  for (const tenantId of listTenantIds()) {
    if (content.includes(`id:"${tenantId}"`) || content.includes(`id:'${tenantId}'`)) {
      return tenantId;
    }
  }
  return null;
}

module.exports = {
  repoRoot,
  tenantsDir,
  listTenantIds,
  getDataAdapter,
  usesMockData,
  getMockDataFolder,
  getMockDataTsconfigPaths,
  getMockDataWebpackAlias,
  getOtherTenants,
  getLeakPatternsForTenant,
  resolveBuildDir,
  detectTenantFromBuild,
};
