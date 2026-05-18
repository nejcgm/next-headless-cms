export interface BikeSchoolIntroProps {
  kicker?: string;
  heading: string;
  subheading?: string;
  dateRange: string;
  location: string;
  cta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
}
