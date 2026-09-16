import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";
import { ICON_NAMES } from "./icon-names";

export const iconSchema = boxStyleSchema.extend({
  name: z.enum(ICON_NAMES),
  label: z.string().nullish(),
  size: z.number().nullish(),
});

export const iconPolicy: CompositionPolicy = {
  level: 1,
  maxDepth: 1,
  slots: {},
};
