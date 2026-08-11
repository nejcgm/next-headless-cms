import { z } from "zod";

export const amenitiesGridSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  amenities: z.array(
    z.object({
      icon: z.string().optional(),
      title: z.string(),
      description: z.string().optional(),
    })
  ),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
  showDescription: z.boolean().optional(),
});
