export interface GalleryImage {
  src: string;
  alt?: string;
}

export interface GalleryProps {
  heading: string;
  subheading?: string;
  defaultImageAlt: string;
  showLessLabel: string;
  showMorePrefix: string;
  showMoreSuffix: string;
  lightboxAltPrefix: string;
  images: GalleryImage[];
}
