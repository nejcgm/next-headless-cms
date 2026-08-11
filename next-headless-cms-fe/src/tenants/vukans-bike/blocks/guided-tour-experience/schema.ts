import { z } from "zod";

export const guidedTourExperienceSchema = z.object({
  heading: z.string(),
  subheading: z.string().optional(),
  items: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      icon: z.enum(["route", "coach", "group", "safety"]),
    })
  ),
});
