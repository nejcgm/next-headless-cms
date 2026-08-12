export interface CacheTagPageArgs {
  tenant: string;
  slug: string;
  locale: string;
}

export interface CacheTagPageGroupArgs {
  tenant: string;
  slug: string;
}

export interface CacheTagNavigationArgs {
  tenant: string;
  locale: string;
}

export interface CacheTagCollectionArgs {
  tenant: string;
  collection: string;
}

export interface CacheTagEntryArgs {
  tenant: string;
  collection: string;
  id: string;
  locale?: string;
}

export const cacheTags = {
  page: ({ tenant, slug, locale }: CacheTagPageArgs) =>
    `strapi:page:${tenant}:${slug}:${locale}`,
  pageGroup: ({ tenant, slug }: CacheTagPageGroupArgs) =>
    `strapi:page:${tenant}:${slug}`,
  allPages: (tenant: string) => `strapi:pages:${tenant}`,

  navigation: ({ tenant, locale }: CacheTagNavigationArgs) =>
    `strapi:nav:${tenant}:${locale}`,
  navigationGroup: (tenant: string) => `strapi:nav:${tenant}`,

  collection: ({ tenant, collection }: CacheTagCollectionArgs) =>
    `strapi:collection:${tenant}:${collection}`,
  entry: ({ tenant, collection, id, locale }: CacheTagEntryArgs) =>
    locale
      ? `strapi:entry:${tenant}:${collection}:${locale}:${id}`
      : `strapi:entry:${tenant}:${collection}:${id}`,
};
