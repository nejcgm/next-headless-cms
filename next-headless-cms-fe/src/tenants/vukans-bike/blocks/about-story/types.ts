export interface AboutStoryProps {
  /** Small label above the headline (e.g. "Naša zgodba") */
  kicker?: string;
  headline: string;
  /** Optional pull quote or tagline */
  quote?: string;
  /**
   * Body copy as a single string. Separate paragraphs with a blank line
   * (two newlines). Stored as a `text` field in Strapi — editors use the
   * textarea; paragraphs split on `\n\n` at render time.
   */
  body: string;
  /** Optional image URL */
  image?: string;
  /** Image position on desktop */
  imagePosition?: "left" | "right";
}
