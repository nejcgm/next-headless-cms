import { z } from "zod";

export const aboutStorySchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  story: z.string().optional(),
  mission: z.string().optional(),
  image: z.string().optional(),
  yearEstablished: z.string().optional(),
  highlights: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      })
    )
    .optional(),
  imagePosition: z.enum(["left", "right"]).optional(),
});
