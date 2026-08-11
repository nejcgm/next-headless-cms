import { z } from "zod";

export const aboutValuesSchema = z.object({
  eyebrowBadge: z.string(),
  heading: z.string(),
  subheading: z.string().optional(),
  items: z.array(
    z.object({
      icon: z.string(),
      title: z.string(),
      description: z.string(),
    })
  ),
});
