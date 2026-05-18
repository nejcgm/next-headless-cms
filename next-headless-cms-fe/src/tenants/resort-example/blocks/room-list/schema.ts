import { z } from "zod";

const ctaSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

export const roomListSchema = z.object({
  heading: z.string().optional(),
  subheading: z.string().optional(),
  limit: z.number().optional().default(6),
  layout: z.enum(["grid", "list"]).optional().default("grid"),
  cta: ctaSchema.optional(),
});
