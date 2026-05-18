export interface AboutStoryProps {
  /** Small label above the headline (e.g. "Naša zgodba") */
  kicker?: string;
  headline: string;
  /** Optional pull quote or tagline */
  quote?: string;
  /** Body paragraphs (each item = one paragraph) */
  body: string[];
  /** Optional image URL */
  image?: string;
  /** Image position on desktop */
  imagePosition?: "left" | "right";
}
