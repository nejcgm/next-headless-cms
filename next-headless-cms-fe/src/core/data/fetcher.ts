import { cache } from "react";
import type { CmsAdapter } from "./contracts";
import type { PageData } from "@core/types/page";
import type { NavigationData } from "@core/types/navigation";
import { templateUsesSiteChrome } from "@core/routing/template-chrome";
import { StrapiAdapter } from "./adapters/strapi.adapter";
import tenantConfig from "@tenant/config";
import { env } from "@/env";

const strapiAdapter = new StrapiAdapter();
let mockAdapterPromise: Promise<CmsAdapter> | undefined;

function getMockAdapter(): Promise<CmsAdapter> {
  if (!mockAdapterPromise) {
    // Dynamic import keeps mock JSON out of Strapi tenant builds (see dataAdapter in config).
    mockAdapterPromise = import("./adapters/mock.adapter").then(
      ({ MockAdapter }) => new MockAdapter()
    );
  }
  return mockAdapterPromise;
}

let strapiEnvChecked = false;

function ensureStrapiEnv(): void {
  if (strapiEnvChecked || tenantConfig.dataAdapter !== "strapi") return;
  strapiEnvChecked = true;

  if (!env.STRAPI_URL) {
    throw new Error(
      'STRAPI_URL is required when tenant dataAdapter is "strapi"'
    );
  }
  if (process.env.NODE_ENV === "production" && !env.STRAPI_API_TOKEN) {
    throw new Error(
      'STRAPI_API_TOKEN is required in production when dataAdapter is "strapi"'
    );
  }
}

export async function getAdapter(): Promise<CmsAdapter> {
  ensureStrapiEnv();
  return tenantConfig.dataAdapter === "strapi"
    ? strapiAdapter
    : getMockAdapter();
}

export const getPageCached = cache(
  async (
    tenantId: string,
    slug: string,
    locale: string
  ): Promise<PageData | null> => {
    return (await getAdapter()).getPage(tenantId, slug, locale);
  }
);

export const getNavigationCached = cache(
  async (tenantId: string, locale: string): Promise<NavigationData | null> => {
    return (await getAdapter()).getNavigation(tenantId, locale);
  }
);

export async function loadPageWithNavigation(
  tenantId: string,
  slug: string,
  locale: string
): Promise<{ page: PageData | null; navigation: NavigationData | null }> {
  const page = await getPageCached(tenantId, slug, locale);
  if (!page) return { page: null, navigation: null };
  if (!templateUsesSiteChrome(page.template)) return { page, navigation: null };

  const navigation = await getNavigationCached(tenantId, locale);
  return { page, navigation };
}
