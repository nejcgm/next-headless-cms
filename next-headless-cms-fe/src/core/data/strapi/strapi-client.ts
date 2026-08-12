import "server-only";

import qs from "qs";
import { logger } from "@shared/lib/logger";
import { FETCH_TIMEOUT_MS, PAGINATION, strapiConfig } from "./strapi-config";
import type {
  StrapiFetchAllArgs,
  StrapiFetchOptions,
  StrapiListResponse,
  StrapiQuery,
} from "./types";

export class StrapiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly collection: string
  ) {
    super(message);
    this.name = "StrapiError";
  }
}

function buildUrl(collection: string, query?: StrapiQuery): string {
  const search = query ? qs.stringify(query, { encodeValuesOnly: true }) : "";
  const base = `${strapiConfig.baseUrl}/api/${collection}`;
  return search ? `${base}?${search}` : base;
}

function authHeaders(): HeadersInit {
  return strapiConfig.token
    ? { Authorization: `Bearer ${strapiConfig.token}` }
    : {};
}

export async function strapiFetch<T = unknown>(
  collection: string,
  options: StrapiFetchOptions
): Promise<StrapiListResponse<T>> {
  const url = buildUrl(collection, options.query);
  logger.debug(`Strapi GET ${collection}`, {
    url,
    bypassCache: options.bypassCache ?? false,
  });

  try {
    const res = await fetch(url, {
      headers: authHeaders(),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      ...(options.bypassCache
        ? { cache: "no-store" as const }
        : { next: { revalidate: options.revalidate, tags: options.tags } }),
    });

    if (!res.ok) {
      throw new StrapiError(
        `Strapi request failed: ${res.status} ${res.statusText}`,
        res.status,
        collection
      );
    }

    return (await res.json()) as StrapiListResponse<T>;
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new StrapiError(
        `Strapi request timed out after ${FETCH_TIMEOUT_MS}ms`,
        408,
        collection
      );
    }
    throw err;
  }
}

export async function strapiFetchAll<T = unknown>({
  collection,
  query,
  revalidate,
  tags,
  bypassCache,
}: StrapiFetchAllArgs): Promise<T[]> {
  const rows: T[] = [];
  let page = 1;
  let pageCount = 1;

  while (page <= pageCount && page <= PAGINATION.maxPages) {
    const res = await strapiFetch<T>(collection, {
      query: { ...query, pagination: { page, pageSize: PAGINATION.pageSize } },
      revalidate,
      tags,
      bypassCache,
    });
    rows.push(...(res.data ?? []));
    pageCount = res.meta?.pagination?.pageCount ?? 1;
    page += 1;
  }

  return rows;
}
