import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";

export const textSchema = boxStyleSchema.extend({
  content: z.string(),
  variant: z.enum(["body", "lead", "caption", "label"]).optional(),
  bold: z.boolean().optional(),
});

export const textPolicy: CompositionPolicy = {
  level: 1,
  maxDepth: 1,
  slots: {},
};
