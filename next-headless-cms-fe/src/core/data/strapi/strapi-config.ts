import { env } from "@/env";

export const strapiConfig = {
  baseUrl: env.STRAPI_URL ?? "http://localhost:1337",
  token: env.STRAPI_API_TOKEN ?? "",
};

export const STRAPI_COLLECTIONS = {
  pages: "pages",
  navigations: "navigations",
  products: "products",
} as const;

export type StrapiCollection = (typeof STRAPI_COLLECTIONS)[keyof typeof STRAPI_COLLECTIONS];

export const POPULATE = {
  page: { seo: true, blocks: { populate: "*" } },
  navigation: { header: { populate: "*" }, footer: { populate: "*" }, footerCopy: true },
};

export const REVALIDATE = {
  page: 60,
  navigation: 300,
  collection: 60,
};

export const PAGINATION = {
  pageSize: 100,
  maxPages: 50,
} as const;

export const FETCH_TIMEOUT_MS = 15_000;
