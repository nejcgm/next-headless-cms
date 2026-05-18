import type { MetadataRoute } from "next";
import tenantConfig from "@tenant/config";
import { getAdapter } from "@core/data/fetcher";
import { getSiteOrigin } from "@core/seo/site-url";
import { isIndexingDisabled } from "@core/seo/crawl-policy";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isIndexingDisabled()) return [];

  const base = getSiteOrigin(tenantConfig);
  const origin = base.replace(/\/$/, "");
  const adapter = getAdapter(tenantConfig.id);
  const entries = await adapter.listSitemapEntries(tenantConfig.id, tenantConfig.defaultLocale);

  return entries.map(({ pathname, lastModified }) => ({
    url: pathname === "/" ? `${origin}/` : `${origin}${pathname.startsWith("/") ? pathname : `/${pathname}`}`,
    lastModified: lastModified ?? undefined,
  }));
}
