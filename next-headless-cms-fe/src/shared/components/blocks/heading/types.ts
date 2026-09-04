import type { BoxStyleProps } from "@shared/utils/box-style";

export type HeadingProps = BoxStyleProps & {
  content: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: "display" | "title" | "section";
  blockId?: string;
};
