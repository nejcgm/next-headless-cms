import { z } from "zod";

export const productListSchema = z.object({
  heading: z.string().nullish(),
  subheading: z.string().nullish(),
  outOfStockLabel: z.string(),
  limit: z.number().nullish(),
  layout: z.enum(["grid", "list"]).nullish(),
  anchorId: z.string().nullish(),
});
