import type { MetadataRoute } from "next";
import tenantConfig from "@tenant/config";
import { getAdapter } from "@core/data/fetcher";
import { prefixPathname } from "@core/i18n/locale-path";
import { getSiteOrigin } from "@core/seo/site-url";
import { isIndexingDisabled } from "@core/seo/crawl-policy";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isIndexingDisabled()) return [];

  const base = getSiteOrigin(tenantConfig);
  const origin = base.replace(/\/$/, "");
  const adapter = getAdapter();

  const byLocale = await Promise.all(
    tenantConfig.locales.map(async (locale) => {
      const entries = await adapter.listSitemapEntries(tenantConfig.id, locale);
      return entries.map(({ pathname, lastModified }) => ({
        pathname: prefixPathname(pathname, locale, tenantConfig.defaultLocale),
        lastModified,
      }));
    })
  );

  const seen = new Set<string>();
  const urls: MetadataRoute.Sitemap = [];

  for (const entries of byLocale) {
    for (const { pathname, lastModified } of entries) {
      if (seen.has(pathname)) continue;
      seen.add(pathname);
      urls.push({
        url: pathname === "/" ? `${origin}/` : `${origin}${pathname}`,
        lastModified: lastModified ?? undefined,
      });
    }
  }

  return urls.length > 0 ? urls : [{ url: `${origin}/` }];
}
