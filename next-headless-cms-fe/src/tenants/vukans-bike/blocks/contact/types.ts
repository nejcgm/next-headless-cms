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
  /** Link to open in Google Maps (or other map app) */
  directionsLink: string;
  /** Optional iframe embed URL for map (e.g. from Google Maps Share > Embed) */
  mapEmbedUrl?: string;
  phone: string;
  phoneHref?: string;
  email: string;
  /** Optional opening hours note */
  hoursNote?: string;
}
