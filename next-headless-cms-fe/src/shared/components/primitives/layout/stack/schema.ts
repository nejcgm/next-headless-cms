import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";
import { STACK_NEST_ALLOW } from "../../../composition-allow";

export const stackSchema = boxStyleSchema.extend({
  gap: z.enum(["sm", "md", "lg"]).optional(),
  align: z.enum(["start", "center", "end", "stretch"]).optional(),
});

export const stackPolicy: CompositionPolicy = {
  level: 1,
  maxDepth: 4,
  slots: {
    default: {
      allow: [...STACK_NEST_ALLOW],
    },
  },
};
