import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";

export const textSchema = boxStyleSchema
  .omit({ fontSize: true, height: true, minWidth: true, minHeight: true, maxHeight: true })
  .extend({
    content: z.string(),
    as: z.enum(["p", "span", "h1", "h2", "h3", "h4", "h5", "h6"]).nullish(),
    fontFamily: z.enum(["body", "heading", "display"]).nullish(),
    fontSize: z.number().nullish(),
    lineHeight: z.number().nullish(),
    bold: z.boolean().nullish(),
    uppercase: z.boolean().nullish(),
    letterSpacing: z.number().nullish(),
  });

export const textPolicy: CompositionPolicy = {
  level: 1,
  maxDepth: 1,
  slots: {},
};
