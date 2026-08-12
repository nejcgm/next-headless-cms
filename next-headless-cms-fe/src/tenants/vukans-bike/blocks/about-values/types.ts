export interface AboutValueItem {
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

export interface ValueCardProps {
  item: AboutValueItem;
  index: number;
}
