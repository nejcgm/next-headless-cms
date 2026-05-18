import type { Review } from "../../integrations/reviews/types";

export interface TestimonialsProps {
  heading?: string;
  subheading?: string;
  limit?: number;
  layout?: "grid" | "carousel";
  // Injected by dataContract
  reviews: Review[];
}
