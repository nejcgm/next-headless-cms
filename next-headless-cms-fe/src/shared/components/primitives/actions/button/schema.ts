import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";

export const buttonSchema = boxStyleSchema.extend({
  label: z.string(),
  href: z.string(),
  variant: z.enum(["primary", "secondary"]).optional(),
});

export const buttonPolicy: CompositionPolicy = {
  level: 1,
  maxDepth: 1,
  slots: {},
};
