import type { Breadcrumb, NavigationData } from "./navigation";

export type { Breadcrumb, FooterCopy, NavItem, NavigationData } from "./navigation";

export interface PageData {
  slug: string;
  slugPattern?: string;
  locale: string;
  template: string;
  blocks: BlockInstance[];
  seo: PageSeo;
  navigation?: NavigationData;
  breadcrumbs?: Breadcrumb[];
}

export interface BlockInstance {
  id: string;
  type: string;
  props: Record<string, unknown>;
  dataContract?: string;
  visibility?: BlockVisibility;
}

export interface BlockVisibility {
  devices?: ("mobile" | "tablet" | "desktop")[];
  locales?: string[];
  dateRange?: { from?: string; to?: string };
}

export interface PageSeo {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
}

