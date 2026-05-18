export interface AboutPersonProps {
  /** Optional image URL */
  image?: string;
  name: string;
  role: string;
  bio: string;
  /** Optional CTA (e.g. "Kontaktiraj me" -> /contact) */
  cta?: { label: string; href: string };
}
