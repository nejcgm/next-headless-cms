import { z } from "zod";

export const imageGallerySchema = z.object({
  heading: z.string().optional(),
  images: z.array(
    z.object({
      src: z.string(),
      alt: z.string(),
    })
  ),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
  lightbox: z.boolean().optional(),
});
