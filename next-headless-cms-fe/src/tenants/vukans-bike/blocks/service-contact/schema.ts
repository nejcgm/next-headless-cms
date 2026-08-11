import { z } from "zod";

export const serviceContactSchema = z.object({
  heading: z.string(),
  text: z.string().optional(),
  phone: z.string(),
  phoneHref: z.string().optional(),
  email: z.string(),
  emailHref: z.string().optional(),
  ctaText: z.string().optional(),
});
