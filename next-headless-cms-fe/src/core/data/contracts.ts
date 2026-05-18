import type { PageData, NavigationData } from "@core/types/page";

/** Public URL path for sitemap (leading slash). */
export interface SitemapEntry {
  pathname: string;
  lastModified?: Date;
}

export interface CmsAdapter {
  getPage(tenant: string, slug: string, locale: string): Promise<PageData | null>;
  getCollection<T = unknown>(tenant: string, collection: string, params?: CollectionParams): Promise<T[]>;
  getEntry<T = unknown>(tenant: string, collection: string, id: string): Promise<T | null>;
  getNavigation(tenant: string, locale: string): Promise<NavigationData | null>;
  listSitemapEntries(tenant: string, locale: string): Promise<SitemapEntry[]>;
}

export interface CollectionParams {
  locale?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  filters?: Record<string, unknown>;
}
