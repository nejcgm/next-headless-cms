import { z } from "zod";

export const servicePricingSchema = z.object({
  heading: z.string(),
  subheading: z.string().optional(),
  packages: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      label: z.string().optional(),
      price: z.number(),
      priceDisplay: z.string().optional(),
      priceNote: z.string().optional(),
      features: z.string(),
      turnaround: z.string().optional(),
    })
  ),
  note: z.string().optional(),
  contactCta: z.string().optional(),
  contactHref: z.string().optional(),
});
