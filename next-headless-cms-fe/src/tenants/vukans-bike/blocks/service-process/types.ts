export interface ProcessStep {
  title: string;
  description: string;
  icon?: string;
  duration?: string;
  /**
   * Optional bullet details as a single string, one bullet per line.
   * Stored as `text` in Strapi; split on `\n` at render time.
   */
  details?: string;
}

export interface ServiceProcessProps {
  heading: string;
  subheading?: string;
  steps: ProcessStep[];
}
