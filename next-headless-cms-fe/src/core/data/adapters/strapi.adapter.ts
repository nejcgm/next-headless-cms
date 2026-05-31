import type {
  CmsAdapter,
  CollectionParams,
  EntryParams,
  SitemapEntry,
} from "../contracts";
import type { PageData, NavigationData } from "@core/types/page";
import { logger } from "@shared/lib/logger";
import { cacheTags } from "../cache-tags";
import {
  POPULATE,
  REVALIDATE,
  STRAPI_COLLECTIONS,
} from "../strapi/strapi-config";
import {
  strapiFetch,
  strapiFetchAll,
  type StrapiQuery,
} from "../strapi/strapi-client";
import { resolvePublicationContext } from "../strapi/strapi-publication";
import { normalizeLogicalSlug, tenantScope } from "../strapi/strapi-query";
import {
  findPatternMatch,
  isPlainObject,
  toNavigationData,
  toPageData,
  toPatternCandidate,
  unwrapStrapiDocument,
  type PatternCandidate,
} from "../strapi/strapi-document";

export class StrapiAdapter implements CmsAdapter {
  async getPage(
    tenant: string,
    slug: string,
    locale: string
  ): Promise<PageData | null> {
    const logicalSlug = normalizeLogicalSlug(slug);
    const { status, bypassCache } = await resolvePublicationContext();
    const pageTags = [
      cacheTags.page(tenant, logicalSlug, locale),
      cacheTags.pageGroup(tenant, logicalSlug),
      cacheTags.allPages(tenant),
    ];

    try {
      const exact = await this.findOne(
        STRAPI_COLLECTIONS.pages,
        {
          filters: {
            ...tenantScope(tenant, locale),
            slug: { $eq: logicalSlug },
          },
          populate: POPULATE.page,
          status,
        },
        { revalidate: REVALIDATE.page, tags: pageTags, bypassCache }
      );

      const direct = exact ? toPageData(exact, locale) : null;
      if (direct) return direct;

      return await this.matchPatternPage(
        tenant,
        logicalSlug,
        locale,
        status,
        bypassCache
      );
    } catch (err) {
      this.logFailure("getPage", err, { tenant, slug: logicalSlug, locale });
      return null;
    }
  }

  private async matchPatternPage(
    tenant: string,
    logicalSlug: string,
    locale: string,
    status: "published" | "draft",
    bypassCache: boolean
  ): Promise<PageData | null> {
    const tags = [
      cacheTags.pageGroup(tenant, `pattern:${locale}`),
      cacheTags.allPages(tenant),
    ];

    const rows = await strapiFetchAll(
      STRAPI_COLLECTIONS.pages,
      {
        filters: {
          ...tenantScope(tenant, locale),
          slugPattern: { $notNull: true },
        },
        fields: ["slug", "slugPattern"],
        status,
      },
      { revalidate: REVALIDATE.page, tags, bypassCache }
    );

    const candidates = rows
      .map(toPatternCandidate)
      .filter((c): c is PatternCandidate => c != null);

    const matchedPattern = findPatternMatch(candidates, logicalSlug);
    if (!matchedPattern) return null;

    const full = await this.findOne(
      STRAPI_COLLECTIONS.pages,
      {
        filters: {
          ...tenantScope(tenant, locale),
          slugPattern: { $eq: matchedPattern },
        },
        populate: POPULATE.page,
        status,
      },
      {
        revalidate: REVALIDATE.page,
        tags: [
          cacheTags.pageGroup(tenant, logicalSlug),
          cacheTags.allPages(tenant),
        ],
        bypassCache,
      }
    );

    return full ? toPageData(full, locale) : null;
  }

  async getNavigation(
    tenant: string,
    locale: string
  ): Promise<NavigationData | null> {
    const { status, bypassCache } = await resolvePublicationContext();

    try {
      const doc = await this.findOne(
        STRAPI_COLLECTIONS.navigations,
        {
          filters: tenantScope(tenant, locale),
          populate: POPULATE.navigation,
          status,
        },
        {
          revalidate: REVALIDATE.navigation,
          tags: [
            cacheTags.navigation(tenant, locale),
            cacheTags.navigationGroup(tenant),
          ],
          bypassCache,
        }
      );

      return doc ? toNavigationData(doc) : null;
    } catch (err) {
      this.logFailure("getNavigation", err, { tenant, locale });
      return null;
    }
  }

