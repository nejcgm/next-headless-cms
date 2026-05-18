export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  /** Optional short label e.g. "Servis gorskih koles" */
  label?: string;
  price: number;
  /** When set, shown instead of €{price} (e.g. hourly / custom text) */
  priceDisplay?: string;
  /** Optional note under price (e.g. "od", "približno") */
  priceNote?: string;
  features: string[];
  /** Optional - not always shown */
  turnaround?: string;
}

export interface ServicePricingProps {
  heading: string;
  subheading?: string;
  packages: ServicePackage[];
  note?: string;
  /** CTA at bottom e.g. "Za servis nas kontaktirajte po e-pošti ali telefonu" */
  contactCta?: string;
  contactHref?: string;
}
