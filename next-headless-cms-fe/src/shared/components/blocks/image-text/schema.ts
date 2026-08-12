import { z } from "zod";

const link = z.object({ label: z.string(), href: z.string() });

export const imageTextSchema = z.object({
  layout: z.enum(["image-left", "image-right"]).optional(),
  image: z.object({
    src: z.string(),
    alt: z.string(),
  }),
  heading: z.string(),
  body: z.string(),
  cta: link.optional(),
});
