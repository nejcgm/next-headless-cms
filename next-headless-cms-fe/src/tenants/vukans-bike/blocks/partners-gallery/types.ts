export interface Partner {
  id: string;
  name: string;
  /** Logo or icon image URL */
  icon: string;
  /** Short about / description text */
  about: string;
  /** Optional link to partner website or social profile */
  url?: string;
  /** CTA line when `url` is set; falls back to block `defaultPartnerLinkLabel` in JSON */
  linkLabel?: string;
}

export interface PartnersGalleryProps {
  eyebrowBadge: string;
  defaultPartnerLinkLabel: string;
  heading: string;
  subheading?: string;
  partners: Partner[];
}
