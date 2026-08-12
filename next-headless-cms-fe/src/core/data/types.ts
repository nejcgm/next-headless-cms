import type { PageData, NavigationData } from "@core/types/page";

export interface SitemapEntry {
  pathname: string;
  lastModified?: Date;
}

export interface CollectionParams {
  locale?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  filters?: Record<string, unknown>;
}

export interface EntryParams {
  locale?: string;
}

export interface TenantPageParams {
  tenantId: string;
  slug: string;
  locale: string;
}

export interface PageWithNavigationResult {
  page: PageData | null;
  navigation: NavigationData | null;
}

export interface GetPageArgs {
  tenant: string;
  slug: string;
  locale: string;
}

export interface GetCollectionArgs {
  tenant: string;
  collection: string;
  params?: CollectionParams;
}

export interface GetEntryArgs {
  tenant: string;
  collection: string;
  id: string;
  params?: EntryParams;
}

export interface CmsAdapter {
  getPage(args: GetPageArgs): Promise<PageData | null>;
  getCollection<T = unknown>(args: GetCollectionArgs): Promise<T[]>;
  getEntry<T = unknown>(args: GetEntryArgs): Promise<T | null>;
  getNavigation(tenant: string, locale: string): Promise<NavigationData | null>;
  listSitemapEntries(tenant: string, locale: string): Promise<SitemapEntry[]>;
}
