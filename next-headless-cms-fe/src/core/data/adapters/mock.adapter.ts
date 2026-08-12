import type {
  CmsAdapter,
  GetCollectionArgs,
  GetEntryArgs,
  GetPageArgs,
  SitemapEntry,
} from "../types";
import type { PageData, NavigationData } from "@core/types/page";
import { logger } from "@shared/lib/logger";
import tenantConfig from "@tenant/config";
import { toPageData, toNavigationData, patternToRegex } from "../strapi/strapi-document";
import type { SitemapJson } from "./types";

import sitemapFile from "@mock-data/sitemap.json";

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
      const raw = (mod.default ?? mod) as Record<string, unknown>;
      if (!raw?.slug) continue;
      const pattern =
        typeof raw.slugPattern === "string" && raw.slugPattern.trim()
          ? raw.slugPattern.trim()
          : typeof raw.slug === "string"
            ? raw.slug
            : "";
      if (!pattern.includes(":")) continue;
      if (!patternToRegex(pattern).test(slug)) continue;
      return raw as unknown as PageData;
    } catch {
      continue;
    }
  }
  return null;
}

export class MockAdapter implements CmsAdapter {
  async getPage({ slug, locale }: GetPageArgs): Promise<PageData | null> {
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

    let raw: PageData | null = null;
    if (locale !== defaultLocale) {
      raw = await loadJson(`${locale}--${normalized}`);
    }
    if (!raw) {
      raw = await loadJson(normalized);
    }
    if (!raw) {
      raw = await findPageByPattern(slug);
    }
    if (!raw) {
      logger.warn(`MockAdapter: Page not found: ${normalized}`);
      return null;
    }

    const page = toPageData(raw, locale);
    if (!page) return null;
    if (locale !== page.locale) {
      return { ...page, locale };
    }
    return page;
  }

  async getCollection<T>({
    collection,
    params,
  }: GetCollectionArgs): Promise<T[]> {
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

  async getEntry<T>({
    collection,
    id,
    params,
  }: GetEntryArgs): Promise<T | null> {
    const locale = params?.locale ?? tenantConfig.defaultLocale;
    const items = await this.getCollection<T & { id?: string; slug?: string }>({
      tenant: "",
      collection,
      params: { locale },
    });
    return (items.find((item) => item.slug === id || item.id === id) as T) ?? null;
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

    let raw: NavigationData | null = null;
    if (locale !== defaultLocale) {
      raw = await loadJson(`${locale}--navigation`);
    }
    if (!raw) {
      raw = await loadJson("navigation");
    }
    if (!raw) {
      logger.warn("MockAdapter: navigation.json not found");
      return null;
    }

    return toNavigationData(raw);
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
