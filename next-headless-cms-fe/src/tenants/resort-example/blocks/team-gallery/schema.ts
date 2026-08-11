import { z } from "zod";

export const teamGallerySchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  members: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      image: z.string().optional(),
      bio: z.string().optional(),
    })
  ),
});
