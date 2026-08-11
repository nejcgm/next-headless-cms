import { z } from "zod";

const contactLabels = z.object({
  addressHeading: z.string(),
  directionsLinkText: z.string(),
  phoneHeading: z.string(),
  emailHeading: z.string(),
  mapIframeTitle: z.string(),
  mapFallbackTitle: z.string(),
  mapFullscreenLink: z.string(),
});

export const contactSchema = z.object({
  labels: contactLabels,
  heading: z.string(),
  subheading: z.string().optional(),
  address: z.object({
    street: z.string(),
    postalCode: z.string(),
    city: z.string(),
    country: z.string().optional(),
  }),
  directionsLink: z.string(),
  mapEmbedUrl: z.string().optional(),
  phone: z.string(),
  phoneHref: z.string().optional(),
  email: z.string(),
  hoursNote: z.string().optional(),
});
