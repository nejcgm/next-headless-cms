export interface GalleryImage {
  src: string;
  alt: string;
}

export interface ImageGalleryProps {
  heading?: string;
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
  lightbox?: boolean;
}
