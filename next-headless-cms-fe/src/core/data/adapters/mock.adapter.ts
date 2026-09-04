import fs from "fs";
import path from "path";
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

function mockDataRoot(): string {
  return path.join(
    process.cwd(),
    "src",
    "tenants",
    tenantConfig.id,
    "mock-data"
  );
}

function readJsonFile<T>(relativePath: string): T | null {
  const filePath = path.join(mockDataRoot(), relativePath);
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch (error) {
    logger.debug(`MockAdapter: failed to read ${relativePath}`, {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

function listPageFiles(): string[] {
  const dir = path.join(mockDataRoot(), "pages");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((name) => name.endsWith(".json"));
}

function findPageByPattern(slug: string): PageData | null {
  for (const fileName of listPageFiles()) {
    const raw = readJsonFile<Record<string, unknown>>(`pages/${fileName}`);
    if (!raw || typeof raw.slug !== "string") continue;
    const pattern =
      typeof raw.slugPattern === "string" && raw.slugPattern.trim()
        ? raw.slugPattern.trim()
        : raw.slug;
    if (!pattern.includes(":")) continue;
    if (!patternToRegex(pattern).test(slug)) continue;
    return raw as unknown as PageData;
  }
  return null;
}

export class MockAdapter implements CmsAdapter {
  async getPage({ slug, locale }: GetPageArgs): Promise<PageData | null> {
    const normalized =
      slug === "/" ? "home" : slug.replace(/^\//, "").replace(/\//g, "--");
    const defaultLocale = tenantConfig.defaultLocale;

    logger.debug(`MockAdapter: Loading page for ${normalized} (locale ${locale})`);

    let raw: PageData | null = null;
    if (locale !== defaultLocale) {
      raw = readJsonFile<PageData>(`pages/${locale}--${normalized}.json`);
    }
    if (!raw) {
      raw = readJsonFile<PageData>(`pages/${normalized}.json`);
    }
    if (!raw) {
      raw = findPageByPattern(slug);
    }
    if (!raw) {
      logger.warn(`MockAdapter: Page not found: ${normalized}`);
      return null;
    }

    const page = toPageData(raw, locale, tenantConfig.id);
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

    logger.debug(
      `MockAdapter: Loading collection ${collection} (locale ${locale})`
    );

    let data: T[] | null = null;
    if (locale !== defaultLocale) {
      data = readJsonFile<T[]>(`collections/${locale}--${collection}.json`);
    }
    if (!data) {
      data = readJsonFile<T[]>(`collections/${collection}.json`);
    }
    if (!data) {
      logger.warn(`MockAdapter: Collection not found: ${collection}`);
      return [];
    }

    if (
      typeof params?.limit === "number" &&
      Number.isFinite(params.limit) &&
      params.limit > 0
    ) {
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
    return (
      (items.find((item) => item.slug === id || item.id === id) as T) ?? null
    );
  }

  async getNavigation(
    _tenant: string,
    locale: string
  ): Promise<NavigationData | null> {
    const defaultLocale = tenantConfig.defaultLocale;

    let raw: NavigationData | null = null;
    if (locale !== defaultLocale) {
      raw = readJsonFile<NavigationData>(`${locale}--navigation.json`);
    }
    if (!raw) {
      raw = readJsonFile<NavigationData>("navigation.json");
    }
    if (!raw) {
      logger.warn("MockAdapter: navigation.json not found");
      return null;
    }

    return toNavigationData(raw);
  }

  async listSitemapEntries(
    tenant: string,
    locale: string
  ): Promise<SitemapEntry[]> {
    void tenant;
    void locale;
    const raw = readJsonFile<SitemapJson>("sitemap.json");
    const entries = raw?.entries ?? [];
    return entries.map((e) => ({
      pathname: e.pathname.startsWith("/") ? e.pathname : `/${e.pathname}`,
      lastModified: e.lastModified ? new Date(e.lastModified) : undefined,
    }));
  }
}
