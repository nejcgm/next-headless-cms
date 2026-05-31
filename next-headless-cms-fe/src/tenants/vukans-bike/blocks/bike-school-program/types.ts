export interface BikeSchoolProgramItem {
  title: string;
  level: string;
  description: string;
  /**
   * Highlight bullet points as a single string, one per line.
   * Stored as `text` in Strapi; split on `\n` at render time.
   */
  bullets: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface BikeSchoolProgramProps {
  heading: string;
  subheading?: string;
  items: BikeSchoolProgramItem[];
}
