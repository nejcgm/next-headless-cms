export type StrapiCollection = "pages" | "navigations" | "products";

export interface StrapiQuery {
  filters?: Record<string, unknown>;
  populate?: Record<string, unknown> | string;
  fields?: string[];
  sort?: string | string[];
  pagination?: {
    page?: number;
    pageSize?: number;
    limit?: number;
    start?: number;
  };
  status?: "published" | "draft";
}

export interface StrapiListMeta {
  pagination?: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export interface StrapiListResponse<T = unknown> {
  data: T[];
  meta?: StrapiListMeta;
}

export interface StrapiFetchOptions {
  query?: StrapiQuery;
  revalidate: number;
  tags: string[];
  bypassCache?: boolean;
}

export interface PatternCandidate {
  slug: string;
  slugPattern?: string;
}

export interface StrapiFetchAllArgs {
  collection: string;
  query: StrapiQuery;
  revalidate: number;
  tags: string[];
  bypassCache?: boolean;
}
