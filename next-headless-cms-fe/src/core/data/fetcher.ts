import { cache } from "react";
import type { CmsAdapter } from "./contracts";
import type { NavigationData } from "@core/types/navigation";
import { MockAdapter } from "./adapters/mock.adapter";
import { StrapiAdapter } from "./adapters/strapi.adapter";
import tenantConfig from "@tenant/config";

const adapters: Record<string, CmsAdapter> = {
  mock: new MockAdapter(),
  strapi: new StrapiAdapter(),
};

export function getAdapter(tenantId?: string): CmsAdapter {
  void tenantId;
  return adapters[tenantConfig.dataAdapter];
}

export const getNavigationCached = cache(
  async (tenantId: string, locale: string): Promise<NavigationData | null> => {
    return getAdapter(tenantId).getNavigation(tenantId, locale);
  }
);
