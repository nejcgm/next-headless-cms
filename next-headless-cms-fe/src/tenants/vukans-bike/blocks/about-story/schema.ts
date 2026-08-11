import { z } from "zod";

export const aboutStorySchema = z.object({
  kicker: z.string().optional(),
  headline: z.string(),
  quote: z.string().optional(),
  body: z.string(),
  image: z.string().optional(),
  imagePosition: z.enum(["left", "right"]).optional(),
});
