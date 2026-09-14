import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";
import { LAYOUT_NEST_ALLOW } from "../../../composition-allow";

export const flexSchema = boxStyleSchema.extend({
  direction: z.enum(["row", "column"]).nullish(),
  gap: z.enum(["sm", "md", "lg"]).nullish(),
  align: z.enum(["start", "center", "end", "stretch"]).nullish(),
  justify: z.enum(["start", "center", "end", "between"]).nullish(),
  wrap: z.boolean().nullish(),
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
