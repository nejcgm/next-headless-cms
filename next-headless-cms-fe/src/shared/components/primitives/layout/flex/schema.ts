import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";
import { LAYOUT_NEST_ALLOW } from "../../../composition-allow";

export const flexSchema = boxStyleSchema.extend({
  direction: z.enum(["row", "column"]).optional(),
  gap: z.enum(["sm", "md", "lg"]).optional(),
  align: z.enum(["start", "center", "end", "stretch"]).optional(),
  justify: z.enum(["start", "center", "end", "between"]).optional(),
  wrap: z.boolean().optional(),
});

export const flexPolicy: CompositionPolicy = {
  level: 1,
  maxDepth: 4,
  slots: {
    default: {
      allow: [...LAYOUT_NEST_ALLOW],
    },
  },
};
