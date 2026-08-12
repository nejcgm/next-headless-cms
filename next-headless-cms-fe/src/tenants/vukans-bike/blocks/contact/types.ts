export interface ContactLabels {
  addressHeading: string;
  directionsLinkText: string;
  phoneHeading: string;
  emailHeading: string;
  mapIframeTitle: string;
  mapFallbackTitle: string;
  mapFullscreenLink: string;
}

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

export interface AddressBlockProps {
  address: ContactAddress;
  directionsLink: string;
  labels: ContactLabels;
}
