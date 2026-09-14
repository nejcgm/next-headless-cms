import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";

export const accordionSchema = z.object({
  title: z.string(),
  content: z.string(),
  defaultOpen: z.boolean().nullish(),
  padding: z.string().nullish(),
  margin: z.string().nullish(),
  backgroundColor: z
    .enum([
      "primary",
      "secondary",
      "accent",
      "background",
      "foreground",
      "muted",
      "border",
      "text-primary",
    ])
    .nullish(),
  border: z.enum(["none", "hairline", "invertedOutline"]).nullish(),
  borderRadius: z.string().nullish(),
});

export const accordionPolicy: CompositionPolicy = {
  level: 3,
  maxDepth: 1,
  slots: {},
};
