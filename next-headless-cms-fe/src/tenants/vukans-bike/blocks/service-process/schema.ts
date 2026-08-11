import { z } from "zod";

export const serviceProcessSchema = z.object({
  heading: z.string(),
  subheading: z.string().optional(),
  steps: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      icon: z.string().optional(),
      duration: z.string().optional(),
      details: z.string().optional(),
    })
  ),
});
