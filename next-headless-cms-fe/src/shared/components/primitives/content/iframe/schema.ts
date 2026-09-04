import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";

export const iframeSchema = boxStyleSchema.extend({
  src: z.string(),
  title: z.string(),
  allowFullscreen: z.boolean().optional(),
  aspect: z.enum(["video", "map", "square"]).optional(),
});

export const iframePolicy: CompositionPolicy = {
  level: 1,
  maxDepth: 1,
  slots: {},
};
