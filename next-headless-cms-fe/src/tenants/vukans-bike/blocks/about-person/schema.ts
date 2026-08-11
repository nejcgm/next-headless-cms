import { z } from "zod";

const link = z.object({ label: z.string(), href: z.string() });

export const aboutPersonSchema = z.object({
  image: z.string().optional(),
  name: z.string(),
  role: z.string(),
  bio: z.string(),
  cta: link.optional(),
});
