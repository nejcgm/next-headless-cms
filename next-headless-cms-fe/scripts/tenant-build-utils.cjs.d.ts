export function getMockDataWebpackAlias(tenantId: string): string | null;
export function getDataAdapter(tenantId: string): "mock" | "strapi";
export function usesMockData(tenantId: string): boolean;
export function getMockDataFolder(tenantId: string): string;
export function getTenantDataRel(tenantId: string): string;
export function getMockDataTsconfigPaths(tenantId: string): { base: string; glob: string };
export const repoRoot: string;
export const tenantsDir: string;
export const mockDataStubRel: string;
