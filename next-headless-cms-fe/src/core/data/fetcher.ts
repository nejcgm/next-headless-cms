import type { CmsAdapter } from "./contracts";
import { MockAdapter } from "./adapters/mock.adapter";
import { StrapiAdapter } from "./adapters/strapi.adapter";
import tenantConfig from "@tenant/config";

const adapters: Record<string, CmsAdapter> = {
  mock: new MockAdapter(),
  strapi: new StrapiAdapter(),
};

export function getAdapter(_tenantId?: string): CmsAdapter {
  return adapters[tenantConfig.dataAdapter];
}
