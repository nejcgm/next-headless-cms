export interface GuidedTourExperienceItem {
  title: string;
  description: string;
  icon: "route" | "coach" | "group" | "safety";
}

export interface GuidedTourExperienceProps {
  heading: string;
  subheading?: string;
  items: GuidedTourExperienceItem[];
}
