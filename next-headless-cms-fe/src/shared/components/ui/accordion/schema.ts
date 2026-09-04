import { z } from "zod";
import type { CompositionPolicy } from "@core/blocks/types";

export const accordionSchema = z.object({
  title: z.string(),
  content: z.string(),
  defaultOpen: z.boolean().optional(),
  padding: z.string().optional(),
  margin: z.string().optional(),
  backgroundColor: z.string().optional(),
  border: z.string().optional(),
  borderRadius: z.string().optional(),
});

export const accordionPolicy: CompositionPolicy = {
  level: 3,
  maxDepth: 1,
  slots: {},
};
