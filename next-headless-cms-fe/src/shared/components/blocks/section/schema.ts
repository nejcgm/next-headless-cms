import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";
import { LAYOUT_NEST_ALLOW } from "../composition-allow";

export const sectionSchema = boxStyleSchema.omit({ padding: true }).extend({
  padding: z.enum(["sm", "md", "lg"]).optional(),
  backgroundImage: z.string().optional(),
  backgroundFit: z.enum(["cover", "contain"]).optional(),
  overlay: z.number().min(0).max(1).optional(),
  anchorId: z.string().optional(),
  surface: z.string().optional(),
  justify: z.enum(["start", "center", "end"]).optional(),
  align: z.enum(["start", "center", "end"]).optional(),
});

export const sectionPolicy: CompositionPolicy = {
  level: 1,
  maxDepth: 4,
  slots: {
    default: {
      allow: [...LAYOUT_NEST_ALLOW],
    },
  },
};
