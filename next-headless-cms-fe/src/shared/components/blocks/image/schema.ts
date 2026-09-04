import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";

export const imageSchema = boxStyleSchema.extend({
  src: z.string(),
  alt: z.string().optional(),
  fit: z.enum(["cover", "contain"]).optional(),
});

export const imagePolicy: CompositionPolicy = {
  level: 1,
  maxDepth: 1,
  slots: {},
};
