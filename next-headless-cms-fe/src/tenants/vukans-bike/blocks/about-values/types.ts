export interface AboutValueItem {
  /** Icon name or custom SVG path. Built-in: "bike", "user", "check", "location", "tools", "clock", "shield", "award" */
  icon: string;
  title: string;
  description: string;
}

export interface AboutValuesProps {
  eyebrowBadge: string;
  heading: string;
  subheading?: string;
  items: AboutValueItem[];
}
