import { z } from "zod";

export const bookingWidgetSchema = z.object({
  heading: z.string().optional(),
  layout: z.enum(["inline", "vertical"]).optional(),
});
