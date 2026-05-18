export interface TeamMember {
  name: string;
  role: string;
  image?: string;
  bio?: string;
}

export interface TeamGalleryProps {
  title?: string;
  subtitle?: string;
  members: TeamMember[];
}
