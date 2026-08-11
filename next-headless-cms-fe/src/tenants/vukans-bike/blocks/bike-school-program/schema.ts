import { z } from "zod";

export const bikeSchoolProgramSchema = z.object({
  heading: z.string(),
  subheading: z.string().optional(),
  items: z.array(
    z.object({
      title: z.string(),
      level: z.string(),
      description: z.string(),
      bullets: z.string(),
      ctaLabel: z.string().optional(),
      ctaHref: z.string().optional(),
    })
  ),
});
