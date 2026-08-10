export interface ServicePackage {
  name: string;
  description: string;
  label?: string;
  price: number;
  priceDisplay?: string;
  priceNote?: string;
  features: string;
  turnaround?: string;
}

export interface ServicePricingProps {
  heading: string;
  subheading?: string;
  packages: ServicePackage[];
  note?: string;
  contactCta?: string;
  contactHref?: string;
}
