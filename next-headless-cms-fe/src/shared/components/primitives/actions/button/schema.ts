import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";
import { LINK_BUTTON_NEST_ALLOW } from "../../../composition-allow";

export const buttonSchema = boxStyleSchema
  .omit({
    minWidth: true,
    minHeight: true,
    maxWidth: true,
    maxHeight: true,
    fontSize: true,
    fontWeight: true,
    borderRadius: true,
    overflow: true,
  })
  .extend({
    href: z.string(),
    type: z.enum(["button", "submit", "reset"]).nullish(),
    disabled: z.boolean().nullish(),
    variant: z.enum(["primary", "secondary", "outline", "ghost"]).nullish(),
    fontSize: z.number().nullish(),
    fontWeight: z.number().nullish(),
    textAlign: z.enum(["left", "center", "right"]).nullish(),
    borderRadius: z.number().nullish(),
    overflow: z.enum(["visible", "hidden"]).nullish(),
    accessibleLabel: z.string().nullish(),
  });

export const buttonPolicy: CompositionPolicy = {
  level: 1,
  maxDepth: 2,
  slots: {
    default: {
      allow: [...LINK_BUTTON_NEST_ALLOW],
      maxItems: 2,
    },
  },
};
