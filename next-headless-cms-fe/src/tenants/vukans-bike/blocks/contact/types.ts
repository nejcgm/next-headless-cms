import type { ContactLabels } from "./labels";

export interface ContactAddress {
  street: string;
  postalCode: string;
  city: string;
  country?: string;
}

export interface ContactProps {
  labels: ContactLabels;
  heading: string;
  subheading?: string;
  address: ContactAddress;
  directionsLink: string;
  mapEmbedUrl?: string;
  phone: string;
  phoneHref?: string;
  email: string;
  hoursNote?: string;
}
