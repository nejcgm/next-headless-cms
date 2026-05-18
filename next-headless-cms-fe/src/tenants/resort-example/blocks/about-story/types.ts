export interface AboutStoryProps {
  title?: string;
  subtitle?: string;
  story?: string;
  mission?: string;
  image?: string;
  yearEstablished?: string;
  highlights?: Array<{
    value: string;
    label: string;
  }>;
  imagePosition?: "left" | "right";
}
