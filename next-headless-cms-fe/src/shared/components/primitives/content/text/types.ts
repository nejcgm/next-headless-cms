import type { BoxStyle } from "@shared/utils/box-style";

export type TextFontSize =
  | "cardTitle"
  | "sectionTitle"
  | "priceCompact"
  | "pageTitle"
  | "price"
  | "display"
  | "statement"
  | "custom";

export type TextProps = Omit<BoxStyle, "fontSize"> & {
  content: string;
  variant?: "body" | "lead" | "caption" | "label";
  bold?: boolean;
  fontSize?: TextFontSize;
  customFontSize?: string;
  blockId?: string;
};
