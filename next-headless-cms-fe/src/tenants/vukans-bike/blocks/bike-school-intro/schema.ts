import { z } from "zod";

const link = z.object({ label: z.string(), href: z.string() });

export const bikeSchoolIntroSchema = z.object({
  kicker: z.string().optional(),
  heading: z.string(),
  subheading: z.string().optional(),
  dateRange: z.string(),
  location: z.string(),
  cta: link,
  secondaryCta: link.optional(),
});
