import type { CmsAdapter, CollectionParams, SitemapEntry } from "../contracts";
import type { PageData, NavigationData } from "@core/types/page";
import { apiClient } from "@shared/lib/api-client";
import { logger } from "@shared/lib/logger";
import { env } from "@/env";

interface StrapiListResponse {
  data: unknown[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/** Strapi may return `slug` as a string, localized map, or nested `data.attributes.slug`. */
function extractSlugField(raw: unknown, locale: string, depth = 0): string | undefined {
  if (raw == null || depth > 8) return undefined;

  if (typeof raw === "string") {
    const s = raw.trim();
    return s ? s : undefined;
  }

  if (typeof raw !== "object") return undefined;

  const o = raw as Record<string, unknown>;

  if (locale && !Array.isArray(raw)) {
    const locVal = o[locale];
    if (typeof locVal === "string" && locVal.trim()) return locVal.trim();
  }

  const slugVal = o.slug;
  if (typeof slugVal === "string") {
    const s = slugVal.trim();
    if (s) return s;
  }
  if (slugVal != null && typeof slugVal === "object") {
    const nested = extractSlugField(slugVal, locale, depth + 1);
    if (nested) return nested;
  }

  const pathVal = o.path;
  if (typeof pathVal === "string" && pathVal.trim()) return pathVal.trim();

  if (o.data !== undefined) {
    const d = o.data;
    if (Array.isArray(d) && d.length > 0) {
      const fromArr = extractSlugField(d[0], locale, depth + 1);
      if (fromArr) return fromArr;
    } else {
      const fromData = extractSlugField(d, locale, depth + 1);
      if (fromData) return fromData;
    }
  }

  if (o.attributes !== undefined && typeof o.attributes === "object") {
    return extractSlugField(o.attributes, locale, depth + 1);
  }

  return undefined;
}

function readNoIndex(seo: unknown, depth = 0): boolean | undefined {
  if (seo == null || depth > 6) return undefined;
  if (typeof seo === "object" && "noIndex" in seo) {
    const v = (seo as { noIndex: unknown }).noIndex;
    if (typeof v === "boolean") return v;
  }
  if (typeof seo === "object" && seo !== null) {
    const o = seo as Record<string, unknown>;
    if (o.data !== undefined) return readNoIndex(o.data, depth + 1);
    if (o.attributes !== undefined && typeof o.attributes === "object") {
      return readNoIndex(o.attributes, depth + 1);
    }
  }
  return undefined;
}

function readUpdatedAt(source: unknown, depth = 0): string | undefined {
  if (source == null || depth > 6) return undefined;
  if (typeof source === "string") return source;
  if (typeof source !== "object") return undefined;
  const o = source as Record<string, unknown>;
  if (typeof o.updatedAt === "string") return o.updatedAt;
  if (o.data !== undefined) return readUpdatedAt(o.data, depth + 1);
  if (o.attributes !== undefined && typeof o.attributes === "object") {
    return readUpdatedAt(o.attributes, depth + 1);
  }
  return undefined;
}

function flattenStrapiPageListItem(item: unknown, locale: string): {
  slug?: string;
  noIndex?: boolean;
  updatedAt?: string;
} {
  if (!item || typeof item !== "object") return {};

  const root = item as Record<string, unknown>;
  const body =
    root.attributes !== undefined && typeof root.attributes === "object"
      ? (root.attributes as Record<string, unknown>)
      : root;

  const slug = extractSlugField(body.slug, locale) ?? extractSlugField(body, locale);
  const noIndex = readNoIndex(body.seo);
  const updatedAt = readUpdatedAt(body) ?? readUpdatedAt(root);

  return {
    slug,
    noIndex,
    updatedAt,
  };
}

export class StrapiAdapter implements CmsAdapter {
  private baseUrl = env.STRAPI_URL ?? "http://localhost:1337";
  private token = env.STRAPI_API_TOKEN ?? "";

  private headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  async getPage(tenant: string, slug: string, locale: string): Promise<PageData | null> {
    const res = await apiClient<{ data: PageData[] }>(`${this.baseUrl}/api/pages`, {
      params: {
        "filters[tenant][$eq]": tenant,
        "filters[slug][$eq]": slug,
        locale,
        populate: "deep",
      },
      headers: this.headers(),
      next: { revalidate: 60, tags: [`page-${tenant}-${slug}`] },
    });

    return res.data?.[0] ?? null;
  }

  async listSitemapEntries(tenant: string, locale: string): Promise<SitemapEntry[]> {
    try {
      const pageSize = 100;
      const rows: unknown[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore && page <= 50) {
        const res = await apiClient<StrapiListResponse>(`${this.baseUrl}/api/pages`, {
          params: {
            "filters[tenant][$eq]": tenant,
            locale,
            "pagination[page]": page,
            "pagination[pageSize]": pageSize,
          },
          headers: this.headers(),
          next: { revalidate: 300, tags: [`sitemap-${tenant}`] },
        });

        const batch = res.data ?? [];
        rows.push(...batch);

        const pageCount = res.meta?.pagination?.pageCount;
        if (typeof pageCount === "number" && pageCount >= 1) {
          hasMore = page < pageCount;
        } else {
          hasMore = batch.length === pageSize;
        }
        page += 1;
      }

      const out: SitemapEntry[] = [];
      for (const item of rows) {
        const { slug, noIndex, updatedAt } = flattenStrapiPageListItem(item, locale);
        if (!slug || noIndex) continue;
        const pathname = slug.startsWith("/") ? slug : `/${slug}`;
        out.push({
          pathname,
          lastModified: updatedAt ? new Date(updatedAt) : undefined,
        });
      }
      return out.length > 0 ? out : [{ pathname: "/" }];
    } catch (err) {
      logger.warn("StrapiAdapter.listSitemapEntries failed", {
        error: err instanceof Error ? err.message : String(err),
      });
      return [{ pathname: "/" }];
    }
  }

  async getCollection<T>(tenant: string, collection: string, params?: CollectionParams): Promise<T[]> {
    const res = await apiClient<{ data: T[] }>(`${this.baseUrl}/api/${collection}`, {
      params: {
        "filters[tenant][$eq]": tenant,
        locale: params?.locale,
        "pagination[limit]": params?.limit,
        "pagination[start]": params?.offset,
        sort: params?.sort,
        ...params?.filters,
      },
      headers: this.headers(),
      next: { revalidate: 60, tags: [`collection-${tenant}-${collection}`] },
    });

    return res.data ?? [];
  }

  async getEntry<T>(tenant: string, collection: string, id: string): Promise<T | null> {
    const res = await apiClient<{ data: T | null }>(`${this.baseUrl}/api/${collection}/${id}`, {
      params: { populate: "deep" },
      headers: this.headers(),
      next: { revalidate: 60, tags: [`entry-${tenant}-${collection}-${id}`] },
    });

    return res.data ?? null;
  }

  async getNavigation(tenant: string, locale: string): Promise<NavigationData | null> {
    const res = await apiClient<{ data: NavigationData[] }>(`${this.baseUrl}/api/navigations`, {
      params: {
        "filters[tenant][$eq]": tenant,
        locale,
        populate: "deep",
      },
      headers: this.headers(),
      next: { revalidate: 300, tags: [`nav-${tenant}`] },
    });

    return res.data?.[0] ?? null;
  }
}
