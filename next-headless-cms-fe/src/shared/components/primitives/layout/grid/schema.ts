import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";
import { GRID_NEST_ALLOW } from "../../../composition-allow";

const columnCount = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

// Strapi enumeration fields are always strings.
const strapiColumnCount = z.enum(["1", "2", "3", "4"]);

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
    .nullish(),
  columnsMobile: strapiColumnCount.nullish(),
  columnsTablet: strapiColumnCount.nullish(),
  columnsDesktop: strapiColumnCount.nullish(),
  gap: z.enum(["sm", "md", "lg"]).nullish(),
});

export const gridPolicy: CompositionPolicy = {
  level: 1,
  maxDepth: 5,
  slots: {
    default: {
      allow: [...GRID_NEST_ALLOW],
    },
  },
};
