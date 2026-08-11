import { z } from "zod";

const link = z.object({ label: z.string(), href: z.string() });

export const heroSchema = z.object({
  headline: z.string(),
  subheadline: z.string().optional(),
  backgroundImage: z.string(),
  overlay: z.number().optional(),
  cta: link,
  secondaryCta: link.optional(),
});
