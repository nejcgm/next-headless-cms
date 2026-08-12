export interface HeroProps {
  headline: string;
  subheadline?: string;
  backgroundImage: string;
  overlay?: number;
  cta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}
