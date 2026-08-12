export interface BikeDetailLabels {
  notFoundTitle: string;
  notFoundBody: string;
  notFoundCtaLabel: string;
  notFoundCtaHref: string;
  breadcrumbHome: string;
  breadcrumbHomeHref: string;
  breadcrumbBikes: string;
  breadcrumbBikesHref: string;
  outOfStock: string;
  descriptionHeading: string;
  specsHeading: string;
  contactTeaser: string;
  contactPhoneLabel: string;
  contactPhoneHref: string;
  contactCtaLabel: string;
  contactCtaHref: string;
}

export interface BikeData {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  images?: string[];
  category: string;
  inStock: boolean;
  tags?: string[];
  specs?: Record<string, string>;
}

export interface BikeDetailProps {
  labels: BikeDetailLabels;
  bike?: BikeData;
}

export interface LoadBikeParams {
  tenant: string;
  locale: string;
  pageSlug: string | undefined;
}
