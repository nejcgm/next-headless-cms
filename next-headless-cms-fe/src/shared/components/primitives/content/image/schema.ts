import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";

export const imageSchema = boxStyleSchema.extend({
  src: z.string(),
  alt: z.string().nullish(),
  fit: z.enum(["cover", "contain", "fill", "none"]).nullish(),
  position: z.enum(["center", "top", "bottom", "left", "right"]).nullish(),
});

export const imagePolicy: CompositionPolicy = {
  level: 1,
  maxDepth: 1,
  slots: {},
};
