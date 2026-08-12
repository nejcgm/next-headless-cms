import type { StrapiQuery } from "../strapi/types";

export interface SitemapJsonEntry {
  pathname: string;
  lastModified?: string;
}

export interface SitemapJson {
  entries: SitemapJsonEntry[];
}

export interface FindOneArgs {
  collection: string;
  query: StrapiQuery;
  revalidate: number;
  tags: string[];
  bypassCache?: boolean;
}

export interface MatchPatternPageArgs {
  tenant: string;
  logicalSlug: string;
  locale: string;
  status: "published" | "draft";
  bypassCache: boolean;
}

export interface LogFailureArgs {
  method: string;
  err: unknown;
  context: Record<string, unknown>;
}
