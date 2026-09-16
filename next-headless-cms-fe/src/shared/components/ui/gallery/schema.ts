import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";
import { GALLERY_NEST_ALLOW } from "../../composition-allow";

const columnCount = z.enum(["1", "2", "3", "4"]);

export const gallerySchema = boxStyleSchema.extend({
  heading: z.string().nullish(),
  subheading: z.string().nullish(),
  layout: z.enum(["grid", "masonry"]).nullish(),
  columnsMobile: columnCount.nullish(),
  columnsTablet: columnCount.nullish(),
  columnsDesktop: columnCount.nullish(),
  gap: z.string().nullish(),
});

export const galleryPolicy: CompositionPolicy = {
  level: 3,
  maxDepth: 2,
  slots: {
    default: {
      allow: [...GALLERY_NEST_ALLOW],
    },
  },
};
