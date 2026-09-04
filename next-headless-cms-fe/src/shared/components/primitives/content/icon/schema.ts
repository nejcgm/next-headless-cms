import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";

export const iconSchema = boxStyleSchema.extend({
  name: z.enum(["map-pin", "phone", "mail"]),
  label: z.string().optional(),
  size: z.enum(["sm", "md", "lg"]).optional(),
});

export const iconPolicy: CompositionPolicy = {
  level: 1,
  maxDepth: 1,
  slots: {},
};
