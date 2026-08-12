export interface HeroProps {
  headline: string;
  subheadline?: string;
  backgroundImage: string;
  backgroundFit?: "cover" | "contain";
  overlay?: number;
  cta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}
