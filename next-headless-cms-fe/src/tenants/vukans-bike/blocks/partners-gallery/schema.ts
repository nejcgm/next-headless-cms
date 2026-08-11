import { z } from "zod";

export const partnersGallerySchema = z.object({
  eyebrowBadge: z.string(),
  defaultPartnerLinkLabel: z.string(),
  heading: z.string(),
  subheading: z.string().optional(),
  partners: z.array(
    z.object({
      name: z.string(),
      icon: z.string(),
      about: z.string(),
      url: z.string().optional(),
      linkLabel: z.string().optional(),
    })
  ),
});
