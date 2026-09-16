import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";
import { GRID_NEST_ALLOW } from "../../../composition-allow";

const columnCount = z.enum(["1", "2", "3", "4"]);

export const gridSchema = boxStyleSchema.extend({
  columnsMobile: columnCount.nullish(),
  columnsTablet: columnCount.nullish(),
  columnsDesktop: columnCount.nullish(),
  gap: z.string().nullish(),
});

export const gridPolicy: CompositionPolicy = {
  level: 1,
  maxDepth: 6,
  slots: {
    default: {
      allow: [...GRID_NEST_ALLOW],
    },
  },
};
