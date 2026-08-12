import { z } from "zod";

const link = z.object({ label: z.string(), href: z.string() });

export const ctaBannerSchema = z.object({
  heading: z.string(),
  subheading: z.string().optional(),
  cta: link,
  background: z.enum(["primary", "muted", "dark"]).optional(),
});
