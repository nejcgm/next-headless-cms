import type { BoxStyle } from "@shared/utils/box-style";

export type TextProps = BoxStyle & {
  content: string;
  variant?: "body" | "lead" | "caption" | "label";
  blockId?: string;
};
