export interface BikeSchoolProgramItem {
  title: string;
  level: string;
  description: string;
  bullets: string[];
  ctaLabel?: string;
  ctaHref?: string;
}

export interface BikeSchoolProgramProps {
  heading: string;
  subheading?: string;
  items: BikeSchoolProgramItem[];
}
