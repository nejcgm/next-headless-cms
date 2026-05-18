import type { CmsAdapter, CollectionParams, SitemapEntry } from "../contracts";
import type { PageData, NavigationData } from "@core/types/page";
import { logger } from "@shared/lib/logger";
import tenantConfig from "@tenant/config";

import sitemapFile from "@mock-data/sitemap.json";

interface SitemapJsonEntry {
  pathname: string;
  lastModified?: string;
}

interface SitemapJson {
  entries: SitemapJsonEntry[];
}

function patternToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/:[\w-]+/g, "([^/]+)");
  return new RegExp(`^${escaped}$`);
}

const pageContext = (require as unknown as { context: (d: string, b: boolean, r: RegExp) => { keys: () => string[] } }).context(
  "@mock-data/pages",
  false,
  /\.json$/
);

async function findPageByPattern(slug: string): Promise<PageData | null> {
  for (const key of pageContext.keys()) {
    const match = key.match(/^\.\/(.+)\.json$/);
    if (!match) continue;
    const pageName = match[1];
    try {
      const mod = await import(
        /* webpackInclude: /\.json$/ */
        /* webpackChunkName: "mock-page-[request]" */
        `@mock-data/pages/${pageName}.json`
      );
      const page = (mod.default ?? mod) as PageData;
      if (!page?.slug) continue;
      const pattern = page.slugPattern ?? page.slug;
      if (!pattern.includes(":")) continue;
      if (!patternToRegex(pattern).test(slug)) continue;
      return page;
    } catch {
      continue;
    }
  }
  return null;
}

export class MockAdapter implements CmsAdapter {
  async getPage(_tenant: string, slug: string, locale: string): Promise<PageData | null> {
    const normalized = slug === "/" ? "home" : slug.replace(/^\//, "").replace(/\//g, "--");
    const defaultLocale = tenantConfig.defaultLocale;

    logger.debug(`MockAdapter: Loading page for ${normalized} (locale ${locale})`);

    const loadJson = async (fileBase: string): Promise<PageData | null> => {
      try {
        const mod = await import(
          /* webpackInclude: /\.json$/ */
          /* webpackChunkName: "mock-page-[request]" */
          `@mock-data/pages/${fileBase}.json`
        );
        return (mod.default ?? mod) as PageData;
      } catch {
        return null;
      }
    };

    // Non-default locale: try `de--about.json` first, then fall back to shared `about.json`.
    let page: PageData | null = null;
    if (locale !== defaultLocale) {
      page = await loadJson(`${locale}--${normalized}`);
    }
    if (!page) {
      page = await loadJson(normalized);
    }
    if (!page) {
      page = await findPageByPattern(slug);
    }
    if (!page) {
      logger.warn(`MockAdapter: Page not found: ${normalized}`);
      return null;
    }

    const cloned = { ...page };
    if (locale !== cloned.locale) {
      cloned.locale = locale;
    }
    return cloned;
  }

  async getCollection<T>(_tenant: string, collection: string, params?: CollectionParams): Promise<T[]> {
    const defaultLocale = tenantConfig.defaultLocale;
    const locale = params?.locale ?? defaultLocale;

    logger.debug(`MockAdapter: Loading collection ${collection} (locale ${locale})`);

    const loadJson = async (fileBase: string): Promise<T[] | null> => {
      try {
        const mod = await import(
          /* webpackInclude: /\.json$/ */
          /* webpackChunkName: "mock-collection-[request]" */
          `@mock-data/collections/${fileBase}.json`
        );
        return mod.default as T[];
      } catch {
        return null;
      }
    };

    let data: T[] | null = null;
    if (locale !== defaultLocale) {
      data = await loadJson(`${locale}--${collection}`);
    }
    if (!data) {
      data = await loadJson(collection);
    }
    if (!data) {
      logger.warn(`MockAdapter: Collection not found: ${collection}`);
      return [];
    }

    if (typeof params?.limit === "number" && Number.isFinite(params.limit) && params.limit > 0) {
      data = data.slice(0, params.limit);
    }
    return data;
  }

  async getEntry<T>(_tenant: string, collection: string, id: string): Promise<T | null> {
    const items = await this.getCollection<T & { id: string }>("", collection);
    return items.find((item) => item.id === id) ?? null;
  }

  async getNavigation(_tenant: string, locale: string): Promise<NavigationData | null> {
    const defaultLocale = tenantConfig.defaultLocale;

    const loadJson = async (fileBase: string): Promise<NavigationData | null> => {
      try {
        const mod = await import(
          /* webpackInclude: /\.json$/ */
          /* webpackChunkName: "mock-navigation-[request]" */
          `@mock-data/${fileBase}.json`
        );
        return (mod.default ?? mod) as NavigationData;
      } catch {
        return null;
      }
    };

    let data: NavigationData | null = null;
    if (locale !== defaultLocale) {
      data = await loadJson(`${locale}--navigation`);
    }
    if (!data) {
      data = await loadJson("navigation");
    }
    if (!data) {
      logger.warn("MockAdapter: navigation.json not found");
      return null;
    }
    return data;
  }

  async listSitemapEntries(tenant: string, locale: string): Promise<SitemapEntry[]> {
    void tenant;
    void locale;
    const raw = sitemapFile as SitemapJson;
    const entries = raw.entries ?? [];
    return entries.map((e) => ({
      pathname: e.pathname.startsWith("/") ? e.pathname : `/${e.pathname}`,
      lastModified: e.lastModified ? new Date(e.lastModified) : undefined,
    }));
  }
}
