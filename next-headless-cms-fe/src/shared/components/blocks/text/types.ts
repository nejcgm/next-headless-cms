import type { BoxStyleProps } from "@shared/utils/box-style";

export type TextProps = BoxStyleProps & {
  content: string;
  variant?: "body" | "lead" | "caption" | "label";
  blockId?: string;
};
