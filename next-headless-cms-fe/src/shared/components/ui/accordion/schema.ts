import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { BORDER_STYLES, colorValueSchema } from "@shared/utils/box-style";
import { LAYOUT_NEST_ALLOW } from "../../composition-allow";

export const accordionSchema = z.object({
  title: z.string(),
  defaultOpen: z.boolean().nullish(),
  padding: z.string().nullish(),
  margin: z.string().nullish(),
  backgroundColor: colorValueSchema.nullish(),
  borderWidth: z.number().nullish(),
  borderStyle: z.enum(BORDER_STYLES).nullish(),
  borderColor: colorValueSchema.nullish(),
  borderRadius: z.string().nullish(),
});

export const accordionPolicy: CompositionPolicy = {
  level: 3,
  maxDepth: 4,
  slots: {
    default: {
      allow: [...LAYOUT_NEST_ALLOW],
    },
  },
};
