import { z } from "zod";

export const testimonialsSchema = z.object({
  heading: z.string().optional(),
  subheading: z.string().optional(),
  limit: z.number().optional(),
  layout: z.enum(["grid", "carousel"]).optional(),
});
