import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";
import { boxStyleSchema } from "@shared/utils/box-style";
import { LINK_BUTTON_NEST_ALLOW } from "../../../composition-allow";

export const linkSchema = boxStyleSchema
  .pick({
    padding: true,
    backgroundColor: true,
    color: true,
    borderWidth: true,
    borderStyle: true,
    borderColor: true,
  })
  .extend({
    href: z.string(),
    target: z.enum(["_self", "_blank"]).nullish(),
    showArrow: z.boolean().nullish(),
    variant: z.enum(["primary", "secondary", "ghost", "link"]).nullish(),
    fontSize: z.number().nullish(),
    fontWeight: z.number().nullish(),
    textAlign: z.enum(["left", "center", "right"]).nullish(),
    borderRadius: z.number().nullish(),
    accessibleLabel: z.string().nullish(),
  });

export const linkPolicy: CompositionPolicy = {
  level: 1,
  maxDepth: 2,
  slots: {
    default: {
      allow: [...LINK_BUTTON_NEST_ALLOW],
      maxItems: 2,
    },
  },
};
