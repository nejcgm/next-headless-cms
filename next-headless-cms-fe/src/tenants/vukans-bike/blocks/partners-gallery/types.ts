export interface Partner {
  name: string;
  icon: string;
  about: string;
  url?: string;
  linkLabel?: string;
}

export interface PartnersGalleryProps {
  eyebrowBadge: string;
  defaultPartnerLinkLabel: string;
  heading: string;
  subheading?: string;
  partners: Partner[];
}

export interface PartnerCardProps {
  partner: Partner;
  defaultPartnerLinkLabel: string;
}
