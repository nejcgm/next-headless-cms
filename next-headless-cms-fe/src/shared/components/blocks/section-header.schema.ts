import { z } from "zod";

export const sectionHeaderSchema = z.object({
  heading: z.string(),
  subheading: z.string().optional(),
  centered: z.boolean().optional(),
});
