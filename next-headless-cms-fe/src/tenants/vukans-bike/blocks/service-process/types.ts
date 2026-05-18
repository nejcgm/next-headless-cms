export interface ProcessStep {
  title: string;
  description: string;
  icon?: string;
  duration?: string;
  details?: string[];
}

export interface ServiceProcessProps {
  heading: string;
  subheading?: string;
  steps: ProcessStep[];
}
