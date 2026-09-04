import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";

export const headingSchema = boxStyleSchema.extend({
  content: z.string(),
  level: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
  ]).optional(),
  variant: z.enum(["display", "title", "section"]).optional(),
});

export const headingPolicy: CompositionPolicy = {
  level: 1,
  maxDepth: 1,
  slots: {},
};
