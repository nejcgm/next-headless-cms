export interface CtaBannerProps {
  heading: string;
  subheading?: string;
  cta: { label: string; href: string };
  background?: "primary" | "muted" | "dark";
}
