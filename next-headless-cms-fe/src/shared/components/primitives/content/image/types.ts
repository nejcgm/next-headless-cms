import type { BoxStyle } from "@shared/utils/box-style";

export type ImageBlockProps = BoxStyle & {
  src: string;
  alt?: string;
  fit?: "cover" | "contain";
  blockId?: string;
};