  async getCollection<T>(
    tenant: string,
    collection: string,
    params?: CollectionParams
  ): Promise<T[]> {
    const { status, bypassCache } = await resolvePublicationContext();

    try {
      const res = await strapiFetch<T>(collection, {
        query: {
          filters: {
            ...tenantScope(tenant, params?.locale),
            ...params?.filters,
          },
          status,
          sort: params?.sort,
          pagination: { limit: params?.limit, start: params?.offset },
        },
        revalidate: REVALIDATE.collection,
        tags: [cacheTags.collection(tenant, collection)],
        bypassCache,
      });
      return res.data ?? [];
    } catch (err) {
      this.logFailure("getCollection", err, { tenant, collection });
      return [];
    }
  }

  async getEntry<T>(
    tenant: string,
    collection: string,
    id: string,
    params?: EntryParams
  ): Promise<T | null> {
    const { status, bypassCache } = await resolvePublicationContext();

    try {
      const entry = await this.findOne<T>(
        collection,
        {
          filters: {
            ...tenantScope(tenant, params?.locale),
            slug: { $eq: id },
          },
          status,
        },
        {
          revalidate: REVALIDATE.collection,
          tags: [
            cacheTags.entry(tenant, collection, id, params?.locale),
            cacheTags.collection(tenant, collection),
          ],
          bypassCache,
        }
      );
      return entry;
    } catch (err) {
      this.logFailure("getEntry", err, {
        tenant,
        collection,
        id,
        locale: params?.locale,
      });
      return null;
    }
  }

  async listSitemapEntries(
    tenant: string,
    locale: string
  ): Promise<SitemapEntry[]> {
    try {
      const rows = await strapiFetchAll(
        STRAPI_COLLECTIONS.pages,
        {
          filters: tenantScope(tenant, locale),
          fields: ["slug", "updatedAt"],
          populate: { seo: true },
          status: "published",
        },
        {
          revalidate: REVALIDATE.page,
          tags: [
            cacheTags.pageGroup(tenant, "sitemap"),
            cacheTags.allPages(tenant),
          ],
        }
      );

      const entries = rows.flatMap((row) => {
        const entry = this.toSitemapEntry(row);
        return entry ? [entry] : [];
      });

      return entries.length > 0 ? entries : [{ pathname: "/" }];
    } catch (err) {
      this.logFailure("listSitemapEntries", err, { tenant, locale });
      return [{ pathname: "/" }];
    }
  }

  private async findOne<T = unknown>(
    collection: string,
    query: StrapiQuery,
    cache: { revalidate: number; tags: string[]; bypassCache?: boolean }
  ): Promise<T | null> {
    const res = await strapiFetch<T>(collection, {
      query: { ...query, pagination: { ...query.pagination, pageSize: 1 } },
      revalidate: cache.revalidate,
      tags: cache.tags,
      bypassCache: cache.bypassCache,
    });
    return res.data?.[0] ?? null;
  }

  private toSitemapEntry(row: unknown): SitemapEntry | null {
    const doc = unwrapStrapiDocument(row);
    if (!doc || typeof doc.slug !== "string" || !doc.slug.trim()) return null;

    const seo =
      unwrapStrapiDocument(doc.seo) ??
      (isPlainObject(doc.seo) ? doc.seo : null);
    if (seo?.noIndex === true) return null;

    const updatedAt =
      typeof doc.updatedAt === "string" ? doc.updatedAt : undefined;
    return {
      pathname: normalizeLogicalSlug(doc.slug.trim()),
      lastModified: updatedAt ? new Date(updatedAt) : undefined,
    };
  }

  private logFailure(
    method: string,
    err: unknown,
    context: Record<string, unknown>
  ) {
    logger.warn(`StrapiAdapter.${method} failed`, {
      ...context,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
