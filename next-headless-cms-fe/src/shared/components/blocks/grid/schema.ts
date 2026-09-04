import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";
import { GRID_NEST_ALLOW } from "../composition-allow";

const columnCount = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export const gridSchema = boxStyleSchema.extend({
  columns: z
    .union([
      columnCount,
      z.object({
        mobile: columnCount,
        tablet: columnCount.optional(),
        desktop: columnCount.optional(),
      }),
    ])
    .optional(),
  gap: z.enum(["sm", "md", "lg"]).optional(),
});

export const gridPolicy: CompositionPolicy = {
  level: 1,
  maxDepth: 3,
  slots: {
    default: {
      allow: [...GRID_NEST_ALLOW],
    },
  },
};
