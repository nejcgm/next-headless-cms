import type {
  CmsAdapter,
  GetCollectionArgs,
  GetEntryArgs,
  GetPageArgs,
  SitemapEntry,
} from "../types";
import type {
  FindOneArgs,
  LogFailureArgs,
  MatchPatternPageArgs,
} from "./types";
import type { PageData, NavigationData } from "@core/types/page";
import { logger } from "@shared/lib/logger";
import { cacheTags } from "../cache-tags";
import {
  POPULATE,
  REVALIDATE,
  STRAPI_COLLECTIONS,
} from "../strapi/strapi-config";
import { strapiFetch, strapiFetchAll } from "../strapi/strapi-client";
import type { PatternCandidate } from "../strapi/types";
import { resolvePublicationContext } from "../strapi/strapi-publication";
import { normalizeLogicalSlug, tenantScope } from "../strapi/strapi-query";
import {
  findPatternMatch,
  isPlainObject,
  toNavigationData,
  toPageData,
  toPatternCandidate,
  unwrapStrapiDocument,
} from "../strapi/strapi-document";

export class StrapiAdapter implements CmsAdapter {
  async getPage({
    tenant,
    slug,
    locale,
  }: GetPageArgs): Promise<PageData | null> {
    const logicalSlug = normalizeLogicalSlug(slug);
    const { status, bypassCache } = await resolvePublicationContext();
    const pageTags = [
      cacheTags.page({ tenant, slug: logicalSlug, locale }),
      cacheTags.pageGroup({ tenant, slug: logicalSlug }),
      cacheTags.allPages(tenant),
    ];

    try {
      const exact = await this.findOne({
        collection: STRAPI_COLLECTIONS.pages,
        query: {
          filters: {
            ...tenantScope(tenant, locale),
            slug: { $eq: logicalSlug },
          },
          populate: POPULATE.page,
          status,
        },
        revalidate: REVALIDATE.page,
        tags: pageTags,
        bypassCache,
      });

      const direct = exact ? toPageData(exact, locale, tenant) : null;
      if (direct) return direct;

      return await this.matchPatternPage({
        tenant,
        logicalSlug,
        locale,
        status,
        bypassCache,
      });
    } catch (err) {
      this.logFailure({
        method: "getPage",
        err,
        context: { tenant, slug: logicalSlug, locale },
      });
      return null;
    }
  }

  private async matchPatternPage({
    tenant,
    logicalSlug,
    locale,
    status,
    bypassCache,
  }: MatchPatternPageArgs): Promise<PageData | null> {
    const tags = [
      cacheTags.pageGroup({ tenant, slug: `pattern:${locale}` }),
      cacheTags.allPages(tenant),
    ];

    const rows = await strapiFetchAll({
      collection: STRAPI_COLLECTIONS.pages,
      query: {
        filters: {
          ...tenantScope(tenant, locale),
          slugPattern: { $notNull: true },
        },
        fields: ["slug", "slugPattern"],
        status,
      },
      revalidate: REVALIDATE.page,
      tags,
      bypassCache,
    });

    const candidates = rows
      .map(toPatternCandidate)
      .filter((c): c is PatternCandidate => c != null);

    const matchedPattern = findPatternMatch(candidates, logicalSlug);
    if (!matchedPattern) return null;

    const full = await this.findOne({
      collection: STRAPI_COLLECTIONS.pages,
      query: {
        filters: {
          ...tenantScope(tenant, locale),
          slugPattern: { $eq: matchedPattern },
        },
        populate: POPULATE.page,
        status,
      },
      revalidate: REVALIDATE.page,
      tags: [
        cacheTags.pageGroup({ tenant, slug: logicalSlug }),
        cacheTags.allPages(tenant),
      ],
      bypassCache,
    });

    return full ? toPageData(full, locale, tenant) : null;
  }

  async getNavigation(
    tenant: string,
    locale: string
  ): Promise<NavigationData | null> {
    const { status, bypassCache } = await resolvePublicationContext();

    try {
      const doc = await this.findOne({
        collection: STRAPI_COLLECTIONS.navigations,
        query: {
          filters: tenantScope(tenant, locale),
          populate: POPULATE.navigation,
          status,
        },
        revalidate: REVALIDATE.navigation,
        tags: [
          cacheTags.navigation({ tenant, locale }),
          cacheTags.navigationGroup(tenant),
        ],
        bypassCache,
      });

      return doc ? toNavigationData(doc) : null;
    } catch (err) {
      this.logFailure({
        method: "getNavigation",
        err,
        context: { tenant, locale },
      });
      return null;
    }
  }

  async getCollection<T>({
    tenant,
    collection,
    params,
  }: GetCollectionArgs): Promise<T[]> {
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
        tags: [cacheTags.collection({ tenant, collection })],
        bypassCache,
      });
      return res.data ?? [];
    } catch (err) {
      this.logFailure({
        method: "getCollection",
        err,
        context: { tenant, collection },
      });
      return [];
    }
  }

  async getEntry<T>({
    tenant,
    collection,
    id,
    params,
  }: GetEntryArgs): Promise<T | null> {
    const { status, bypassCache } = await resolvePublicationContext();

    try {
      const entry = await this.findOne<T>({
        collection,
        query: {
          filters: {
            ...tenantScope(tenant, params?.locale),
            slug: { $eq: id },
          },
          status,
        },
        revalidate: REVALIDATE.collection,
        tags: [
          cacheTags.entry({
            tenant,
            collection,
            id,
            locale: params?.locale,
          }),
          cacheTags.collection({ tenant, collection }),
        ],
        bypassCache,
      });
      return entry;
    } catch (err) {
      this.logFailure({
        method: "getEntry",
        err,
        context: {
          tenant,
          collection,
          id,
          locale: params?.locale,
        },
      });
      return null;
    }
  }

  async listSitemapEntries(
    tenant: string,
    locale: string
  ): Promise<SitemapEntry[]> {
    try {
      const rows = await strapiFetchAll({
        collection: STRAPI_COLLECTIONS.pages,
        query: {
          filters: tenantScope(tenant, locale),
          fields: ["slug", "updatedAt"],
          populate: { seo: true },
          status: "published",
        },
        revalidate: REVALIDATE.page,
        tags: [
          cacheTags.pageGroup({ tenant, slug: "sitemap" }),
          cacheTags.allPages(tenant),
        ],
      });

      const entries = rows.flatMap((row) => {
        const entry = this.toSitemapEntry(row);
        return entry ? [entry] : [];
      });

      return entries.length > 0 ? entries : [{ pathname: "/" }];
    } catch (err) {
      this.logFailure({
        method: "listSitemapEntries",
        err,
        context: { tenant, locale },
      });
      return [{ pathname: "/" }];
    }
  }

  private async findOne<T = unknown>({
    collection,
    query,
    revalidate,
    tags,
    bypassCache,
  }: FindOneArgs): Promise<T | null> {
    const res = await strapiFetch<T>(collection, {
      query: { ...query, pagination: { ...query.pagination, pageSize: 1 } },
      revalidate,
      tags,
      bypassCache,
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

  private logFailure({ method, err, context }: LogFailureArgs) {
    logger.warn(`StrapiAdapter.${method} failed`, {
      ...context,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
