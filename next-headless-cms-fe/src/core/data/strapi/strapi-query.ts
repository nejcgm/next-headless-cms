export function tenantScope(
  tenant: string,
  locale?: string
): Record<string, unknown> {
  const filters: Record<string, unknown> = { tenant: { $eq: tenant } };
  if (locale) filters.lang = { $eq: locale };
  return filters;
}

export function normalizeLogicalSlug(slug: string): string {
  if (slug === "") return "/";
  return slug.startsWith("/") ? slug : `/${slug}`;
}
