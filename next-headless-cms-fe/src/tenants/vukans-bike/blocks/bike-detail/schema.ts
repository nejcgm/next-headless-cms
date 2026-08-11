import { z } from "zod";

const bikeDetailLabels = z.object({
  notFoundTitle: z.string(),
  notFoundBody: z.string(),
  notFoundCtaLabel: z.string(),
  notFoundCtaHref: z.string(),
  breadcrumbHome: z.string(),
  breadcrumbHomeHref: z.string(),
  breadcrumbBikes: z.string(),
  breadcrumbBikesHref: z.string(),
  outOfStock: z.string(),
  descriptionHeading: z.string(),
  specsHeading: z.string(),
  contactTeaser: z.string(),
  contactPhoneLabel: z.string(),
  contactPhoneHref: z.string(),
  contactCtaLabel: z.string(),
  contactCtaHref: z.string(),
});

export const bikeDetailSchema = z.object({
  labels: bikeDetailLabels,
});
