import { z } from "zod";

export const gallerySchema = z.object({
  heading: z.string(),
  subheading: z.string().optional(),
  defaultImageAlt: z.string(),
  showLessLabel: z.string(),
  showMorePrefix: z.string(),
  showMoreSuffix: z.string(),
  lightboxAltPrefix: z.string(),
  images: z.array(
    z.object({
      src: z.string(),
      alt: z.string().optional(),
    })
  ),
});
