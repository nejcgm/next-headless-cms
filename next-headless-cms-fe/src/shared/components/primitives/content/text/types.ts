import type { BoxStyle } from "@shared/utils/box-style";

export type TextProps = Omit<
  BoxStyle,
  "fontSize" | "height" | "minWidth" | "minHeight" | "maxHeight"
> & {
  content: string;
  as?: "p" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  fontFamily?: "body" | "heading" | "display";
  fontSize?: number;
  lineHeight?: number;
  bold?: boolean;
  uppercase?: boolean;
  letterSpacing?: number;
  blockId?: string;
};
