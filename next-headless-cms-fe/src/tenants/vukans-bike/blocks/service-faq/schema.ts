import { z } from "zod";

export const serviceFaqSchema = z.object({
  heading: z.string(),
  subheading: z.string().optional(),
  items: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ),
  contactCtaText: z.string().optional(),
  contactCtaLabel: z.string().optional(),
  contactCtaHref: z.string().optional(),
});
