import type { BoxStyle } from "@shared/utils/box-style";

export type ImageBlockProps = BoxStyle & {
  src: string;
  alt?: string;
  fit?: "cover" | "contain" | "fill" | "none";
  position?: "center" | "top" | "bottom" | "left" | "right";
  blockId?: string;
};
