import { z } from "zod";

export const productListSchema = z.object({
  heading: z.string().optional(),
  subheading: z.string().optional(),
  outOfStockLabel: z.string(),
  limit: z.number().optional(),
  category: z.string().optional(),
  layout: z.enum(["grid", "list"]).optional(),
  anchorId: z.string().optional(),
});
