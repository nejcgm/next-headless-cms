import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";
import { LAYOUT_NEST_ALLOW } from "../../../composition-allow";

export const flexSchema = boxStyleSchema.extend({
  direction: z.enum(["row", "column"]).nullish(),
  gap: z.string().nullish(),
  align: z.enum(["start", "center", "end", "stretch", "baseline"]).nullish(),
  justify: z.enum(["start", "center", "end", "between", "around", "evenly"]).nullish(),
  wrap: z.boolean().nullish(),
  backgroundImage: z.string().nullish(),
  overlay: z.number().min(0).max(1).nullish(),
  anchorId: z.string().nullish(),
});

export const flexPolicy: CompositionPolicy = {
  level: 1,
  maxDepth: 5,
  slots: {
    default: {
      allow: [...LAYOUT_NEST_ALLOW],
    },
  },
};
