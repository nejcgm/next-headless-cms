export const cacheTags = {
  page: (tenant: string, slug: string, locale: string) =>
    `strapi:page:${tenant}:${slug}:${locale}`,
  pageGroup: (tenant: string, slug: string) => `strapi:page:${tenant}:${slug}`,
  allPages: (tenant: string) => `strapi:pages:${tenant}`,

  navigation: (tenant: string, locale: string) => `strapi:nav:${tenant}:${locale}`,
  navigationGroup: (tenant: string) => `strapi:nav:${tenant}`,

  collection: (tenant: string, collection: string) =>
    `strapi:collection:${tenant}:${collection}`,
  entry: (tenant: string, collection: string, id: string, locale?: string) =>
    locale
      ? `strapi:entry:${tenant}:${collection}:${locale}:${id}`
      : `strapi:entry:${tenant}:${collection}:${id}`,
} as const;
