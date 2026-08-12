export interface ImageTextProps {
  layout?: "image-left" | "image-right";
  image: {
    src: string;
    alt: string;
  };
  heading: string;
  body: string;
  cta?: { label: string; href: string };
}
