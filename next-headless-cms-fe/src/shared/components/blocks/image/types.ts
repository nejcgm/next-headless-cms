import type { BoxStyleProps } from "@shared/utils/box-style";

export type ImageBlockProps = BoxStyleProps & {
  src: string;
  alt?: string;
  fit?: "cover" | "contain";
  blockId?: string;
};
