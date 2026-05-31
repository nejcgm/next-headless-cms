export interface FaqItem {
  question: string;
  answer: string;
}

export interface ServiceFaqProps {
  heading: string;
  subheading?: string;
  items: FaqItem[];
  /**
   * Optional contact CTA shown after the FAQ list.
   * Stored as flat fields in Strapi to avoid a nested component.
   */
  contactCtaText?: string;
  contactCtaLabel?: string;
  contactCtaHref?: string;
}
