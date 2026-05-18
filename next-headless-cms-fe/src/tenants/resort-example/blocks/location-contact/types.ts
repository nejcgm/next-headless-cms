export interface LocationContactProps {
  title?: string;
  address?: {
    street?: string;
    city?: string;
    zip?: string;
    country?: string;
  };
  phone?: string;
  email?: string;
  mapEmbedUrl?: string;
  directionsLink?: string;
  openingHours?: Array<{
    day: string;
    hours: string;
  }>;
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
}
