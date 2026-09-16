import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";
import { LAYOUT_NEST_ALLOW } from "../../../composition-allow";

export const sectionSchema = boxStyleSchema
  .omit({
    backgroundColor: true,
    overflow: true,
    minHeight: true,
  })
  .extend({
    backgroundImage: z.string().nullish(),
    backgroundFit: z.enum(["cover", "contain"]).nullish(),
    backgroundPosition: z.enum(["center", "top", "bottom", "left", "right"]).nullish(),
    overlay: z.number().min(0).max(1).nullish(),
    anchorId: z.string().nullish(),
    width: z.enum(["full", "contained"]).nullish(),
    minHeight: z.enum(["standard", "tall"]).nullish(),
    surface: z.enum(["background", "muted", "accent", "foreground"]).nullish(),
    divider: z.enum(["none", "top", "bottom", "both"]).nullish(),
    overflow: z.enum(["visible", "hidden"]).nullish(),
  });

export const sectionPolicy: CompositionPolicy = {
  level: 1,
  maxDepth: 7,
  slots: {
    default: {
      allow: [...LAYOUT_NEST_ALLOW],
    },
  },
};
