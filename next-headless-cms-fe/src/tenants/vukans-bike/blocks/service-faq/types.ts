export interface FaqItem {
  question: string;
  answer: string;
}

export interface ServiceFaqProps {
  heading: string;
  subheading?: string;
  items: FaqItem[];
  contactCtaText?: string;
  contactCtaLabel?: string;
  contactCtaHref?: string;
}

export interface FaqAccordionProps {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}
