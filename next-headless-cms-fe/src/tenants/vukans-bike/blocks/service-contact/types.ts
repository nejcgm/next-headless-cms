export interface ServiceContactProps {
  heading: string;
  text?: string;
  phone: string;
  /** Optional tel: link (e.g. +38670815379). If missing, derived from phone. */
  phoneHref?: string;
  email: string;
  /** Optional mailto. If missing, uses email. */
  emailHref?: string;
  ctaText?: string;
}
