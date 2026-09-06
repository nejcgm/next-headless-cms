import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";

export const linkSchema = boxStyleSchema.extend({
  label: z.string(),
  href: z.string(),
  variant: z.enum(["primary", "muted"]).optional(),
  showArrow: z.boolean().optional(),
});

export const linkPolicy: CompositionPolicy = {
  level: 1,
  maxDepth: 1,
  slots: {},
};
