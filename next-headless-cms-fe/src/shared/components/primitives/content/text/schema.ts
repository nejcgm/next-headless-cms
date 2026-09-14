import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";

export const textSchema = boxStyleSchema.omit({ fontSize: true }).extend({
  content: z.string(),
  variant: z.enum(["body", "lead", "caption", "label"]).nullish(),
  bold: z.boolean().nullish(),
  fontSize: z
    .enum([
      "cardTitle",
      "sectionTitle",
      "priceCompact",
      "pageTitle",
      "price",
      "display",
      "statement",
      "custom",
    ])
    .nullish(),
  customFontSize: z.string().nullish(),
});

export const textPolicy: CompositionPolicy = {
  level: 1,
  maxDepth: 1,
  slots: {},
};
