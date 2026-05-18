export interface FaqItem {
  question: string;
  answer: string;
}

export interface ServiceFaqProps {
  heading: string;
  subheading?: string;
  items: FaqItem[];
  contactCta?: {
    text: string;
    label: string;
    href: string;
  };
}
