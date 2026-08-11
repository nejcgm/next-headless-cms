import { z } from "zod";

export const locationContactSchema = z.object({
  title: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  mapEmbedUrl: z.string().optional(),
  directionsLink: z.string().optional(),
  openingHours: z
    .array(
      z.object({
        day: z.string(),
        hours: z.string(),
      })
    )
    .optional(),
  socialLinks: z
    .array(
      z.object({
        platform: z.string(),
        url: z.string(),
      })
    )
    .optional(),
});
