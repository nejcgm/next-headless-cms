import { z } from "zod";

export const richTextSchema = z.object({
  content: z.string(),
  className: z.string().optional(),
});
