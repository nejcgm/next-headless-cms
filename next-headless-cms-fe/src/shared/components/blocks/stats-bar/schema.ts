import { z } from "zod";

export const statsBarSchema = z.object({
  stats: z.array(
    z.object({
      value: z.string(),
      label: z.string(),
    })
  ),
});
