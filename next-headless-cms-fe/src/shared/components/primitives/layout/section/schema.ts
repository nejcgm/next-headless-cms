import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";
import { LAYOUT_NEST_ALLOW } from "../../../composition-allow";

export const sectionSchema = boxStyleSchema
  .omit({ padding: true, backgroundColor: true })
  .extend({
    padding: z.enum(["sm", "md", "lg"]).nullish(),
    backgroundImage: z.string().nullish(),
    backgroundFit: z.enum(["cover", "contain"]).nullish(),
    overlay: z.number().min(0).max(1).nullish(),
    anchorId: z.string().nullish(),
    surface: z.enum(["background", "muted", "accent", "foreground"]).nullish(),
    heroHeight: z.enum(["standard", "tall"]).nullish(),
    justify: z.enum(["start", "center", "end"]).nullish(),
    align: z.enum(["start", "center", "end"]).nullish(),
  });

export const sectionPolicy: CompositionPolicy = {
  level: 1,
  maxDepth: 6,
  slots: {
    default: {
      allow: [...LAYOUT_NEST_ALLOW],
    },
  },
};
